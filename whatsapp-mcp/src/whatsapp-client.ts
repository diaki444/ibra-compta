import path from "node:path";
import fs from "node:fs";
import { Boom } from "@hapi/boom";
import P from "pino";
import qrcode from "qrcode-terminal";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  type WASocket,
  type proto,
} from "@whiskeysockets/baileys";
import type { ChatSummary, StoredContact, StoredMessage } from "./types.js";

const AUTH_DIR = path.join(process.cwd(), "auth_info");
const MAX_MESSAGES_PER_CHAT = 200;

class WhatsAppClient {
  private sock: WASocket | null = null;
  private connected = false;
  private connecting: Promise<void> | null = null;

  // In-memory stores (rebuilt from live events each run; WhatsApp Web
  // does not hand over full history through an unofficial client).
  private messagesByChat = new Map<string, StoredMessage[]>();
  private contacts = new Map<string, StoredContact>();
  private chatMeta = new Map<string, { name: string; isGroup: boolean; lastTs?: number; lastText?: string }>();

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) return this.connecting;

    this.connecting = this.doConnect();
    return this.connecting;
  }

  private async doConnect(): Promise<void> {
    if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" }) as any,
      printQRInTerminal: false,
      syncFullHistory: false,
    });
    this.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // eslint-disable-next-line no-console
        console.error("\n[whatsapp-mcp] Scan this QR code from WhatsApp > Linked devices > Link a device:\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        this.connected = true;
        // eslint-disable-next-line no-console
        console.error("[whatsapp-mcp] Connected to WhatsApp.");
      }

      if (connection === "close") {
        this.connected = false;
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        // eslint-disable-next-line no-console
        console.error(
          `[whatsapp-mcp] Connection closed (code ${statusCode ?? "unknown"}).`,
          loggedOut ? "Logged out — delete auth_info/ and re-scan QR." : "Reconnecting...",
        );
        if (!loggedOut) {
          this.connecting = null;
          void this.connect();
        }
      }
    });

    sock.ev.on("contacts.upsert", (list) => this.upsertContacts(list));
    sock.ev.on("contacts.update", (list) => this.upsertContacts(list as any));

    sock.ev.on("chats.upsert", (chats) => {
      for (const c of chats) {
        const jid = c.id;
        if (!jid) continue;
        const existing = this.chatMeta.get(jid);
        this.chatMeta.set(jid, {
          name: c.name || existing?.name || jid,
          isGroup: jid.endsWith("@g.us"),
          lastTs: existing?.lastTs,
          lastText: existing?.lastText,
        });
      }
    });

    sock.ev.on("messages.upsert", ({ messages }) => {
      for (const m of messages) {
        this.recordMessage(m);
      }
    });

    await new Promise<void>((resolve) => {
      const check = () => {
        if (this.connected) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };
      check();
      // Also resolve once the QR has been printed so callers aren't blocked
      // forever waiting for a scan that happens interactively.
    });
  }

  private upsertContacts(list: Array<{ id?: string; name?: string; notify?: string }>) {
    for (const c of list) {
      if (!c.id) continue;
      this.contacts.set(c.id, {
        jid: c.id,
        name: c.name ?? this.contacts.get(c.id)?.name,
        notify: c.notify ?? this.contacts.get(c.id)?.notify,
      });
    }
  }

  private recordMessage(m: proto.IWebMessageInfo) {
    const jid = m.key.remoteJid;
    if (!jid) return;
    const text =
      m.message?.conversation ??
      m.message?.extendedTextMessage?.text ??
      m.message?.imageMessage?.caption ??
      m.message?.videoMessage?.caption ??
      (m.message ? "[message non-texte]" : "");
    if (!text) return;

    const senderJid = m.key.participant || jid;
    const senderName = this.contacts.get(senderJid)?.name ?? this.contacts.get(senderJid)?.notify ?? m.pushName ?? undefined;

    const stored: StoredMessage = {
      id: m.key.id ?? `${Date.now()}`,
      chatJid: jid,
      fromMe: Boolean(m.key.fromMe),
      senderName,
      text,
      timestamp: typeof m.messageTimestamp === "number" ? m.messageTimestamp : Number(m.messageTimestamp ?? Date.now() / 1000),
    };

    const list = this.messagesByChat.get(jid) ?? [];
    list.push(stored);
    if (list.length > MAX_MESSAGES_PER_CHAT) list.shift();
    this.messagesByChat.set(jid, list);

    const meta = this.chatMeta.get(jid);
    this.chatMeta.set(jid, {
      name: meta?.name ?? senderName ?? jid,
      isGroup: jid.endsWith("@g.us"),
      lastTs: stored.timestamp,
      lastText: stored.text,
    });
  }

  listChats(limit = 20): ChatSummary[] {
    return [...this.chatMeta.entries()]
      .sort((a, b) => (b[1].lastTs ?? 0) - (a[1].lastTs ?? 0))
      .slice(0, limit)
      .map(([jid, meta]) => ({
        jid,
        name: meta.name,
        isGroup: meta.isGroup,
        lastMessage: meta.lastText,
        lastMessageTimestamp: meta.lastTs,
      }));
  }

  readMessages(chatJid: string, limit = 20): StoredMessage[] {
    const list = this.messagesByChat.get(chatJid) ?? [];
    return list.slice(-limit);
  }

  searchContacts(query: string): StoredContact[] {
    const q = query.trim().toLowerCase();
    const results: StoredContact[] = [];
    for (const c of this.contacts.values()) {
      const name = (c.name ?? "").toLowerCase();
      const notify = (c.notify ?? "").toLowerCase();
      if (name.includes(q) || notify.includes(q)) results.push(c);
    }
    // Also allow matching chats whose name we only learned from chats.upsert.
    for (const [jid, meta] of this.chatMeta.entries()) {
      if (meta.isGroup) continue;
      if (meta.name.toLowerCase().includes(q) && !results.some((r) => r.jid === jid)) {
        results.push({ jid, name: meta.name });
      }
    }
    return results;
  }

  listGroups(): ChatSummary[] {
    return this.listChats(500).filter((c) => c.isGroup);
  }

  /**
   * Checks whether a raw phone number (digits only, with country code,
   * no "+") has an active WhatsApp account. Mirrors the "not every number
   * has WhatsApp" issue (common for US landlines, for example).
   */
  async numberHasWhatsApp(phoneDigits: string): Promise<{ jid: string; exists: boolean } | null> {
    if (!this.sock) throw new Error("WhatsApp not connected");
    const results = await this.sock.onWhatsApp(phoneDigits);
    const result = results?.[0];
    if (!result) return null;
    return { jid: result.jid, exists: Boolean(result.exists) };
  }

  async sendMessage(jid: string, text: string): Promise<void> {
    if (!this.sock) throw new Error("WhatsApp not connected");
    await this.sock.sendMessage(jid, { text });
  }

  getSock(): WASocket {
    if (!this.sock) throw new Error("WhatsApp not connected");
    return this.sock;
  }
}

export const whatsapp = new WhatsAppClient();

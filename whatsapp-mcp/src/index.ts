#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { whatsapp } from "./whatsapp-client.js";

const BULK_MAX_RECIPIENTS = 10;
const BULK_DELAY_MS_MIN = 3000;
const BULK_DELAY_MS_MAX = 6000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = new McpServer({
  name: "whatsapp-mcp",
  version: "0.1.0",
});

server.tool(
  "whatsapp_status",
  "Indique si le compte WhatsApp personnel est connecte et pret a envoyer/lire des messages.",
  {},
  async () => {
    const connected = whatsapp.isConnected();
    return {
      content: [
        {
          type: "text",
          text: connected
            ? "WhatsApp est connecte et pret."
            : "WhatsApp n'est pas encore connecte. Verifiez le terminal ou tourne le serveur pour scanner le QR code (WhatsApp > Appareils lies > Lier un appareil).",
        },
      ],
    };
  },
);

server.tool(
  "whatsapp_list_chats",
  "Liste les conversations WhatsApp recentes (contacts et groupes), triees par derniere activite.",
  { limit: z.number().int().min(1).max(100).default(20).describe("Nombre maximum de conversations a retourner") },
  async ({ limit }) => {
    const chats = whatsapp.listChats(limit);
    if (chats.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Aucune conversation en memoire pour le moment. Le serveur ne recoit que les messages recus depuis qu'il tourne (pas l'historique complet). Attendez un peu ou envoyez/recevez un message puis reessayez.",
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(chats, null, 2),
        },
      ],
    };
  },
);

server.tool(
  "whatsapp_search_contact",
  "Recherche un contact ou un groupe WhatsApp par nom (recherche partielle, insensible a la casse). Retourne une liste de correspondances avec leur JID (identifiant WhatsApp) a utiliser ensuite dans whatsapp_send_message. Si plusieurs resultats, demandez a l'utilisateur de preciser lequel.",
  { query: z.string().min(1).describe("Nom (ou partie du nom) du contact ou du groupe a rechercher") },
  async ({ query }) => {
    const matches = whatsapp.searchContacts(query);
    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Aucun contact ou groupe trouve pour "${query}". Le carnet d'adresses se construit au fil des messages recus/envoyes depuis que le serveur tourne ; si le contact n'est pas encore apparu, demandez le numero complet (format international, sans "+", suivi de @s.whatsapp.net).`,
          },
        ],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
    };
  },
);

server.tool(
  "whatsapp_read_messages",
  "Lit les derniers messages d'une conversation WhatsApp (contact ou groupe), a partir de son JID.",
  {
    jid: z.string().describe("JID de la conversation, ex: 33612345678@s.whatsapp.net ou 123456789@g.us"),
    limit: z.number().int().min(1).max(100).default(20),
  },
  async ({ jid, limit }) => {
    const messages = whatsapp.readMessages(jid, limit);
    if (messages.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Aucun message en memoire pour cette conversation (le serveur ne voit que ce qui a transite depuis qu'il tourne).",
          },
        ],
      };
    }
    return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
  },
);

server.tool(
  "whatsapp_check_number",
  "Verifie si un numero de telephone possede un compte WhatsApp actif, avant de tenter un envoi. Utile pour la prospection (tous les numeros n'ont pas WhatsApp, en particulier les lignes fixes americaines).",
  {
    phoneDigits: z
      .string()
      .regex(/^\d{6,15}$/)
      .describe("Numero complet avec indicatif pays, chiffres uniquement, sans '+' ni espaces. Ex: 33612345678"),
  },
  async ({ phoneDigits }) => {
    const result = await whatsapp.numberHasWhatsApp(phoneDigits);
    if (!result) {
      return { content: [{ type: "text", text: `Impossible de verifier le numero ${phoneDigits}.` }] };
    }
    return {
      content: [
        {
          type: "text",
          text: result.exists
            ? `Le numero ${phoneDigits} a un compte WhatsApp (jid: ${result.jid}).`
            : `Le numero ${phoneDigits} n'a pas de compte WhatsApp actif.`,
        },
      ],
    };
  },
);

server.tool(
  "whatsapp_send_message",
  "Envoie un message texte a un contact ou un groupe WhatsApp, a partir de son JID (utilisez whatsapp_search_contact ou whatsapp_check_number pour l'obtenir d'abord).",
  {
    jid: z.string().describe("JID destinataire, ex: 33612345678@s.whatsapp.net (contact) ou 123456789@g.us (groupe)"),
    text: z.string().min(1).describe("Contenu du message a envoyer"),
  },
  async ({ jid, text }) => {
    await whatsapp.sendMessage(jid, text);
    return {
      content: [{ type: "text", text: `Message envoye avec succes a ${jid}.` }],
    };
  },
);

server.tool(
  "whatsapp_bulk_outreach",
  `Envoie un message personnalise a plusieurs destinataires WhatsApp a la suite (prospection). ` +
    `Limite a ${BULK_MAX_RECIPIENTS} destinataires par appel et espace chaque envoi de ${BULK_DELAY_MS_MIN / 1000}-${
      BULK_DELAY_MS_MAX / 1000
    }s pour reduire le risque de blocage du compte par WhatsApp. ` +
    `Necessite confirm=true : ne jamais mettre confirm=true sans que l'utilisateur ait explicitement valide l'envoi en masse et le contenu du message. ` +
    `Verifiez whatsapp_check_number sur chaque numero avant d'appeler cet outil : WhatsApp ne peut pas envoyer a un numero qui n'a pas de compte WhatsApp. ` +
    `Usage responsable uniquement : respectez les lois locales anti-spam et les conditions d'utilisation de WhatsApp ; n'utilisez pas ceci pour harceler ou spammer des personnes qui n'ont pas de relation avec vous.`,
  {
    recipients: z
      .array(
        z.object({
          jid: z.string().describe("JID destinataire, ex: 33612345678@s.whatsapp.net"),
          text: z.string().min(1).describe("Message personnalise pour ce destinataire"),
        }),
      )
      .min(1)
      .max(BULK_MAX_RECIPIENTS),
    confirm: z
      .boolean()
      .describe("Doit valoir true uniquement si l'utilisateur a explicitement confirme l'envoi en masse."),
  },
  async ({ recipients, confirm }) => {
    if (!confirm) {
      return {
        content: [
          {
            type: "text",
            text: "Envoi annule : confirm doit etre explicitement confirme par l'utilisateur avant un envoi en masse.",
          },
        ],
      };
    }

    const results: Array<{ jid: string; status: "sent" | "failed"; error?: string }> = [];
    for (const r of recipients) {
      try {
        await whatsapp.sendMessage(r.jid, r.text);
        results.push({ jid: r.jid, status: "sent" });
      } catch (err) {
        results.push({ jid: r.jid, status: "failed", error: err instanceof Error ? err.message : String(err) });
      }
      const delay = BULK_DELAY_MS_MIN + Math.random() * (BULK_DELAY_MS_MAX - BULK_DELAY_MS_MIN);
      await sleep(delay);
    }

    return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
  },
);

async function main() {
  // Lance la connexion WhatsApp en arriere-plan ; le serveur MCP repond
  // deja aux outils pendant que la connexion/QR se prepare.
  void whatsapp.connect().catch((err) => {
    console.error("[whatsapp-mcp] Erreur de connexion WhatsApp:", err);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[whatsapp-mcp] Erreur fatale:", err);
  process.exit(1);
});

# whatsapp-mcp

Serveur MCP (Model Context Protocol) local qui connecte **Claude Desktop** a votre **compte WhatsApp personnel**, pour pouvoir lire et envoyer des messages WhatsApp directement depuis une conversation Claude — comme demontre dans la video "connecter WhatsApp a Claude Desktop" (plugin "Hello AI WhatsApp").

Ce projet reproduit le meme principe avec des briques 100% open source :

- [Baileys](https://github.com/WhiskeySockets/Baileys) : librairie non-officielle qui parle le protocole WhatsApp **Multi-Device** (le meme que whatsapp.com/web, via un QR code de liaison d'appareil).
- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) : SDK officiel pour exposer des outils MCP a Claude Desktop.

Aucun abonnement, aucun service tiers payant : tout tourne localement sur votre machine.

## ⚠️ A lire avant d'utiliser

- Ceci utilise le protocole WhatsApp Web **non-officiellement** (WhatsApp ne fournit pas d'API publique gratuite pour les comptes personnels). C'est le meme mecanisme que "WhatsApp Web" / "Appareils lies" officiel, mais via une librairie tierce — utilisez-le avec votre **propre compte**, pour un usage personnel ou professionnel raisonnable.
- Un envoi en masse non sollicite ("spam") peut faire bannir votre numero par WhatsApp. L'outil `whatsapp_bulk_outreach` est volontairement limite (10 destinataires max par appel, delai de 3-6s entre chaque envoi, confirmation explicite requise) — gardez un usage mesure et consenti.
- Ne pas committer le dossier `auth_info/` (deja dans `.gitignore`) : il contient les cles de session de votre compte WhatsApp, equivalent a un acces complet a votre compte.
- Ce serveur doit **tourner en permanence en arriere-plan** sur votre machine pour que Claude Desktop puisse l'utiliser (comme la video le montre).

## Prerequis

- [Node.js](https://nodejs.org/) version 20 ou plus.
- [Claude Desktop](https://claude.com/download) installe.
- Un smartphone avec WhatsApp installe (pour scanner le QR code).

## Installation

```bash
cd whatsapp-mcp
npm install
npm run build
```

## Premiere connexion (scan du QR code)

```bash
npm start
```

Un QR code s'affiche dans le terminal. Sur votre telephone :

1. Ouvrez **WhatsApp**.
2. Allez dans **Parametres (⋮ ou ⚙️) > Appareils lies > Lier un appareil**.
3. Scannez le QR code affiche dans le terminal.

Des que la liaison est faite, le terminal affiche `[whatsapp-mcp] Connected to WhatsApp.`. Les identifiants sont sauvegardes dans `auth_info/` : vous n'aurez plus besoin de rescanner tant que vous ne supprimez pas ce dossier (ou ne vous deliez pas depuis le telephone).

Vous pouvez arreter ce test avec `Ctrl+C` — Claude Desktop relancera le serveur automatiquement a chaque demarrage.

## Configuration de Claude Desktop

Ouvrez (ou creez) le fichier de configuration MCP de Claude Desktop :

- **macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

Ajoutez une entree `whatsapp` dans `mcpServers`, avec le **chemin absolu** vers ce dossier :

```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["/chemin/absolu/vers/whatsapp-mcp/dist/index.js"],
      "cwd": "/chemin/absolu/vers/whatsapp-mcp"
    }
  }
}
```

Sur Windows, utilisez des doubles antislash ou des slashs, par exemple :
`"C:\\Users\\VotreNom\\whatsapp-mcp\\dist\\index.js"`.

> Le `cwd` est important : c'est la que le dossier `auth_info/` sera cree/lu.

Redemarrez **completement** Claude Desktop (quittez-le aussi depuis la barre des taches / menu bar, pas juste la fenetre) pour qu'il recharge la configuration.

## Verification

Dans Claude Desktop, ouvrez **Parametres > Developer** (ou **Connectors**) : vous devriez voir le serveur `whatsapp` connecte avec ses outils charges.

Puis testez directement dans une conversation :

```
Verifie que WhatsApp est bien connecte.
```

```
Liste mes conversations WhatsApp recentes.
```

```
Envoie un message a [nom du contact] pour lui demander comment il va.
```

Claude Desktop demandera une confirmation avant chaque appel d'outil (sauf si vous choisissez "toujours autoriser") — c'est volontaire pour garder le controle, notamment sur l'envoi.

## Outils MCP exposes

| Outil | Description |
|---|---|
| `whatsapp_status` | Verifie l'etat de connexion du compte WhatsApp. |
| `whatsapp_list_chats` | Liste les conversations recentes (contacts + groupes). |
| `whatsapp_search_contact` | Cherche un contact/groupe par nom approximatif, retourne son JID. |
| `whatsapp_read_messages` | Lit les derniers messages d'une conversation (par JID). |
| `whatsapp_check_number` | Verifie si un numero de telephone a un compte WhatsApp actif. |
| `whatsapp_send_message` | Envoie un message texte a un contact ou un groupe. |
| `whatsapp_bulk_outreach` | Envoie un message personnalise a plusieurs destinataires (max 10/appel, delai anti-spam, confirmation explicite requise). |

## Limitations connues (comme dans la demo d'origine)

- **Texte uniquement** : pas d'envoi de photos, videos ou documents dans cette v1.
- **Pas d'historique complet** : ce serveur ne voit que les messages recus/envoyes **depuis qu'il tourne** (Baileys ne rapatrie pas tout l'historique d'un compte par defaut). Plus vous le laissez tourner, plus son "carnet d'adresses" et son historique en memoire se remplissent.
- Les noms de contacts ambigus (plusieurs personnes portant le meme nom) doivent etre desambiguises manuellement — `whatsapp_search_contact` retourne toutes les correspondances pour que Claude puisse demander lequel choisir.
- Certains numeros (notamment les lignes fixes professionnelles americaines) n'ont pas de compte WhatsApp : utilisez `whatsapp_check_number` avant un envoi en masse pour eviter les echecs.

## Prospection / lead generation (usage responsable)

L'outil `whatsapp_bulk_outreach` permet de reproduire la demo "recherche d'entreprises + proposition personnalisee par WhatsApp" : vous pouvez demander a Claude de chercher des contacts sur le web, verifier leurs numeros avec `whatsapp_check_number`, puis envoyer un message personnalise via cet outil. Gardez a l'esprit :

- Respectez les reglementations locales (RGPD en Europe, lois anti-spam) sur la prospection non sollicitee.
- Un volume eleve d'envois a des inconnus augmente fortement le risque de blocage du numero par WhatsApp.
- Preferez une liste de contacts qualifiee (opt-in, ou relation professionnelle existante) plutot qu'un envoi massif a froid.

## Depannage

- **"Connection closed... Logged out"** : supprimez le dossier `auth_info/` et relancez `npm start` pour rescanner un nouveau QR code.
- **Claude Desktop ne voit pas le serveur** : verifiez que les chemins dans `claude_desktop_config.json` sont bien absolus, que `npm run build` a ete execute (le dossier `dist/` doit exister), et redemarrez completement Claude Desktop.
- **Les messages/contacts n'apparaissent pas** : laissez le serveur tourner plus longtemps, ou envoyez/recevez un message de test pour peupler le cache en memoire.

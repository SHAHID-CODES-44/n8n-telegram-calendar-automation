# n8n Calendar Agent

An AI agent that manages Google Calendar through natural language. Use it from **Telegram** or from a **React web app**. Both talk to the same n8n workflow.

> "Schedule a meeting 10pm to 11pm: Movie Watch" / "Move it to 9pm" / "Delete it"

## Features

- Read, create, update, and delete Google Calendar events
- Two interfaces, one agent: Telegram bot and React chat UI
- Tool-calling agent (Groq LLM) with date and timezone awareness (IST)
- Confirmation step before deleting
- Self-hosted with Docker, no paid services

## Architecture

- Check workflows/workflow.png for Image Ref
- And Check workflows/telegram-calendar-agent.json for the Whole Workflow
- Maybe it help you for Importing it directly into you n8n

The `If` node checks which trigger fired and routes the reply back to the right client.

## Stack

| Layer | Tech |
|---|---|
| Automation | n8n (self-hosted, Docker) |
| LLM | Groq (tool-calling model) |
| Calendar | Google Calendar API (OAuth2) |
| Backend | Node.js, Express |
| Frontend | React (Vite), react-router |
| Tunnel | Cloudflare quick tunnel (Telegram webhook only) |

## Repo structure

```
backend/     Express proxy: POST /api/chat -> n8n webhook
frontend/    React chat UI
workflow/    Exported n8n workflow (credentials excluded)
prompts/     Agent system message
docker/      start-n8n.bat (tunnel + n8n restart)
docs/        Detailed setup guide
```

## Quick start

**1. n8n**
```
docker volume create n8n_data
docker run -d --restart unless-stopped --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Kolkata" -e TZ="Asia/Kolkata" \
  -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

**2. Credentials in n8n:** Telegram bot token, Groq API key, Google Calendar OAuth2. Redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`.

**3. Import the workflow:** paste `workflow/telegram-calendar-agent.json` onto the canvas (Ctrl+V), assign credentials, and publish.

**4. Backend**
```
cd backend
npm install
echo N8N_WEBHOOK_URL=http://localhost:5678/webhook/calendar-chat > .env
node server.js
```

**5. Frontend**
```
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

**6. Telegram (optional):** Telegram needs a public HTTPS URL. Run `docker/start-n8n.bat` to start the tunnel and restart n8n with `WEBHOOK_URL`, then Unpublish and Publish the workflow. The React path needs no tunnel.

Full walkthrough and troubleshooting: [docs/setup-guide.md](docs/setup-guide.md).

## Known limitations

- Quick tunnel URLs change on every restart (Telegram only).
- Google OAuth tokens expire after 7 days while the consent screen is in Testing mode.
- Groq free tier is rate limited, and tool-calling model availability changes.
- Single-user: no auth on the Express endpoint.

## Roadmap

- Conversation memory
- Scheduled daily agenda
- WhatsApp channel
- Webhook auth header and tests

## Security

Never commit tokens, API keys, OAuth secrets, or `.env` files. Exported workflows reference credentials by ID only.
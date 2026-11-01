# Setup Guide
Run a Telegram bot that reads your Google Calendar, using n8n on your own computer.
Telegram Trigger -> AI Agent (Groq + Google Calendar) -> Telegram reply

## What you need

- Windows, macOS, or Linux with **Docker Desktop**
- **cloudflared** (free Cloudflare tunnel)
- A **Telegram** account
- A **Groq** account (free API key)
- A **Google** account with Google Calendar

## 1. Start n8n with Docker

docker volume create n8n_data

docker run -d --restart unless-stopped --name n8n -p 5678:5678 -e GENERIC_TIMEZONE="Asia/Kolkata" -e TZ="Asia/Kolkata" -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n

Open `http://localhost:5678` and create your owner account. Change the timezone to your own.

## 2. Create the Telegram bot

1. In Telegram, open **@BotFather** and send `/newbot`.
2. Choose a name and a unique username ending in `bot`.
3. Copy the **token**. Keep it private and never commit it.
4. Message your new bot once, then open this link in a browser to find your Chat ID:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   Your Chat ID is the number after `"chat":{"id":`.

## 3. Get a Groq API key

1. Sign in at **console.groq.com**.
2. Go to **API Keys**, then **Create API Key**, and copy it.
3. In n8n, pick a model that supports **tool calling** (for example `openai/gpt-oss-120b` or a Llama versatile model). Groq retires models often, so check the dropdown.

## 4. Set up Google Calendar access

1. Open **console.cloud.google.com** and select (or create) a project.
2. **APIs & Services, Library:** enable **Google Calendar API**.
3. **OAuth consent screen:** choose **External** and add your Gmail as a **Test user**.
4. **Clients, Create client:** type **Web application**. Under **Authorized redirect URIs**, add:
   `http://localhost:5678/rest/oauth2-credential/callback`
5. Copy the **Client ID** and **Client Secret**.
6. In n8n, create a **Google Calendar** credential, paste both, click **Sign in with Google**, and allow access.

## 5. Start the tunnel

Telegram needs a public HTTPS address to reach n8n.

```
cloudflared tunnel --url http://localhost:5678
```

Copy the `https://....trycloudflare.com` link and keep the window open.

## 6. Restart n8n with the tunnel link

Replace `YOUR_LINK` with your link and keep the `/` at the end.

```
docker stop n8n
```

```
docker rm n8n
```

```
docker run -d --restart unless-stopped --name n8n -p 5678:5678 -e WEBHOOK_URL="YOUR_LINK/" -e GENERIC_TIMEZONE="Asia/Kolkata" -e TZ="Asia/Kolkata" -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Your workflows and credentials are kept in the `n8n_data` volume.

## 7. Build the workflow

Import `workflow/telegram-calendar-agent.json` (paste it onto the canvas with Ctrl+V), or build it by hand:

1. **Telegram Trigger:** event **On message**, with your bot token as the credential.
2. **AI Agent:**
   - Source for Prompt: **Define below**
   - Prompt (Expression): `{{ $json.message.text }}`
   - System Message: copy it from `prompts/system-message.txt`
3. **Groq Chat Model:** connect it to the agent's Chat Model slot.
4. **Google Calendar tool:** connect it to the agent's Tool slot.
   - Resource: **Event**
   - Operation: **Get Many**
   - Calendar: pick your calendar from the list
   - Limit: 20
5. **Telegram, Send a text message:**
   - Chat ID (Expression): `{{ $('Telegram Trigger').item.json.message.chat.id }}`
   - Text (Expression): `{{ $json.output }}`
   - Turn off **Append n8n Attribution**.
6. Click **Publish**.

## 8. Test

Message your bot: `What is on my calendar today?`

---

## Starting again after a shutdown

1. Open **Docker Desktop**.
2. Run `cloudflared tunnel --url http://localhost:5678` and copy the new link.
3. Run `docker stop n8n`, `docker rm n8n`, then the `docker run` command from step 6 with the new link.
4. Open `http://localhost:5678`, then **Unpublish** and **Publish** the workflow.
5. Message your bot.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Parameter "Prompt (User Message)" is required` | Set Source for Prompt to **Define below** and enter the prompt expression. |
| `model has been decommissioned` | Choose a current model in the Groq node. |
| `tool calling is not supported with this model` | Choose a model that supports tools. |
| Agent says the calendar is clear | Set the Calendar tool to Resource **Event**, Operation **Get Many**. |
| Wrong times in replies | Set the timezone in Docker and in the System Message. |
| `Access blocked` from Google | Add your Gmail under **Audience, Test users**. |
| `Telegram Trigger: Bad request` | The tunnel link changed. Redo steps 5 and 6, then Publish again. |
| Cannot test inside n8n | Unpublish first. Telegram allows only one listener. |

## Security

- Never commit tokens, API keys, Client Secrets, your Chat ID, or your email.
- If a token leaks, send `/revoke` to BotFather and update the n8n credential.
- Quick tunnels change every time and have no uptime guarantee. For always-on use, move to n8n Cloud or a small VPS.
# n8n Telegram Calendar Agent

## About the Project

A personal schedule assistant that lives in Telegram. You message the bot, for example "What is on my calendar today?", and it checks your Google Calendar and replies with your events, with times shown in your own timezone.

It is built with **n8n** (workflow automation), an **AI agent** powered by **Groq**, and the **Google Calendar API**. It runs on your own computer with Docker, so it costs nothing.

## How the workflow works

You (Telegram)
      |
      v
Telegram Trigger       receives your message
      |
      v
AI Agent               understands the question
  |- Groq Chat Model     the AI brain
  |- Google Calendar     reads your events
      |
      v
Telegram (Send)        sends the answer back to you

1. You send a message to your bot.
2. The Telegram Trigger passes it to the AI Agent.
3. The agent decides what to ask, calls the Google Calendar tool, and writes a short reply using the rules in `prompts/system-message.txt`.
4. The reply is sent back to the same Telegram chat.

## How to run it

You need: **Docker Desktop**, **cloudflared**, a **Telegram** account, a free **Groq** API key, and a **Google** account.

1. **Start n8n** in Docker:
   ```
   docker volume create n8n_data
   docker run -d --restart unless-stopped --name n8n -p 5678:5678 -e GENERIC_TIMEZONE="Asia/Kolkata" -e TZ="Asia/Kolkata" -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
   ```
   Open `http://localhost:5678` and create your account.

2. **Create the Telegram bot:** message **@BotFather**, send `/newbot`, and copy the token.

3. **Get a Groq API key** at console.groq.com.

4. **Connect Google Calendar:** enable the Google Calendar API in Google Cloud, create an OAuth Web application client, and add `http://localhost:5678/rest/oauth2-credential/callback` as the redirect URI.

5. **Add the credentials** in n8n: Telegram, Groq, and Google Calendar.

6. **Import the workflow:** copy `workflow/telegram-calendar-agent.json`, then press Ctrl+V on the n8n canvas. Select your credentials in each node.

7. **Start the tunnel and n8n:** double-click `docker/start-n8n.bat`. It starts a Cloudflare tunnel and restarts n8n with the new public link.

8. **Publish:** in n8n, click **Unpublish**, then **Publish** on the workflow.

9. **Test:** message your bot, "What is on my calendar today?"

For detailed instructions and fixes for common errors, see [docs/setup-guide.md](docs/setup-guide.md).

## Notes

- The bot works only while your computer, Docker, and the tunnel are running.
- The free tunnel link changes each time you restart it, so repeat steps 7 and 8 after every restart.
- Never commit tokens, API keys, or secrets.

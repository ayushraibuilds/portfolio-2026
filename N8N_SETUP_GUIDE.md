# 🤖 n8n AI Email Auto-Reply Pipeline — Setup Guide

## What This Does

New email → AI reads & classifies → drafts reply → sends it → logs lead → alerts you on Telegram.

**Stack:** n8n Cloud (free) + Google Gemini API (free) + Gmail + Google Sheets + Telegram Bot (free)

---

## Step 1: Create n8n Cloud Account (2 min)

1. Go to [n8n.cloud](https://n8n.cloud)
2. Sign up with Google (`ayushraibuilds@gmail.com`)
3. Free tier: **5 workflows, 100 executions/month**

---

## Step 2: Get Google Gemini API Key (3 min)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API key"**
3. Copy and save the key — free tier: **15 requests/minute**

---

## Step 3: Create the Lead Tracker Google Sheet (2 min)

1. Go to [Google Sheets](https://sheets.google.com) → Create new spreadsheet
2. Name it **"AI Lead Tracker"**
3. Add these headers in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Name | Email | Service Interest | Urgency | Summary | Reply Sent | Status |

4. Copy the **spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`

---

## Step 4: Create Telegram Bot (3 min)

1. Open Telegram → search for **@BotFather**
2. Send `/newbot`
3. Give your bot a name: `Ayush Lead Alerts`
4. Give it a username: `ayush_leads_bot` (must end in `bot`)
5. **Copy the bot token** — looks like: `7123456789:AAF...xyz`
6. **Get your chat ID:**
   - Send any message to your new bot
   - Open: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find `"chat":{"id":YOUR_CHAT_ID}` in the response
   - Copy the chat ID number

---

## Step 5: Import the Workflow (3 min)

1. In n8n, click **"Add workflow"** (+ button)
2. Click the **three dots (⋯)** → **"Import from file"**
3. Upload `n8n-workflow.json` from your `ai-portfolio` folder
4. The workflow loads with **8 nodes:**
   - 📧 New Email Received
   - 🚫 Filter Spam & Auto-Replies
   - 🧠 AI: Classify & Draft Reply
   - ⚙️ Parse AI Response
   - ✉️ Send AI Reply
   - 📊 Log Lead to Sheet
   - 🔍 Urgency Check *(new)*
   - 📱 Telegram Alert *(new)*

---

## Step 6: Connect Gmail Credentials (5 min)

1. Click the **"New Email Received"** node
2. Click **"Credential to connect with"** → **"Create New Credential"**
3. Select **"Gmail OAuth2"**
4. Sign in with `ayushraibuilds@gmail.com` → allow all permissions
5. Save the credential
6. **Apply the same credential** to the **"Send AI Reply"** node

---

## Step 7: Connect Gemini API (2 min)

1. Click the **"AI: Classify & Draft Reply"** node
2. Click **"Credential to connect with"** → **"Create New Credential"**
3. Select **"Google Gemini (PaLM) API"**
4. Paste your API key from Step 2 → Save

---

## Step 8: Connect Google Sheets (3 min)

1. Click the **"Log Lead to Sheet"** node
2. Click **"Credential to connect with"** → **"Create New Credential"**
3. Select **"Google Sheets OAuth2"**
4. Authorize with your Google account
5. Update the **Document ID** with your spreadsheet ID from Step 3

---

## Step 9: Connect Telegram (2 min)

1. Click the **"Telegram Alert"** node
2. In the URL field, replace `REPLACE_WITH_YOUR_TELEGRAM_BOT_TOKEN` with your bot token from Step 4
3. In the body parameters, replace `REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID` with your chat ID from Step 4

---

## Step 10: Test It! (5 min)

1. Click **"Test workflow"** in n8n
2. From a **different email account**, send a test email:
   - **To:** ayushraibuilds@gmail.com
   - **Subject:** Need a WhatsApp chatbot for my D2C brand
   - **Body:** Hi, I run a skincare brand in Mumbai and get 100+ WhatsApp messages daily. Need a bot that handles order tracking and refunds. Budget: $1000. When can you start?
3. Wait ~30 seconds, then verify:
   - ✅ AI-generated reply received in test email inbox
   - ✅ New row in Google Sheet with lead details
   - ✅ Telegram notification on your phone (urgency should be "high")
4. If everything works, toggle **"Active"** (top-right) to turn it ON permanently

---

## Services the AI References

| Service | Price | Keywords it detects |
|---|---|---|
| WhatsApp AI Agents | $150+ (₹12,000+) | chatbot, WhatsApp, bot, support |
| AI SaaS Tools | $250+ (₹20,000+) | SaaS, dashboard, app, platform |
| Workflow Automation | $50+ (₹5,000+) | automation, n8n, Zapier, workflow |
| RAG / Knowledge | Custom | RAG, search, knowledge, embeddings |
| Full-Stack Web Dev | Custom | website, web app, frontend, backend |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Gmail says "insufficient permissions" | Re-authorize the credential. Tick all permission boxes. |
| AI returns garbage/errors | Verify Gemini API key at [AI Studio](https://aistudio.google.com/apikey) |
| Google Sheet not updating | Check Document ID. Ensure Sheet1 has exact headers. |
| Telegram alert not arriving | Verify bot token and chat ID. Send a message to the bot first. |
| Replies going to spam | Normal initially. Mark as "not spam" a few times. |
| Workflow not triggering | Ensure it's set to **Active** (toggle top-right) |

---

## Cost Summary

| Service | Cost |
|---|---|
| n8n Cloud | Free (100 runs/month) |
| Google Gemini API | Free (15 req/min) |
| Gmail | Free |
| Google Sheets | Free |
| Telegram Bot | Free |
| **Total** | **₹0/month** |

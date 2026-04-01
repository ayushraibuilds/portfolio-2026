# ✍️ AI Proposal Writer — Setup Guide

## What This Does

Send a job description → AI generates a tailored Upwork proposal → sends it to your Telegram → logs to Google Sheets.

**Trigger:** POST webhook (can be called from Telegram, browser, or the Upwork Screener)

**Stack:** n8n Cloud (free) + Gemini API (free) + Telegram (free) + Google Sheets (free)

---

## Step 1: Create Google Sheet (2 min)

1. Create a new spreadsheet: **"AI Proposals"**
2. Headers in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Job Title | Confidence | Matching Projects | Suggested Rate | Proposal | Job Link | Status |

3. Copy the spreadsheet ID

---

## Step 2: Import the Workflow (3 min)

1. In n8n, import `proposal-writer-workflow.json`
2. The workflow has **8 nodes:**
   - 🔗 Webhook: Generate Proposal
   - ✅ Validate Input
   - 🔍 Valid Input?
   - 🧠 AI: Write Proposal
   - ⚙️ Parse Proposal
   - 📱 Telegram: Send Proposal
   - 📝 Log Proposal
   - 📤 Respond to Webhook

---

## Step 3: Connect Credentials (3 min)

1. **Gemini API:** Click "AI: Write Proposal" → add credential
2. **Google Sheets:** Click "Log Proposal" → add credential → set Document ID
3. **Telegram:** Click "Telegram: Send Proposal" → replace bot token and chat ID

---

## Step 4: Activate & Get Webhook URL (2 min)

1. Toggle workflow to **Active**
2. Click the **"Webhook: Generate Proposal"** node
3. Copy the **Production URL** — looks like: `https://your-instance.app.n8n.cloud/webhook/generate-proposal`

---

## Step 5: Test It (3 min)

### Using curl:
```bash
curl -X POST https://YOUR_N8N_URL/webhook/generate-proposal \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Need n8n + AI automation expert",
    "job_description": "We need someone to build an automated lead qualification pipeline using n8n and AI. Must have experience with LLMs and webhook integrations. Budget: $500.",
    "budget": "$500 fixed",
    "link": "https://upwork.com/jobs/example"
  }'
```

### Verify:
- ✅ Telegram receives the generated proposal
- ✅ Google Sheet logs the proposal
- ✅ curl response contains the proposal JSON

---

## Connecting to Upwork Screener (Optional)

To auto-generate proposals for jobs scored "APPLY":

1. In the Upwork Screener workflow, add an **HTTP Request** node after "APPLY or MAYBE?"
2. Set it to POST to your Proposal Writer webhook URL
3. Map the fields: `job_title`, `job_description`, `budget`, `link`

This creates a fully automated pipeline: **Job found → Scored → Proposal generated → Sent to Telegram**

---

## Cost: ₹0/month

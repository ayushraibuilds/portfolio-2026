# 🔍 Upwork Job Screener Bot — Setup Guide

## What This Does

Every 30 minutes: scans 5 Upwork RSS feeds → AI scores each job (0-100) against your skills → alerts you on Telegram for APPLY/MAYBE jobs → logs everything to Google Sheets.

**Stack:** n8n Cloud (free) + Gemini API (free) + Telegram (free) + Google Sheets (free)

---

## Step 1: Create Google Sheet (2 min)

1. Go to [Google Sheets](https://sheets.google.com) → Create new spreadsheet
2. Name it **"Upwork Job Screener"**
3. Add these headers in Row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Date | Job Title | Score | Verdict | Budget | Reason | Matching Projects | Job Link | Applied |

4. Copy the spreadsheet ID from the URL

---

## Step 2: Import the Workflow (3 min)

1. In n8n, click **"Add workflow"** (+ button)
2. Import `upwork-screener-workflow.json`
3. The workflow loads with **14 nodes:**
   - ⏰ Every 30 Minutes (schedule trigger)
   - 🌐 5× RSS Feed Fetchers (n8n, LangGraph, WhatsApp, AI Agent, FastAPI)
   - 📖 Read Existing Jobs (Google Sheets lookup)
   - ⚙️ Parse & Deduplicate RSS
   - 🆕 Filter New Jobs Only
   - 🧠 AI: Score Job (Gemini)
   - 📊 Parse Score
   - 📝 Log All Jobs (Google Sheets)
   - 🔍 APPLY or MAYBE? (verdict filter)
   - 📱 Telegram: Job Alert

---

## Step 3: Connect Credentials (5 min)

1. **Google Sheets:** Click "Read Existing Jobs" + "Log All Jobs" → add Google Sheets credential → update Document ID
2. **Gemini API:** Click "AI: Score Job" → add Gemini credential
3. **Telegram:** Click "Telegram: Job Alert" → replace bot token and chat ID (same as Lead Pipeline bot)

---

## Step 4: Customize RSS Feeds (Optional)

The default feeds search for:
- `n8n automation`
- `langgraph python`
- `whatsapp chatbot ai`
- `ai agent python`
- `fastapi ai`

To change keywords, click any RSS fetch node and edit the URL query parameter `q=your+keywords`.

---

## Step 5: Test & Activate (3 min)

1. Click **"Test workflow"**
2. Wait for RSS feeds to fetch (~30 seconds)
3. Verify:
   - ✅ Jobs appear parsed in the "Parse & Deduplicate RSS" node
   - ✅ Each job gets a score in "Parse Score"
   - ✅ Google Sheet has new rows
   - ✅ Telegram receives an alert for any APPLY/MAYBE jobs
4. Toggle **"Active"** to turn it ON

---

## How Scoring Works

| Component | Points | What it measures |
|---|---|---|
| Skill Match | 0-40 | How many of your skills match the job |
| Project Proof | 0-30 | Whether you have a real built project to reference |
| Rate Fit | 0-15 | Is the budget reasonable ($20+/hr or $200+ fixed) |
| Red Flags | 0-15 | Deducted for: free trials, unclear scope, Shopify/WordPress-only |

**Verdicts:**
- 🟢 **APPLY** (70-100): Strong match, apply immediately
- 🟡 **MAYBE** (50-69): Decent match, review manually
- 🔴 **SKIP** (0-49): Poor match, logged but no alert

---

## Cost: ₹0/month

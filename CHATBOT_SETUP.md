# 🤖 Portfolio AI Chatbot — Setup Guide

## What This Does

A chat widget on your portfolio website where visitors ask questions → AI answers using your full portfolio data → converts visitors to leads.

**Stack:** Vanilla JS widget + Netlify Function (free) + Gemini API (free)

---

## Architecture

```
Visitor clicks chat bubble → types question
    → JS sends POST to /.netlify/functions/chat (same domain)
    → Netlify Function calls Gemini 2.0 Flash with portfolio context
    → Response sent back to chat widget
    → Conversation saved in localStorage
```

No separate deployment needed — the function deploys with your portfolio site.

**Fallback:** When the API is unavailable, the chatbot uses smart keyword-based responses built into `chatbot.js`, so the widget never appears broken.

---

## Step 1: Add Gemini API Key to Netlify (3 min)

1. Go to your Netlify dashboard → your portfolio site
2. Go to **Site settings → Environment variables**
3. Add: `GEMINI_API_KEY` = your key from [AI Studio](https://aistudio.google.com/apikey)
4. **Redeploy** the site (Deploys → Trigger deploy)

That's it. The function at `netlify/functions/chat.js` deploys automatically.

---

## Step 2: Test It (2 min)

1. Open your deployed portfolio site
2. Click the purple chat bubble (bottom-right, above WhatsApp button)
3. Chat panel opens with welcome message
4. Type: "What projects has Ayush built?"
5. Verify AI response appears

**Test fallback:** Disconnect internet → type a message → should get a keyword-based fallback response.

---

## Features

| Feature | Details |
|---|---|
| **Chat history** | Saved in localStorage, survives page reload |
| **Typewriter effect** | Bot messages appear character by character |
| **Typing indicator** | Animated dots while AI is generating |
| **Smart fallback** | Works without API — responds to pricing, projects, contact, tech stack queries |
| **Rate limiting** | 20 requests/minute per IP on the Netlify Function |
| **Mobile responsive** | Full-screen chat on mobile devices |
| **Clear chat** | 🗑️ button in header clears history |

---

## File Structure

```
ai-portfolio/
├── chatbot.css              ← widget styles
├── chatbot.js               ← chat logic + fallback
├── netlify/
│   └── functions/
│       └── chat.js          ← Gemini API proxy (auto-deployed)
```

---

## Cost: $0/month
- Netlify Functions: Free (125K requests/month)
- Gemini API: Free (15 requests/minute)

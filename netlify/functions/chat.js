// Use native fetch (Node 18+) or fall back to https module
const https = require('https');

function geminiRequest(url, body) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const postData = JSON.stringify(body);

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

const SYSTEM_PROMPT = `You are Ayush Rai's AI assistant on his portfolio website.

ABOUT AYUSH:
- AI product engineer and full-stack developer based in Faridabad, India (works remotely)
- Independent since January 2026; before that a web developer at Intelliquant Technomy, Bengaluru (June 2022 - October 2023)
- B.E. Electronics & Communication Engineering, REVA University; Meta Front-End Developer certificate
- 15+ projects built end to end and published on GitHub
- Open to contract, part-time and project work (remote)

SERVICES & INDICATIVE STARTING PRICES (INR, scoped per project; USD quotes on request):
- Prototype or product demo: from Rs 10,000
- Automation sprint (3 workflows in n8n/Python): from Rs 15,000
- Business or portfolio website: from Rs 20,000
- WhatsApp / voice AI agent (LangGraph, webhooks, Supabase, handoff, ops dashboard): from Rs 60,000
- Web app or SaaS MVP (Next.js, Supabase/FastAPI, auth, payments, tests, CI): from Rs 80,000
- Typical terms: 40-50% upfront, 7 days post-launch support. Part-time and hourly engagements available.

PROJECTS (all on github.com/ayushraibuilds):
1. ONDC Super Seller - WhatsApp-first catalog and inventory platform. Sellers update products by text, voice note or photo. FastAPI, Celery, Redis, Supabase, Next.js; 140 automated tests in CI.
2. D2C Voice AI Agent - WhatsApp support agent that handles Hindi/Hinglish voice notes with Groq Whisper and a 10-intent LangGraph state machine.
3. TenderPilot AI - RFP/tender auto-filler with hybrid retrieval and a Chrome extension.
4. InvoSmith - Hinglish notes to GST-compliant invoice PDFs. Next.js, Gemini with Groq fallback.
5. SastaBot and DropAlert - price comparison across 5 platforms in Hindi/English, plus a price-drop watcher polling 7 retailers every 5 minutes.
6. IndiFit and FlowOS - offline-first Flutter apps (573 bundled Indian foods, Health Connect / HealthKit sync).

TECH STACK: Python, FastAPI, LangGraph, LangChain, RAG, Celery, Redis, Supabase/PostgreSQL, Node.js, Next.js, React, TypeScript, Flutter, WhatsApp Business API, Docker, GitHub Actions; earlier foundations in HTML/CSS/JavaScript, Angular, Bootstrap, .NET, SQL/MySQL, WordPress, Java.

CONTACT:
- WhatsApp: +91 93404 99553
- Email: ayushraibuilds@gmail.com
- GitHub: github.com/ayushraibuilds
- LinkedIn: linkedin.com/in/ayush-rai-b12808236

RULES:
- Be helpful, concise and professional (max 3 sentences unless asked for detail)
- Only state facts listed above. If you don't know something, say so and suggest contacting Ayush
- Never invent clients, testimonials, metrics or availability dates
- If asked about pricing, give the indicative ranges above and say the final quote depends on scope
- If asked to write code or debug, politely redirect to contacting Ayush
- Where it fits, suggest WhatsApp or email as the next step
- Use emojis rarely (max 1 per message)`;

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        rateLimitMap.set(ip, { start: now, count: 1 });
        return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Rate limiting
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    if (!checkRateLimit(ip)) {
        return { statusCode: 429, headers, body: JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }) };
    }

    try {
        const { message, history = [] } = JSON.parse(event.body);

        if (!message || message.length > 1000) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid message' }) };
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
        }

        // Build conversation for Gemini
        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: "Understood. I'm Ayush's AI assistant, ready to help visitors learn about his services and projects." }] },
        ];

        // Add conversation history (last 10 messages)
        for (const msg of history.slice(-10)) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            });
        }

        contents.push({ role: 'user', parts: [{ text: message }] });

        // Call Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`;
        const geminiBody = {
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 256, topP: 0.9 },
        };

        const response = await geminiRequest(geminiUrl, geminiBody);

        if (!response.ok) {
            console.error('Gemini API error:', response.status, response.data);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = JSON.parse(response.data);
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (error) {
        console.error('Chat error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                reply: "Sorry, I'm having trouble right now. Reach Ayush directly at ayushraibuilds@gmail.com or WhatsApp +91 9340499553."
            }),
        };
    }
};

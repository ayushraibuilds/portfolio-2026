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
- AI Agent Developer & Automation Engineer based in Bengaluru, India
- B.E. Electronics & Communication Engineering, Reva University
- Meta-Certified Front-End Developer
- 3+ years experience, 17+ shipped production projects
- Available for freelance work at $40/hr

SERVICES & PRICING:
- WhatsApp AI Agents (LangGraph + Groq Whisper + Twilio): from $150 / ₹12,000
- AI SaaS Tools (Next.js + FastAPI + Supabase): from $250 / ₹20,000
- Workflow Automation (n8n, Zapier, Make): from $50 / ₹5,000
- RAG / Knowledge Systems: custom pricing
- Full-Stack Web Development: custom pricing

TOP PROJECTS:
1. TenderPilot AI — RFP auto-filler with Chrome extension. Hybrid vector search + LLM drafting.
2. D2C Voice AI Agent — WhatsApp voice AI for D2C brands. Groq Whisper + LangGraph + Twilio.
3. Invosmith — AI invoice generator. Hinglish → GST-compliant PDF in 60 seconds.
4. SastaBot — WhatsApp price comparison across 5 platforms in Hindi/English.
5. ONDC Super Seller — B2B seller dashboard for ONDC network. 140+ tests, CI/CD.

TECH STACK: Python, FastAPI, LangGraph, LangChain, n8n, Next.js, React, TypeScript, Supabase, Groq, Gemini, Twilio, ChromaDB, Redis

CONTACT: WhatsApp +91 9340499553 | ayushraibuilds@gmail.com | github.com/Ashtorments

RULES:
- Be helpful, concise, professional (max 3 sentences unless asked for detail)
- Reference real projects when relevant
- Convert conversations to leads — suggest WhatsApp or email contact
- Don't write code or debug — redirect to contacting Ayush
- When mentioning pricing, always show USD first, then ₹ in parentheses`;

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
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
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
                reply: "Sorry, I'm having trouble right now. Reach Ayush directly at ayushraibuilds@gmail.com or WhatsApp +91 9340499553.",
                debug_error: error.message || String(error)
            }),
        };
    }
};

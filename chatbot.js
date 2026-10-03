/**
 * Portfolio AI Chatbot Widget
 * Connects to Gemini via a Netlify Function proxy
 * Falls back to a local system prompt if proxy is unavailable
 */

class AIChatbot {
    constructor() {
        // Configuration
        this.API_URL = '/.netlify/functions/chat'; // Same domain, no separate deploy needed
        this.STORAGE_KEY = 'ayush_chatbot_history';
        this.MAX_HISTORY = 20;
        this.isOpen = false;
        this.isTyping = false;

        // System prompt with full portfolio knowledge
        this.systemPrompt = `You are Ayush Rai's AI assistant on his portfolio website.

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

        this.history = this.loadHistory();
        this.init();
    }

    init() {
        this.bubble = document.getElementById('chatBubble');
        this.panel = document.getElementById('chatPanel');
        this.messagesContainer = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSendBtn');
        this.clearBtn = document.getElementById('chatClearBtn');
        this.closeBtn = document.getElementById('chatCloseBtn');

        if (!this.bubble || !this.panel) return;

        // Event listeners
        this.bubble.addEventListener('click', () => this.toggle());
        this.closeBtn.addEventListener('click', () => this.close());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize input
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 80) + 'px';
        });

        // Render existing history
        this.renderHistory();

        // Show welcome message if no history
        if (this.history.length === 0) {
            this.addBotMessage("Hey, I'm Ayush's AI assistant. Ask me about his projects, services or availability.");
            this.renderSuggestions();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.panel.setAttribute('aria-hidden', 'false');
        this.bubble.setAttribute('aria-label', 'Close chat');
        this.panel.classList.add('open');
        this.bubble.classList.add('active');
        this.input.focus();
        this.scrollToBottom();
    }

    close() {
        this.isOpen = false;
        this.panel.setAttribute('aria-hidden', 'true');
        this.bubble.setAttribute('aria-label', 'Open chat');
        this.panel.classList.remove('open');
        this.bubble.classList.remove('active');
    }

    renderSuggestions() {
        this.removeSuggestions();
        const wrap = document.createElement('div');
        wrap.className = 'chat-suggest';
        wrap.id = 'chatSuggest';
        ['What have you built?', 'Pricing?', 'Are you available?'].forEach(q => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = q;
            b.addEventListener('click', () => { this.input.value = q; this.sendMessage(); });
            wrap.appendChild(b);
        });
        this.messagesContainer.appendChild(wrap);
    }

    removeSuggestions() {
        const old = document.getElementById('chatSuggest');
        if (old) old.remove();
    }

    // --- Message Handling ---

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isTyping) return;

        this.input.value = '';
        this.input.style.height = 'auto';
        this.removeSuggestions();
        this.addUserMessage(text);
        this.showTyping();

        try {
            const response = await this.callAPI(text);
            this.hideTyping();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTyping();
            this.addBotMessage("Sorry, I'm having trouble connecting right now. You can reach Ayush directly at ayushraibuilds@gmail.com or WhatsApp +91 93404 99553.");
        }
    }

    addUserMessage(text) {
        this.history.push({ role: 'user', content: text });
        this.saveHistory();
        this.renderMessage('user', text);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        this.history.push({ role: 'assistant', content: text });
        this.saveHistory();
        this.renderMessageAnimated('bot', text);
    }

    renderMessage(type, text) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        msg.textContent = text;
        this.messagesContainer.appendChild(msg);
    }

    renderMessageAnimated(type, text) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        this.messagesContainer.appendChild(msg);

        // Typewriter effect
        let i = 0;
        const speed = 15; // ms per character
        const typeWriter = () => {
            if (i < text.length) {
                msg.textContent = text.substring(0, i + 1);
                i++;
                this.scrollToBottom();
                setTimeout(typeWriter, speed);
            }
        };
        typeWriter();
    }

    showTyping() {
        this.isTyping = true;
        this.sendBtn.disabled = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.sendBtn.disabled = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    // --- API Communication ---

    async callAPI(message) {
        // Build conversation history for context
        const recentHistory = this.history.slice(-10).map(h => ({
            role: h.role,
            content: h.content
        }));

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: recentHistory
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.reply || data.response || data.text || 'Sorry, I could not generate a response.';
        } catch (error) {
            console.warn('Chatbot API error, using fallback:', error);
            return this.fallbackResponse(message);
        }
    }

    // Fallback responses when the API is unavailable
    fallbackResponse(message) {
        const lower = message.toLowerCase();
        const has = (...words) => words.some(w => lower.includes(w));

        if (has('pric', 'cost', 'rate', 'charge', 'quote', 'budget', 'how much')) {
            return "Indicative starting points: prototypes from ₹10,000, automation sprints from ₹15,000, websites from ₹20,000, WhatsApp AI agents from ₹60,000 and web app / SaaS MVPs from ₹80,000. Final quotes depend on scope — email ayushraibuilds@gmail.com for one.";
        }
        if (has('project', 'portfolio', 'built', 'work', 'github')) {
            return "Highlights: ONDC Super Seller (WhatsApp-first catalog platform, 140 tests in CI), a Hinglish voice support agent on LangGraph, TenderPilot AI (RFP auto-filler), InvoSmith (GST invoices), SastaBot / DropAlert and the IndiFit Flutter app. Open any card in the Work section, or see github.com/ayushraibuilds.";
        }
        if (has('contact', 'hire', 'available', 'whatsapp', 'email', 'reach')) {
            return "Ayush is open to contract, part-time and project work. Reach him on WhatsApp at +91 93404 99553 or email ayushraibuilds@gmail.com.";
        }
        if (has('tech', 'stack', 'skill', 'language', 'framework')) {
            return "Python, FastAPI, LangGraph, LangChain, RAG, Celery/Redis, Supabase, Next.js, React, TypeScript and Flutter — plus web foundations in Angular, .NET, SQL and WordPress.";
        }
        if (has('hello', 'hi ', 'hey') || lower.trim() === 'hi') {
            return "Hey! I'm Ayush's AI assistant. Ask me about his projects, services, pricing or tech stack.";
        }
        return "I can tell you about Ayush's projects, services, pricing or stack. For anything specific, email ayushraibuilds@gmail.com or WhatsApp +91 93404 99553.";
    }

    // --- History Management ---

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    saveHistory() {
        // Keep only last N messages
        if (this.history.length > this.MAX_HISTORY) {
            this.history = this.history.slice(-this.MAX_HISTORY);
        }
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        } catch {
            // Storage full — clear old history
            this.history = this.history.slice(-5);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        }
    }

    renderHistory() {
        this.messagesContainer.innerHTML = '';
        for (const msg of this.history) {
            const type = msg.role === 'user' ? 'user' : 'bot';
            this.renderMessage(type, msg.content);
        }
        this.scrollToBottom();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem(this.STORAGE_KEY);
        this.messagesContainer.innerHTML = '';
        this.addBotMessage("Chat cleared. How can I help?");
        this.renderSuggestions();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiChatbot = new AIChatbot();
});

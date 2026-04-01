/**
 * Portfolio AI Chatbot Widget
 * Connects to Gemini via a Vercel Edge Function proxy
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
- AI Agent Developer & Automation Engineer based in Bengaluru, India
- B.E. Electronics & Communication Engineering, Reva University
- Meta-Certified Front-End Developer
- 3+ years experience, 17+ shipped production projects
- Available for freelance work at $40/hr

SERVICES & PRICING:
- WhatsApp AI Agents (LangGraph + Groq Whisper + Twilio): from $150 (₹12,000)
- AI SaaS Tools (Next.js + FastAPI + Supabase): from $250 (₹20,000)
- Workflow Automation (n8n, Zapier, Make): from $50 (₹5,000)
- RAG / Knowledge Systems: custom pricing
- Full-Stack Web Development: custom pricing

TOP PROJECTS:
1. TenderPilot AI — RFP auto-filler. Parses tender documents with hybrid vector search, auto-drafts answers, fills portal fields via Chrome extension. React + Node + SQLite + Supabase. Free/Pro/Team tiers.
2. D2C Voice AI Agent — WhatsApp support agent for Indian D2C brands. Transcribes Hindi/English voice notes via Groq Whisper, classifies 10 intent types in LangGraph, resolves 80% of tickets autonomously. FastAPI + LangGraph + Twilio.
3. Invosmith — AI invoice generator for Indian freelancers. Paste Hinglish notes → GST-compliant PDF in 60 seconds. Gemini → Groq fallback chain. Next.js + 5 templates + Resend email delivery.
4. SastaBot — Multilingual WhatsApp price comparison agent. Compare prices across Amazon, Flipkart, Blinkit, Zepto, Instamart in Hindi or English. FastAPI + LangGraph + Redis.
5. ONDC Super Seller — B2B seller dashboard for India's ONDC network. WhatsApp catalog management, bulk product import, real-time analytics, 140+ automated tests. Next.js + FastAPI + Supabase.

TECH STACK: Python, FastAPI, LangGraph, LangChain, n8n, Next.js, React, TypeScript, Supabase, Groq, Gemini, Twilio, ChromaDB, Redis, Node.js, JWT, vector search

CONTACT:
- WhatsApp: +91 9340499553
- Email: ayushraibuilds@gmail.com
- GitHub: github.com/Ashtorments

RULES:
- Be helpful, concise, and professional
- If asked about pricing, give the ranges above and suggest a call for custom quotes
- If asked to do something you can't (write code, debug, etc.), politely redirect to contacting Ayush
- Always try to convert the conversation to a lead: suggest contacting via WhatsApp or email
- Max 3 sentences per response unless specifically asked for detail
- Use emojis sparingly (max 1 per message)
- If greeting, say "Hey! I'm Ayush's AI assistant. Ask me anything about his work, services, or projects."`;

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
            this.addBotMessage("Hey! 👋 I'm Ayush's AI assistant. Ask me anything about his work, services, or projects.");
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
        this.panel.classList.add('open');
        this.bubble.classList.add('active');
        this.input.focus();
        this.scrollToBottom();
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
        this.bubble.classList.remove('active');
    }

    // --- Message Handling ---

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isTyping) return;

        this.input.value = '';
        this.input.style.height = 'auto';
        this.addUserMessage(text);
        this.showTyping();

        try {
            const response = await this.callAPI(text);
            this.hideTyping();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTyping();
            this.addBotMessage("Sorry, I'm having trouble connecting right now. You can reach Ayush directly at ayushraibuilds@gmail.com or WhatsApp +91 9340499553.");
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

    // Fallback responses when API is unavailable
    fallbackResponse(message) {
        const lower = message.toLowerCase();

        if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge')) {
            return "Ayush's services start at $50 (₹5,000) for workflow automation, $150 (₹12,000) for WhatsApp AI agents, and $250 (₹20,000) for full AI SaaS tools. For a custom quote, reach out at ayushraibuilds@gmail.com.";
        }
        if (lower.includes('project') || lower.includes('portfolio') || lower.includes('built') || lower.includes('work')) {
            return "Ayush has shipped 17+ production projects including TenderPilot AI (RFP auto-filler), D2C Voice Agent (WhatsApp voice AI), Invosmith (AI invoice generator), SastaBot (price comparison bot), and ONDC Super Seller (B2B dashboard). Scroll down to the Projects section to see details!";
        }
        if (lower.includes('contact') || lower.includes('hire') || lower.includes('available') || lower.includes('whatsapp')) {
            return "Ayush is currently available for freelance work! Best ways to reach him: WhatsApp +91 9340499553 or email ayushraibuilds@gmail.com. He typically responds within 2 hours.";
        }
        if (lower.includes('tech') || lower.includes('stack') || lower.includes('skill')) {
            return "Ayush's core stack: Python, FastAPI, LangGraph, LangChain, n8n, Next.js, React, TypeScript, Supabase, Groq, Gemini, Twilio, Redis, and vector databases. He specializes in production AI systems.";
        }
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return "Hey! I'm Ayush's AI assistant. Ask me about his projects, services, pricing, or tech stack — or I can help you get in touch with him directly.";
        }
        return "I'd love to help! You can ask me about Ayush's projects, services, pricing, or tech stack. For specific inquiries, reach out directly at ayushraibuilds@gmail.com or WhatsApp +91 9340499553.";
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
        this.addBotMessage("Chat cleared! 🧹 How can I help you?");
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiChatbot = new AIChatbot();
});

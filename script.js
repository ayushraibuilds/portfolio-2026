/* ==========================================================
   Ayush Rai — Portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================== */
(() => {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GH = 'https://github.com/ayushraibuilds/';

    /* ---------- Project data (facts taken from the repos / resume) ---------- */
    const PROJECTS = {
        ondc: {
            tag: 'Full-stack · WhatsApp-first',
            title: 'ONDC Super Seller',
            lede: "A catalog and inventory platform for small sellers on India's ONDC network, driven from WhatsApp instead of a dashboard they never open.",
            does: [
                'Sellers update their catalog by text, voice note or product photo',
                'Next.js dashboard with CSV bulk import/export and price updates',
                'Low-stock alerts and an activity log'
            ],
            built: [
                'An LLM parser with circuit-breaker fallback turns messages into structured catalog writes in Supabase',
                'Runs as three Railway services (API, Celery worker, Celery beat) plus a Vercel dashboard',
                '140 automated tests run in GitHub Actions CI'
            ],
            stack: ['FastAPI', 'Celery', 'Redis', 'Supabase', 'Next.js', 'Twilio', 'Groq'],
            link: GH + 'ondc-super-seller'
        },
        d2c: {
            tag: 'AI agent · WhatsApp + voice',
            title: 'D2C Voice AI Agent',
            lede: 'A WhatsApp support agent for Indian D2C brands that understands Hindi and Hinglish voice notes, where most chatbots only read text.',
            does: [
                'Transcribes voice notes and routes each message through 10 intents',
                'Order status, refunds, cancellations, exchanges, payment issues and FAQs',
                'Hands over to a human when it should, with context'
            ],
            built: [
                'LangGraph state machine on FastAPI with Groq Whisper for transcription',
                'Webhook signature validation, rate limiting and retries',
                'Docker, GitHub Actions CI, Supabase migrations and a Next.js ops dashboard'
            ],
            stack: ['LangGraph', 'FastAPI', 'Groq Whisper', 'Twilio', 'Next.js', 'Supabase'],
            link: GH + 'd2c-voice-agent'
        },
        tender: {
            tag: 'AI SaaS · RAG',
            title: 'TenderPilot AI',
            lede: 'An RFP and tender auto-filler for agencies and IT teams: read the document, draft the answers, fill the portal.',
            does: [
                'Learns from PDF, DOCX and XLSX knowledge sources',
                'Drafts answers with side-by-side review and confidence tags',
                'Exports to Excel, PDF, JSON and XML; a Chrome extension fills portal fields'
            ],
            built: [
                'Hybrid retrieval: full-text search plus vector rerank',
                'JWT auth with workspace isolation',
                'Free / Pro / Team usage tiers'
            ],
            stack: ['React', 'TypeScript', 'Express', 'Vector search', 'Chrome MV3'],
            link: GH + 'tender-rfp-autofiller'
        },
        invo: {
            tag: 'SaaS tool · PWA',
            title: 'InvoSmith',
            lede: 'Invoices and proposals for Indian freelancers, from messy project notes (Hinglish welcome) to a GST-ready PDF.',
            does: [
                'Turns raw notes into a structured, GST-compliant invoice PDF',
                'Calculates CGST / SGST / IGST by state and includes UPI details',
                'Delivers by email through Resend'
            ],
            built: [
                'Next.js 16 and TypeScript with Zod-validated AI output',
                'Multi-provider LLM chain (Gemini, with Groq as fallback)',
                'Per-IP rate limiting and installable PWA'
            ],
            stack: ['Next.js', 'TypeScript', 'Gemini', 'Groq', 'Zod', 'Resend'],
            link: GH + 'InvoSmith'
        },
        sasta: {
            tag: 'Price intelligence',
            title: 'SastaBot & DropAlert',
            lede: 'Two sides of the same idea: ask for the best price in Hindi or English, or let a worker watch for the drop.',
            does: [
                'SastaBot compares Amazon, Flipkart, Blinkit, Zepto and Instamart on web and WhatsApp',
                'DropAlert checks 7 retailers every 5 minutes',
                'Alerts by email, push, Telegram and WhatsApp'
            ],
            built: [
                'FastAPI + LangGraph conversational layer',
                'Playwright scrapers run by Celery workers with Redis',
                'Next.js front end'
            ],
            stack: ['FastAPI', 'LangGraph', 'Playwright', 'Celery', 'Redis', 'Next.js'],
            link: GH + 'sastabot'
        },
        mobile: {
            tag: 'Mobile · offline-first',
            title: 'IndiFit & FlowOS',
            lede: 'Two Flutter apps built to work without a connection and sync when there is one.',
            does: [
                'IndiFit: workout and nutrition tracker with 573 bundled Indian foods plus 25 regional entries',
                'Health Connect / HealthKit sync and password-protected backup',
                'FlowOS: energy-aware focus planner with AI daily reports and a Chrome extension'
            ],
            built: [
                'Flutter with Riverpod state management',
                'Drift (SQLite) for local data, Supabase for sync',
                'Gemini for AI reports; 676 commits on IndiFit alone'
            ],
            stack: ['Flutter', 'Riverpod', 'Drift', 'Supabase', 'Gemini'],
            link: GH + 'indifit'
        }
    };

    /* ---------- Nav ---------- */
    const nav = $('#nav');
    const navToggle = $('#navToggle');
    const navLinks = $('#navLinks');
    const progress = $('#scrollProgress');
    const sectionLinks = new Map($$('a', navLinks).map(a => [a.getAttribute('href').slice(1), a]));
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            nav.classList.toggle('scrolled', y > 24);
            if (y < 240) sectionLinks.forEach(l => l.classList.remove('active'));
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const closeMenu = () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', navLinks).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // active link highlighting
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(l => l.classList.remove('active'));
            const link = sectionLinks.get(entry.target.id);
            if (link) link.classList.add('active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionLinks.forEach((_, id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });

    /* ---------- Reveal on scroll ---------- */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => revealObserver.observe(el));

    /* ---------- Count-up numbers ---------- */
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            countObserver.unobserve(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            if (reduceMotion) { el.textContent = target; return; }
            const start = performance.now();
            const dur = 1600;
            const tick = now => {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 4);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(el => countObserver.observe(el));

    /* ---------- Hero phone demo ---------- */
    (() => {
        const body = $('#phoneBody');
        const trace = $('#trace');
        if (!body || !trace) return;
        const msgs = $$('.msg', body);
        const typing = $('.typing', body);
        const rows = $$('.trace-row', trace);
        const byStep = (list, step) => list.find(el => el.dataset.step === String(step));
        const timers = [];
        const at = (ms, fn) => timers.push(setTimeout(fn, ms));

        const showAll = () => {
            msgs.forEach(m => m.classList.add('show'));
            rows.forEach(r => r.classList.add('show'));
        };
        const reset = () => {
            timers.splice(0).forEach(clearTimeout);
            msgs.forEach(m => m.classList.remove('show'));
            rows.forEach(r => r.classList.remove('show'));
            typing.classList.remove('show');
        };
        const play = () => {
            reset();
            at(500, () => byStep(msgs, 0).classList.add('show'));
            at(1700, () => { byStep(msgs, 1).classList.add('show'); byStep(rows, 1).classList.add('show'); });
            at(3100, () => byStep(rows, 2).classList.add('show'));
            at(4000, () => typing.classList.add('show'));
            at(5600, () => {
                typing.classList.remove('show');
                byStep(msgs, 3).classList.add('show');
                byStep(rows, 3).classList.add('show');
            });
            at(13000, play);
        };

        if (reduceMotion) { showAll(); return; }
        let visible = false;
        new IntersectionObserver(entries => {
            const nowVisible = entries[0].isIntersecting;
            if (nowVisible && !visible) play();
            if (!nowVisible && visible) reset();
            visible = nowVisible;
        }, { threshold: 0.25 }).observe($('#phone'));
    })();

    /* ---------- Flow steps ---------- */
    (() => {
        const flow = $('#flow');
        if (!flow) return;
        const steps = $$('.step', flow);
        const bar = $('.flow-line span', flow);
        let idx = 0;
        let paused = false;
        let timer = null;

        const activate = i => {
            idx = i;
            steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
            bar.style.width = `${(i / (steps.length - 1)) * 100}%`;
        };
        const start = () => {
            if (reduceMotion || timer) return;
            timer = setInterval(() => { if (!paused) activate((idx + 1) % steps.length); }, 3200);
        };
        const stop = () => { clearInterval(timer); timer = null; };

        steps.forEach((s, i) => {
            ['mouseenter', 'focus', 'click'].forEach(ev => s.addEventListener(ev, () => { paused = true; activate(i); }));
            s.addEventListener('mouseleave', () => { paused = false; });
            s.addEventListener('blur', () => { paused = false; });
        });
        new IntersectionObserver(entries => (entries[0].isIntersecting ? start() : stop()), { threshold: 0.3 }).observe(flow);
        activate(0);
    })();

    /* ---------- Card spotlight + project dialog ---------- */
    const cards = $$('.card[data-project]');
    cards.forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    const dlg = $('#projectDialog');
    const fill = (ul, items) => { ul.replaceChildren(...items.map(t => Object.assign(document.createElement('li'), { textContent: t }))); };
    const openProject = id => {
        const p = PROJECTS[id];
        if (!p || !dlg) return;
        $('#dlgTag').textContent = p.tag;
        $('#dlgTitle').textContent = p.title;
        $('#dlgLede').textContent = p.lede;
        fill($('#dlgDoes'), p.does);
        fill($('#dlgBuilt'), p.built);
        fill($('#dlgStack'), p.stack);
        $('#dlgLink').href = p.link;
        dlg.showModal();
        dlg.scrollTop = 0;
    };
    cards.forEach(card => {
        const open = () => openProject(card.dataset.project);
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    if (dlg) {
        $('#dlgClose').addEventListener('click', () => dlg.close());
        $('#dlgTalk').addEventListener('click', () => dlg.close());
        dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    }

    /* ---------- Contact form (Netlify Forms, with graceful fallback) ---------- */
    (() => {
        const form = $('#contactForm');
        if (!form) return;
        const status = $('#formStatus');
        const btn = $('#submitBtn');
        const wa = $('#waBtn');

        const summary = () => {
            const d = new FormData(form);
            return `Hi Ayush, I'm ${d.get('name') || '(name)'}.\nInterested in: ${d.get('service') || '(not chosen yet)'}\n\n${d.get('message') || ''}`.trim();
        };
        const mailto = () => `mailto:ayushraibuilds@gmail.com?subject=${encodeURIComponent('Project enquiry from ' + (form.elements.name.value || 'your website'))}&body=${encodeURIComponent(summary())}`;

        wa.addEventListener('click', () => {
            window.open(`https://wa.me/919340499553?text=${encodeURIComponent(summary())}`, '_blank', 'noopener');
        });

        form.addEventListener('submit', async e => {
            e.preventDefault();
            status.className = 'form-status';
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            btn.disabled = true;
            status.textContent = 'Sending…';
            try {
                const body = new URLSearchParams(new FormData(form)).toString();
                const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
                if (!res.ok) throw new Error(res.status);
                form.reset();
                status.className = 'form-status ok';
                status.textContent = "Thanks — message received. I'll reply within a day.";
            } catch {
                status.className = 'form-status err';
                status.innerHTML = `Couldn't send from here. <a href="${mailto()}">Email me instead</a> or use the WhatsApp button.`;
            } finally {
                btn.disabled = false;
            }
        });
    })();

    /* ---------- Footer year ---------- */
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
})();

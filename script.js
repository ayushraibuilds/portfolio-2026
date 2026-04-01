/* ============================================
   AI CRAFT — Interactive Scripts (3D Upgrade)
   Requires: Three.js, GSAP + ScrollTrigger
   ============================================ */

// === Navigation ===
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navLinks = document.getElementById('navLinks');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        });

        this.navToggle.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navLinks.classList.toggle('active');
        });

        this.navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.navToggle.classList.remove('active');
                this.navLinks.classList.remove('active');
            });
        });
    }
}

// === GSAP Scroll Animation Engine ===
class GSAPAnimator {
    constructor() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Fallback to basic IntersectionObserver if GSAP didn't load
            this.fallbackInit();
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        this.init();
    }

    init() {
        this.animateHero();
        this.animateSections();
        this.animateSkills();
        this.animateServiceCards();
        this.animateProjectCards();
        this.animateProcessSteps();
        this.animateTestimonials();
        this.animatePricingCards();
        this.animateCounters();
        this.animateContactSection();
    }

    animateHero() {
        // Remove data-animate visibility conflicts — force hero elements visible
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.visibility = 'visible';
        }
        document.querySelectorAll('.hero [data-animate]').forEach(el => {
            el.classList.add('visible');
            el.style.opacity = '1';
        });

        // Parallax: hero content moves slower on scroll
        gsap.to('.hero-content', {
            y: 150,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            }
        });

        // Profile image entrance
        gsap.fromTo('.hero-profile',
            { scale: 0, rotation: -180, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
        );

        // Title entrance
        gsap.fromTo('.hero-title',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
        );

        // Subtitle entrance
        gsap.fromTo('.hero-subtitle',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
        );

        // Badge entrance
        gsap.fromTo('.hero-badge',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.4 }
        );

        // Buttons entrance
        gsap.fromTo('.hero-actions .btn',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.9 }
        );

        // Stats entrance with stagger
        gsap.fromTo('.stat',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'power2.out', delay: 1.1 }
        );

        // Stat dividers
        gsap.fromTo('.stat-divider',
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, duration: 0.4, stagger: 0.2, ease: 'power2.out', delay: 1.3 }
        );
    }

    animateSections() {
        // Section headers — use fromTo to ensure they end at opacity 1
        document.querySelectorAll('.section-header').forEach(header => {
            // Force data-animate visible immediately for GSAP-controlled headers
            header.classList.add('visible');
            header.style.opacity = '1';
            header.style.transform = 'none';

            gsap.fromTo(header.children,
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                    scrollTrigger: { trigger: header, start: 'top 90%', once: true }
                }
            );
        });
    }

    animateSkills() {
        // Force skills section visible (override data-animate CSS)
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.classList.add('visible');
            skillsGrid.style.opacity = '1';
            skillsGrid.style.transform = 'none';
        }

        // Animate each skill category with stagger
        gsap.fromTo('.skill-category',
            { y: 40, opacity: 0, scale: 0.95 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
                scrollTrigger: { trigger: '.skills-grid', start: 'top 85%', once: true }
            }
        );

        // Animate individual skill pills with stagger
        gsap.fromTo('.skill-pill',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)',
                scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', once: true }
            }
        );
    }

    animateServiceCards() {
        gsap.fromTo('.service-card',
            { y: 80, opacity: 0, scale: 0.9 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                scrollTrigger: { trigger: '.services-grid', start: 'top 85%', once: true }
            }
        );
    }

    animateProjectCards() {
        gsap.fromTo('.project-card',
            { y: 100, opacity: 0, scale: 0.85 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.2, ease: 'power3.out',
                scrollTrigger: { trigger: '.projects-grid', start: 'top 85%', once: true }
            }
        );
    }

    animateProcessSteps() {
        gsap.fromTo('.process-step',
            { x: -80, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 0.8, stagger: 0.25, ease: 'power3.out',
                scrollTrigger: { trigger: '.process-steps', start: 'top 85%', once: true }
            }
        );

        gsap.fromTo('.process-connector',
            { scaleY: 0, opacity: 0 },
            {
                scaleY: 1, opacity: 1, transformOrigin: 'top center', duration: 0.5, stagger: 0.25, ease: 'power2.out', delay: 0.3,
                scrollTrigger: { trigger: '.process-steps', start: 'top 85%', once: true }
            }
        );
    }

    animateTestimonials() {
        gsap.fromTo('.testimonial-card',
            { y: 60, opacity: 0, rotateY: 15 },
            {
                y: 0, opacity: 1, rotateY: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
                scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%', once: true }
            }
        );
    }

    animatePricingCards() {
        gsap.fromTo('.pricing-card',
            { y: 60, opacity: 0, scale: 0.9 },
            {
                y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                scrollTrigger: { trigger: '.pricing-grid', start: 'top 85%', once: true }
            }
        );
    }

    animateCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        textContent: target,
                        duration: 2,
                        ease: 'power1.out',
                        snap: { textContent: 1 },
                        onUpdate: function () {
                            el.textContent = Math.round(parseFloat(el.textContent));
                        }
                    });
                }
            });
        });
    }

    animateContactSection() {
        gsap.fromTo('.cta-content',
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true }
            }
        );

        gsap.fromTo('.contact-form .form-group, .contact-form .form-row',
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
                scrollTrigger: { trigger: '.contact-form', start: 'top 90%', once: true }
            }
        );
    }

    fallbackInit() {
        const elements = document.querySelectorAll('[data-animate]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        elements.forEach(el => observer.observe(el));
    }
}

// === Interactive 3D Card Tilt ===
class Card3DTilt {
    constructor() {
        this.cards = document.querySelectorAll('.service-card, .project-card, .testimonial-card, .pricing-card');
        if (window.innerWidth < 768) return; // Skip on mobile
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

            card.addEventListener('mousemove', (e) => this.onMove(e, card));
            card.addEventListener('mouseleave', (e) => this.onLeave(e, card));
        });
    }

    onMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;

        // Move spotlight gradient
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;
        card.style.setProperty('--glow-x', `${glowX}%`);
        card.style.setProperty('--glow-y', `${glowY}%`);
    }

    onLeave(e, card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    }
}

// === Custom Cursor ===
class CustomCursor {
    constructor() {
        if (window.innerWidth < 768 || 'ontouchstart' in window) return;
        this.init();
    }

    init() {
        // Create cursor elements
        this.dot = document.createElement('div');
        this.dot.className = 'cursor-dot';
        this.ring = document.createElement('div');
        this.ring.className = 'cursor-ring';
        document.body.appendChild(this.dot);
        document.body.appendChild(this.ring);

        this.pos = { x: 0, y: 0 };
        this.ringPos = { x: 0, y: 0 };

        document.addEventListener('mousemove', (e) => {
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
            this.dot.style.left = `${this.pos.x}px`;
            this.dot.style.top = `${this.pos.y}px`;
        });

        // Smooth trailing ring
        this.animateRing();

        // Hover states
        const hoverTargets = document.querySelectorAll('a, button, .project-card, .service-card, .pricing-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.dot.classList.add('cursor-hover');
                this.ring.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                this.dot.classList.remove('cursor-hover');
                this.ring.classList.remove('cursor-hover');
            });
        });
    }

    animateRing() {
        this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.15;
        this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.15;
        this.ring.style.left = `${this.ringPos.x}px`;
        this.ring.style.top = `${this.ringPos.y}px`;
        requestAnimationFrame(() => this.animateRing());
    }
}

// === Contact Form ===
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value,
            };

            console.log('Form submitted:', formData);

            this.form.innerHTML = `
                <div class="form-success">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3>Message Sent! 🎉</h3>
                    <p>Thanks for reaching out. I'll get back to you within 24 hours.</p>
                </div>
            `;
        });
    }
}

// === Project Modals ===
class ProjectModal {
    constructor() {
        this.projects = {
            'tenderpilot': {
                tag: 'AI SaaS',
                title: 'TenderPilot AI',
                problem: 'Agencies and IT service companies spend 3–5 days manually reading RFP documents, drafting answers from scratch, and copy-pasting data into tender portals — for every single bid.',
                solution: 'Built a full-stack SaaS tool that parses uploaded RFP/tender documents using hybrid vector search (FTS5 + embedding rerank), auto-drafts answers from the company knowledge base, exports to Excel/PDF, and fills portal fields via a Chrome browser extension. Includes Free/Pro/Team subscription tiers with JWT auth and usage tracking.',
                result: 'Reduces RFP response time from 3 days to under 2 hours. Browser extension enables direct portal autofill without copy-paste.',
                link: 'https://github.com/Ashtorments'
            },
            'd2c-voice': {
                tag: 'AI Agent',
                title: 'D2C Voice AI Agent',
                problem: 'Indian D2C brands receive 60–80% of customer support via WhatsApp voice notes in Hindi, Hinglish, or regional languages. Traditional chatbots fail entirely on audio.',
                solution: 'Built an enterprise WhatsApp support agent using FastAPI + LangGraph. Groq Whisper transcribes voice notes in real-time, a hybrid 3-step language detector handles Hinglish, and a LangGraph state machine classifies 10 intent types (order status, refunds, exchanges, payment issues, etc.) and executes the right action via an e-commerce adapter layer.',
                result: 'Handles 80%+ of support tickets autonomously with sub-3 second response times. Production-hardened with idempotency checks, rate limiting, Twilio signature validation, and a full RUNBOOK.',
                link: 'https://github.com/Ashtorments'
            },
            'invosmith': {
                tag: 'SaaS Tool',
                title: 'Invosmith',
                problem: 'Indian freelancers waste 30–60 minutes per client creating GST-compliant invoices and proposals, often in spreadsheets or Word documents with manual tax calculations.',
                solution: 'Built a Next.js PWA where freelancers paste raw project notes (even in Hinglish) and get a branded, GST-compliant PDF in 60 seconds. AI chain: Gemini → Groq (LLaMA) → smart mock parser as fallback. Supports 5 niche templates (Developer, Designer, Consultant, Photographer, Writer), email delivery via Resend, and document history with localStorage + Supabase.',
                result: 'Invoice generation time reduced from 45+ minutes to under 60 seconds. GST split (CGST/SGST/IGST) calculated automatically based on state codes.',
                link: 'https://github.com/Ashtorments'
            },
            'sastabot': {
                tag: 'WhatsApp Bot',
                title: 'SastaBot — AI Price Comparison',
                problem: 'Indian online shoppers check 4–5 apps manually to find the best price. No single tool works in Hindi or natively on WhatsApp where most tier-2/3 users already shop.',
                solution: 'Built a FastAPI + LangGraph backend where users ask in Hindi or English via WhatsApp and get instant price comparisons across Amazon, Flipkart, Blinkit, Zepto, and Instamart. Redis caches results for 30 mins. Affiliate API integration generates commission on purchases.',
                result: 'A fully functional multilingual shopping assistant that works on the platform 500M+ Indians already use. Affiliate model creates passive revenue from every purchase.',
                link: 'https://github.com/Ashtorments'
            },
            'ondc': {
                tag: 'B2B Dashboard',
                title: 'ONDC Super Seller Platform',
                problem: 'Small sellers joining India\'s ONDC open commerce network had no unified tool to manage their catalog, track orders, and handle WhatsApp-based customer interactions.',
                solution: 'Built a full-stack B2B dashboard: Next.js frontend, FastAPI backend, Supabase database, Twilio WhatsApp integration for catalog management, JWT + API key auth, bulk CSV product import, real-time order analytics, and 140+ automated tests with GitHub Actions CI/CD.',
                result: 'Production-ready platform that reduces ONDC seller onboarding time by 80%. WhatsApp catalog management lets sellers update their entire product list via chat.',
                link: 'https://github.com/Ashtorments'
            }
        };

        this.modal = document.getElementById('projectModal');
        this.closeBtn = document.getElementById('closeModal');
        this.cards = document.querySelectorAll('.project-card[data-project-id]');

        if (!this.modal || !this.closeBtn || this.cards.length === 0) return;

        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-project-id');
                if (this.projects[id]) {
                    this.openModal(this.projects[id]);
                }
            });
        });

        this.closeBtn.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    openModal(data) {
        document.getElementById('modalTag').textContent = data.tag;
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalProblem').textContent = data.problem;
        document.getElementById('modalSolution').textContent = data.solution;
        document.getElementById('modalResult').textContent = data.result;

        // Show/hide GitHub link
        const modalLink = document.getElementById('modalLink');
        if (modalLink) {
            if (data.link) {
                modalLink.href = data.link;
                modalLink.style.display = 'inline-flex';
            } else {
                modalLink.style.display = 'none';
            }
        }

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // GSAP modal animation
        if (typeof gsap !== 'undefined') {
            gsap.from('.modal-container', {
                scale: 0.8,
                opacity: 0,
                y: 60,
                duration: 0.5,
                ease: 'power3.out',
            });
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// === Loading Screen ===
class LoadingScreen {
    constructor() {
        this.createLoader();
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div class="loader-content">
                <span class="loader-icon">⚡</span>
                <div class="loader-bar"><div class="loader-progress"></div></div>
            </div>
        `;
        document.body.prepend(loader);

        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    gsap.to('#loader', {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.inOut',
                        onComplete: () => loader.remove(),
                    });
                } else {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.remove(), 600);
                }
            }, 800);
        });
    }
}

// === Smooth Scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// === Initialize Everything ===
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen
    new LoadingScreen();

    // 3D Hero Scene (Three.js)
    const heroContainer = document.getElementById('hero-3d-container');
    if (heroContainer && typeof THREE !== 'undefined') {
        new HeroScene(heroContainer);
    }

    new Navigation();
    new GSAPAnimator();
    new Card3DTilt();
    new CustomCursor();
    new ContactForm();
    new ProjectModal();
});

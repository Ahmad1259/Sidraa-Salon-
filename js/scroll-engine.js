// scroll-engine.js — SIDRA'S Salon Scroll Storytelling

class ScrollEngine {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.ticking = false;
        this.lastScrollY = window.scrollY;

        // Cache elements
        this.hairJourney = document.getElementById('hair-journey');
        this.hairStages = this.hairJourney ? this.hairJourney.querySelectorAll('.hair-stage') : [];
        this.scissorsReveal = document.getElementById('scissors-reveal');
        this.scissorsElement = document.getElementById('scissors-element');
        this.mirrorReveal = document.getElementById('mirror-reveal');
        this.mirrorImage = document.getElementById('mirror-image');
        this.floatingObjects = document.querySelectorAll('.floating-object');
        this.revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
        this.locationExperience = document.getElementById('location-experience');
        this.locationSteps = document.querySelectorAll('.location-step');

        this.init();
    }

    init() {
        if (this.prefersReducedMotion) {
            // Show all content statically
            this.revealElements.forEach(el => {
                el.classList.add('revealed');
                if (el.classList.contains('reveal-stagger')) {
                    Array.from(el.children).forEach(c => c.classList.add('revealed'));
                }
            });
            // Show all hair stages
            this.hairStages.forEach(s => s.classList.add('active'));
            // Show mirror image fully
            if (this.mirrorImage) this.mirrorImage.style.clipPath = 'ellipse(100% 100% at 50% 50%)';
            return;
        }

        this.setupRevealObservers();
        this.setupLightbox();
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
        this.update();
    }

    onScroll() {
        this.lastScrollY = window.scrollY;
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.update();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    // Calculate scroll progress through an element (0 = just entering, 1 = fully passed)
    getProgress(element) {
        const rect = element.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.top >= vh || rect.bottom <= 0) return -1; // off screen
        return Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
    }

    update() {
        const isMobile = window.innerWidth < 768;

        // 1. HAIR TRANSFORMATION JOURNEY — stage switching
        if (this.hairJourney && this.hairStages.length > 0) {
            const progress = this.getProgress(this.hairJourney);
            const stageCount = this.hairStages.length;
            const activeIndex = progress >= 0 
                ? Math.min(stageCount - 1, Math.floor(progress * stageCount))
                : 0;
            this.hairStages.forEach((stage, i) => {
                stage.classList.toggle('active', i === activeIndex);
            });
        }

        // 2. SCISSORS REVEAL — horizontal travel
        if (this.scissorsReveal && this.scissorsElement) {
            const progress = this.getProgress(this.scissorsReveal);
            if (progress >= 0) {
                const maxVW = isMobile ? 80 : 100;
                this.scissorsElement.style.transform =
                    `translate(${progress * maxVW}vw, -50%)`;

                // Animate the split line position
                const track = this.scissorsReveal.querySelector('.scissors-track');
                if (track) {
                    track.style.transform = `translateY(-50%) scaleX(${progress})`;
                }
            }
        }

        // 3. MIRROR REVEAL — expanding ellipse clip-path
        if (this.mirrorReveal && this.mirrorImage) {
            const progress = this.getProgress(this.mirrorReveal);
            if (progress >= 0) {
                // On mobile, use simpler fade; on desktop, use clip-path
                if (isMobile) {
                    this.mirrorImage.style.clipPath = 'none';
                    this.mirrorImage.style.opacity = Math.min(1, progress * 2);
                } else {
                    const pct = Math.min(100, progress * 150); // expand faster
                    this.mirrorImage.style.clipPath = `ellipse(${pct}% ${pct}% at 50% 50%)`;
                    this.mirrorImage.style.opacity = '1';
                }
            }
        }

        // 4. FLOATING BEAUTY OBJECTS — parallax (desktop only)
        if (!isMobile && this.floatingObjects.length > 0) {
            this.floatingObjects.forEach(obj => {
                const speed = parseFloat(obj.dataset.speed) || 0.2;
                obj.style.transform = `translateY(${this.lastScrollY * speed}px)`;
            });
        }

        // 5. LOCATION ZOOM SEQUENCE — sequential reveal
        if (this.locationExperience && this.locationSteps.length > 0) {
            const progress = this.getProgress(this.locationExperience);
            if (progress >= 0) {
                const n = this.locationSteps.length;
                this.locationSteps.forEach((step, i) => {
                    const threshold = i / n;
                    const stepProg = Math.max(0, Math.min(1, (progress - threshold) * n));
                    if (stepProg > 0) {
                        step.style.opacity = Math.min(1, stepProg * 3);
                        step.style.transform = `translateY(0) scale(${1 + stepProg * 0.03})`;
                    } else {
                        step.style.opacity = '0';
                        step.style.transform = 'translateY(20px) scale(0.95)';
                    }
                });
            }
        }
    }

    setupRevealObservers() {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;

                if (el.classList.contains('reveal-stagger')) {
                    // Stagger each direct child
                    Array.from(el.children).forEach((child, i) => {
                        child.style.transitionDelay = `${i * 120}ms`;
                        child.classList.add('revealed');
                    });
                    el.classList.add('revealed');
                } else {
                    el.classList.add('revealed');
                }
                obs.unobserve(el);
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

        this.revealElements.forEach(el => observer.observe(el));
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
        if (!lightbox || !lightboxImg) return;

        // Open lightbox on gallery image click
        document.querySelectorAll('.gallery-grid-item img, .gallery-scroll-item img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scrollEngine = new ScrollEngine();
});

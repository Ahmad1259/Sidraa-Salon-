// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Utilities
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.body.classList.add('reduce-motion');
    }

    // 1. Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    const showPage = () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600);
        }
    };

    if (loadingScreen && !document.body.classList.contains('loaded')) {
        // Show the logo reveal for 1.8 seconds (1-2s range)
        setTimeout(showPage, 1800);
    } else {
        showPage();
    }

    // 2. Navigation
    const nav = document.getElementById('main-nav');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = document.querySelectorAll('section[id]');

    const handleScroll = throttle(() => {
        if (!nav) return;
        if (window.scrollY > 80) {
            nav.classList.add('nav-scrolled');
            nav.classList.remove('nav-hero');
        } else {
            nav.classList.remove('nav-scrolled');
            nav.classList.add('nav-hero');
        }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Smooth scroll and mobile menu close
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-section');
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    e.preventDefault();
                    targetSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            }
            closeMobileMenu();
        });
    });

    // Mobile nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-section');
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    e.preventDefault();
                    closeMobileMenu();
                    // Small delay so menu closes first
                    setTimeout(() => {
                        targetSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                    }, 100);
                }
            }
        });
    });

    // Active section highlighting
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Mobile Menu Toggle
    let isMenuOpen = false;
    const toggleMobileMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            document.body.classList.add('menu-open');
            mobileMenuBtn?.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            mobileMenu?.focus();
        } else {
            closeMobileMenu();
        }
    };

    const closeMobileMenu = () => {
        isMenuOpen = false;
        document.body.classList.remove('menu-open');
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'a') {
                closeMobileMenu();
            }
        });
    }

    // 3. Wedding Banner
    const weddingBanner = document.getElementById('wedding-banner');
    const bannerClose = document.getElementById('banner-close');

    if (weddingBanner && bannerClose) {
        const isDismissed = sessionStorage.getItem('bannerDismissed');
        if (isDismissed === 'true') {
            document.body.classList.add('banner-dismissed');
            weddingBanner.style.display = 'none';
        } else {
            bannerClose.addEventListener('click', () => {
                document.body.classList.add('banner-dismissed');
                sessionStorage.setItem('bannerDismissed', 'true');
                weddingBanner.style.display = 'none';
                document.body.style.paddingTop = '0'; // Adjust accordingly if needed
            });
        }
    }
});

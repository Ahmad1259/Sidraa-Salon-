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

    // 1. Loading Screen: Random Scissor Cut Sequence (< 1.8s)
    const loadingScreen = document.getElementById('loading-screen');
    const stage = document.querySelector('.loader-stage');
    const scissors = document.getElementById('loader-scissors');
    const cutLine = document.querySelector('.loader-cut-line');
    const leftHalf = document.querySelector('.loader-logo-left');
    const rightHalf = document.querySelector('.loader-logo-right');

    const runScissorsLoader = () => {
        if (!loadingScreen || !stage || !leftHalf || !rightHalf || !scissors) {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            return;
        }

        // Random cut angle between -35deg and 35deg
        const randomAngles = [-28, -15, 0, 18, 30, -32, 22];
        const angle = randomAngles[Math.floor(Math.random() * randomAngles.length)];

        // Set clipping paths according to the cut angle
        // Diagonal clip line: polygon calculations
        if (angle === 0) {
            leftHalf.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
            rightHalf.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
        } else if (angle > 0) {
            leftHalf.style.clipPath = 'polygon(0 0, 65% 0, 35% 100%, 0 100%)';
            rightHalf.style.clipPath = 'polygon(65% 0, 100% 0, 100% 100%, 35% 100%)';
        } else {
            leftHalf.style.clipPath = 'polygon(0 0, 35% 0, 65% 100%, 0 100%)';
            rightHalf.style.clipPath = 'polygon(35% 0, 100% 0, 100% 100%, 65% 100%)';
        }

        if (cutLine) {
            cutLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }

        // Timeline (Total ~1.7s):
        // 0.3s: Scissors appears and swoops across
        setTimeout(() => {
            stage.classList.add('slicing');
            scissors.style.transform = `translate(-140%, -50%) rotate(${angle}deg)`;
            scissors.style.opacity = '1';
        }, 150);

        // 0.5s: Scissors cuts through the middle
        setTimeout(() => {
            scissors.style.transform = `translate(140%, -50%) rotate(${angle}deg)`;
            stage.classList.add('sliced');

            // Logo halves separate smoothly
            const offsetDist = window.innerWidth < 768 ? 16 : 28;
            const rad = (angle * Math.PI) / 180;
            const perpX = -Math.sin(rad) * offsetDist;
            const perpY = Math.cos(rad) * offsetDist;

            leftHalf.style.transform = `translate(${-perpX - 10}px, ${-perpY}px) rotate(${-3}deg)`;
            leftHalf.style.opacity = '0.7';

            rightHalf.style.transform = `translate(${perpX + 10}px, ${perpY}px) rotate(${3}deg)`;
            rightHalf.style.opacity = '0.7';
        }, 550);

        // 1.2s: Both halves fade out gracefully
        setTimeout(() => {
            leftHalf.style.opacity = '0';
            rightHalf.style.opacity = '0';
            if (cutLine) cutLine.style.opacity = '0';
            scissors.style.opacity = '0';
        }, 1200);

        // 1.6s: Dismiss loader and unveil site
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1600);
    };

    if (loadingScreen && !document.body.classList.contains('loaded')) {
        runScissorsLoader();
    } else {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        if (loadingScreen) loadingScreen.style.display = 'none';
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

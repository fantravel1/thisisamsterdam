/* ==========================================================================
   ThisIsAmsterdam — Main JavaScript
   Handles navigation, scroll effects, animations, and interactions
   ========================================================================== */

(function () {
    'use strict';

    /* ---------- DOM References ---------- */
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav ? mainNav.querySelectorAll('a[href^="#"]') : [];

    /* ---------- Sticky Header ---------- */
    let lastScroll = 0;
    const SCROLL_THRESHOLD = 60;

    function handleHeaderScroll() {
        const currentScroll = window.scrollY;

        if (currentScroll > SCROLL_THRESHOLD) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    /* ---------- Mobile Menu ---------- */
    function toggleMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    }

    function closeMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* ---------- Smooth Scroll for Nav Links ---------- */
    function handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        closeMenu();

        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL without scroll
        history.pushState(null, null, href);
    }

    /* ---------- Scroll Animations (Intersection Observer) ---------- */
    function setupScrollAnimations() {
        // Elements that animate on scroll
        const animateSelectors = [
            '.section-header',
            '.stat-card',
            '.neighborhood-card',
            '.info-card',
            '.daily-card',
            '.design-card',
            '.canal-fact',
            '.transit-mode',
            '.timeline-item',
            '.faq-item',
            '.culture-block',
            '.culture-image',
            '.culture-quote',
            '.canals-feature',
            '.bikes-main h3',
            '.bikes-main h4',
            '.bikes-rules',
            '.intro-text',
            '.intro-stats'
        ];

        const elements = document.querySelectorAll(animateSelectors.join(', '));

        elements.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        // Add stagger class to parent grids
        document.querySelectorAll(
            '.neighborhood-grid, .design-grid, .daily-grid, .intro-stats, .faq-list'
        ).forEach(function (el) {
            el.classList.add('stagger-children');
        });

        // Intersection Observer
        if (!('IntersectionObserver' in window)) {
            // Fallback: show everything
            elements.forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -60px 0px',
                threshold: 0.1
            }
        );

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ---------- FAQ Accessibility Enhancement ---------- */
    function setupFAQ() {
        var faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(function (item) {
            var summary = item.querySelector('summary');
            if (!summary) return;

            // Keyboard support is native with <details>/<summary>
            // Add smooth animation for opening/closing
            item.addEventListener('toggle', function () {
                if (item.open) {
                    var answer = item.querySelector('.faq-answer');
                    if (answer) {
                        answer.style.maxHeight = '0';
                        answer.style.overflow = 'hidden';
                        answer.style.transition = 'max-height 0.4s ease';
                        // Force reflow
                        answer.offsetHeight;
                        answer.style.maxHeight = answer.scrollHeight + 'px';

                        // Clean up after animation
                        setTimeout(function () {
                            answer.style.maxHeight = '';
                            answer.style.overflow = '';
                            answer.style.transition = '';
                        }, 400);
                    }
                }
            });
        });
    }

    /* ---------- Lazy Loading Enhancement ---------- */
    function setupLazyLoading() {
        // Native lazy loading is used via HTML attributes
        // This adds a fade-in effect when images load
        var lazyImages = document.querySelectorAll('img[loading="lazy"]');

        lazyImages.forEach(function (img) {
            if (img.complete) return;

            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';

            img.addEventListener('load', function () {
                img.style.opacity = '1';
                setTimeout(function () {
                    img.style.transition = '';
                }, 500);
            });

            img.addEventListener('error', function () {
                // Graceful fallback — show a subtle gradient
                img.style.opacity = '1';
                img.parentElement.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #2d3436 100%)';
            });
        });
    }

    /* ---------- Active Section Highlighting ---------- */
    function setupActiveNav() {
        var sections = document.querySelectorAll('section[id]');

        if (!('IntersectionObserver' in window) || !sections.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.getAttribute('id');
                        // Remove active from all
                        navLinks.forEach(function (link) {
                            link.classList.remove('nav-active');
                        });
                        // Add active to matching link
                        var activeLink = mainNav.querySelector('a[href="#' + id + '"]');
                        if (activeLink) {
                            activeLink.classList.add('nav-active');
                        }
                    }
                });
            },
            {
                rootMargin: '-30% 0px -60% 0px',
                threshold: 0
            }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* ---------- Parallax Effect for Hero (Desktop Only) ---------- */
    function setupParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.innerWidth < 768) return;

        var heroImg = document.querySelector('.hero-img');
        if (!heroImg) return;

        var ticking = false;

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    var scrolled = window.scrollY;
                    if (scrolled < window.innerHeight) {
                        heroImg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px) scale(1.05)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Initialize ---------- */
    function init() {
        // Scroll handler (throttled via rAF)
        var scrollTicking = false;
        window.addEventListener('scroll', function () {
            if (!scrollTicking) {
                requestAnimationFrame(function () {
                    handleHeaderScroll();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        // Initial header check
        handleHeaderScroll();

        // Mobile menu
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }

        // Nav links smooth scroll
        navLinks.forEach(function (link) {
            link.addEventListener('click', handleNavClick);
        });

        // Close menu on escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                closeMenu();
                menuToggle.focus();
            }
        });

        // Setup features
        setupScrollAnimations();
        setupFAQ();
        setupLazyLoading();
        setupActiveNav();
        setupParallax();

        // Handle window resize (debounced)
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                // Close mobile menu on resize to desktop
                if (window.innerWidth > 900 && mainNav.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

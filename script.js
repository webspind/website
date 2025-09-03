// Modern 2026 Website Controller
class ModernWebsite {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMobileMenuOpen = false;
        this.isScrolling = false;
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupTypewriter();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupFormHandling();
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupMobileOptimizations();
    }

    // Theme Management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // Update theme toggle button
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.setAttribute('aria-label', `Skift til ${theme === 'light' ? 'mørk' : 'lys'} tilstand`);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Add theme transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (this.isMobileMenuOpen) {
                        this.toggleMobileMenu();
                    }
                }
            });
        });

        // Header effects on scroll with throttling
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16), { passive: true });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMobileMenuOpen) {
                    this.toggleMobileMenu();
                }
            }
        });

        // Click outside to close mobile menu
        document.addEventListener('click', (e) => {
            const mobileMenu = document.querySelector('.mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');
            
            if (this.isMobileMenuOpen && 
                !mobileMenu.contains(e.target) && 
                !navLinks.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });

        // Touch events for mobile
        this.setupTouchEvents();
    }

    // Mobile optimizations
    setupMobileOptimizations() {
        // Reduce motion on mobile for better performance
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--animation-duration', '0.4s');
        }

        // Optimize scroll performance on mobile
        if ('ontouchstart' in window) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
    }

    // Touch events for mobile
    setupTouchEvents() {
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartY, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could trigger next section
                this.triggerSwipeAnimation('up');
            } else {
                // Swipe down - could trigger previous section
                this.triggerSwipeAnimation('down');
            }
        }
    }

    triggerSwipeAnimation(direction) {
        // Add visual feedback for swipe
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.textContent = direction === 'up' ? '↑' : '↓';
        
        Object.assign(indicator.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            color: 'var(--text-accent)',
            zIndex: '1000',
            pointerEvents: 'none',
            animation: 'fadeInOut 1s ease'
        });

        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1000);
    }

    // Enhanced scroll handling
    handleScroll() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        
        if (scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Parallax effects
        this.updateParallax(scrollY);
        
        // Update scroll indicator
        this.updateScrollIndicator(scrollY);
        
        this.lastScrollY = scrollY;
    }

    // Parallax effects
    setupParallaxEffects() {
        // Create parallax elements
        this.parallaxElements = document.querySelectorAll('.shape, .hero-shapes, .spider-web');
        
        // Add CSS for parallax
        const style = document.createElement('style');
        style.textContent = `
            .parallax-element {
                will-change: transform;
                transform: translateZ(0);
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }

    updateParallax(scrollY) {
        if (!this.parallaxElements) return;

        this.parallaxElements.forEach((element, index) => {
            const rate = scrollY * (0.1 + index * 0.02);
            const rotation = scrollY * (0.01 + index * 0.005);
            
            element.style.transform = `translateY(${rate}px) rotate(${rotation}deg)`;
        });
    }

    updateScrollIndicator(scrollY) {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollProgress = scrollY / (documentHeight - windowHeight);
        
        if (scrollProgress > 0.1) {
            scrollIndicator.style.opacity = '0.3';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    }

    // Mobile Menu
    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    toggleMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            navLinks.style.display = 'flex';
            navLinks.style.opacity = '1';
            navLinks.style.transform = 'translateY(0)';
            
            // Animate hamburger to X
            mobileMenuBtn.classList.add('active');
            
            // Prevent body scroll on mobile
            document.body.style.overflow = 'hidden';
        } else {
            navLinks.style.opacity = '0';
            navLinks.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (!this.isMobileMenuOpen) {
                    navLinks.style.display = 'none';
                }
            }, 300);
            
            // Animate X to hamburger
            mobileMenuBtn.classList.remove('active');
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    // Animations
    initializeAnimations() {
        // Add CSS for mobile menu animations
        const style = document.createElement('style');
        style.textContent = `
            .nav-links {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .mobile-menu-btn.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-btn.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            @media (max-width: 768px) {
                .nav-links {
                    position: fixed;
                    top: 80px;
                    left: 0;
                    right: 0;
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border-primary);
                    flex-direction: column;
                    padding: 2rem;
                    gap: 1rem;
                    display: none;
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Typewriter Effect
    setupTypewriter() {
        const typewriterElement = document.getElementById('typewriter');
        if (!typewriterElement) return;

        const texts = [
            'Digital Marketing Specialist',
            'SEO Ekspert',
            'Web Developer',
            'Grafisk Designer',
            'Informationsvidenskabsstuderende'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;

        const typeWriter = () => {
            const currentText = texts[textIndex];
            
            if (isPaused) {
                isPaused = false;
                setTimeout(typeWriter, 2000);
                return;
            }
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentText.length) {
                isPaused = true;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(typeWriter, typeSpeed);
        };

        // Start after initial load
        setTimeout(typeWriter, 1000);
    }

    // Scroll Effects
    setupScrollEffects() {
        // Enhanced scroll effects with performance optimization
        let ticking = false;
        
        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const shapes = document.querySelectorAll('.shape');
            
            shapes.forEach((shape, index) => {
                const rate = scrolled * (0.1 + index * 0.05);
                const rotation = scrolled * (0.02 + index * 0.01);
                shape.style.transform = `translateY(${rate}px) rotate(${rotation}deg)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }, { passive: true });
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe elements for animation with different animation types
        const animateElements = document.querySelectorAll('.skill-category, .work-item, .stat, .contact-item');
        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            // Add different animation directions
            if (index % 3 === 0) {
                el.classList.add('animate-on-scroll', 'animate-left');
            } else if (index % 3 === 1) {
                el.classList.add('animate-on-scroll', 'animate-right');
            } else {
                el.classList.add('animate-on-scroll', 'animate-scale');
            }
            
            observer.observe(el);
        });

        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            .animate-left.animate-in {
                transform: translateX(0) !important;
            }
            
            .animate-right.animate-in {
                transform: translateX(0) !important;
            }
            
            .animate-scale.animate-in {
                transform: scale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Form Handling
    setupFormHandling() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(e);
        });

        // Enhanced form validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearValidationError(input));
            input.addEventListener('focus', () => this.addFocusEffect(input));
        });
    }

    addFocusEffect(input) {
        input.style.transform = 'translateY(-2px)';
        input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Indtast venligst en gyldig email-adresse';
                break;
            default:
                if (field.hasAttribute('required')) {
                    isValid = value.length >= 2;
                    errorMessage = 'Dette felt skal udfyldes';
                }
                break;
        }

        if (!isValid && value.length > 0) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearValidationError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearValidationError(field);
        
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        Object.assign(errorElement.style, {
            color: '#ef4444',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            display: 'block',
            animation: 'fadeInUp 0.3s ease'
        });

        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        field.parentNode.appendChild(errorElement);
    }

    clearValidationError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    handleFormSubmission(e) {
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = e.target.querySelector('.btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <span class="loading-spinner"></span>
            <span>Sender...</span>
        `;
        
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.8';

        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Simulate form submission
        setTimeout(() => {
            this.showNotification('Tak for din besked! Jeg vender tilbage så snart som muligt. ✨', 'success');
            e.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            style.remove();
        }, 2000);
    }

    // Notifications
    showNotification(message, type = 'info') {
        this.closeAllNotifications();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</div>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Modern notification styling
        Object.assign(notification.style, {
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--text-primary)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-2xl)',
            border: '1px solid var(--border-primary)',
            zIndex: '1000',
            transform: 'translateX(100%) scale(0.8)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: '420px',
            minWidth: '280px',
            fontSize: '1rem'
        });

        const content = notification.querySelector('.notification-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
        });

        const icon = notification.querySelector('.notification-icon');
        Object.assign(icon.style, {
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            background: colors[type],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            flexShrink: '0',
            marginTop: '0.125rem'
        });

        const text = notification.querySelector('.notification-text');
        Object.assign(text.style, {
            flex: '1',
            lineHeight: '1.4'
        });

        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0',
            width: '1.5rem',
            height: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.25rem',
            transition: 'all 0.2s ease'
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'var(--bg-secondary)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0) scale(1)';
        });

        // Auto remove after 6 seconds
        const autoRemoveTimer = setTimeout(() => {
            this.removeNotification(notification);
        }, 6000);

        // Close button functionality
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemoveTimer);
            this.removeNotification(notification);
        });

        notification.autoRemoveTimer = autoRemoveTimer;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }

    closeAllNotifications() {
        document.querySelectorAll('.notification').forEach(notification => {
            if (notification.autoRemoveTimer) {
                clearTimeout(notification.autoRemoveTimer);
            }
            this.removeNotification(notification);
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernWebsite();
    
    // Add some fun interactions
    let clickCount = 0;
    const logo = document.querySelector('.logo');
    
    if (logo) {
        logo.addEventListener('click', (e) => {
            clickCount++;
            if (clickCount === 5) {
                // Easter egg: rainbow mode
                document.body.style.filter = 'hue-rotate(0deg)';
                document.body.style.animation = 'rainbow 3s infinite';
                
                setTimeout(() => {
                    document.body.style.animation = '';
                    document.body.style.filter = '';
                }, 10000);
                
                clickCount = 0;
            }
        });
    }
});

// Add rainbow animation for Easter egg
const rainbowStyles = document.createElement('style');
rainbowStyles.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg) saturate(1.2); }
        25% { filter: hue-rotate(90deg) saturate(1.2); }
        50% { filter: hue-rotate(180deg) saturate(1.2); }
        75% { filter: hue-rotate(270deg) saturate(1.2); }
        100% { filter: hue-rotate(360deg) saturate(1.2); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(rainbowStyles);
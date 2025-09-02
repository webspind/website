// Apple Store-inspired Website Controller
class AppleStoreWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeScrollEffects();
        this.setupFormHandling();
        this.initializeAnimations();
        this.setupTypewriter();
        this.setupAppleStyleInteractions();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation with Apple-style easing
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header blur effect on scroll
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const scrollY = window.scrollY;
            
            if (scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollY = scrollY;
        }, { passive: true });

        // Interest tags interaction with haptic-like feedback
        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.handleInterestClick(e.target);
                this.createRippleEffect(e);
            });

            // Add hover sound simulation (visual feedback)
            tag.addEventListener('mouseenter', () => {
                this.addHoverFeedback(tag);
            });

            tag.addEventListener('mouseleave', () => {
                this.removeHoverFeedback(tag);
            });
        });

        // Keyboard navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            if (e.key === 'Escape') {
                this.closeAllNotifications();
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupAppleStyleInteractions() {
        // Add micro-interactions to buttons and form elements
        document.querySelectorAll('.btn, .form-input').forEach(element => {
            element.addEventListener('mousedown', (e) => {
                this.createPressEffect(e.target);
            });

            element.addEventListener('mouseup', () => {
                this.removePressEffect(element);
            });
        });

        // Profile image interaction
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.addEventListener('click', () => {
                this.showProfileImageModal();
            });
        }

        // Card hover effects
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.enhanceCardHover(card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCardHover(card);
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles
        Object.assign(ripple.style, {
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(0, 122, 255, 0.3)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none'
        });

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addHoverFeedback(element) {
        element.style.transform = 'translateY(-4px) scale(1.02)';
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    }

    removeHoverFeedback(element) {
        element.style.transform = '';
    }

    createPressEffect(element) {
        element.style.transform = 'scale(0.96)';
        element.style.transition = 'transform 0.1s ease';
    }

    removePressEffect(element) {
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }, 100);
    }

    enhanceCardHover(card) {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.16)';
    }

    resetCardHover(card) {
        card.style.transform = '';
        card.style.boxShadow = '';
    }

    showProfileImageModal() {
        // Create Apple-style modal for profile image
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <img src="IMG_3176.jpg" alt="Jakob Munch-Brandt" class="modal-image">
                    <button class="modal-close">&times;</button>
                </div>
            </div>
        `;

        // Styles for modal
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '2000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const backdrop = modal.querySelector('.modal-backdrop');
        Object.assign(backdrop.style, {
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        });

        const content = modal.querySelector('.modal-content');
        Object.assign(content.style, {
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            cursor: 'default'
        });

        const image = modal.querySelector('.modal-image');
        Object.assign(image.style, {
            width: '400px',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        });

        const closeBtn = modal.querySelector('.modal-close');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        });

        document.body.appendChild(modal);

        // Close modal handlers
        backdrop.addEventListener('click', () => modal.remove());
        closeBtn.addEventListener('click', () => modal.remove());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });

        // Animate in
        modal.style.opacity = '0';
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s ease';
        });
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100); // Stagger animation
                }
            });
        }, observerOptions);

        // Observe all cards with initial hidden state
        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
            observer.observe(card);
        });
    }

    setupFormHandling() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(e);
            });
        }

        // Enhanced form validation with Apple-style feedback
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            input.addEventListener('input', (e) => {
                this.clearValidationError(e.target);
            });

            // Add focus animations
            input.addEventListener('focus', (e) => {
                this.addFocusEffect(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.removeFocusEffect(e.target);
            });
        });
    }

    addFocusEffect(input) {
        input.style.transform = 'translateY(-2px)';
        input.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
    }

    removeFocusEffect(input) {
        if (!input.matches(':focus')) {
            input.style.transform = '';
            input.style.boxShadow = '';
        }
    }

    handleFormSubmission(e) {
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData);
        
        // Show Apple-style loading state
        const submitBtn = e.target.querySelector('.btn');
        const originalText = submitBtn.textContent;
        
        // Create loading animation
        submitBtn.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <span class="loading-spinner"></span>
                Sender...
            </span>
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
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Simulate form submission with success animation
        setTimeout(() => {
            this.showAppleStyleNotification('Tak for din besked! Jeg vender tilbage så snart som muligt. ✨', 'success');
            e.target.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            style.remove();
        }, 2000);
    }

    handleInterestClick(tag) {
        const interest = tag.textContent.replace(/^[\w\s]*\s/, ''); // Remove emoji
        const messages = {
            'Digital Marketing': 'Jeg specialiserer mig i SEO, online markedsføring og bruger HubSpot til at optimere kundens digitale tilstedeværelse.',
            'Grafisk Design': 'Med Canva og Adobe Photoshop skaber jeg visuelt tiltalende content, der kommunikerer effektivt.',
            'Webudvikling': 'Fra hjemmesidekonstruktion til responsivt design - jeg bygger digitale løsninger der fungerer på alle enheder.',
            'Videoproduktion': 'Med Adobe Premiere Pro producerer jeg engagerende videoindhold til forskellige platforme.',
            'Fitness': 'Som tidligere gym staff hos PureGym og Fitness World kombinerer jeg min passion for fitness med mit professionelle liv.',
            'Informationsvidenskab': 'Som bachelorstuderende på Aarhus Universitet dykker jeg dybt ned i dataanalyse og informationssystemer.',
            'Content Creation': 'Som medredaktør hos 24skin og gennem mit konsulentarbejde skaber jeg content, der engagerer og konverterer.',
            'Kaffe': 'Den perfekte fuel til kreative processer og lange arbejdsdage! ☕'
        };

        const message = messages[interest] || `${interest} er en af mine store passioner!`;
        this.showAppleStyleNotification(message, 'info');
    }

    showAppleStyleNotification(message, type = 'info') {
        this.closeAllNotifications();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#30D158',
            error: '#FF453A',
            info: '#007AFF'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</div>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Apple-style notification styling
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            color: '#1D1D1F',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.16)',
            border: '0.5px solid rgba(255, 255, 255, 0.3)',
            zIndex: '1000',
            transform: 'translateX(100%) scale(0.8)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            maxWidth: '420px',
            minWidth: '280px',
            fontSize: '17px'
        });

        const content = notification.querySelector('.notification-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        });

        const icon = notification.querySelector('.notification-icon');
        Object.assign(icon.style, {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: colors[type],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            flexShrink: '0',
            marginTop: '2px'
        });

        const text = notification.querySelector('.notification-text');
        Object.assign(text.style, {
            flex: '1',
            lineHeight: '1.4',
            fontSize: '17px'
        });

        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: '#86868B',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(0, 0, 0, 0.05)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });

        document.body.appendChild(notification);

        // Animate in with Apple-style spring animation
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

    initializeScrollEffects() {
        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        // Parallax effect for hero section
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const hero = document.querySelector('.hero');
                    
                    if (hero) {
                        const rate = scrolled * -0.3;
                        hero.style.transform = `translateY(${rate}px)`;
                    }

                    // Update progress bar
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolledPercentage = (winScroll / height) * 100;
                    progressBar.style.width = scrolledPercentage + '%';
                    
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    setupTypewriter() {
        const typewriterElement = document.querySelector('.typewriter');
        if (typewriterElement) {
            const texts = [
                'Kommunikations- og marketingkonsulent',
                'Digital marketing specialist',
                'Content creator',
                'Informationsvidenskabsstuderende'
            ];
            
            let textIndex = 0;
            let charIndex = 0;
            let isDeleting = false;

            const typeWriter = () => {
                const currentText = texts[textIndex];
                
                if (isDeleting) {
                    typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                    charIndex++;
                }

                let typeSpeed = isDeleting ? 80 : 120;

                if (!isDeleting && charIndex === currentText.length) {
                    typeSpeed = 3000;
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    typeSpeed = 800;
                }

                setTimeout(typeWriter, typeSpeed);
            };

            setTimeout(typeWriter, 1500);
        }
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
            color: '#FF453A',
            fontSize: '15px',
            marginTop: '8px',
            display: 'block',
            animation: 'fadeInUp 0.3s ease'
        });

        field.style.borderColor = '#FF453A';
        field.style.boxShadow = '0 0 0 4px rgba(255, 69, 58, 0.1)';
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
}

// Add ripple animation keyframes
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AppleStoreWebsite();
    
    // Add some fun Easter eggs with Apple-style feedback
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            document.body.style.filter = 'hue-rotate(0deg)';
            document.body.style.animation = 'rainbow 3s infinite';
            
            setTimeout(() => {
                document.body.style.animation = '';
                document.body.style.filter = '';
            }, 10000);
        }
    });
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
`;
document.head.appendChild(rainbowStyles);
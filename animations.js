// Modern Animations and Interactions
// This file contains smooth animations, scroll functions, and interactive features

// Smooth scroll polyfill for older browsers
if (!window.CSS || !CSS.supports('scroll-behavior', 'smooth')) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/dist/smoothscroll.min.js';
    document.head.appendChild(script);
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeScrollEffects();
    initializeIntersectionObserver();
    initializeSmoothScrolling();
    initializeParallaxEffects();
    initializeLoadingAnimations();
});

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for scroll-triggered animations
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.tool-card, .pricing-card, .feature-item, .stat').forEach(el => {
        observer.observe(el);
    });
}

// Scroll effects and parallax
function initializeScrollEffects() {
    let ticking = false;

    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        // Navbar background opacity
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const opacity = Math.min(scrolled / 100, 1);
            navbar.style.backgroundColor = `rgba(255, 255, 255, ${0.95 + opacity * 0.05})`;
        }

        // Progress bar for reading progress
        updateReadingProgress();
        
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
}

// Reading progress indicator
function updateReadingProgress() {
    const progressBar = document.querySelector('.reading-progress');
    if (!progressBar) return;

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    progressBar.style.width = scrolled + '%';
}

// Parallax effects
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
        element.style.transition = 'transform 0.1s ease-out';
    });
}

// Loading animations
function initializeLoadingAnimations() {
    // Stagger animation for tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Fade in animation for hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Button hover animations
function initializeButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Card hover animations
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.tool-card, .pricing-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Typing animation for text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Progress bar animation
function animateProgressBar(progressBar, targetWidth, duration = 1000) {
    const startWidth = 0;
    const increment = targetWidth / (duration / 16);
    let currentWidth = startWidth;
    
    const timer = setInterval(() => {
        currentWidth += increment;
        if (currentWidth >= targetWidth) {
            currentWidth = targetWidth;
            clearInterval(timer);
        }
        progressBar.style.width = currentWidth + '%';
    }, 16);
}

// Modal animations
function initializeModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal);
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function openModal(modal) {
    modal.style.display = 'block';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    requestAnimationFrame(() => {
        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });
}

function closeModal(modal) {
    modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// File upload animations
function initializeFileUploadAnimations() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
            this.style.transform = 'scale(1.02)';
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            this.style.transform = 'scale(1)';
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            this.style.transform = 'scale(1)';
        });
    });
}

// Form validation animations
function initializeFormAnimations() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

// Loading states
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        element.appendChild(spinner);
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Success/Error message animations
function showMessage(message, type = 'info', duration = 5000) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-20px)';
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Animate in
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
    
    // Auto remove
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, duration);
}

// Page transition effects
function initializePageTransitions() {
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname) {
                e.preventDefault();
                
                // Add fade out effect
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '0';
                
                setTimeout(() => {
                    window.location.href = this.href;
                }, 300);
            }
        });
    });
}

// Initialize all animations
function initializeAnimations() {
    initializeButtonAnimations();
    initializeCardAnimations();
    initializeModalAnimations();
    initializeFileUploadAnimations();
    initializeFormAnimations();
    initializePageTransitions();
}

// Utility functions for external use
window.AnimationUtils = {
    typeWriter,
    animateCounter,
    animateProgressBar,
    showLoading,
    hideLoading,
    showMessage,
    openModal,
    closeModal
};

// Add CSS for animations
const animationStyles = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .tool-card,
    .pricing-card,
    .feature-item,
    .stat {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .btn {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .tool-card,
    .pricing-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .upload-area {
        transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
    }
    
    .message {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .modal {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .focused {
        transform: translateY(-2px);
    }
    
    .focused label {
        color: #000000;
        font-weight: 600;
    }
    
    .focused input,
    .focused textarea,
    .focused select {
        border-color: #000000;
    }
    
    .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: #000000;
        z-index: 9999;
        transition: width 0.1s ease;
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Add reading progress bar
const progressBar = document.createElement('div');
progressBar.className = 'reading-progress';
document.body.appendChild(progressBar);

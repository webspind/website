// Apple-Style JavaScript for Webspind
// Modern, smooth interactions inspired by Apple's design philosophy

// Global variables
let userCredits = 3; // Daily free credits
let dailyResetTime = new Date();
dailyResetTime.setHours(24, 0, 0, 0); // Reset at midnight

// Navigation Management
function initializeNavigation() {
    // Remove existing navigation if it exists
    const existingNav = document.querySelector('.navbar');
    if (existingNav) {
        existingNav.remove();
    }

    // Detect current page
    const currentPage = detectCurrentPage();
    
    // Create navigation HTML
    const navHTML = createNavigationHTML(currentPage);
    
    // Inject navigation into the page
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // Setup navigation event listeners
    setupNavigationEvents();
}

function detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('ai-detector')) return 'ai-detector';
    if (path.includes('pdf-merger')) return 'pdf-merger';
    if (path.includes('pdf-ocr')) return 'pdf-ocr';
    if (path.includes('pdf-splitter')) return 'pdf-splitter';
    if (path.includes('pdf-compressor')) return 'pdf-compressor';
    if (path.includes('word-to-pdf')) return 'word-to-pdf';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms')) return 'terms';
    return 'home';
}

function createNavigationHTML(currentPage) {
    const isHomePage = currentPage === 'home';
    const isToolPage = currentPage.includes('detector') || currentPage.includes('merger') || 
                      currentPage.includes('ocr') || currentPage.includes('splitter') || 
                      currentPage.includes('compressor') || currentPage.includes('word-to-pdf');
    
    const homeLink = isHomePage ? '#' : (isToolPage ? '../index.html' : 'index.html');
    const toolsLink = isHomePage ? '#tools' : (isToolPage ? '../index.html#tools' : 'index.html#tools');
    const pricingLink = isHomePage ? '#pricing' : (isToolPage ? '../index.html#pricing' : 'index.html#pricing');

    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <a href="${homeLink}" style="text-decoration: none; color: inherit;">
                        <span class="logo-text">Webspind</span>
                    </a>
                </div>
                <div class="nav-menu">
                    <a href="${toolsLink}" class="nav-link">Tools</a>
                    <a href="${pricingLink}" class="nav-link">Pricing</a>
                    <div class="credits-display">
                        <span class="credits-icon">⚡</span>
                        <span id="credits-count">3</span>
                    </div>
                </div>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    `;
}

function setupNavigationEvents() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeApp();
    setupEventListeners();
    checkDailyReset();
    initializeAppleFeatures();
});

// Initialize app
function initializeApp() {
    // Load saved credits from localStorage
    const savedCredits = localStorage.getItem('webspind_credits');
    const savedResetTime = localStorage.getItem('webspind_reset_time');
    
    if (savedCredits && savedResetTime) {
        const resetTime = new Date(savedResetTime);
        const now = new Date();
        
        // Check if it's a new day
        if (now.getDate() !== resetTime.getDate() || now.getMonth() !== resetTime.getMonth() || now.getFullYear() !== resetTime.getFullYear()) {
            // New day - reset credits
            userCredits = 3;
            updateCreditsDisplay();
            saveCredits();
        } else {
            // Same day - use saved credits
            userCredits = parseInt(savedCredits);
            updateCreditsDisplay();
        }
    } else {
        // First time user
        userCredits = 3;
        updateCreditsDisplay();
        saveCredits();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Modal close functionality
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScrollTo(target);
            }
        });
    });
}

// Apple-style smooth scrolling
function smoothScrollTo(target) {
    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Check daily reset
function checkDailyReset() {
    const now = new Date();
    const resetTime = new Date(dailyResetTime);
    
    if (now >= resetTime) {
        userCredits = 3;
        updateCreditsDisplay();
        saveCredits();
        
        // Set next reset time
        dailyResetTime.setDate(dailyResetTime.getDate() + 1);
        saveCredits();
        
        showAppleMessage('Your daily credits have been reset! You now have 3 free credits.', 'success');
    }
}

// Update credits display
function updateCreditsDisplay() {
    const creditsElement = document.getElementById('credits-count');
    if (creditsElement) {
        creditsElement.textContent = userCredits;
    }
}

// Save credits to localStorage
function saveCredits() {
    localStorage.setItem('webspind_credits', userCredits.toString());
    localStorage.setItem('webspind_reset_time', dailyResetTime.toISOString());
}

// Show payment modal
function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animate modal in
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Process payment (template for Stripe integration)
function processPayment(credits, price) {
    // This is a template - you'll need to integrate with Stripe
    showAppleMessage('Payment processing... This will be connected to your Stripe account.', 'info');
    
    // Simulate successful payment
    setTimeout(() => {
        userCredits += credits;
        updateCreditsDisplay();
        saveCredits();
        showAppleMessage(`Payment successful! You now have ${userCredits} credits.`, 'success');
        
        // Close modal
        closeModal();
    }, 2000);
}

// Check if user has enough credits
function hasEnoughCredits(requiredCredits = 1) {
    return userCredits >= requiredCredits;
}

// Use credits
function useCredits(amount = 1) {
    if (hasEnoughCredits(amount)) {
        userCredits -= amount;
        updateCreditsDisplay();
        saveCredits();
        return true;
    }
    return false;
}

// Apple-style message system
function showAppleMessage(message, type = 'info', duration = 5000) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.apple-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `apple-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-icon">
                <i class="fas ${getMessageIcon(type)}"></i>
            </div>
            <div class="message-text">${message}</div>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insert at top of page
    const body = document.body;
    body.insertBefore(messageDiv, body.firstChild);
    
    // Animate in
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);
    
    // Auto remove after duration
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, duration);
}

function getMessageIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

// Apple-style features initialization
function initializeAppleFeatures() {
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize tool card interactions
    initializeToolCardInteractions();
    
    // Initialize parallax effects
    initializeParallaxEffects();
    
    // Initialize loading animations
    initializeLoadingAnimations();
    
    // Initialize navbar effects
    initializeNavbarEffects();
}

// Scroll animations using Intersection Observer
function initializeScrollAnimations() {
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
    const animatedElements = document.querySelectorAll('.tool-card, .pricing-card, .section-header');
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// Enhanced tool card interactions
function initializeToolCardInteractions() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        // Add subtle hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add click tracking
        const toolLink = card.querySelector('.tool-link');
        if (toolLink) {
            toolLink.addEventListener('click', function(e) {
                const toolName = card.dataset.tool;
                trackToolUsage(toolName, 'click');
            });
        }
    });
}

// Parallax effects for hero section
function initializeParallaxEffects() {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        
        floatingCards.forEach((card, index) => {
            const speed = 0.3 + (index * 0.1);
            card.style.transform = `translateY(${rate * speed}px)`;
        });
    });
}

// Loading animations for better perceived performance
function initializeLoadingAnimations() {
    // Add loading class to body initially
    document.body.classList.add('loading');
    
    // Remove loading class when everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }, 500);
    });
}

// Navbar effects
function initializeNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });
}

// Enhanced tool tracking with modern analytics
function trackToolUsage(toolName, action = 'view') {
    // Enhanced tracking with more context
    const trackingData = {
        tool: toolName,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        credits: userCredits
    };
    
    // Store in localStorage for analytics
    const usageHistory = JSON.parse(localStorage.getItem('webspind_usage') || '[]');
    usageHistory.push(trackingData);
    
    // Keep only last 100 entries
    if (usageHistory.length > 100) {
        usageHistory.splice(0, usageHistory.length - 100);
    }
    
    localStorage.setItem('webspind_usage', JSON.stringify(usageHistory));
    
    // Track with existing system
    trackEvent('Tool Usage', action, toolName);
}

// Analytics tracking (template for Google Analytics)
function trackEvent(category, action, label) {
    // This is a template - integrate with your analytics
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // Example Google Analytics 4 event
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// File upload utilities
function createFileUploadArea(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const uploadArea = document.createElement('div');
    uploadArea.className = 'upload-area';
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>${options.title || 'Upload Files'}</h3>
        <p>${options.description || 'Drag and drop files here or click to browse'}</p>
        <input type="file" multiple accept="${options.accept || '*'}" style="display: none;">
    `;
    
    const fileInput = uploadArea.querySelector('input[type="file"]');
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    
    let files = [];
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    function handleFiles(newFiles) {
        Array.from(newFiles).forEach(file => {
            if (options.maxSize && file.size > options.maxSize) {
                showAppleMessage(`File ${file.name} is too large. Maximum size is ${formatFileSize(options.maxSize)}.`, 'error');
                return;
            }
            
            if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
                showAppleMessage(`File type ${file.type} is not supported.`, 'error');
                return;
            }
            
            files.push(file);
        });
        
        updateFileList();
    }
    
    function updateFileList() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="remove-file" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }
    
    function removeFile(index) {
        files.splice(index, 1);
        updateFileList();
    }
    
    // Make removeFile globally accessible
    window.removeFile = removeFile;
    
    container.appendChild(uploadArea);
    container.appendChild(fileList);
    
    // Return methods to interact with the upload area
    return {
        getFiles: () => files,
        clearFiles: () => {
            files = [];
            updateFileList();
        },
        addFiles: (newFiles) => {
            handleFiles(newFiles);
        }
    };
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Process file with credit check
function processFileWithCredits(processFunction, requiredCredits = 1) {
    if (!hasEnoughCredits(requiredCredits)) {
        showAppleMessage(`You need ${requiredCredits} credit(s) to download this file. You have ${userCredits} credits remaining.`, 'error');
        showPaymentModal();
        return false;
    }
    
    // Use credits and process
    if (useCredits(requiredCredits)) {
        processFunction();
        return true;
    }
    
    return false;
}

// Download file
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show loading state
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        element.appendChild(spinner);
    }
}

// Hide loading state
function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Simulate file processing (for demo purposes)
function simulateProcessing(duration = 2000) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

// SEO and performance optimizations
function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    optimizeImages();
});

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

// Export functions for use in tool pages
window.WebspindUtils = {
    hasEnoughCredits,
    useCredits,
    showMessage: showAppleMessage,
    createFileUploadArea,
    formatFileSize,
    processFileWithCredits,
    downloadFile,
    showLoading,
    hideLoading,
    simulateProcessing,
    trackEvent,
    trackToolUsage,
    userCredits: () => userCredits
};
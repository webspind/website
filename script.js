// Global variables
let userCredits = 3; // Daily free credits
let dailyResetTime = new Date();
dailyResetTime.setHours(24, 0, 0, 0); // Reset at midnight

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkDailyReset();
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
        });
    }
    
    // Modal close functionality
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
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
        
        showMessage('Your daily credits have been reset! You now have 3 free credits.', 'success');
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
    }
}

// Process payment (template for Stripe integration)
function processPayment(credits, price) {
    // This is a template - you'll need to integrate with Stripe
    showMessage('Payment processing... This will be connected to your Stripe account.', 'info');
    
    // Simulate successful payment
    setTimeout(() => {
        userCredits += credits;
        updateCreditsDisplay();
        saveCredits();
        showMessage(`Payment successful! You now have ${userCredits} credits.`, 'success');
        
        // Close modal
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
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

// Show message
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of page
    const body = document.body;
    body.insertBefore(messageDiv, body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
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
                showMessage(`File ${file.name} is too large. Maximum size is ${formatFileSize(options.maxSize)}.`, 'error');
                return;
            }
            
            if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
                showMessage(`File type ${file.type} is not supported.`, 'error');
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
        showMessage(`You need ${requiredCredits} credit(s) to download this file. You have ${userCredits} credits remaining.`, 'error');
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

// Export functions for use in tool pages
window.WebspindUtils = {
    hasEnoughCredits,
    useCredits,
    showMessage,
    createFileUploadArea,
    formatFileSize,
    processFileWithCredits,
    downloadFile,
    showLoading,
    hideLoading,
    simulateProcessing,
    trackEvent,
    userCredits: () => userCredits
};

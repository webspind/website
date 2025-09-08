// Webspind Credit System - Client-side JavaScript
// Handles credit tracking, purchases, and usage management

class WebspindCredits {
  constructor() {
    this.apiBase = 'https://api.webspind.com'; // Replace with your actual API URL
    this.deviceId = this.getDeviceId();
    this.userId = localStorage.getItem('webspind-user-id');
    this.credits = parseInt(localStorage.getItem('webspind-credits') || '3'); // 3 free credits
    this.freeCreditsUsed = parseInt(localStorage.getItem('webspind-free-used') || '0');
    this.freeCreditsLimit = 3; // 3 free credits for new users
    
    this.init();
  }
  
  // Initialize the credit system
  async init() {
    await this.loadCredits();
    this.updateUI();
    this.setupEventListeners();
    
    // Check for session_id in URL (post-checkout)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      await this.handlePostCheckout(sessionId);
    }
  }
  
  // Generate device identifier for free users
  getDeviceId() {
    let deviceId = localStorage.getItem('webspind-device-id');
    if (!deviceId) {
      // Generate a device ID based on browser fingerprint
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset()
      ].join('|');
      
      deviceId = btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
      localStorage.setItem('webspind-device-id', deviceId);
    }
    return deviceId;
  }
  
  // Load current credits from API
  async loadCredits() {
    try {
      const response = await fetch(`${this.apiBase}/api/credits/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.userId || this.deviceId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.credits = data.credits;
        this.freeCreditsUsed = data.freeCreditsUsed;
        this.saveCreditsToLocal();
      }
    } catch (error) {
      console.error('Failed to load credits:', error);
      // Fallback to local storage
      this.loadCreditsFromLocal();
    }
  }
  
  // Fallback: load credits from local storage
  loadCreditsFromLocal() {
    this.credits = parseInt(localStorage.getItem('webspind-credits') || '3');
    this.freeCreditsUsed = parseInt(localStorage.getItem('webspind-free-used') || '0');
  }

  // Save credits to local storage
  saveCreditsToLocal() {
    localStorage.setItem('webspind-credits', this.credits.toString());
    localStorage.setItem('webspind-free-used', this.freeCreditsUsed.toString());
  }
  
  // Check if user can perform an action (without consuming credits)
  canPerformAction(amount = 1) {
    return this.credits >= amount;
  }
  
  // Consume credits (call this when user performs an action)
  async consumeCredits(amount = 1) {
    // Check if user can perform the action first
    if (!this.canPerformAction(amount)) {
      this.showBuyCreditsModal();
      return false;
    }
    
    try {
      const response = await fetch(`${this.apiBase}/api/credits/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.userId || this.deviceId,
          amount: amount
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.credits = result.credits;
        this.freeCreditsUsed = result.freeCreditsUsed;
        this.saveCreditsToLocal();
        this.updateUI();
        
        if (!result.allowed) {
          this.showBuyCreditsModal();
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to consume credits:', error);
      // Fallback to local check
      return this.consumeCreditsLocal(amount);
    }
    
    return false;
  }
  
  // Fallback: consume credits locally
  consumeCreditsLocal(amount) {
    if (this.credits < amount) {
      this.showBuyCreditsModal();
      return false;
    }
    
    this.credits -= amount;
    this.saveCreditsToLocal();
    this.updateUI();
    return true;
  }
  
  // Update UI elements
  updateUI() {
    // Update credit badge
    const quotaBadge = document.getElementById('quota-badge');
    if (quotaBadge) {
      const isNewUser = this.freeCreditsUsed < this.freeCreditsLimit;
      const freeCreditsRemaining = Math.max(0, this.freeCreditsLimit - this.freeCreditsUsed);
      
      quotaBadge.innerHTML = `
        <span class="text-sm font-medium">
          ${isNewUser ? `Free: ${freeCreditsRemaining} left` : ''} • 
          Credits: ${this.credits}
        </span>
      `;
    }
    
    // Update buy credits buttons
    const buyCreditsButtons = document.querySelectorAll('.buy-credits-btn');
    buyCreditsButtons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
    
    // Update support buttons (show as secondary)
    const supportButtons = document.querySelectorAll('.support-btn');
    supportButtons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  }
  
  // Show buy credits modal
  showBuyCreditsModal(context = 'no_credits') {
    const modal = document.getElementById('buy-credits-modal');
    if (modal) {
      // Update modal content based on context
      this.updateBuyCreditsModalContent(context);
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Update buy credits modal content based on context
  updateBuyCreditsModalContent(context) {
    const modal = document.getElementById('buy-credits-modal');
    if (!modal) return;
    
    const title = modal.querySelector('h3');
    const description = modal.querySelector('p');
    
    if (context === 'no_credits') {
      title.textContent = 'Out of Credits';
      description.textContent = `You have ${this.credits} credits remaining. Buy more credits to continue using our tools.`;
    } else if (context === 'buy_clicked') {
      title.textContent = 'Buy Credits';
      description.textContent = 'Choose a credit package that works for you. Credits never expire and can be used for any tool.';
    } else if (context === 'premium_feature') {
      title.textContent = 'Premium Feature';
      description.textContent = 'This feature requires credits. Buy credits to access background removal and other premium tools.';
    }
  }
  
  // Hide buy credits modal
  hideBuyCreditsModal() {
    const modal = document.getElementById('buy-credits-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }
  
  // Handle post-checkout flow
  async handlePostCheckout(sessionId) {
    try {
      const response = await fetch(`${this.apiBase}/api/credits/purchase?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.credits) {
          this.credits += data.credits;
          this.saveCreditsToLocal();
          this.updateUI();
          
          // Show success message
          this.showSuccessMessage(`Success! ${data.credits} credits added to your account.`);
          
          // Clean URL
          const url = new URL(window.location);
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url);
        }
      }
    } catch (error) {
      console.error('Failed to handle post-checkout:', error);
    }
  }
  
  // Create Stripe checkout session for credits
  async createCheckout(creditPackage) {
    try {
      const response = await fetch(`${this.apiBase}/api/credits/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          package: creditPackage,
          identifier: this.userId || this.deviceId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  }
  
  // Show success message
  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideBuyCreditsModal();
      }
    });
    
    // Close modal on outside click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('buy-credits-modal');
      if (modal && e.target === modal) {
        this.hideBuyCreditsModal();
      }
    });
  }
  
  // Get credit packages
  getCreditPackages() {
    return [
      { id: 'starter', name: 'Starter Pack', credits: 10, price: 2.99, popular: false },
      { id: 'popular', name: 'Popular Pack', credits: 50, price: 9.99, popular: true },
      { id: 'pro', name: 'Pro Pack', credits: 100, price: 16.99, popular: false },
      { id: 'enterprise', name: 'Enterprise Pack', credits: 250, price: 34.99, popular: false }
    ];
  }
}

// Initialize credit system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.webspindCredits = new WebspindCredits();
  // Keep backward compatibility
  window.webspindFreemium = window.webspindCredits;
});

// Export for use in other scripts
window.WebspindCredits = WebspindCredits;
window.WebspindFreemium = WebspindCredits; // Backward compatibility


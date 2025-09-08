// Webspind Freemium System - Client-side JavaScript
// Handles usage tracking, quota management, and upgrade flows

class WebspindFreemium {
  constructor() {
    this.apiBase = 'https://api.webspind.com'; // Replace with your actual API URL
    this.deviceId = this.getDeviceId();
    this.licenseKey = localStorage.getItem('webspind-license-key');
    this.plan = this.licenseKey ? 'pro' : 'free';
    this.usage = { used: 0, limit: 3, remaining: 3 };
    
    this.init();
  }
  
  // Initialize the freemium system
  async init() {
    await this.loadUsage();
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
  
  // Load current usage from API
  async loadUsage() {
    try {
      const response = await fetch(`${this.apiBase}/api/usage/peek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.licenseKey || this.deviceId,
          plan: this.plan
        })
      });
      
      if (response.ok) {
        this.usage = await response.json();
        this.plan = this.usage.plan;
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
      // Fallback to local storage
      this.loadUsageFromLocal();
    }
  }
  
  // Fallback: load usage from local storage
  loadUsageFromLocal() {
    const today = new Date().toISOString().split('T')[0];
    const localUsage = JSON.parse(localStorage.getItem(`webspind-usage-${today}`) || '{"used": 0}');
    this.usage = {
      used: localUsage.used,
      limit: this.plan === 'pro' ? 300 : 3,
      remaining: (this.plan === 'pro' ? 300 : 3) - localUsage.used
    };
  }
  
  // Check if user can perform an action (without consuming usage)
  canPerformAction(amount = 1) {
    return this.usage.remaining >= amount;
  }
  
  // Consume usage (call this when user performs an action)
  async consumeUsage(amount = 1) {
    // Check if user can perform the action first
    if (!this.canPerformAction(amount)) {
      this.showUpgradeModal('limit_reached');
      return false;
    }
    
    try {
      const response = await fetch(`${this.apiBase}/api/usage/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.licenseKey || this.deviceId,
          amount: amount,
          plan: this.plan
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.usage = result;
        
        // Update local storage as backup
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`webspind-usage-${today}`, JSON.stringify({ used: result.used }));
        
        this.updateUI();
        
        if (!result.allowed) {
          this.showUpgradeModal('limit_reached');
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to consume usage:', error);
      // Fallback to local check
      return this.consumeUsageLocal(amount);
    }
    
    return false;
  }
  
  // Fallback: consume usage locally
  consumeUsageLocal(amount) {
    const today = new Date().toISOString().split('T')[0];
    const localUsage = JSON.parse(localStorage.getItem(`webspind-usage-${today}`) || '{"used": 0}');
    const limit = this.plan === 'pro' ? 300 : 3;
    
    if (localUsage.used + amount > limit) {
      this.showUpgradeModal();
      return false;
    }
    
    localUsage.used += amount;
    localStorage.setItem(`webspind-usage-${today}`, JSON.stringify(localUsage));
    
    this.usage = {
      used: localUsage.used,
      limit: limit,
      remaining: limit - localUsage.used
    };
    
    this.updateUI();
    return true;
  }
  
  // Update UI elements
  updateUI() {
    // Update quota badge
    const quotaBadge = document.getElementById('quota-badge');
    if (quotaBadge) {
      quotaBadge.innerHTML = `
        <span class="text-sm font-medium">
          Plan: ${this.plan === 'pro' ? 'Pro' : 'Free'} • 
          ${this.usage.remaining}/${this.usage.limit} left today
        </span>
      `;
    }
    
    // Update upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    upgradeButtons.forEach(btn => {
      if (this.plan === 'pro') {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'inline-block';
      }
    });
    
    // Update support buttons (show as secondary)
    const supportButtons = document.querySelectorAll('.support-btn');
    supportButtons.forEach(btn => {
      btn.style.display = 'inline-block';
    });
  }
  
  // Show upgrade modal
  showUpgradeModal(context = 'limit_reached') {
    const modal = document.getElementById('upgrade-modal');
    if (modal) {
      // Update modal content based on context
      this.updateUpgradeModalContent(context);
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Update upgrade modal content based on context
  updateUpgradeModalContent(context) {
    const modal = document.getElementById('upgrade-modal');
    if (!modal) return;
    
    const title = modal.querySelector('h3');
    const description = modal.querySelector('p');
    
    if (context === 'limit_reached') {
      title.textContent = 'Out of free actions';
      description.textContent = 'You\'ve reached today\'s 3 free actions. Get Pro Pass for 300/day, batch tools, OCR/redaction, faster processing, and no ads.';
    } else if (context === 'upgrade_clicked') {
      title.textContent = 'Upgrade to Pro';
      description.textContent = 'Unlock 300 actions/day, batch processing, OCR tools, and faster processing with Pro Pass.';
    } else if (context === 'premium_feature') {
      title.textContent = 'Premium Feature';
      description.textContent = 'This feature requires Pro Pass. Upgrade to access batch processing, OCR tools, and more.';
    }
  }
  
  // Hide upgrade modal
  hideUpgradeModal() {
    const modal = document.getElementById('upgrade-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }
  
  // Handle post-checkout flow
  async handlePostCheckout(sessionId) {
    try {
      const response = await fetch(`${this.apiBase}/api/lookup?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.license) {
          this.licenseKey = data.license;
          localStorage.setItem('webspind-license-key', data.license);
          this.plan = 'pro';
          await this.loadUsage();
          this.updateUI();
          
          // Show success message
          this.showSuccessMessage('Welcome to Pro! Your license has been activated.');
          
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
  
  // Activate license key
  async activateLicense(licenseKey) {
    try {
      const response = await fetch(`${this.apiBase}/api/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          this.licenseKey = licenseKey;
          localStorage.setItem('webspind-license-key', licenseKey);
          this.plan = data.plan;
          await this.loadUsage();
          this.updateUI();
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to activate license:', error);
    }
    
    return false;
  }
  
  // Create Stripe checkout session
  async createCheckout(plan, priceId) {
    try {
      const response = await fetch(`${this.apiBase}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, priceId })
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
        this.hideUpgradeModal();
      }
    });
    
    // Close modal on outside click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('upgrade-modal');
      if (modal && e.target === modal) {
        this.hideUpgradeModal();
      }
    });
  }
  
  // Get time until reset (UTC midnight)
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

// Initialize freemium system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.webspindFreemium = new WebspindFreemium();
});

// Export for use in other scripts
window.WebspindFreemium = WebspindFreemium;

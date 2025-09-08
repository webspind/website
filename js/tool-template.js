// Template for integrating freemium system into tool pages
// Include this script in all tool pages

// Tool-specific configuration
const TOOL_CONFIG = {
  name: 'PDF Merge', // Replace with actual tool name
  actionCost: 1, // How many actions this tool costs (OCR/AI = 2)
  isPremiumFeature: false, // Set to true for Pro-only features
  batchEnabled: false // Set to true if tool supports batch processing
};

// Initialize tool with freemium integration
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for freemium system to load
  await waitForFreemium();
  
  // Initialize tool-specific functionality
  initializeTool();
  
  // Add freemium integration to tool actions
  integrateFreemiumSystem();
});

// Wait for freemium system to be available
function waitForFreemium() {
  return new Promise((resolve) => {
    const checkFreemium = () => {
      if (window.webspindFreemium) {
        resolve();
      } else {
        setTimeout(checkFreemium, 100);
      }
    };
    checkFreemium();
  });
}

// Initialize tool-specific functionality
function initializeTool() {
  // Add your tool's initialization code here
  console.log(`Initializing ${TOOL_CONFIG.name} tool`);
  
  // Example: Initialize drag and drop, file handlers, etc.
  // This is where you'd put your existing tool initialization code
}

// Integrate freemium system with tool actions
function integrateFreemiumSystem() {
  // Add quota badge to navigation
  addQuotaBadge();
  
  // Add upgrade buttons to navigation
  addUpgradeButtons();
  
  // Add subtle Pro banner under header
  addProBanner();
  
  // Wrap tool actions with usage checks
  wrapToolActions();
  
  // Add upgrade modal
  addUpgradeModal();
}

// Add quota badge to navigation
function addQuotaBadge() {
  const nav = document.querySelector('nav .flex.items-center.justify-between');
  if (nav && !document.getElementById('quota-badge')) {
    const quotaBadge = document.createElement('div');
    quotaBadge.id = 'quota-badge';
    quotaBadge.className = 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm';
    quotaBadge.innerHTML = '<span class="text-sm font-medium">Loading...</span>';
    
    // Insert before the last child (usually the support button)
    nav.insertBefore(quotaBadge, nav.lastElementChild);
  }
}

// Add subtle upsell banner across tools
function addProBanner() {
  if (document.getElementById('pro-banner')) return;
  const main = document.querySelector('main');
  if (!main) return;
  const banner = document.createElement('div');
  banner.id = 'pro-banner';
  banner.className = 'mb-6';
  banner.innerHTML = `
    <div class="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="text-sm text-gray-800">
        Need to process more or larger files? <span class="font-semibold">Pro allows 300 actions/day</span>, batch processing, OCR/redaction, faster processing and no ads.
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button class="btn-primary w-full sm:w-auto" onclick="handleUpgradeClick()">Upgrade to Pro</button>
        <a class="btn-secondary w-full sm:w-auto" href="/pricing.html">See Plans</a>
      </div>
    </div>
  `;
  main.insertBefore(banner, main.firstElementChild?.nextSibling || main.firstChild);
}

// Add upgrade buttons to navigation
function addUpgradeButtons() {
  const nav = document.querySelector('nav .flex.items-center.justify-between');
  if (nav && !document.querySelector('.upgrade-btn')) {
    // Add upgrade button
    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'btn-primary hidden md:block upgrade-btn';
    upgradeBtn.textContent = 'Upgrade to Pro';
    upgradeBtn.onclick = handleUpgradeClick;
    
    // Add support button (secondary)
    const supportBtn = document.createElement('button');
    supportBtn.className = 'btn-secondary hidden md:block support-btn ml-2';
    supportBtn.textContent = 'Support';
    supportBtn.onclick = openSupport;
    
    nav.appendChild(upgradeBtn);
    nav.appendChild(supportBtn);
  }
}

// Wrap tool actions with usage checks
function wrapToolActions() {
  // Find all action buttons (merge, convert, generate, etc.)
  const actionButtons = document.querySelectorAll('button[onclick*="process"], button[onclick*="merge"], button[onclick*="convert"], button[onclick*="generate"]');
  
  actionButtons.forEach(button => {
    const originalOnclick = button.onclick;
    button.onclick = async function(e) {
      e.preventDefault();
      
      // Check if user can perform action
      if (!window.webspindFreemium.canPerformAction(TOOL_CONFIG.actionCost)) {
        window.webspindFreemium.showUpgradeModal('limit_reached');
        return;
      }
      
      // Check if this is a premium feature
      if (TOOL_CONFIG.isPremiumFeature && window.webspindFreemium.plan !== 'pro') {
        window.webspindFreemium.showUpgradeModal('premium_feature');
        return;
      }
      
      // Consume usage
      const canProceed = await window.webspindFreemium.consumeUsage(TOOL_CONFIG.actionCost);
      if (!canProceed) {
        return;
      }
      
      // Execute original action
      if (originalOnclick) {
        originalOnclick.call(this, e);
      }
    };
  });
}

// Add upgrade modal to page
function addUpgradeModal() {
  if (!document.getElementById('upgrade-modal')) {
    const modalHTML = `
      <div id="upgrade-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full">
            <div class="flex justify-between items-center p-6 border-b">
              <h3 class="text-xl font-bold text-gray-900">Out of free actions</h3>
              <button onclick="window.webspindFreemium?.hideUpgradeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            <div class="p-6">
              <p class="text-gray-600 mb-6">You've reached today's 3 free actions. Get Pro Pass for 300/day, batch tools, OCR/redaction, faster processing, and no ads.</p>
              
              <div class="space-y-4 mb-6">
                <div class="flex items-center gap-3">
                  <span class="text-green-500 text-xl">✓</span>
                  <span class="text-sm text-gray-700">300 actions per day</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-500 text-xl">✓</span>
                  <span class="text-sm text-gray-700">Batch processing</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-500 text-xl">✓</span>
                  <span class="text-sm text-gray-700">OCR & redaction tools</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-500 text-xl">✓</span>
                  <span class="text-sm text-gray-700">Faster processing</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-500 text-xl">✓</span>
                  <span class="text-sm text-gray-700">No ads</span>
                </div>
              </div>
              
              <div class="space-y-3">
                <button onclick="window.location.href='/pricing.html'" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Upgrade to Pro - €6.99/mo
                </button>
                <button onclick="openLicenseModal()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors">
                  Activate License
                </button>
                <button onclick="window.webspindFreemium?.hideUpgradeModal()" class="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors">
                  Keep exploring
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- License Activation Modal -->
      <div id="license-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-2xl max-w-md w-full">
            <div class="flex justify-between items-center p-6 border-b">
              <h3 class="text-xl font-bold text-gray-900">Activate License</h3>
              <button onclick="closeLicenseModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            <div class="p-6">
              <p class="text-gray-600 mb-4">Enter your license key to activate Pro features:</p>
              <input type="text" id="license-key-input" placeholder="Enter license key..." 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4">
              <button onclick="activateLicense()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Activate License
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// Upgrade and modal functions
function handleUpgradeClick() {
  if (window.webspindFreemium && window.webspindFreemium.usage.remaining <= 0) {
    window.webspindFreemium.showUpgradeModal('limit_reached');
  } else {
    window.webspindFreemium.showUpgradeModal('upgrade_clicked');
  }
}

function openSupport() {
  // Open support modal or redirect
  window.location.href = '/pricing.html';
}

function openLicenseModal() {
  document.getElementById('license-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLicenseModal() {
  document.getElementById('license-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function activateLicense() {
  const licenseKey = document.getElementById('license-key-input').value.trim();
  
  if (!licenseKey) {
    alert('Please enter a license key');
    return;
  }
  
  if (window.webspindFreemium) {
    window.webspindFreemium.activateLicense(licenseKey).then(success => {
      if (success) {
        closeLicenseModal();
        alert('License activated successfully!');
      } else {
        alert('Invalid license key. Please check and try again.');
      }
    });
  }
}

// Close modals on outside click
document.addEventListener('click', function(e) {
  const upgradeModal = document.getElementById('upgrade-modal');
  const licenseModal = document.getElementById('license-modal');
  
  if (upgradeModal && e.target === upgradeModal) {
    window.webspindFreemium?.hideUpgradeModal();
  }
  
  if (licenseModal && e.target === licenseModal) {
    closeLicenseModal();
  }
});

// Close modals on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.webspindFreemium?.hideUpgradeModal();
    closeLicenseModal();
  }
});

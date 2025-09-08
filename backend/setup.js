#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Webspind Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
    console.log('⚠️  Please edit .env file with your actual configuration\n');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
  console.log('✅ Created data directory');
}

console.log('\n📋 Setup Checklist:');
console.log('1. Edit .env file with your configuration:');
console.log('   - STRIPE_SECRET_KEY (from Stripe Dashboard)');
console.log('   - STRIPE_PUBLISHABLE_KEY (from Stripe Dashboard)');
console.log('   - STRIPE_WEBHOOK_SECRET (from Stripe Dashboard)');
console.log('   - JWT_SECRET (generate a random string)');
console.log('   - FRONTEND_URL (your website URL)');
console.log('\n2. Install dependencies:');
console.log('   npm install');
console.log('\n3. Start the server:');
console.log('   npm start');
console.log('\n4. Configure Stripe webhooks:');
console.log('   - Go to Stripe Dashboard > Webhooks');
console.log('   - Add endpoint: https://yourdomain.com/api/webhooks/stripe');
console.log('   - Select events: customer.subscription.*, invoice.payment_*');
console.log('\n5. Update frontend API URL:');
console.log('   - Change apiBase in js/freemium.js to your backend URL');
console.log('\n🎉 Setup complete!');

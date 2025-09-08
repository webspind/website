// Cloudflare Worker for Webspind Freemium API
// Handles usage tracking, Stripe integration, and license management

import { Stripe } from 'stripe';

// Environment variables (set in Cloudflare Workers dashboard)
const STRIPE_SECRET_KEY = 'sk_test_...'; // Replace with your Stripe secret key
const STRIPE_WEBHOOK_SECRET = 'whsec_...'; // Replace with your webhook secret
const ALLOWED_ORIGINS = ['https://webspind.com', 'https://www.webspind.com'];

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://webspind.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to generate device identifier for free users
function generateDeviceId(ip, userAgent) {
  const crypto = require('crypto');
  const data = `${ip}-${userAgent}`;
  return crypto.createHmac('sha256', 'webspind-device-key').update(data).digest('hex');
}

// Helper function to get today's date key
function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Usage tracking functions
async function getUsage(identifier, plan = 'free') {
  const today = getTodayKey();
  const key = `usage:${identifier}:${today}`;
  
  // In production, this would use Cloudflare KV or D1 database
  // For now, we'll simulate with a simple in-memory store
  const usage = await USAGE_STORE.get(key);
  return usage ? JSON.parse(usage) : { used: 0, limit: plan === 'pro' ? 300 : 3 };
}

async function consumeUsage(identifier, amount, plan = 'free') {
  const today = getTodayKey();
  const key = `usage:${identifier}:${today}`;
  
  const currentUsage = await getUsage(identifier, plan);
  const limit = plan === 'pro' ? 300 : 3;
  
  if (currentUsage.used + amount > limit) {
    return { allowed: false, used: currentUsage.used, limit, remaining: limit - currentUsage.used };
  }
  
  const newUsage = { used: currentUsage.used + amount, limit };
  await USAGE_STORE.put(key, JSON.stringify(newUsage));
  
  return { allowed: true, used: newUsage.used, limit, remaining: limit - newUsage.used };
}

// License management functions
async function getLicense(licenseKey) {
  const key = `license:${licenseKey}`;
  const license = await LICENSE_STORE.get(key);
  return license ? JSON.parse(license) : null;
}

async function createLicense(plan, source = 'stripe') {
  const licenseKey = crypto.randomUUID();
  const license = {
    key: licenseKey,
    plan: plan,
    status: 'active',
    created: new Date().toISOString(),
    source: source,
    limits: {
      daily: plan === 'pro' ? 300 : 3,
      fileSize: plan === 'pro' ? 4 * 1024 * 1024 * 1024 : 200 * 1024 * 1024, // 4GB vs 200MB
      batch: plan === 'pro'
    }
  };
  
  await LICENSE_STORE.put(`license:${licenseKey}`, JSON.stringify(license));
  return license;
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Validate origin
    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }
    
    try {
      // Route handling
      switch (path) {
        case '/api/usage/peek':
          return await handleUsagePeek(request);
        case '/api/usage/consume':
          return await handleUsageConsume(request);
        case '/api/checkout':
          return await handleCheckout(request);
        case '/api/lookup':
          return await handleLookup(request);
        case '/api/webhook':
          return await handleWebhook(request);
        case '/api/activate':
          return await handleActivate(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('API Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

// API endpoint handlers
async function handleUsagePeek(request) {
  const { identifier, plan } = await request.json();
  const usage = await getUsage(identifier, plan);
  
  return new Response(JSON.stringify({
    plan: plan || 'free',
    used: usage.used,
    limit: usage.limit,
    remaining: usage.limit - usage.used
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUsageConsume(request) {
  const { identifier, amount = 1, plan = 'free' } = await request.json();
  const result = await consumeUsage(identifier, amount, plan);
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCheckout(request) {
  const { plan, priceId } = await request.json();
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: plan === 'lifetime' ? 'payment' : 'subscription',
    success_url: `https://webspind.com/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: 'https://webspind.com/pricing',
    metadata: {
      plan: plan
    }
  });
  
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLookup(request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  
  if (!sessionId) {
    return new Response('Missing session_id', { status: 400 });
  }
  
  // Retrieve Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status === 'paid') {
    // Create license
    const license = await createLicense(session.metadata.plan, 'stripe');
    
    // Store session to license mapping (24h TTL)
    await SESSION_STORE.put(`session:${sessionId}`, license.key, { expirationTtl: 86400 });
    
    return new Response(JSON.stringify({ license: license.key }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Payment not completed', { status: 400 });
}

async function handleActivate(request) {
  const { licenseKey } = await request.json();
  
  if (!licenseKey) {
    return new Response('Missing license key', { status: 400 });
  }
  
  const license = await getLicense(licenseKey);
  
  if (!license) {
    return new Response('Invalid license key', { status: 404 });
  }
  
  if (license.status !== 'active') {
    return new Response('License is not active', { status: 400 });
  }
  
  return new Response(JSON.stringify({ 
    valid: true, 
    plan: license.plan,
    limits: license.limits 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleWebhook(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Invalid signature', { status: 400 });
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        const license = await createLicense(session.metadata.plan, 'stripe');
        await SESSION_STORE.put(`session:${session.id}`, license.key, { expirationTtl: 86400 });
      }
      break;
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update license status based on subscription
      // Implementation depends on your subscription management needs
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

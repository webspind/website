const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');
const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({error: 'Webhook handler failed'});
  }
});

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  const identifier = subscription.metadata.webspind_identifier;
  const plan = subscription.metadata.plan;
  
  if (identifier) {
    // Update user plan to pro
    await db.updateUserPlan(identifier, 'pro');
    
    // Reset credits to pro level
    await db.resetDailyCredits(identifier, 300);
    
    // Store subscription
    await db.createSubscription(
      identifier,
      subscription.id,
      plan,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    );
    
    console.log(`Subscription created for user ${identifier}`);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  const identifier = subscription.metadata.webspind_identifier;
  
  if (identifier) {
    // Update subscription status
    await db.updateSubscriptionStatus(subscription.id, subscription.status);
    
    // If subscription is active, ensure user has pro plan
    if (subscription.status === 'active') {
      await db.updateUserPlan(identifier, 'pro');
      await db.resetDailyCredits(identifier, 300);
    }
    
    console.log(`Subscription updated for user ${identifier}: ${subscription.status}`);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  const identifier = subscription.metadata.webspind_identifier;
  
  if (identifier) {
    // Update subscription status
    await db.updateSubscriptionStatus(subscription.id, 'canceled');
    
    // Downgrade user to free plan
    await db.updateUserPlan(identifier, 'free');
    
    // Reset to free credits (3 per day)
    await db.resetDailyCredits(identifier, 3);
    
    console.log(`Subscription canceled for user ${identifier}`);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const identifier = subscription.metadata.webspind_identifier;
  
  if (identifier) {
    // Log the payment
    await db.logTransaction(
      identifier,
      'purchase',
      invoice.amount_paid,
      `Monthly payment for ${subscription.metadata.plan}`,
      invoice.id
    );
    
    // Ensure user has pro plan and credits
    await db.updateUserPlan(identifier, 'pro');
    await db.resetDailyCredits(identifier, 300);
    
    console.log(`Payment succeeded for user ${identifier}: ${invoice.amount_paid} cents`);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const identifier = subscription.metadata.webspind_identifier;
  
  if (identifier) {
    console.log(`Payment failed for user ${identifier}`);
    // You might want to send an email notification here
    // or implement a grace period before downgrading
  }
}

module.exports = router;

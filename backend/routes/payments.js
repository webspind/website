const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');
const router = express.Router();

// Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { identifier, plan = 'pro_monthly', success_url, cancel_url } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    // Get or create user
    let user = await db.getUserByIdentifier(identifier);
    if (!user) {
      await db.createUser(identifier);
      user = await db.getUserByIdentifier(identifier);
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          webspind_identifier: identifier
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      await db.updateUserPlan(identifier, 'free'); // Will be updated to pro after payment
    }

    // Define pricing
    const prices = {
      pro_monthly: {
        amount: process.env.PRO_MONTHLY_PRICE || 699, // €6.99
        currency: 'eur',
        interval: 'month',
        product_name: 'Webspind Pro Monthly'
      },
      pro_yearly: {
        amount: process.env.PRO_YEARLY_PRICE || 6999, // €69.99
        currency: 'eur',
        interval: 'year',
        product_name: 'Webspind Pro Yearly'
      }
    };

    const selectedPlan = prices[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: selectedPlan.currency,
            product_data: {
              name: selectedPlan.product_name,
              description: 'Unlimited access to all Webspind tools with 300 credits per day',
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${process.env.FRONTEND_URL}/tools/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL}/pricing.html`,
      metadata: {
        webspind_identifier: identifier,
        plan: plan
      },
      subscription_data: {
        metadata: {
          webspind_identifier: identifier,
          plan: plan
        }
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful payment
router.get('/purchase', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const identifier = session.metadata.webspind_identifier;
    const plan = session.metadata.plan;

    // Update user plan to pro
    await db.updateUserPlan(identifier, 'pro');
    
    // Reset credits to pro level (300)
    await db.resetDailyCredits(identifier, 300);
    
    // Log the purchase
    await db.logTransaction(
      identifier, 
      'purchase', 
      plan === 'pro_monthly' ? 699 : 6999, 
      `Upgraded to ${plan}`,
      session_id
    );

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Store subscription in database
    await db.createSubscription(
      identifier,
      subscription.id,
      plan,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    );

    res.json({
      success: true,
      message: 'Payment processed successfully',
      plan: plan,
      credits: 300
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Get user's subscription status
router.get('/subscription/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const subscription = await db.getSubscription(identifier);
    
    if (!subscription) {
      return res.json({
        hasSubscription: false,
        plan: 'free'
      });
    }

    res.json({
      hasSubscription: true,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
    });

  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Cancel subscription
router.post('/cancel/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const subscription = await db.getSubscription(identifier);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update subscription status in database
    await db.updateSubscriptionStatus(subscription.stripe_subscription_id, 'canceled');

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;

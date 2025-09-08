const express = require('express');
const db = require('../database');
const router = express.Router();

// Get user's credit balance
router.post('/balance', async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    // Get or create user
    let user = await db.getUserByIdentifier(identifier);
    if (!user) {
      await db.createUser(identifier);
      user = await db.getUserByIdentifier(identifier);
    }

    // Get or create credits record
    let credits = await db.getCredits(identifier);
    if (!credits) {
      await db.createCreditsRecord(identifier);
      credits = await db.getCredits(identifier);
    }

    // Check if daily reset is needed
    const today = new Date().toISOString().split('T')[0];
    const lastReset = credits.last_reset_date;
    
    if (lastReset !== today) {
      // Reset daily credits
      const isPro = user.plan === 'pro';
      const newCredits = isPro ? 300 : 3; // Pro gets 300, free gets 3
      
      await db.resetDailyCredits(identifier, newCredits);
      await db.logTransaction(identifier, 'reset', newCredits, 'Daily credit reset');
      
      // Update credits object
      credits.credits = newCredits;
      credits.free_credits_used = 0;
      credits.last_reset_date = today;
    }

    res.json({
      credits: credits.credits,
      freeCreditsUsed: credits.free_credits_used,
      plan: user.plan,
      lastReset: credits.last_reset_date
    });

  } catch (error) {
    console.error('Error getting credit balance:', error);
    res.status(500).json({ error: 'Failed to get credit balance' });
  }
});

// Consume credits for an action
router.post('/consume', async (req, res) => {
  try {
    const { identifier, amount = 1 } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    // Get user and credits
    const user = await db.getUserByIdentifier(identifier);
    const credits = await db.getCredits(identifier);
    
    if (!user || !credits) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough credits
    if (credits.credits < amount) {
      return res.json({
        allowed: false,
        credits: credits.credits,
        freeCreditsUsed: credits.free_credits_used,
        message: 'Insufficient credits'
      });
    }

    // Consume credits
    const newCredits = credits.credits - amount;
    const newFreeCreditsUsed = user.plan === 'free' ? 
      Math.min(credits.free_credits_used + amount, 3) : 
      credits.free_credits_used;

    await db.updateCredits(identifier, newCredits, newFreeCreditsUsed);
    await db.logTransaction(identifier, 'consume', amount, `Consumed ${amount} credit(s) for tool usage`);

    res.json({
      allowed: true,
      credits: newCredits,
      freeCreditsUsed: newFreeCreditsUsed,
      message: 'Credits consumed successfully'
    });

  } catch (error) {
    console.error('Error consuming credits:', error);
    res.status(500).json({ error: 'Failed to consume credits' });
  }
});

// Get user's transaction history
router.get('/history/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // This would need a new method in database.js
    // For now, return a simple response
    res.json({
      transactions: [],
      message: 'Transaction history endpoint - to be implemented'
    });

  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
});

// Get analytics (admin endpoint)
router.get('/analytics', async (req, res) => {
  try {
    const totalRevenue = await db.getTotalRevenue();
    const activeUsers = await db.getActiveUsers();

    res.json({
      totalRevenue,
      activeUsers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;

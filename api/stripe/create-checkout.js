const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const { priceId } = req.body || {};
    if (!priceId) {
      res.status(400).json({ error: 'missing_priceId' });
      return;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/index.html#pricing`,
    }, { idempotencyKey: `co_${priceId}_${Date.now()}` });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout error', err);
    res.status(500).json({ error: 'server_error' });
  }
};



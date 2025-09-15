const Stripe = require('stripe');
const jwt = require('jsonwebtoken');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

function priceToCredits(price) {
  const meta = (price && price.metadata) || {};
  if (meta.credits) return Number(meta.credits);
  const map = {
    [process.env.STRIPE_PRICE_10 || '']: 10,
    [process.env.STRIPE_PRICE_40 || '']: 40,
    [process.env.STRIPE_PRICE_120 || '']: 120,
    [process.env.STRIPE_PRICE_400 || '']: 400,
    [process.env.STRIPE_PRICE_1200 || '']: 1200,
  };
  return map[price?.id] || 0;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const sid = req.query.session_id;
    if (!sid) {
      res.status(400).json({ error: 'missing_session_id' });
      return;
    }
    const session = await stripe.checkout.sessions.retrieve(sid, {
      expand: ['line_items.data.price'],
    });
    if (session.payment_status !== 'paid') {
      res.status(402).json({ error: 'not_paid' });
      return;
    }
    const item = session.line_items?.data?.[0];
    const price = item?.price;
    const credits = priceToCredits(price);
    if (!credits) {
      res.status(500).json({ error: 'credits_not_found' });
      return;
    }
    const aud = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//,'') || 'localhost';
    const token = jwt.sign({ tier: 'pro', credits, aud }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1d' });
    res.status(200).json({ token, credits });
  } catch (err) {
    console.error('confirm error', err);
    res.status(500).json({ error: 'server_error' });
  }
};



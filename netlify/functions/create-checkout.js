const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }
  try {
    const { priceId } = JSON.parse(event.body||'{}');
    if(!priceId) return { statusCode: 400, body: JSON.stringify({ error: 'missing_priceId' }) };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${event.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing.html`,
    }, { idempotencyKey: `co_${priceId}_${Date.now()}` });
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) };
  }
};



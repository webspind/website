const Stripe = require('stripe');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }
  try {
    const params = new URLSearchParams(event.rawQuery || event.queryStringParameters);
    const sid = params.get ? params.get('session_id') : (event.queryStringParameters && event.queryStringParameters.session_id);
    if(!sid) return { statusCode: 400, body: JSON.stringify({ error: 'missing_session_id' }) };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const session = await stripe.checkout.sessions.retrieve(sid, { expand: ['line_items.data.price'] });
    if(session.payment_status !== 'paid') return { statusCode: 402, body: JSON.stringify({ error: 'not_paid' }) };
    const item = session.line_items && session.line_items.data && session.line_items.data[0];
    const price = item && item.price;
    const credits = Number(price && price.metadata && price.metadata.credits) ||
      Number(process.env[`STRIPE_PRICE_MAP_${price && price.id}`] || 0);
    if(!credits) return { statusCode: 500, body: JSON.stringify({ error: 'credits_not_found' }) };
    const aud = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//,'') || 'localhost';
    const token = jwt.sign({ tier:'pro', credits, aud }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1d' });
    return { statusCode: 200, body: JSON.stringify({ token, credits }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) };
  }
};



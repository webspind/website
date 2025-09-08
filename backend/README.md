# Webspind Backend - Credit System & Payments

A complete backend system for managing user credits, subscriptions, and payments for Webspind tools.

## Features

- ✅ **User Management** - Device-based and user-based identification
- ✅ **Credit System** - Daily credit limits and consumption tracking
- ✅ **Stripe Integration** - Secure payment processing
- ✅ **Subscription Management** - Monthly/yearly Pro subscriptions
- ✅ **Webhook Handling** - Real-time payment and subscription updates
- ✅ **Analytics** - Revenue and user tracking
- ✅ **SQLite Database** - Lightweight, file-based storage

## Quick Start

### 1. Setup

```bash
# Clone and navigate to backend directory
cd backend

# Run setup script
node setup.js

# Install dependencies
npm install
```

### 2. Configuration

Edit the `.env` file with your configuration:

```env
# Stripe Configuration (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server Configuration
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Security
JWT_SECRET=your_super_secret_key_here
```

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Credits
- `POST /api/credits/balance` - Get user's credit balance
- `POST /api/credits/consume` - Consume credits for actions
- `GET /api/credits/history/:identifier` - Get transaction history
- `GET /api/credits/analytics` - Get revenue analytics

### Payments
- `POST /api/payments/checkout` - Create Stripe checkout session
- `GET /api/payments/purchase?session_id=xxx` - Handle successful payment
- `GET /api/payments/subscription/:identifier` - Get subscription status
- `POST /api/payments/cancel/:identifier` - Cancel subscription

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook endpoint

## Stripe Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account and get API keys
3. Add keys to `.env` file

### 2. Configure Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env`

### 3. Test Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Frontend Integration

Update your `js/freemium.js`:

```javascript
// Change this line:
this.apiBase = 'https://api.webspind.com';

// To your backend URL:
this.apiBase = 'https://yourdomain.com/api';
```

## Database Schema

### Users Table
- `id` - Primary key
- `device_id` - Device identifier
- `user_id` - User identifier (optional)
- `email` - User email (optional)
- `stripe_customer_id` - Stripe customer ID
- `plan` - User plan (free/pro)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Credits Table
- `id` - Primary key
- `user_identifier` - User identifier
- `credits` - Current credit balance
- `free_credits_used` - Free credits used today
- `last_reset_date` - Last daily reset date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Transactions Table
- `id` - Primary key
- `user_identifier` - User identifier
- `type` - Transaction type (purchase/consume/reset)
- `amount` - Amount (credits or cents)
- `description` - Transaction description
- `stripe_session_id` - Stripe session ID (if applicable)
- `created_at` - Creation timestamp

### Subscriptions Table
- `id` - Primary key
- `user_identifier` - User identifier
- `stripe_subscription_id` - Stripe subscription ID
- `plan` - Subscription plan
- `status` - Subscription status
- `current_period_start` - Current period start
- `current_period_end` - Current period end
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Deployment

### Option 1: VPS/Server
```bash
# Install Node.js and PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name webspind-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Option 3: Heroku
```bash
# Install Heroku CLI
heroku create webspind-backend

# Add environment variables
heroku config:set STRIPE_SECRET_KEY=sk_...

# Deploy
git push heroku main
```

## Monitoring

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### Analytics
```bash
curl https://yourdomain.com/api/credits/analytics
```

## Security

- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection protection
- ✅ Stripe webhook signature verification

## Support

For issues or questions:
1. Check the logs: `pm2 logs webspind-backend`
2. Verify Stripe webhook configuration
3. Check database connectivity
4. Review environment variables

## License

MIT License - see LICENSE file for details.

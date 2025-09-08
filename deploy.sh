#!/bin/bash

# Webspind Backend Deployment Script
# This script helps deploy the backend to various platforms

echo "🚀 Webspind Backend Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    cd backend
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Please install it first:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
    
    # Login to Railway
    railway login
    
    # Create new project
    railway init
    
    # Add environment variables
    echo "📝 Please add your environment variables in Railway dashboard:"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_PUBLISHABLE_KEY" 
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo "   - JWT_SECRET"
    echo "   - FRONTEND_URL"
    
    # Deploy
    railway up
    
    echo "✅ Deployment to Railway complete!"
    echo "🔗 Your backend URL will be shown in Railway dashboard"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "🟣 Deploying to Heroku..."
    
    cd backend
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install it first:"
        echo "   https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Create Heroku app
    read -p "Enter your Heroku app name: " app_name
    heroku create $app_name
    
    # Add environment variables
    echo "📝 Adding environment variables..."
    read -p "Enter your Stripe Secret Key: " stripe_secret
    read -p "Enter your Stripe Publishable Key: " stripe_publishable
    read -p "Enter your Stripe Webhook Secret: " stripe_webhook
    read -p "Enter your JWT Secret: " jwt_secret
    read -p "Enter your Frontend URL: " frontend_url
    
    heroku config:set STRIPE_SECRET_KEY=$stripe_secret
    heroku config:set STRIPE_PUBLISHABLE_KEY=$stripe_publishable
    heroku config:set STRIPE_WEBHOOK_SECRET=$stripe_webhook
    heroku config:set JWT_SECRET=$jwt_secret
    heroku config:set FRONTEND_URL=$frontend_url
    heroku config:set NODE_ENV=production
    
    # Deploy
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    
    echo "✅ Deployment to Heroku complete!"
    echo "🔗 Your backend URL: https://$app_name.herokuapp.com"
}

# Function to deploy to VPS
deploy_vps() {
    echo "🖥️  Deploying to VPS..."
    
    read -p "Enter your VPS IP address: " vps_ip
    read -p "Enter your VPS username: " vps_user
    
    echo "📝 Please run these commands on your VPS:"
    echo ""
    echo "1. Install Node.js and PM2:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo "   sudo npm install -g pm2"
    echo ""
    echo "2. Clone your repository:"
    echo "   git clone https://github.com/yourusername/webspind.git"
    echo "   cd webspind/backend"
    echo ""
    echo "3. Install dependencies:"
    echo "   npm install"
    echo ""
    echo "4. Create .env file with your configuration"
    echo ""
    echo "5. Start with PM2:"
    echo "   pm2 start server.js --name webspind-backend"
    echo "   pm2 save"
    echo "   pm2 startup"
    echo ""
    echo "6. Configure Nginx (optional):"
    echo "   sudo nano /etc/nginx/sites-available/webspind"
    echo ""
    echo "7. Update frontend API URL in js/freemium.js"
}

# Main menu
echo ""
echo "Select deployment option:"
echo "1) Railway (Recommended - Easy)"
echo "2) Heroku (Popular)"
echo "3) VPS/Server (Custom)"
echo "4) Local Development Setup"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_heroku
        ;;
    3)
        deploy_vps
        ;;
    4)
        echo "🛠️  Setting up local development..."
        cd backend
        node setup.js
        echo "✅ Local setup complete!"
        echo "📝 Next steps:"
        echo "   1. Edit .env file with your configuration"
        echo "   2. Run: npm install"
        echo "   3. Run: npm start"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Stripe webhooks pointing to your backend"
echo "2. Update js/freemium.js with your backend URL"
echo "3. Test the payment flow"
echo "4. Monitor logs and analytics"
echo ""
echo "🔗 Useful links:"
echo "- Stripe Dashboard: https://dashboard.stripe.com"
echo "- Railway Dashboard: https://railway.app"
echo "- Heroku Dashboard: https://dashboard.heroku.com"

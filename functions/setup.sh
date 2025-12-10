#!/bin/bash
# Email Notifications Setup Script
# Copy and paste these commands in order to set up email notifications

echo "=========================================="
echo "Navis Email Notifications Setup"
echo "=========================================="
echo ""

# Step 1: Install Firebase CLI
echo "Step 1: Installing Firebase CLI..."
npm install -g firebase-tools
firebase login

echo ""
echo "=========================================="
echo "⚠️  IMPORTANT - Before continuing:"
echo "=========================================="
echo "1. Get these from your hosting provider:"
echo "   - Mail server hostname (e.g., mail.yourdomain.com)"
echo "   - SMTP port (587 for TLS, 465 for SSL)"
echo "   - Email account (e.g., noreply@yourdomain.com)"
echo "   - Password or app-specific password"
echo ""
echo "2. Have ready:"
echo "   - Your application URL (e.g., https://navis.yourdomain.com)"
echo "   - A secure random token for admin operations"
echo ""
read -p "Press Enter when ready..."

echo ""
echo "Step 2: Configure Firebase Functions"
echo "=========================================="
echo ""
echo "These commands will store your mail server credentials securely in Firebase."
echo "You'll be prompted for each value."
echo ""

# Prompt for configuration values
echo ""
echo "CPANEL USERS: Use these default settings:"
echo "  Host: mail.yourdomain.com"
echo "  Port: 587"
echo "  Secure: false"
echo ""

read -p "Enter mail server host (e.g., mail.yourdomain.com): " MAIL_HOST
read -p "Enter mail server port (587 or 465): " MAIL_PORT
read -p "Enter mail server username (e.g., noreply@yourdomain.com): " MAIL_USER
read -sp "Enter mail server password: " MAIL_PASSWORD
echo ""
read -p "Enter from address (usually same as username): " MAIL_FROM
read -p "Use SSL? (true for 465, false for 587): " MAIL_SECURE
read -p "Enter application URL (e.g., https://navis.yourdomain.com): " APP_URL
read -sp "Enter admin token (paste a random secure token): " ADMIN_TOKEN
echo ""

# Configure Firebase
echo ""
echo "Setting Firebase configuration..."

firebase functions:config:set \
  mail.host="$MAIL_HOST" \
  mail.port="$MAIL_PORT" \
  mail.user="$MAIL_USER" \
  mail.password="$MAIL_PASSWORD" \
  mail.from="$MAIL_FROM" \
  mail.secure="$MAIL_SECURE" \
  app.url="$APP_URL" \
  admin.token="$ADMIN_TOKEN"

echo "✅ Configuration saved!"
echo ""

# Step 3: Verify configuration
echo "Step 3: Verifying configuration..."
firebase functions:config:get

echo ""
echo "=========================================="
echo "Step 4: Navigate to functions directory"
echo "=========================================="
cd "$(dirname "$0")/functions" || exit
echo "Current directory: $(pwd)"

echo ""
echo "=========================================="
echo "Step 5: Installing Dependencies"
echo "=========================================="
npm install
npm run build

echo ""
echo "=========================================="
echo "Step 6: Deploying to Firebase"
echo "=========================================="
firebase deploy --only functions

echo ""
echo "Returning to project root..."
cd -

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Create a new user account to test welcome email"
echo "2. Check email inbox (may take 1-2 minutes)"
echo "3. Check Firebase logs: firebase functions:log"
echo "4. Update Firestore collections with email fields"
echo "5. Test delivery status updates"
echo ""
echo "For more details, see:"
echo "- EMAIL_QUICK_START.md"
echo "- DEPLOYMENT_GUIDE_EMAIL.md"
echo "- INTEGRATION_EXAMPLES.md"
echo ""
echo "Monitor logs with: firebase functions:log"
echo "View config with: firebase functions:config:get"

# Email Notifications Deployment Guide for Navis

Complete step-by-step guide to deploy email notifications using Firebase Cloud Functions and your domain's mail server.

## Overview

This setup uses:
- **Frontend**: Vercel (already deployed)
- **Database**: Firebase Firestore
- **Email Backend**: Firebase Cloud Functions
- **Mail Server**: Your domain's email server

No additional server infrastructure needed!

## Prerequisites Checklist

- [ ] Firebase project set up (with Firestore)
- [ ] Node.js 18+ installed locally
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Domain email server credentials:
  - [ ] Mail server hostname (e.g., mail.yourdomain.com)
  - [ ] Mail server port (587 or 465)
  - [ ] Email account (noreply@yourdomain.com)
  - [ ] Email account password or app-specific password
- [ ] Git repository access

## Step 1: Prepare Your Domain Email Account

Contact your hosting provider to:
1. Create an email account: `noreply@yourdomain.com`
2. Get SMTP credentials:
   - **Host**: mail.yourdomain.com (or equivalent)
   - **Port**: 587 (TLS) or 465 (SSL)
   - **Username**: noreply@yourdomain.com
   - **Password**: [provided by hosting]

### Example Mail Server Hosts
- **cPanel/Plesk**: mail.yourdomain.com or smtp.yourdomain.com
- **Google Workspace**: smtp.gmail.com (port 587)
- **Office 365**: smtp.office365.com (port 587)
- **Custom**: Ask your hosting provider

## Step 2: Set Up Local Development

```bash
# Clone/navigate to your project
cd navis

# Install dependencies
npm install

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

## Step 3: Install Functions Dependencies

```bash
cd functions
npm install
npm run build
```

## Step 4: Configure Email Settings in Firebase

```bash
# From the project root (not in functions folder)

# Set mail server configuration
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="your-email-password" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false"

# Set application URL
firebase functions:config:set app.url="https://navis.yourdomain.com"

# Set admin token (generate random secure string)
firebase functions:config:set admin.token="your-random-secure-token-here"
```

### Example for Common Hosts

#### **cPanel/Plesk with TLS (Port 587)**
```bash
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="password123" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false"
```

#### **cPanel/Plesk with SSL (Port 465)**
```bash
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="465" \
  mail.user="noreply@yourdomain.com" \
  mail.password="password123" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="true"
```

#### **Google Workspace**
```bash
firebase functions:config:set \
  mail.host="smtp.gmail.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="your-app-password" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false"
```

## Step 5: Verify Configuration

```bash
# View all configured values
firebase functions:config:get

# You should see output like:
# {
#   "mail": {
#     "host": "mail.yourdomain.com",
#     "port": "587",
#     "user": "noreply@yourdomain.com",
#     "password": "***",
#     "from": "noreply@yourdomain.com",
#     "secure": "false"
#   },
#   "app": {
#     "url": "https://navis.yourdomain.com"
#   },
#   "admin": {
#     "token": "***"
#   }
# }
```

## Step 6: Test Locally (Optional)

```bash
# Create .runtimeconfig.json for local testing
cat > functions/.runtimeconfig.json << EOF
{
  "mail": {
    "host": "mail.yourdomain.com",
    "port": "587",
    "user": "noreply@yourdomain.com",
    "password": "your-password",
    "from": "noreply@yourdomain.com",
    "secure": "false"
  },
  "app": {
    "url": "http://localhost:3000"
  },
  "admin": {
    "token": "dev-token"
  }
}
EOF

# Start local emulator
npm run serve

# In another terminal, test by creating a user in Firestore

# Check logs
firebase functions:log
```

**Important**: Add `.runtimeconfig.json` to `.gitignore`

## Step 7: Deploy to Production

```bash
# Build functions
cd functions
npm run build
cd ..

# Deploy to Firebase
firebase deploy --only functions

# Check deployment status
firebase functions:log
```

## Step 8: Update Firestore Data Model

Ensure your Firestore collections have the required email fields:

### Users Collection
Each user document should have:
```json
{
  "uid": "firebase_uid",
  "username": "John Doe",
  "email": "john@example.com",
  "company": "CompanyName",
  "accountType": "cargo-mover",
  "imageUrl": "..."
}
```

### Deliveries Collection
Each delivery should have:
```json
{
  "id": "delivery_id",
  "name": "Shipment Name",
  "status": "pending",
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "acceptedBy": "transporter",
  "driverName": "Driver Name",
  "driverPhone": "+256123456789",
  "estimatedDeliveryTime": "2025-12-10 14:30",
  "pickupPoint": "Location A",
  "destination": "Location B"
}
```

### Drivers Collection
Each driver should have:
```json
{
  "uid": "driver_uid",
  "name": "Driver Name",
  "email": "driver@example.com",
  "phoneNumber": "+256123456789",
  "company": "CompanyName",
  "password": "hashed_password"
}
```

## Step 9: Update Firestore Security Rules

Add rules to allow Cloud Functions to read/write necessary data:

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Cloud Functions can read all deliveries and users
    // (for sending emails)
    match /{document=**} {
      allow read, write: if request.auth.token.firebase.email.endsWith('@navis-system');
    }

    // Default: allow reads, restrict writes
    match /{document=**} {
      allow read: if true;
    }
  }
}
```

## Step 10: Integrate with Frontend

### Add Email Service to Frontend

1. The service file is already created at `src/services/emailNotificationService.ts`

2. Use it in your components:

```typescript
import { emailNotificationService } from '../services/emailNotificationService';

// In your registration component, after successful signup:
await emailNotificationService.sendPasswordReset(
  userEmail,
  `https://navis.yourdomain.com/reset-password?token=${resetToken}`,
  '24 hours'
);

// When assigning a delivery to a driver:
await emailNotificationService.sendDriverAssignment(
  driverEmail,
  driverName,
  deliveryId,
  pickupLocation,
  deliveryLocation,
  estimatedKm,
  estimatedEarnings
);
```

### Update Environment Variables

Add to your `.env` file:

```
REACT_APP_URL=https://navis.yourdomain.com
REACT_APP_SEND_CUSTOM_EMAIL_URL=https://region-projectid.cloudfunctions.net/sendCustomEmail
```

## Step 11: Test Email Delivery

### Test 1: Welcome Email
1. Create a new user account
2. Wait 1-2 minutes
3. Check if welcome email arrives

### Test 2: Delivery Status Email
1. Create a delivery with status "pending"
2. Update status to "assigned"
3. Check email inbox

### Test 3: Manual Email (from code)
```javascript
import { emailNotificationService } from './services/emailNotificationService';

// Test password reset
await emailNotificationService.sendPasswordReset(
  'test@example.com',
  'https://navis.yourdomain.com/reset-password?token=123',
  '24 hours'
);
```

### Troubleshooting Delivery Issues

**Check Cloud Function Logs:**
```bash
firebase functions:log
```

**Look for error messages related to:**
- SMTP connection
- Authentication failure
- Email validation
- Rate limiting

## Step 12: Monitor and Maintain

### Regular Monitoring

```bash
# Check function logs regularly
firebase functions:log

# Monitor function performance
firebase functions:describe sendWelcomeEmail
firebase functions:describe sendDeliveryStatusEmail
```

### Update Email Templates

If you need to customize email templates:

1. Edit `functions/src/emailTemplates.ts`
2. Rebuild and redeploy:
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Common Issues & Solutions

### Issue: "Cannot find module 'firebase-admin'"
```bash
cd functions
npm install firebase-admin firebase-functions
npm run build
```

### Issue: SMTP Connection Failed
- Verify mail server hostname
- Try different port (587 vs 465)
- Check firewall allows outbound SMTP
- Verify username/password

### Issue: "No such file or directory .runtimeconfig.json"
- Run `firebase functions:config:get` to set config
- Or create `.runtimeconfig.json` for local development

### Issue: Emails Going to Spam
- Check SPF/DKIM records on your domain
- Use proper "From" header
- Add unsubscribe links to templates
- Monitor bounce rates

## Production Checklist

- [ ] All environment variables configured in Firebase
- [ ] Email credentials securely stored (not in code)
- [ ] Firestore collections have required fields
- [ ] Firestore security rules updated
- [ ] Frontend email service integrated
- [ ] Environment variables set in Vercel
- [ ] Test all email flows (welcome, status updates, password reset)
- [ ] Check email delivery logs
- [ ] Set up monitoring/alerts
- [ ] Document any custom templates

## Next Steps

1. **Add More Email Templates**: Extend `emailTemplates.ts`
2. **Implement Email Queue**: For better reliability
3. **Add Analytics**: Track email open rates
4. **Set Up Retry Logic**: Handle failed deliveries
5. **Add Email Unsubscribe**: Implement preferences

## Support

For issues, check:
- Firebase Functions logs: `firebase functions:log`
- Firebase Console → Cloud Functions
- Email provider documentation
- Firebase documentation: https://firebase.google.com/docs/functions

---

**Created**: December 2025
**Status**: Ready for Production

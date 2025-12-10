# Firebase Cloud Functions Setup for Navis Email Notifications

This guide explains how to set up email notifications using Firebase Cloud Functions with your domain's mail server.

## Architecture Overview

```
Vercel (Frontend)
    ↓
Firebase (Database + Auth + Cloud Functions)
    ↓
Your Domain Mail Server
    ↓
Customer/Driver Email
```

## Prerequisites

- Firebase project (already set up)
- Firebase CLI installed locally
- Domain email server credentials
- Node.js 18+

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Initialize Firebase Functions

```bash
cd navis/functions
npm install
```

## Step 3: Configure Environment Variables

### Option A: Using Firebase Functions Config

```bash
firebase functions:config:set mail.host="mail.yourdomain.com"
firebase functions:config:set mail.port="587"
firebase functions:config:set mail.user="noreply@yourdomain.com"
firebase functions:config:set mail.password="your-email-password"
firebase functions:config:set mail.from="noreply@yourdomain.com"
firebase functions:config:set mail.secure="false"
firebase functions:config:set app.url="https://navis.yourdomain.com"
firebase functions:config:set admin.token="your-secure-admin-token"
```

### Option B: Using .runtimeconfig.json (Local Development)

Create `functions/.runtimeconfig.json`:

```json
{
  "mail": {
    "host": "mail.yourdomain.com",
    "port": "587",
    "user": "noreply@yourdomain.com",
    "password": "your-email-password",
    "from": "noreply@yourdomain.com",
    "secure": false
  },
  "app": {
    "url": "https://navis.yourdomain.com"
  },
  "admin": {
    "token": "your-secure-admin-token"
  }
}
```

## Step 4: Email Server Configuration

### Common Email Server Ports
- **587**: TLS (unencrypted connection, upgraded to TLS after STARTTLS)
- **465**: SSL/TLS (encrypted from the start)
- **25**: SMTP (not recommended, often blocked)

### For cPanel/Plesk Hosting:
- Host: `mail.yourdomain.com`
- Port: `587` (TLS) or `465` (SSL)
- Username: `noreply@yourdomain.com`
- Password: Your email account password
- Secure: Check if using port 465

### For Custom Mail Servers:
Contact your hosting provider for:
- SMTP Host
- SMTP Port
- Username/Password
- SSL/TLS requirement

## Step 5: Deploy Cloud Functions

### Test Locally
```bash
cd functions
npm run build
npm run serve
```

### Deploy to Firebase
```bash
firebase deploy --only functions
```

### View Logs
```bash
firebase functions:log
```

## Step 6: Frontend Integration

### Update Frontend Configuration

1. **Install Firebase Functions SDK** (if not already installed):
```bash
npm install firebase-functions
```

2. **Create a notification service** in your frontend (`src/services/emailNotificationService.ts`):

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../contexts/firebaseContext';

export const emailNotificationService = {
  // Send password reset email
  async sendPasswordReset(email: string, resetLink: string, expiryTime: string = '24 hours') {
    const sendPasswordResetEmail = httpsCallable(functions, 'sendPasswordResetEmail');
    return await sendPasswordResetEmail({ email, resetLink, expiryTime });
  },

  // Send driver assignment notification
  async sendDriverAssignment(
    driverEmail: string,
    driverName: string,
    deliveryId: string,
    pickupLocation: string,
    deliveryLocation: string,
    estimatedKm: number,
    estimatedEarnings: string
  ) {
    const sendDriverAssignmentEmail = httpsCallable(functions, 'sendDriverAssignmentEmail');
    return await sendDriverAssignmentEmail({
      driverEmail,
      driverName,
      deliveryId,
      pickupLocation,
      deliveryLocation,
      estimatedKm,
      estimatedEarnings,
    });
  },

  // Send custom email (admin only)
  async sendCustomEmail(to: string, subject: string, htmlContent: string, adminToken: string) {
    const response = await fetch(
      'https://region-project.cloudfunctions.net/sendCustomEmail',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ to, subject, htmlContent }),
      }
    );
    return response.json();
  },
};
```

## Step 7: Update Firestore Data Model

Ensure your collections include email fields:

### Users Collection
```
{
  uid: "...",
  username: "John Doe",
  email: "john@example.com",  // Required for notifications
  company: "...",
  accountType: "cargo-mover|track-owner|driver",
  ...
}
```

### Deliveries Collection
```
{
  id: "...",
  name: "Shipment Name",
  status: "pending|assigned|in_transit|delivered|cancelled",
  customerEmail: "customer@example.com",  // Required
  customerName: "Customer Name",
  acceptedBy: "transporter company",
  driverName: "Driver Name",
  driverPhone: "Driver Phone",
  estimatedDeliveryTime: "2025-12-10 14:30",
  completedAt: "2025-12-10 14:45",
  ...
}
```

### Drivers Collection
```
{
  uid: "...",
  name: "Driver Name",
  email: "driver@example.com",  // Required for notifications
  phoneNumber: "...",
  company: "...",
  ...
}
```

## Step 8: Test the Email Service

### Test Welcome Email (Create a User)
1. Create a new user in Firebase Auth
2. Add corresponding user doc to Firestore `users` collection
3. Check email (may take 1-2 minutes)

### Test Delivery Status Email
1. Create a delivery with status "pending"
2. Update the status to "assigned"
3. Check email

### Test Password Reset Email
```javascript
// From frontend
import { emailNotificationService } from './services/emailNotificationService';

await emailNotificationService.sendPasswordReset(
  'user@example.com',
  'https://navis.yourdomain.com/reset-password?token=xyz',
  '24 hours'
);
```

## Troubleshooting

### Emails Not Sending

1. **Check Functions Logs:**
```bash
firebase functions:log
```

2. **Verify Email Configuration:**
- Test SMTP connection to mail server
- Verify credentials in Firebase config
- Check email server firewall rules

3. **Common Issues:**
- Wrong port (use 587 for TLS, 465 for SSL)
- Incorrect credentials
- Firewall blocking SMTP
- Email server rate limiting

### Rate Limiting

Add this to handle rate limiting:

```typescript
// In emailService.ts - add retry logic
async function sendEmailWithRetry(to: string, subject: string, html: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await sendEmail(to, subject, html);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
    }
  }
}
```

## Security Considerations

1. **Never commit credentials** to git
2. **Use Firebase secrets** for sensitive data
3. **Validate email addresses** before sending
4. **Rate limit** email sending per user
5. **Monitor email logs** for suspicious activity

## Next Steps

1. Deploy functions to production
2. Update Firebase Firestore security rules
3. Set up email templates for your branding
4. Monitor email delivery metrics
5. Test all notification flows

## References

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)

# Email Notifications - Quick Start Guide

## Your Setup
- **Frontend**: Vercel ✓
- **Database**: Firebase Firestore ✓
- **Email Backend**: Firebase Cloud Functions (NEW)
- **Mail Server**: Your domain's email server

## What's Been Created

```
navis/
├── functions/                          # Firebase Cloud Functions (NEW)
│   ├── src/
│   │   ├── index.ts                   # Main function handlers
│   │   ├── emailService.ts            # Email sending logic
│   │   └── emailTemplates.ts          # Email HTML templates
│   ├── tsconfig.json
│   ├── package.json
│   ├── SETUP_GUIDE.md
│   ├── CONFIG.md
│   └── .runtimeconfig.json            # (Create locally, don't commit)
├── src/services/
│   └── emailNotificationService.ts    # Frontend integration service
├── DEPLOYMENT_GUIDE_EMAIL.md          # Complete deployment steps
├── .env.example                       # Environment variables template
└── .gitignore                         # Updated to exclude secrets
```

## Quick Setup (5 Steps)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Get Email Credentials
Contact your hosting provider for:
- Mail server hostname (mail.yourdomain.com)
- SMTP port (587 or 465)
- Email account (noreply@yourdomain.com)
- Password

### 3. Configure Firebase Functions
```bash
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="your-password" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false" \
  app.url="https://navis.yourdomain.com" \
  admin.token="random-secure-token"
```

### 4. Deploy Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 5. Update Firestore Data
Ensure your collections have these fields:
- **users**: `email` field
- **deliveries**: `customerEmail`, `customerName`, `driverName`, `driverPhone` fields
- **drivers**: `email` field

## Email Triggers

| Trigger | When | Recipients |
|---------|------|------------|
| **Welcome Email** | User creates account | User email |
| **Delivery Assigned** | Delivery status → "assigned" | Customer email |
| **In Transit** | Delivery status → "in_transit" | Customer email |
| **Completed** | Delivery status → "delivered" | Customer email |
| **Password Reset** | User requests password reset | User email |
| **Driver Assignment** | Manual call in code | Driver email |

## Usage in Code

### Frontend - Send Password Reset Email
```typescript
import { emailNotificationService } from './services/emailNotificationService';

await emailNotificationService.sendPasswordReset(
  'user@example.com',
  'https://navis.yourdomain.com/reset?token=xyz',
  '24 hours'
);
```

### Frontend - Notify Driver
```typescript
await emailNotificationService.sendDriverAssignment(
  driverEmail,
  driverName,
  deliveryId,
  'Pickup Address',
  'Delivery Address',
  45.5,  // km
  'UGX 50,000'
);
```

### Automatic Triggers
These happen automatically when data changes in Firestore:

**Welcome Email** (when user document created):
```typescript
// Just save to users collection with email field
await firebaseClient.saveToFirestore('users', {
  uid: 'user123',
  email: 'user@example.com',
  username: 'John Doe',
  company: 'My Company',
  accountType: 'cargo-mover'
});
// Email automatically sent!
```

**Delivery Status Email** (when delivery status updated):
```typescript
// Update delivery status
await firebaseClient.updateInFirestore('deliveries', deliveryId, {
  status: 'assigned'
  // Email automatically sent!
});
```

## Testing

### Test Locally
```bash
# Create .runtimeconfig.json with your mail settings
# Then run:
cd functions
npm run serve

# Create/update a user or delivery to trigger email
```

### Check Production Logs
```bash
firebase functions:log
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails not sending | Check `firebase functions:log` for errors |
| SMTP connection error | Verify host, port, username, password |
| Wrong port | Try 587 (TLS) or 465 (SSL) |
| Function not found | Ensure functions deployed: `firebase deploy --only functions` |
| Can't connect to mail server | Check firewall, try different port |

## Files Reference

| File | Purpose |
|------|---------|
| `functions/src/index.ts` | Cloud function triggers and handlers |
| `functions/src/emailService.ts` | SMTP connection and sending logic |
| `functions/src/emailTemplates.ts` | HTML email templates |
| `src/services/emailNotificationService.ts` | Frontend integration |
| `DEPLOYMENT_GUIDE_EMAIL.md` | Full deployment instructions |
| `functions/CONFIG.md` | Configuration reference |
| `.env.example` | Environment variables template |

## Next Steps

1. ✅ Created all email infrastructure
2. ⏭️ Get mail server credentials from hosting provider
3. ⏭️ Run Firebase config setup command
4. ⏭️ Deploy functions: `firebase deploy --only functions`
5. ⏭️ Test with new user registration
6. ⏭️ Update Firestore collections with email fields
7. ⏭️ Test delivery status changes trigger emails

## Important Reminders

- 🔐 Never commit `.runtimeconfig.json` or `.env` files
- 🔑 Keep mail server password secure
- 📧 Update email templates to match your branding
- ✔️ Verify emails are going to spam before going live
- 📊 Monitor function logs regularly

## Support Resources

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Nodemailer Docs](https://nodemailer.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Email Server Setup](functions/SETUP_GUIDE.md)

---

**Status**: ✅ Ready to Deploy  
**Created**: December 2025  
**Duration**: ~10 minutes to set up

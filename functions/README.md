# Firebase Cloud Functions - Email Notifications

Backend email notification system for Navis logistics application using Firebase Cloud Functions and your domain's SMTP mail server.

## Quick Start

### For Windows:
```bash
cd functions
./setup.bat
```

### For macOS/Linux:
```bash
cd functions
chmod +x setup.sh
./setup.sh
```

### Manual Setup (All Platforms):
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools
firebase login

# 2. Get your mail credentials and run:
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="your-password" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false" \
  app.url="https://navis.yourdomain.com" \
  admin.token="random-secure-token"

# 3. Deploy
firebase deploy --only functions
```

## Directory Structure

```
functions/
├── src/
│   ├── index.ts              # Main Cloud Functions handlers
│   ├── emailService.ts       # SMTP client and email sending logic
│   └── emailTemplates.ts     # HTML email templates
├── dist/                     # Compiled JavaScript (auto-generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .runtimeconfig.json       # Local config (don't commit)
├── SETUP_GUIDE.md            # Detailed setup instructions
├── CONFIG.md                 # Configuration reference
├── setup.sh                  # Linux/Mac setup script
└── setup.bat                 # Windows setup script
```

## Environment Configuration

### Via Firebase CLI (Recommended for Production):
```bash
firebase functions:config:set mail.host="mail.yourdomain.com"
firebase functions:config:set mail.port="587"
firebase functions:config:set mail.user="noreply@yourdomain.com"
firebase functions:config:set mail.password="your-password"
firebase functions:config:set mail.from="noreply@yourdomain.com"
firebase functions:config:set mail.secure="false"
firebase functions:config:set app.url="https://navis.yourdomain.com"
firebase functions:config:set admin.token="your-token"
```

### Via .runtimeconfig.json (Local Development Only):
Create `functions/.runtimeconfig.json`:
```json
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
```

**⚠️ Important**: `.runtimeconfig.json` is in `.gitignore` - never commit passwords!

## Available Functions

### 1. `sendWelcomeEmail` (Trigger: User Created)
Automatically sends welcome email when new user is created in Firestore.

**Trigger**: `users/{userId}` onCreate
**Recipients**: User email
**Requirements**: User document must have `email` and `username` fields

### 2. `sendDeliveryStatusEmail` (Trigger: Delivery Status Changed)
Automatically sends email when delivery status changes.

**Trigger**: `deliveries/{deliveryId}` onUpdate
**Recipients**: Customer email
**Supported Statuses**: 
- `assigned` → "Your Delivery Has Been Assigned"
- `in_transit`/`on_delivery` → "Your Package is on the Way"
- `delivered`/`completed` → "Delivery Completed"
- `cancelled` → "Delivery Cancelled"

**Requirements**: Delivery document must have:
- `status` field
- `customerEmail` field
- `customerName` field
- `driverName`, `driverPhone` (for in_transit)

### 3. `sendPasswordResetEmail` (Callable Function)
Sends password reset email via Firebase function call from frontend.

**Call from Frontend**:
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseContext';

const sendPasswordResetEmail = httpsCallable(functions, 'sendPasswordResetEmail');
await sendPasswordResetEmail({
  email: 'user@example.com',
  resetLink: 'https://app.com/reset?token=xyz',
  expiryTime: '24 hours'
});
```

**Parameters**:
- `email` (required): User email address
- `resetLink` (required): Password reset link
- `expiryTime` (optional): Link expiration time

### 4. `sendDriverAssignmentEmail` (Callable Function)
Sends driver assignment notification.

**Call from Frontend**:
```typescript
const sendDriverAssignmentEmail = httpsCallable(functions, 'sendDriverAssignmentEmail');
await sendDriverAssignmentEmail({
  driverEmail: 'driver@example.com',
  driverName: 'John Doe',
  deliveryId: 'delivery_123',
  pickupLocation: 'Start Address',
  deliveryLocation: 'End Address',
  estimatedKm: 45.5,
  estimatedEarnings: 'UGX 50,000'
});
```

**Parameters**:
- `driverEmail` (required): Driver email
- `driverName`: Driver name
- `deliveryId` (required): Delivery ID
- `pickupLocation`: Pickup address
- `deliveryLocation`: Delivery address
- `estimatedKm`: Distance in kilometers
- `estimatedEarnings`: Formatted earnings

### 5. `sendCustomEmail` (HTTP Endpoint)
HTTP endpoint for admins to send custom emails. Requires authentication token.

**Endpoint**: `https://[region]-[project].cloudfunctions.net/sendCustomEmail`

**Authentication**: Bearer token via `Authorization` header

**Request Body**:
```json
{
  "to": "user@example.com",
  "subject": "Email Subject",
  "htmlContent": "<html>...</html>"
}
```

## Development

### Build
```bash
npm run build
```

### Local Testing
```bash
# Start emulator
npm run serve

# In another terminal, trigger events:
# - Create a user document in Firestore
# - Update a delivery status
# Watch logs in the emulator terminal
```

### View Logs
```bash
# Production
firebase functions:log

# Local
# Logs appear in terminal where `npm run serve` is running
```

## Deployment

### Deploy Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:sendWelcomeEmail
```

### Deploy with Configuration
```bash
# Set config first
firebase functions:config:set mail.host="..."

# Then deploy
firebase deploy --only functions
```

## Testing Email Delivery

### Test 1: Welcome Email
```
1. Create new user in Firebase Console
2. Wait 1-2 minutes
3. Check email inbox (and spam folder)
```

### Test 2: Delivery Status Email
```
1. Create delivery with status "pending"
2. Update status to "assigned"
3. Check email inbox
```

### Test 3: Password Reset Email (from code)
```javascript
const sendPasswordResetEmail = httpsCallable(functions, 'sendPasswordResetEmail');
await sendPasswordResetEmail({
  email: 'test@example.com',
  resetLink: 'https://app.com/reset?token=test123',
  expiryTime: '24 hours'
});
```

## Troubleshooting

### Email Not Sending
```bash
# Check logs
firebase functions:log

# Look for error messages about:
# - SMTP connection
# - Authentication
# - Invalid email address
```

### SMTP Connection Failed
1. Verify mail server hostname: `telnet mail.yourdomain.com 587`
2. Check SMTP port (587 for TLS, 465 for SSL)
3. Verify username and password
4. Check firewall allows outbound SMTP

### "config not yet configured"
```bash
# Ensure all config is set
firebase functions:config:get

# If empty, set values:
firebase functions:config:set mail.host="mail.yourdomain.com"
# ... (set all other values)
```

### TypeScript Compilation Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Function Not Found After Deploy
```bash
# Verify deployment
firebase deploy --only functions

# Check function list
firebase functions:list

# Check logs
firebase functions:log
```

## Configuration Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `mail.host` | ✅ | mail.yourdomain.com | SMTP server hostname |
| `mail.port` | ✅ | 587 | 587 (TLS) or 465 (SSL) |
| `mail.user` | ✅ | noreply@yourdomain.com | Email account username |
| `mail.password` | ✅ | password123 | Email account password |
| `mail.from` | ✅ | noreply@yourdomain.com | From address in emails |
| `mail.secure` | ✅ | false | true for 465, false for 587 |
| `app.url` | ✅ | https://navis.com | Application URL for links |
| `admin.token` | ✅ | random-token | Token for admin endpoints |

## Email Templates

All email templates are in `src/emailTemplates.ts`:

- `welcomeEmail()` - New user welcome
- `deliveryAssignedEmail()` - Delivery assigned to transporter
- `deliveryInTransitEmail()` - Package on the way
- `deliveryCompletedEmail()` - Delivery completed
- `passwordResetEmail()` - Password reset link
- `driverAssignmentEmail()` - Driver assignment notification

### Customize Templates
1. Edit `src/emailTemplates.ts`
2. Run `npm run build`
3. Deploy: `firebase deploy --only functions`

## Security

✅ **Implemented**:
- Credentials stored in Firebase (encrypted at rest)
- HTTPS for all communications
- Token authentication for admin endpoints
- Email validation before sending
- Security rules on Firestore

✅ **Best Practices**:
- Never commit `.runtimeconfig.json` (in .gitignore)
- Rotate admin token periodically
- Monitor logs for suspicious activity
- Use strong email passwords
- Keep dependencies updated

## Monitoring

### View Function Performance
```bash
firebase deploy:describe functions
firebase deploy:describe functions:sendWelcomeEmail
```

### Monitor Email Delivery
- Firebase Console → Cloud Functions → Logs
- Check error rates and latency
- Monitor invocation counts

### Set Up Alerts
Use Firebase Cloud Monitoring to set up alerts for:
- High error rates
- Increased latency
- Deployment failures

## Performance

### Function Limits
- **Timeout**: 60 seconds (default)
- **Memory**: 256 MB (default)
- **Concurrent**: Scales automatically

### Optimization
- Email sending is non-blocking
- Automatic retry on transient failures
- Efficient template rendering
- Connection pooling in nodemailer

### Typical Performance
- Send email: 1-3 seconds
- Function cold start: ~3-5 seconds
- Warm invocation: <1 second

## Cost

### Free Tier Includes
- 125,000 GB-seconds/month
- 2M invocations/month
- Sufficient for most use cases

### Estimated Cost (per 10,000 emails/month)
- Function invocations: ~$0.10
- Compute time: ~$0.05
- **Total**: ~$0.15/month

Your mail server: Already paid for via hosting

## Documentation

- `SETUP_GUIDE.md` - Detailed setup instructions
- `CONFIG.md` - Configuration reference
- `../DEPLOYMENT_GUIDE_EMAIL.md` - Full deployment guide
- `../EMAIL_QUICK_START.md` - Quick reference
- `../INTEGRATION_EXAMPLES.md` - Code examples

## Support

### Common Issues
1. Check `firebase functions:log` for errors
2. Verify SMTP connectivity
3. Ensure Firestore data has required fields
4. Review configuration with `firebase functions:config:get`

### Resources
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Nodemailer Docs](https://nodemailer.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## Version Information

- **Node.js**: 18+
- **Firebase Functions**: 4.8.1+
- **Nodemailer**: 6.9.7+
- **TypeScript**: 5.3.3+

## License

Part of Navis Logistics Application

## Support Contact

For issues, check the documentation or review Firebase function logs.

---

**Last Updated**: December 2025  
**Status**: Production Ready ✅

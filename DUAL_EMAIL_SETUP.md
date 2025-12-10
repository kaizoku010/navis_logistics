# 📧 Dual Email Account Setup Guide

Your Navis system now uses **TWO email accounts** for better organization:

## Email Accounts Setup

### Account 1: noreply@navislogistics.co
**Purpose:** Welcome, Password Reset, Admin Notifications
**Credentials:**
- Username: `noreply@navislogistics.co`
- Password: `tc@QP9Np)CR,K1.l`
- SMTP: `graceful.crystalcloudhosting.com:465`

**Emails Sent From:**
- Welcome email (new user registration)
- Password reset email
- Admin notifications

---

### Account 2: deliveries@navislogistics.co
**Purpose:** Delivery Status Updates
**Credentials:**
- Username: `deliveries@navislogistics.co`
- Password: `_Jld?;D-t6!9Y&Zw`
- SMTP: `graceful.crystalcloudhosting.com:465`

**Emails Sent From:**
- Delivery assigned notification
- Delivery in transit notification
- Delivery completed notification
- Delivery cancelled notification

---

## Configuration Values

When running `setup.bat`, use these values:

### Noreply Email (First Section)
```
Mail Host: graceful.crystalcloudhosting.com
Mail Port: 465
Mail User: noreply@navislogistics.co
Mail Password: tc@QP9Np)CR,K1.l
Mail From: noreply@navislogistics.co
Use SSL: true
```

### Deliveries Email (Second Section)
```
Deliveries Mail User: deliveries@navislogistics.co
Deliveries Mail Password: _Jld?;D-t6!9Y&Zw
Deliveries Mail From: deliveries@navislogistics.co
```

### Other Configuration
```
Application URL: https://yourdomain.com (or your Vercel URL)
Admin Token: (any random secure string, e.g., my-secret-token-xyz)
```

---

## Email Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                 User Actions                        │
└─────────────────────────────────────────────────────┘
          ↓                    ↓
    [New User]           [Create Delivery]
          ↓                    ↓
    Firebase Auth       Shipments.js saves
    Creates user        with email field
          ↓                    ↓
    AuthContext.js       Firestore trigger
    saves to Firestore   fires on update
          ↓                    ↓
    Firestore trigger    sendDeliveryStatusEmail
    fires onCreate       Cloud Function
          ↓                    ↓
sendWelcomeEmail         Uses: deliveries@
Cloud Function           navislogistics.co
          ↓                    ↓
Uses: noreply@           SMTP to Crystal Cloud
navislogistics.co        ↓
          ↓              Sends delivery
SMTP to Crystal Cloud    status updates
          ↓
Sends welcome email
with branding
```

---

## Firebase Configuration (What Gets Set)

When you run the setup script, these Firebase environment variables are configured:

```
mail.host                    = graceful.crystalcloudhosting.com
mail.port                    = 465
mail.user                    = noreply@navislogistics.co
mail.password                = tc@QP9Np)CR,K1.l
mail.from                    = noreply@navislogistics.co
mail.secure                  = true
deliveries.mail.user         = deliveries@navislogistics.co
deliveries.mail.password     = _Jld?;D-t6!9Y&Zw
deliveries.mail.from         = deliveries@navislogistics.co
app.url                      = https://yourdomain.com
admin.token                  = <your-random-token>
```

---

## Code Changes Made

### 1. emailService.ts
**Added:**
- `initializeDeliveriesEmailService()` - Separate transporter for deliveries email
- `emailType` parameter in `sendEmail()` to specify which account to use

**Usage:**
```typescript
// Use noreply account (default)
await sendEmail(email, subject, html);

// Use deliveries account
await sendEmail(email, subject, html, undefined, 'deliveries');
```

### 2. index.ts (Cloud Functions)
**Updated:**
- `sendDeliveryStatusEmail()` now uses `emailType: 'deliveries'`
- All delivery status emails now come from `deliveries@navislogistics.co`

### 3. AuthContext.js
**Updated:**
- Now saves `email` field to Firestore users collection
- Email comes from Firebase Auth

### 4. Shipments.js
**Updated:**
- Now saves `email: user.email` to delivery documents
- Email used for delivery status notifications

---

## Testing Your Setup

### Test 1: Welcome Email
1. Run setup script: `.\functions\setup.bat`
2. Create new user
3. Wait 1-2 minutes
4. Check inbox for email from: `noreply@navislogistics.co`
5. Verify: Professional welcome message

### Test 2: Delivery Status Email
1. Create shipment with your email
2. Go to Firebase Console → Firestore
3. Find the delivery document
4. Change `status` from `pending` → `assigned`
5. Wait 1-2 minutes
6. Check inbox for email from: `deliveries@navislogistics.co`
7. Verify: Delivery assigned notification

### Test 3: Check Logs
```powershell
firebase functions:log
```

You should see:
```
✅ sendWelcomeEmail: Successfully sent to user@email.com from noreply@navislogistics.co
✅ sendDeliveryStatusEmail: Successfully sent to user@email.com from deliveries@navislogistics.co
```

---

## Verification Checklist

After running setup script:

- [ ] Setup script ran without errors
- [ ] Firebase config shows both email accounts
- [ ] Created test user
- [ ] Welcome email arrived from `noreply@navislogistics.co`
- [ ] Email contains your company branding
- [ ] Created test delivery with email
- [ ] Updated delivery status in Firebase Console
- [ ] Delivery email arrived from `deliveries@navislogistics.co`
- [ ] No errors in `firebase functions:log`

---

## Troubleshooting

### Email not arriving from noreply account?
```powershell
# Check logs
firebase functions:log

# Verify config
firebase functions:config:get

# Look for 'mail.user' should be noreply@navislogistics.co
```

### Email not arriving from deliveries account?
```powershell
# Check logs
firebase functions:log

# Look for delivery status updates
# Verify 'deliveries.mail.user' is configured

# Check if delivery document has email field
```

### SMTP Connection Error?
- Verify: graceful.crystalcloudhosting.com:465 is reachable
- Check: Passwords are correct (special characters preserved)
- Confirm: Both email accounts exist in cPanel

### Wrong email address showing?
```powershell
# Update just one email
firebase functions:config:set mail.from="noreply@navislogistics.co"

# Or update deliveries email
firebase functions:config:set deliveries.mail.from="deliveries@navislogistics.co"

# Redeploy
firebase deploy --only functions
```

---

## Email Account Information

### noreply@navislogistics.co
```
Server: graceful.crystalcloudhosting.com
IMAP: Port 993
POP3: Port 995
SMTP: Port 465
Authentication: Required
Username: noreply@navislogistics.co
Password: tc@QP9Np)CR,K1.l
```

### deliveries@navislogistics.co
```
Server: graceful.crystalcloudhosting.com
IMAP: Port 993
POP3: Port 995
SMTP: Port 465
Authentication: Required
Username: deliveries@navislogistics.co
Password: _Jld?;D-t6!9Y&Zw
```

---

## Next Steps

1. **Run setup script:**
   ```powershell
   cd g:\Workspace\firebrand\Navis\navis
   .\functions\setup.bat
   ```

2. **When prompted, enter:**
   - Noreply credentials (see above)
   - Deliveries credentials (see above)
   - Your app URL and admin token

3. **Wait for deployment** (5-10 minutes)

4. **Test both email accounts:**
   - New user registration (noreply)
   - Delivery status update (deliveries)

5. **Monitor logs:**
   ```powershell
   firebase functions:log --follow
   ```

---

## Email Status Map

| Trigger | Email Account | From Address | Purpose |
|---------|---------------|--------------|---------|
| User Registration | noreply | noreply@navislogistics.co | Welcome |
| Password Reset | noreply | noreply@navislogistics.co | Password Reset Link |
| Driver Assignment | noreply | noreply@navislogistics.co | Driver Assigned |
| Delivery Assigned | deliveries | deliveries@navislogistics.co | Status Update |
| Delivery In Transit | deliveries | deliveries@navislogistics.co | Status Update |
| Delivery Completed | deliveries | deliveries@navislogistics.co | Status Update |
| Custom Email | noreply | noreply@navislogistics.co | Admin |

---

## Support

**Issue:** Email configuration not saving?
→ Run: `firebase functions:config:get` to verify

**Issue:** Emails not sending?
→ Run: `firebase functions:log` and look for SMTP errors

**Issue:** Need to update email?
→ Run setup script again or use: `firebase functions:config:set`

---

**Your system is ready!** 🚀 Run the setup script and start testing!

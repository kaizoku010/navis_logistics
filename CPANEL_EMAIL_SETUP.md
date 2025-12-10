# cPanel Email Configuration Guide

## Quick Setup for cPanel Users

If your hosting uses cPanel, use these exact settings:

### cPanel Email Configuration

```
MAIL_HOST    = mail.yourdomain.com
MAIL_PORT    = 587
MAIL_USER    = noreply@yourdomain.com
MAIL_PASSWORD= [Your cPanel email password]
MAIL_FROM    = noreply@yourdomain.com
MAIL_SECURE  = false
```

### Firebase Setup Command (Copy & Paste)

```bash
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="YOUR_CPANEL_PASSWORD" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false" \
  app.url="https://yourdomain.com" \
  admin.token="your-random-secure-token"
```

**Replace**: 
- `YOUR_CPANEL_PASSWORD` with your email account password from cPanel
- `yourdomain.com` with your actual domain
- `your-random-secure-token` with a random string (e.g., from `openssl rand -hex 32`)

## Step-by-Step cPanel Setup

### 1. Create Email Account in cPanel

1. Log in to cPanel
2. Go to **Email Accounts**
3. Click **Create**
4. Enter:
   - **Username**: `noreply`
   - **Domain**: Your domain
   - **Password**: Strong password (save this!)
5. Click **Create**

You'll now have: `noreply@yourdomain.com`

### 2. Get Your Mail Server Details

In cPanel, the mail server is always:
```
Host: mail.yourdomain.com
Port: 587 (or 465)
Protocol: TLS (587) or SSL (465)
```

### 3. Run Setup Script

#### Windows:
```bash
cd navis/functions
setup.bat
```

#### macOS/Linux:
```bash
cd navis/functions
chmod +x setup.sh
./setup.sh
```

### 4. When Prompted, Enter:

```
Mail server host: mail.yourdomain.com
Mail server port: 587
Mail server username: noreply@yourdomain.com
Mail server password: [Password from cPanel]
From address: noreply@yourdomain.com
Use SSL: false
Application URL: https://yourdomain.com
Admin token: [Random secure string]
```

### 5. Verify It Works

```bash
firebase functions:log
```

You should see:
```
Email sent successfully to user@example.com
```

## Troubleshooting cPanel Setup

### "Connection refused" error
- Port might be blocked
- Try port 465 instead of 587
- Change `mail.secure` to `true` if using 465

### "Authentication failed" error
- Wrong password
- Email account hasn't been created yet
- Try resetting password in cPanel

### Email not sending
- Check: `firebase functions:log`
- Verify email address in database has `email` field
- Check cPanel email account exists

## cPanel Mail Server Alternatives

Most cPanel servers also accept:

```
smtp.yourdomain.com  (instead of mail.yourdomain.com)
localhost            (only from server)
127.0.0.1            (only from server)
```

If `mail.yourdomain.com` doesn't work, try `smtp.yourdomain.com`

## Firebase Configuration Check

After setup, verify with:

```bash
firebase functions:config:get
```

Should show:
```json
{
  "mail": {
    "host": "mail.yourdomain.com",
    "port": "587",
    "user": "noreply@yourdomain.com",
    "password": "***",
    "from": "noreply@yourdomain.com",
    "secure": "false"
  },
  ...
}
```

## Testing cPanel Email

### Test 1: Manual Test (from terminal)

```bash
firebase functions:shell

# In the shell:
sendPasswordResetEmail({
  email: 'your-test@gmail.com',
  resetLink: 'https://navis.yourdomain.com/reset',
  expiryTime: '24 hours'
})
```

### Test 2: Create New User

1. Go to your app: https://navis.yourdomain.com
2. Register new account
3. Check email inbox
4. Verify welcome email arrived

### Test 3: Update Delivery

1. Create delivery with status "pending"
2. Change status to "assigned"
3. Check customer email
4. Verify status update email

## cPanel Security Notes

✅ **Secure Email Setup**
- Use strong password (20+ characters)
- Enable SMTP authentication (Firebase does this)
- Use TLS encryption (port 587)
- Monitor cPanel logs: https://yourdomain.com/cpanel

⚠️ **Important**
- Never share email password
- Don't commit password to git
- Use `.env` file to store credentials
- Rotate password every 90 days

## Common cPanel Issues

| Issue | Solution |
|-------|----------|
| Can't connect to mail.yourdomain.com | Verify email account created in cPanel |
| Authentication failed | Check password in cPanel matches |
| Port 587 blocked | Try port 465 with SSL enabled |
| Emails in spam | Add SPF/DKIM records in cPanel DNS |
| Too many connection errors | Rate limiting enabled in cPanel |

## SPF & DKIM Setup (Recommended)

In cPanel → Email Deliverability:

1. Add SPF record:
```
v=spf1 include:yourdomain.com ~all
```

2. Add DKIM:
   - Generate key in cPanel
   - Copy to DNS records
   - Enable for noreply@yourdomain.com

This helps emails reach inbox (not spam folder)

## Quick Reference

```
Provider: cPanel
Host: mail.yourdomain.com
Port: 587
Authentication: Yes
Encryption: TLS
Email Account: noreply@yourdomain.com
Documentation: cPanel docs
Support: Your hosting provider
```

---

**Status**: ✅ Ready to Use  
**Last Updated**: December 2025

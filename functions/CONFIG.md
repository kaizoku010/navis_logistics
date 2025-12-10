# Firebase Functions Configuration

This file documents the environment variables needed for Firebase Cloud Functions.

## Configure with Firebase CLI

Run these commands from your project root:

```bash
# Mail Server Configuration
firebase functions:config:set mail.host="mail.yourdomain.com"
firebase functions:config:set mail.port="587"
firebase functions:config:set mail.user="noreply@yourdomain.com"
firebase functions:config:set mail.password="your-app-specific-password"
firebase functions:config:set mail.from="noreply@yourdomain.com"
firebase functions:config:set mail.secure="false"

# Application URL
firebase functions:config:set app.url="https://navis.yourdomain.com"

# Admin Token (for custom email endpoint)
firebase functions:config:set admin.token="your-secure-random-token"
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MAIL_HOST` | SMTP server hostname | `mail.yourdomain.com` |
| `MAIL_PORT` | SMTP port (587 for TLS, 465 for SSL) | `587` |
| `MAIL_USER` | Email account username | `noreply@yourdomain.com` |
| `MAIL_PASSWORD` | Email account password or app password | `secure_password_123` |
| `MAIL_FROM` | From email address | `noreply@yourdomain.com` |
| `MAIL_SECURE` | Use SSL (true for 465, false for 587) | `false` |
| `APP_URL` | Application URL for links in emails | `https://navis.yourdomain.com` |
| `ADMIN_TOKEN` | Token for admin email endpoint | Random secure string |

## Local Development (.runtimeconfig.json)

Create this file for local testing with `firebase emulators:start`:

```json
{
  "mail": {
    "host": "mail.yourdomain.com",
    "port": "587",
    "user": "noreply@yourdomain.com",
    "password": "your-app-specific-password",
    "from": "noreply@yourdomain.com",
    "secure": "false"
  },
  "app": {
    "url": "http://localhost:3000"
  },
  "admin": {
    "token": "dev-token-for-testing"
  }
}
```

**Important:** Add `.runtimeconfig.json` to `.gitignore` - never commit this file!

## Production Deployment

```bash
# View current configuration
firebase functions:config:get

# Deploy functions with configuration
firebase deploy --only functions
```

## Generating Secure Tokens

For `admin.token`, generate a secure random string:

```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any online random generator and paste here
```

## Testing Email Configuration

```bash
# Start local emulator
cd functions
npm run serve

# In another terminal, test the welcome email trigger by creating a user
```

## Troubleshooting

### "config not yet configured"
```bash
# Set all config values first
firebase functions:config:set mail.host="..."
firebase functions:config:set mail.port="587"
# etc.

# Then redeploy
firebase deploy --only functions
```

### SMTP Connection Errors
- Verify mail server hostname and port
- Check username/password
- Ensure firewall allows outbound SMTP
- Try different port (587 vs 465)

### "Module not found" errors
```bash
# Ensure dependencies are installed
cd functions
npm install
npm run build
```

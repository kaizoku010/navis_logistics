# Firebase Configuration Commands for cPanel Users

## Copy & Paste Ready

### Step 1: Get Your cPanel Details

Open cPanel and create/get your email account:
- **Email**: noreply@yourdomain.com
- **Password**: [Your cPanel email password]

### Step 2: Replace and Run

Copy all of this and replace the placeholders, then paste into your terminal:

```bash
firebase functions:config:set \
  mail.host="mail.yourdomain.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="YOUR_CPANEL_EMAIL_PASSWORD_HERE" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false" \
  app.url="https://navis.yourdomain.com" \
  admin.token="random-secure-token-string"
```

### Step 3: What to Replace

| Placeholder | Replace With |
|-------------|--------------|
| `YOUR_CPANEL_EMAIL_PASSWORD_HERE` | Your cPanel email account password |
| `navis.yourdomain.com` | Your actual domain |
| `random-secure-token-string` | Random string (use any 32 chars) |

## Example (for domain: example.com)

```bash
firebase functions:config:set \
  mail.host="mail.example.com" \
  mail.port="587" \
  mail.user="noreply@example.com" \
  mail.password="MySecurePassword123!" \
  mail.from="noreply@example.com" \
  mail.secure="false" \
  app.url="https://navis.example.com" \
  admin.token="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## Alternative: One Command at a Time

If the multi-line command doesn't work, run these one at a time:

```bash
firebase functions:config:set mail.host="mail.yourdomain.com"
firebase functions:config:set mail.port="587"
firebase functions:config:set mail.user="noreply@yourdomain.com"
firebase functions:config:set mail.password="YOUR_PASSWORD"
firebase functions:config:set mail.from="noreply@yourdomain.com"
firebase functions:config:set mail.secure="false"
firebase functions:config:set app.url="https://yourdomain.com"
firebase functions:config:set admin.token="random-token"
```

## Verify Configuration

After running the command, verify it worked:

```bash
firebase functions:config:get
```

Should output:
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
  "app": {
    "url": "https://yourdomain.com"
  },
  "admin": {
    "token": "***"
  }
}
```

## Deploy Functions

After configuration is set, deploy:

```bash
firebase deploy --only functions
```

---

## Common Mistakes to Avoid

❌ **Wrong**: `mail.yourdomain.com` → ✅ **Correct**: `mail.example.com`
❌ **Wrong**: `noreply` → ✅ **Correct**: `noreply@yourdomain.com`
❌ **Wrong**: `465` with `mail.secure="false"` → ✅ **Correct**: Use `587` with `false` OR `465` with `true`
❌ **Wrong**: Password with special chars not quoted → ✅ **Correct**: `"password@123"`

## For Google Workspace Users (Alternative)

If you use Google Workspace instead:

```bash
firebase functions:config:set \
  mail.host="smtp.gmail.com" \
  mail.port="587" \
  mail.user="noreply@yourdomain.com" \
  mail.password="your-app-specific-password" \
  mail.from="noreply@yourdomain.com" \
  mail.secure="false" \
  app.url="https://yourdomain.com" \
  admin.token="random-token"
```

Note: Generate app-specific password in Google Workspace settings

---

**Ready?** Run the command above with your values replaced!

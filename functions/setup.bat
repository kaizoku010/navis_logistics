@echo off
REM Email Notifications Setup Script for Windows
REM Copy and paste these commands in order to set up email notifications

echo.
echo ==========================================
echo Navis Email Notifications Setup
echo ==========================================
echo.

REM Step 1: Install Firebase CLI
echo Step 1: Installing Firebase CLI...
npm install -g firebase-tools
call firebase login

echo.
echo ==========================================
echo IMPORTANT - Before continuing:
echo ==========================================
echo 1. Get these from your hosting provider:
echo    - Mail server hostname (e.g., mail.yourdomain.com)
echo    - SMTP port (587 for TLS, 465 for SSL)
echo    - Email account (e.g., noreply@yourdomain.com)
echo    - Password or app-specific password
echo.
echo 2. Have ready:
echo    - Your application URL (e.g., https://navis.yourdomain.com)
echo    - A secure random token for admin operations
echo.
pause

echo.
echo Step 2: Configure Firebase Functions
echo ==========================================
echo.
echo Enter your configuration values:
echo.

REM Prompt for configuration values
echo.
echo YOUR SETTINGS (Pre-filled for Crystal Cloud Hosting):
echo   Host: graceful.crystalcloudhosting.com
echo   Port: 465
echo   Secure: true (because port 465 uses SSL)
echo.

set /p MAIL_HOST="Enter mail server host [graceful.crystalcloudhosting.com]: "
if "%MAIL_HOST%"=="" set MAIL_HOST=graceful.crystalcloudhosting.com

set /p MAIL_PORT="Enter mail server port [465]: "
if "%MAIL_PORT%"=="" set MAIL_PORT=465

set /p MAIL_USER="Enter mail server username [noreply@navislogistics.co]: "
if "%MAIL_USER%"=="" set MAIL_USER=noreply@navislogistics.co

set /p MAIL_PASSWORD="Enter mail server password [tc@QP9Np)CR,K1.l]: "
if "%MAIL_PASSWORD%"=="" set MAIL_PASSWORD=tc@QP9Np)CR,K1.l

set /p MAIL_FROM="Enter from address [noreply@navislogistics.co]: "
if "%MAIL_FROM%"=="" set MAIL_FROM=noreply@navislogistics.co

set /p MAIL_SECURE="Use SSL? [true]: "
if "%MAIL_SECURE%"=="" set MAIL_SECURE=true

echo.
echo ==========================================
echo Deliveries Email Configuration
echo ==========================================
echo.
echo DELIVERIES SETTINGS (Pre-filled for Crystal Cloud Hosting):
echo   Host: graceful.crystalcloudhosting.com
echo   Port: 465
echo   Secure: true (because port 465 uses SSL)
echo.

set /p DELIVERIES_MAIL_USER="Enter deliveries email username [deliveries@navislogistics.co]: "
if "%DELIVERIES_MAIL_USER%"=="" set DELIVERIES_MAIL_USER=deliveries@navislogistics.co

set /p DELIVERIES_MAIL_PASSWORD="Enter deliveries email password [_Jld?;D-t6!9Y&Zw]: "
if "%DELIVERIES_MAIL_PASSWORD%"=="" set DELIVERIES_MAIL_PASSWORD=_Jld?;D-t6!9Y&Zw

set /p DELIVERIES_MAIL_FROM="Enter deliveries from address [deliveries@navislogistics.co]: "
if "%DELIVERIES_MAIL_FROM%"=="" set DELIVERIES_MAIL_FROM=deliveries@navislogistics.co

set /p APP_URL="Enter application URL [https://navislogistics.co]: "
if "%APP_URL%"=="" set APP_URL=https://navislogistics.co

set /p ADMIN_TOKEN="Enter admin token (paste a random secure token): "

echo.
echo Setting Firebase configuration...
echo.

call firebase functions:config:set ^
  mail.host="%MAIL_HOST%" ^
  mail.port="%MAIL_PORT%" ^
  mail.user="%MAIL_USER%" ^
  mail.password="%MAIL_PASSWORD%" ^
  mail.from="%MAIL_FROM%" ^
  mail.secure="%MAIL_SECURE%" ^
  deliveries.mail.user="%DELIVERIES_MAIL_USER%" ^
  deliveries.mail.password="%DELIVERIES_MAIL_PASSWORD%" ^
  deliveries.mail.from="%DELIVERIES_MAIL_FROM%" ^
  app.url="%APP_URL%" ^
  admin.token="%ADMIN_TOKEN%"

echo.
echo Configuration saved!
echo.

REM Step 3: Verify configuration
echo Step 3: Verifying configuration...
call firebase functions:config:get

echo.
echo ==========================================
echo Step 4: Navigate to functions directory
echo ==========================================
cd /d "%~dp0"
echo Current directory: %cd%

echo.
echo ==========================================
echo Step 5: Installing Dependencies
echo ==========================================
call npm install
call npm run build

echo.
echo ==========================================
echo Step 6: Deploying to Firebase
echo ==========================================
call firebase deploy --only functions

echo.
echo Returning to project root...
cd ..

echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Create a new user account to test welcome email
echo 2. Check email inbox (may take 1-2 minutes)
echo 3. Check Firebase logs: firebase functions:log
echo 4. Update Firestore collections with email fields
echo 5. Test delivery status updates
echo.
echo For more details, see:
echo - EMAIL_QUICK_START.md
echo - DEPLOYMENT_GUIDE_EMAIL.md
echo - INTEGRATION_EXAMPLES.md
echo.
echo Monitor logs with: firebase functions:log
echo View config with: firebase functions:config:get
echo.
pause

@echo off
REM Fast Email Notifications Deployment Script
REM Use this if you already have Firebase CLI installed and logged in

echo.
echo ==========================================
echo Navis Email Notifications Deployment
echo ==========================================
echo.

REM Skip Step 1 (Firebase CLI already installed)
REM Skip Step 2 (Firebase login already done)

echo Step 1: Verify Firebase Login
call firebase projects:list > nul 2>&1
if errorlevel 1 (
    echo ERROR: Not logged into Firebase. Run: firebase login
    pause
    exit /b 1
)
echo ✓ Firebase login verified

echo.
echo Step 2: Configure Email Settings
echo ==========================================
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
echo DELIVERIES SETTINGS (Pre-filled for Crystal Cloud Hosting):
echo   Host: graceful.crystalcloudhosting.com
echo   Port: 465
echo   Secure: true (because port 465 uses SSL)
echo.

set /p DELIVERIES_MAIL_USER="Enter deliveries email username [deliveries@navislogistics.co]: "
if "%DELIVERIES_MAIL_USER%"=="" set DELIVERIES_MAIL_USER=deliveries@navislogistics.co

set /p DELIVERIES_MAIL_PASSWORD="Enter deliveries email password [_Jld?;D-t6!9Y&Zw]: "
if "%DELIVERIES_MAIL_PASSWORD%"=="" set DELIVERIES_MAIL_PASSWORD=_Jld?;D-t6!9Y^&Zw

set /p DELIVERIES_MAIL_FROM="Enter deliveries from address [deliveries@navislogistics.co]: "
if "%DELIVERIES_MAIL_FROM%"=="" set DELIVERIES_MAIL_FROM=deliveries@navislogistics.co

set /p APP_URL="Enter application URL [https://navislogistics.vercel.app]: "
if "%APP_URL%"=="" set APP_URL=https://navislogistics.vercel.app

set /p ADMIN_TOKEN="Enter admin token (paste a random secure token): "

echo.
echo Step 3: Setting Firebase configuration...
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

if errorlevel 1 (
    echo ERROR: Failed to set Firebase configuration
    pause
    exit /b 1
)

echo ✓ Configuration saved!
echo.

echo Step 4: Verifying configuration...
call firebase functions:config:get
echo.

echo Step 5: Navigate to functions directory and build
echo ==========================================
cd /d "%~dp0"
echo Current directory: %cd%
echo.

REM Check if node_modules exists, if not install
if not exist "node_modules" (
    echo Installing dependencies first time only...
    call npm install
) else (
    echo Dependencies already installed
)

echo Building TypeScript...
call npm run build

if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo Build successful
echo.

echo Step 6: Deploying to Firebase
echo ==========================================
call firebase deploy --only functions

if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo ✓ Deployment successful!
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
echo 4. Test delivery status updates
echo.
echo For more details, see:
echo - DUAL_EMAIL_SETUP.md
echo - EMAIL_QUICK_START.md
echo - INTEGRATION_EXAMPLES.md
echo.
echo Monitor logs with: firebase functions:log
echo View config with: firebase functions:config:get
echo.
pause

# Firebase Push Notifications Setup Guide

This guide will walk you through setting up Firebase Cloud Messaging for push notifications in the Daash app.

## Prerequisites

- Google Account
- Access to [Firebase Console](https://console.firebase.google.com/)
- Supabase project set up

---

## Part 1: Create Firebase Project

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Daash"**
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

### Step 2: Add Android App

1. In your Firebase project, click **"Add app"** → Select **Android**
2. Enter Android package name: `com.daash.app` (from `app.json`)
3. (Optional) Enter app nickname: "Daash Android"
4. Click **"Register app"**
5. **Download `google-services.json`**
6. Save it to the root of your Daash project: `/home/user/Daash/google-services.json`

### Step 3: Add iOS App (Optional - requires Apple Developer Account)

1. Click **"Add app"** → Select **iOS**
2. Enter iOS bundle ID: `com.daash.app`
3. (Optional) Enter app nickname: "Daash iOS"
4. Click **"Register app"**
5. **Download `GoogleService-Info.plist`**
6. Save it to the root of your Daash project: `/home/user/Daash/GoogleService-Info.plist`

---

## Part 2: Get Firebase Admin Credentials (for Supabase)

### Step 1: Generate Service Account Key

1. In Firebase Console, click the **gear icon** ⚙️ → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** - this downloads a JSON file
5. **Keep this file secure!** It contains your private key

### Step 2: Extract Credentials

Open the downloaded JSON file. You'll need these three values:

```json
{
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
}
```

### Step 3: Add to Supabase Environment Variables

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **Edge Functions** → **Secrets**
4. Add the following secrets:

```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

**Important:** For `FIREBASE_PRIVATE_KEY`, keep the newlines (`\n`) in the key string.

---

## Part 3: Deploy Supabase Infrastructure

### Step 1: Run Database Migration

```bash
# Navigate to your project
cd /home/user/Daash

# Run the migration to create push_tokens table
# Option A: Using Supabase CLI
supabase db push

# Option B: Manually in Supabase SQL Editor
# Copy and paste the contents of:
# supabase/migrations/create_push_tokens_table.sql
```

### Step 2: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy send-push-notification
supabase functions deploy monitor-transactions
```

---

## Part 4: Create Development Build

Since Firebase requires native modules, you need a development build (can't use Expo Go).

### Option A: Android Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --profile development --platform android

# When build completes, download and install the APK on your device
```

### Option B: iOS Development Build (Requires Apple Developer Account)

```bash
# Build for iOS
eas build --profile development --platform ios

# Install via TestFlight or direct installation
```

---

## Part 5: Test Push Notifications

### Step 1: Test FCM Token Registration

1. Install your development build on a device
2. Open the app and create/load a wallet
3. Check the console logs - you should see:
   ```
   ✅ Firebase Cloud Messaging available
   ✅ Push notification permission granted
   ✅ FCM Token obtained: eXXXXXXXXXXXXXXXXXX...
   ✅ FCM token registered with Supabase
   ✅ Firebase Cloud Messaging initialized
   ```

### Step 2: Verify Token in Database

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → **push_tokens**
3. You should see a row with:
   - `wallet_address`: Your Stellar wallet address
   - `fcm_token`: Your device FCM token
   - `platform`: ios or android

### Step 3: Test Manual Notification

Send a test notification using Supabase Functions:

```bash
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "title": "Test Notification",
    "body": "Hello from Daash!",
    "data": {"type": "test"}
  }'
```

### Step 4: Test Transaction Monitoring

```bash
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/monitor-transactions' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }'
```

---

## Part 6: Set Up Automatic Transaction Monitoring (Production)

For production, you'll want to monitor transactions automatically.

### Option A: Use Supabase Cron Jobs

Create a cron job that calls `monitor-transactions` every 30 seconds:

1. Go to **Supabase Dashboard** → **Database** → **Cron Jobs**
2. Create a new cron job:

```sql
SELECT cron.schedule(
  'monitor-stellar-transactions',
  '30 seconds',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/monitor-transactions',
      headers := '{"Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY", "Content-Type": "application/json"}',
      body := '{"walletAddress": "GXXXXX"}'
    );
  $$
);
```

### Option B: External Cron Service

Use a service like [Cron-job.org](https://cron-job.org/) to call your Edge Function every 30 seconds.

---

## Troubleshooting

### Problem: "Firebase not available" in logs

**Solution:** You're running in Expo Go. Create a development build instead.

### Problem: No FCM token received

**Solutions:**
1. Check notification permissions are granted
2. Verify `google-services.json` / `GoogleService-Info.plist` are in the root directory
3. Rebuild the app after adding Firebase config files

### Problem: Notifications not received on device

**Solutions:**
1. Verify FCM token is in `push_tokens` table
2. Check Firebase Admin credentials in Supabase secrets
3. Test with Firebase Console → Cloud Messaging → "Send test message"
4. Check device notification settings

### Problem: Transaction monitor not detecting new transactions

**Solutions:**
1. Verify wallet address is correct
2. Check Stellar Horizon API is accessible
3. Test the monitor function manually first
4. Check Edge Function logs in Supabase Dashboard

---

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit** `google-services.json` or `GoogleService-Info.plist` to version control
2. **Never commit** your Firebase Admin private key
3. Store all sensitive credentials in Supabase Secrets or environment variables
4. Use Row Level Security (RLS) policies on the `push_tokens` table
5. Implement rate limiting on Edge Functions in production

---

## Next Steps

Once everything is working:

1. ✅ Test receiving notifications on real transactions
2. ✅ Implement notification preferences in Settings
3. ✅ Add notification sounds and custom vibration patterns
4. ✅ Implement notification grouping and categories
5. ✅ Add deep linking from notifications to transaction details
6. ✅ Monitor notification delivery rates and errors
7. ✅ Scale transaction monitoring for multiple users

---

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stellar Horizon API](https://developers.stellar.org/api/horizon)

---

## Support

If you encounter issues:
1. Check the Firebase Console → Cloud Messaging logs
2. Check Supabase Edge Function logs
3. Enable debug logging in the app
4. Review this guide step by step

Good luck! 🚀

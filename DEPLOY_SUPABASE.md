# Supabase Edge Functions Deployment Guide

This guide will help you deploy the Supabase edge functions for push notifications and transaction monitoring.

## Prerequisites

1. **Supabase Project** - Your project is already set up at: `https://emzlmbpuwxmzpgdsywkc.supabase.co`
2. **Firebase Service Account** - You've added the Firebase config files

## Edge Functions in This Project

1. **send-push-notification** - Sends push notifications to users
2. **monitor-transactions** - Monitors Stellar transactions for wallet addresses

## Deployment Steps

### Option 1: Deploy via Supabase CLI (Recommended)

#### 1. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
tar -xzf supabase.tar.gz
sudo mv supabase /usr/local/bin/
```

**Windows:**
```bash
scoop install supabase
```

#### 2. Login to Supabase

```bash
supabase login
```

This will open a browser for you to authenticate.

#### 3. Link Your Project

```bash
cd /home/user/Daash
supabase link --project-ref emzlmbpuwxmzpgdsywkc
```

#### 4. Set Environment Variables (Secrets)

You need to set these secrets for your edge functions:

```bash
# Firebase Admin credentials (required for push notifications)
supabase secrets set FIREBASE_PROJECT_ID=your-firebase-project-id
supabase secrets set FIREBASE_CLIENT_EMAIL=your-firebase-client-email
supabase secrets set FIREBASE_PRIVATE_KEY="your-firebase-private-key"
```

To get these values:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Extract the values from the downloaded JSON file

#### 5. Deploy the Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy send-push-notification
supabase functions deploy monitor-transactions
```

### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/emzlmbpuwxmzpgdsywkc
2. Navigate to **Edge Functions** in the sidebar
3. Click **Deploy new function**
4. Upload each function from the `supabase/functions/` directory
5. Set environment variables in the **Settings** → **Secrets** section

## Testing the Functions

### Test send-push-notification locally:

```bash
supabase functions serve send-push-notification
```

Then in another terminal:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "walletAddress":"GXXXXX",
    "title":"Payment Received",
    "body":"+10.5 XLM",
    "data":{"type":"transaction_received"}
  }'
```

### Test in production:

```bash
curl -i --location --request POST 'https://emzlmbpuwxmzpgdsywkc.supabase.co/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "walletAddress":"GXXXXX",
    "title":"Test Notification",
    "body":"This is a test",
    "data":{"type":"test"}
  }'
```

## Required Environment Variables

Make sure these are set in your Supabase project:

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `SUPABASE_URL` | Your Supabase project URL | Already in .env |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key | Already in .env |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | Service account private key | Firebase service account JSON |

## Verify Deployment

After deployment, you should see your functions at:
- https://emzlmbpuwxmzpgdsywkc.supabase.co/functions/v1/send-push-notification
- https://emzlmbpuwxmzpgdsywkc.supabase.co/functions/v1/monitor-transactions

## Troubleshooting

### Function not found
- Make sure you've deployed the function
- Check the function name is correct

### Authentication errors
- Verify you're using the correct `SUPABASE_ANON_KEY`
- Check that RLS policies allow the function to access the database

### Firebase errors
- Verify all Firebase environment variables are set correctly
- Ensure the private key has `\n` newlines properly formatted
- Check that the service account has the correct permissions

## Next Steps

1. Deploy the functions
2. Test with a real wallet address
3. Verify push notifications are received on your device
4. Monitor function logs in the Supabase dashboard

## Monitoring

View function logs:
```bash
supabase functions logs send-push-notification
supabase functions logs monitor-transactions
```

Or view them in the Supabase Dashboard under Edge Functions → Logs.

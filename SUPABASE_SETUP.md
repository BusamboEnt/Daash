# Supabase Backend Setup for Daash Wallet

This guide will help you set up Supabase as the backend for your Daash cryptocurrency wallet.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed
- Daash app repository

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: `daash-wallet` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## Step 3: Configure Environment Variables

Create a `.env` file in the root of your Daash project:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Stellar Network
STELLAR_NETWORK=testnet

# Optional: Ramp Network (for production)
RAMP_API_KEY=your-ramp-api-key
```

**Important:** Add `.env` to your `.gitignore` to keep credentials secure!

```bash
echo ".env" >> .gitignore
```

## Step 4: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify success - you should see "Success. No rows returned"

## Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see the following tables:
   - ✅ users
   - ✅ wallets
   - ✅ kyc_verifications
   - ✅ kyc_documents
   - ✅ transactions
   - ✅ ramp_transactions
   - ✅ user_settings

## Step 6: Set Up Storage Buckets (Optional - for KYC documents)

1. Go to **Storage** in Supabase
2. Click "New Bucket"
3. Create two buckets:

### KYC Documents Bucket
- **Name**: `kyc-documents`
- **Public**: ❌ No (keep private)
- **File size limit**: 5 MB
- Click "Create bucket"

**To set file size limit:**
1. Click on the `kyc-documents` bucket
2. Go to "Configuration" tab
3. Set "File size limit" to `5 MB`
4. Click "Save"

### Avatars Bucket
- **Name**: `avatars`
- **Public**: ✅ Yes (for profile pictures)
- **File size limit**: 10 MB
- Click "Create bucket"

**To set file size limit:**
1. Click on the `avatars` bucket
2. Go to "Configuration" tab
3. Set "File size limit" to `10 MB`
4. Click "Save"

### Configure Storage Policies

For `kyc-documents` bucket, add this policy:

```sql
-- Users can upload their own KYC documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own KYC documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 7: Test the Connection

Update `src/config/supabase.ts` with your credentials:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Or use environment variables (recommended):

```typescript
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
```

## Step 8: Enable Realtime (Optional)

For live transaction updates:

1. Go to **Database** → **Replication**
2. Find these tables and enable replication:
   - `transactions`
   - `ramp_transactions`
3. Click the toggle to enable replication

## Database Schema Overview

### Users Table
Stores user profile information (extends Supabase auth.users)
- Links to Stellar wallet public key
- User metadata (name, email, phone)

### Wallets Table
Stores wallet metadata (NOT private keys!)
- Multiple wallets per user
- Wallet names and preferences

### KYC Verifications Table
Stores KYC verification status and limits
- Verification level (0-3)
- Transaction limits
- Provider information

### KYC Documents Table
Stores metadata about uploaded KYC documents
- Document type and status
- File references (actual files in Storage)

### Transactions Table
Cached transaction history from Stellar + local tracking
- Transaction type, amount, status
- Links to Stellar network transactions

### Ramp Transactions Table
On/off-ramp transaction tracking
- Fiat ↔ Crypto conversions
- Provider information
- Exchange rates and fees

## Security Features

✅ **Row Level Security (RLS)** - Enabled on all tables
✅ **Authentication Required** - All operations require valid JWT
✅ **User Isolation** - Users can only access their own data
✅ **Auto-updated Timestamps** - Tracks created/updated times
✅ **Secure Storage** - Private buckets for sensitive documents

## Testing Your Setup

Run your Daash app and check:

1. ✅ App starts without errors
2. ✅ Console shows "Supabase configured" (not "using mock data")
3. ✅ KYC status loads from database
4. ✅ Transactions are saved to database

### Test Queries

In Supabase SQL Editor, test:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- View RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check if triggers are working
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Production Checklist

Before going to production:

- [ ] Move API keys to environment variables
- [ ] Never commit `.env` file
- [ ] Enable database backups in Supabase
- [ ] Set up monitoring/alerts
- [ ] Review and test all RLS policies
- [ ] Enable 2FA on Supabase account
- [ ] Consider upgrading to Supabase Pro ($25/month)
- [ ] Set up custom domain (optional)
- [ ] Configure email templates for auth
- [ ] Enable Edge Functions for advanced logic

## Supabase Dashboard URLs

- **Project Dashboard**: https://app.supabase.com/project/your-project-id
- **Table Editor**: https://app.supabase.com/project/your-project-id/editor
- **SQL Editor**: https://app.supabase.com/project/your-project-id/sql
- **Storage**: https://app.supabase.com/project/your-project-id/storage
- **API Docs**: https://app.supabase.com/project/your-project-id/api

## Pricing

- **Free Tier**:
  - 500MB database
  - 1GB file storage
  - 50K monthly active users
  - Perfect for development and testing

- **Pro Tier** ($25/month):
  - 8GB database
  - 100GB file storage
  - 100K monthly active users
  - Daily backups
  - Email support

## Troubleshooting

### Error: "Failed to get KYC status"
- Check Supabase URL and API key are correct
- Verify database migration ran successfully
- Check RLS policies are enabled

### Error: "relation does not exist"
- Run the migration SQL again
- Verify you're in the correct project

### Error: "JWT expired" or "Invalid JWT"
- User needs to re-authenticate
- Check Supabase anon key is correct

### Can't see data in tables
- Check RLS policies
- Verify user is authenticated
- Use Supabase Table Editor to view data directly

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database migrations
3. ✅ Configure environment variables
4. ⬜ Implement authentication (optional - next phase)
5. ⬜ Test KYC flow end-to-end
6. ⬜ Test ramp transactions
7. ⬜ Deploy to production

---

**🎉 Supabase is now your backend!** Your Daash wallet can now:
- Store user data securely
- Track KYC verifications
- Save transaction history
- Handle on/off-ramp transactions
- Scale to thousands of users

All with enterprise-grade security and Row Level Security! 🚀

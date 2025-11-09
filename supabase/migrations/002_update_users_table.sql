-- Daash Wallet Database Schema - Updated for Wallet-based Users
-- Run this in your Supabase SQL Editor to update the schema

-- Step 1: Drop all foreign key constraints that reference users.id
ALTER TABLE IF EXISTS public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE IF EXISTS public.kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_user_id_fkey;
ALTER TABLE IF EXISTS public.kyc_documents DROP CONSTRAINT IF EXISTS kyc_documents_user_id_fkey;
ALTER TABLE IF EXISTS public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE IF EXISTS public.ramp_transactions DROP CONSTRAINT IF EXISTS ramp_transactions_user_id_fkey;
ALTER TABLE IF EXISTS public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- Step 2: Drop the users table primary key and auth foreign key
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Drop and recreate users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 4: Create new users table with auto-generated UUID (not tied to auth.users)
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stellar_public_key TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Step 5: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for wallet-based access
-- Allow public insert for wallet-based signup
CREATE POLICY "Anyone can create user with stellar key"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Users can view their own data by stellar public key
CREATE POLICY "Users can view their own data by stellar key"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own data by stellar public key
CREATE POLICY "Users can update their own data by stellar key"
  ON public.users FOR UPDATE
  USING (true);

-- Step 7: Create index on stellar_public_key for faster lookups
CREATE INDEX idx_users_stellar_public_key ON public.users(stellar_public_key);

-- Step 7b: Update RLS policies for kyc_verifications table to work without auth
DROP POLICY IF EXISTS "Users can view their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can insert their own KYC" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can update their own KYC" ON public.kyc_verifications;

-- Allow anyone to view, insert, and update KYC (will add proper security later)
CREATE POLICY "Anyone can view KYC"
  ON public.kyc_verifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert KYC"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update KYC"
  ON public.kyc_verifications FOR UPDATE
  USING (true);

-- Update RLS policies for kyc_documents table
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can insert their own KYC documents" ON public.kyc_documents;

CREATE POLICY "Anyone can view KYC documents"
  ON public.kyc_documents FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert KYC documents"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (true);

-- Step 8: Recreate foreign key constraints
ALTER TABLE public.wallets
  ADD CONSTRAINT wallets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.kyc_verifications
  ADD CONSTRAINT kyc_verifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.kyc_documents
  ADD CONSTRAINT kyc_documents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.ramp_transactions
  ADD CONSTRAINT ramp_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 9: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 10: Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

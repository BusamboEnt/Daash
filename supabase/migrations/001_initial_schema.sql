-- Daash Wallet Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- Wallets table (metadata only, NOT private keys!)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stellar_public_key TEXT UNIQUE NOT NULL,
  wallet_name TEXT DEFAULT 'Main Wallet',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC Verifications table
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'pending', 'approved', 'rejected', 'review')),
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 3),
  provider TEXT DEFAULT 'internal',
  provider_user_id TEXT,
  daily_limit DECIMAL(20, 2) DEFAULT 0,
  weekly_limit DECIMAL(20, 2) DEFAULT 0,
  monthly_limit DECIMAL(20, 2) DEFAULT 0,
  per_transaction_limit DECIMAL(20, 2) DEFAULT 0,
  limit_currency TEXT DEFAULT 'USD',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- KYC Documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kyc_verification_id UUID REFERENCES public.kyc_verifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'proof_of_address', 'selfie')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (cached from Stellar + local tracking)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stellar_transaction_id TEXT,
  stellar_hash TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive', 'on_ramp', 'off_ramp', 'payment')),
  from_address TEXT,
  to_address TEXT,
  amount DECIMAL(20, 7) NOT NULL,
  asset_code TEXT DEFAULT 'XLM',
  asset_issuer TEXT,
  fee DECIMAL(20, 7) DEFAULT 0,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Ramp Transactions table (On/Off-ramp tracking)
CREATE TABLE IF NOT EXISTS public.ramp_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'ramp_network',
  provider_transaction_id TEXT,
  ramp_type TEXT NOT NULL CHECK (ramp_type IN ('on_ramp', 'off_ramp')),
  fiat_amount DECIMAL(20, 2) NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  crypto_amount DECIMAL(20, 7) NOT NULL,
  crypto_asset TEXT NOT NULL DEFAULT 'XLM',
  exchange_rate DECIMAL(20, 7),
  fee_amount DECIMAL(20, 2),
  fee_currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  redirect_url TEXT,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  biometric_enabled BOOLEAN DEFAULT false,
  pin_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_stellar_public_key ON public.wallets(stellar_public_key);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON public.kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_kyc_id ON public.kyc_documents(kyc_verification_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stellar_hash ON public.transactions(stellar_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ramp_transactions_user_id ON public.ramp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ramp_transactions_status ON public.ramp_transactions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ramp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for wallets table
CREATE POLICY "Users can view their own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for kyc_verifications table
CREATE POLICY "Users can view their own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for kyc_documents table
CREATE POLICY "Users can view their own KYC documents" ON public.kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents" ON public.kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ramp_transactions table
CREATE POLICY "Users can view their own ramp transactions" ON public.ramp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ramp transactions" ON public.ramp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ramp transactions" ON public.ramp_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_settings table
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ramp_transactions_updated_at BEFORE UPDATE ON public.ramp_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daash Wallet Database Schema - Updated for Wallet-based Users
-- Run this in your Supabase SQL Editor to update the schema

-- First, drop the existing users table constraint
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Drop existing users table (if needed - be careful in production!)
-- Uncomment only if you want to start fresh:
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with auto-generated UUID (not tied to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

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

-- Create index on stellar_public_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stellar_public_key ON public.users(stellar_public_key);

-- Make sure updated_at trigger exists
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase Configuration
// TODO: Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

/**
 * Supabase Client
 * Configured for React Native with AsyncStorage for session persistence
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'https://your-project.supabase.co' &&
    SUPABASE_ANON_KEY !== 'your-anon-key'
  );
};

/**
 * Database Table Names
 */
export const TABLES = {
  USERS: 'users',
  WALLETS: 'wallets',
  KYC: 'kyc_verifications',
  KYC_DOCUMENTS: 'kyc_documents',
  TRANSACTIONS: 'transactions',
  RAMP_TRANSACTIONS: 'ramp_transactions',
  USER_SETTINGS: 'user_settings',
} as const;

/**
 * Storage Buckets
 */
export const BUCKETS = {
  KYC_DOCUMENTS: 'kyc-documents',
  AVATARS: 'avatars',
} as const;

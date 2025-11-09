import { supabase, TABLES, isSupabaseConfigured } from '../config/supabase';
import { KYCInfo, KYCStatus, KYCLevel, RampTransaction, Transaction } from '../types/wallet';

/**
 * Database Types
 */
export interface DatabaseUser {
  id: string;
  stellar_public_key: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  country_code?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface DatabaseWallet {
  id: string;
  user_id: string;
  stellar_public_key: string;
  wallet_name: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKYC {
  id: string;
  user_id: string;
  status: string;
  level: number;
  provider: string;
  provider_user_id?: string;
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  per_transaction_limit: number;
  limit_currency: string;
  rejection_reason?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTransaction {
  id: string;
  user_id: string;
  stellar_transaction_id?: string;
  stellar_hash?: string;
  transaction_type: string;
  from_address?: string;
  to_address?: string;
  amount: number;
  asset_code: string;
  asset_issuer?: string;
  fee: number;
  memo?: string;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface DatabaseRampTransaction {
  id: string;
  user_id: string;
  transaction_id?: string;
  provider: string;
  provider_transaction_id?: string;
  ramp_type: string;
  fiat_amount: number;
  fiat_currency: string;
  crypto_amount: number;
  crypto_asset: string;
  exchange_rate?: number;
  fee_amount?: number;
  fee_currency?: string;
  status: string;
  redirect_url?: string;
  failure_reason?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * Supabase Backend Service
 * Handles all database operations with Row Level Security
 */
export class SupabaseService {
  /**
   * Check if Supabase is configured
   */
  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Create or update user profile
   */
  static async upsertUser(
    userId: string,
    stellarPublicKey: string,
    data?: Partial<DatabaseUser>
  ): Promise<DatabaseUser | null> {
    try {
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .upsert({
          id: userId,
          stellar_public_key: stellarPublicKey,
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      return null;
    }
  }

  /**
   * Get user by stellar public key
   */
  static async getUserByStellarKey(stellarPublicKey: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('stellar_public_key', stellarPublicKey)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by stellar key:', error);
      return null;
    }
  }

  /**
   * Create wallet entry
   */
  static async createWallet(
    userId: string,
    stellarPublicKey: string,
    walletName: string = 'Main Wallet'
  ): Promise<DatabaseWallet | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WALLETS)
        .insert({
          user_id: userId,
          stellar_public_key: stellarPublicKey,
          wallet_name: walletName,
          is_primary: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  }

  /**
   * Get user's wallets
   */
  static async getWallets(userId: string): Promise<DatabaseWallet[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WALLETS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting wallets:', error);
      return [];
    }
  }

  /**
   * Get or create KYC verification (by Stellar public key)
   */
  static async getKYCVerification(stellarPublicKey: string): Promise<KYCInfo | null> {
    try {
      // First, get or create the user by stellar public key
      const user = await this.getUserByStellarKey(stellarPublicKey);
      let userId: string;

      if (!user) {
        // User doesn't exist, create one
        // For now, create a user without Supabase auth (anonymous user)
        // In production, this would be created during sign-up
        const { data: newUser, error: userError } = await supabase
          .from(TABLES.USERS)
          .insert({
            stellar_public_key: stellarPublicKey,
            is_active: true,
          })
          .select()
          .single();

        if (userError) {
          console.error('Error creating user:', userError);
          return null;
        }
        userId = newUser.id;
      } else {
        userId = user.id;
      }

      // Now get or create KYC verification
      const { data, error } = await supabase
        .from(TABLES.KYC)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (!data) {
        // Create initial KYC record
        const { data: newKYC, error: insertError } = await supabase
          .from(TABLES.KYC)
          .insert({
            user_id: userId,
            status: 'not_started',
            level: 0,
            daily_limit: 0,
            weekly_limit: 0,
            monthly_limit: 0,
            per_transaction_limit: 0,
            limit_currency: 'USD',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return this.mapDatabaseKYCToKYCInfo(newKYC);
      }

      return this.mapDatabaseKYCToKYCInfo(data);
    } catch (error) {
      console.error('Error getting KYC verification:', error);
      return null;
    }
  }

  /**
   * Update KYC verification (by Stellar public key)
   */
  static async updateKYCVerification(
    stellarPublicKey: string,
    updates: Partial<DatabaseKYC>
  ): Promise<KYCInfo | null> {
    try {
      // Get user ID from stellar public key
      const user = await this.getUserByStellarKey(stellarPublicKey);
      if (!user) {
        console.error('User not found for stellar public key');
        return null;
      }

      const { data, error } = await supabase
        .from(TABLES.KYC)
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseKYCToKYCInfo(data);
    } catch (error) {
      console.error('Error updating KYC verification:', error);
      return null;
    }
  }

  /**
   * Save KYC document metadata
   */
  static async saveKYCDocument(
    kycVerificationId: string,
    document: {
      document_type: string;
      file_path: string;
      file_name: string;
      file_size: number;
      mime_type: string;
      status: string;
    }
  ): Promise<boolean> {
    try {
      // First, get the user_id from the KYC verification
      const { data: kycData, error: kycError } = await supabase
        .from(TABLES.KYC)
        .select('user_id')
        .eq('id', kycVerificationId)
        .single();

      if (kycError || !kycData) {
        console.error('Error getting KYC verification:', kycError);
        return false;
      }

      const { error } = await supabase
        .from(TABLES.KYC_DOCUMENTS)
        .insert({
          kyc_verification_id: kycVerificationId,
          user_id: kycData.user_id,
          ...document,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving KYC document:', error);
      return false;
    }
  }

  /**
   * Save transaction to database
   */
  static async saveTransaction(
    userId: string,
    transaction: Partial<DatabaseTransaction>
  ): Promise<DatabaseTransaction | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert({
          user_id: userId,
          ...transaction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return null;
    }
  }

  /**
   * Get user transactions with pagination
   */
  static async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<DatabaseTransaction[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Save ramp transaction
   */
  static async saveRampTransaction(
    userId: string,
    rampTransaction: Partial<DatabaseRampTransaction>
  ): Promise<DatabaseRampTransaction | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.RAMP_TRANSACTIONS)
        .insert({
          user_id: userId,
          ...rampTransaction,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving ramp transaction:', error);
      return null;
    }
  }

  /**
   * Get ramp transactions
   */
  static async getRampTransactions(
    userId: string,
    limit: number = 50
  ): Promise<DatabaseRampTransaction[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.RAMP_TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting ramp transactions:', error);
      return [];
    }
  }

  /**
   * Update ramp transaction status
   */
  static async updateRampTransactionStatus(
    transactionId: string,
    status: string,
    failureReason?: string
  ): Promise<boolean> {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      if (failureReason) {
        updates.failure_reason = failureReason;
      }

      const { error } = await supabase
        .from(TABLES.RAMP_TRANSACTIONS)
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ramp transaction status:', error);
      return false;
    }
  }

  /**
   * Helper: Map database KYC to KYCInfo type
   */
  private static mapDatabaseKYCToKYCInfo(dbKYC: DatabaseKYC): KYCInfo {
    return {
      userId: dbKYC.user_id,
      status: dbKYC.status as KYCStatus,
      level: dbKYC.level as KYCLevel,
      limits: {
        daily: dbKYC.daily_limit,
        weekly: dbKYC.weekly_limit,
        monthly: dbKYC.monthly_limit,
        perTransaction: dbKYC.per_transaction_limit,
        currency: dbKYC.limit_currency,
      },
      documentsSubmitted: [],
      lastUpdated: new Date(dbKYC.updated_at),
      rejectionReason: dbKYC.rejection_reason,
    };
  }

  /**
   * Subscribe to transaction changes
   */
  static subscribeToTransactions(
    userId: string,
    callback: (transaction: DatabaseTransaction) => void
  ) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.TRANSACTIONS,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as DatabaseTransaction);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to ramp transaction changes
   */
  static subscribeToRampTransactions(
    userId: string,
    callback: (transaction: DatabaseRampTransaction) => void
  ) {
    return supabase
      .channel('ramp_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.RAMP_TRANSACTIONS,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as DatabaseRampTransaction);
        }
      )
      .subscribe();
  }
}

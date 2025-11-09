export interface StellarWallet {
  publicKey: string;
  secretKey?: string; // Optional for security - not always in memory
}

export interface WalletBalance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface WalletAccount {
  id: string;
  account_id: string;
  balances: WalletBalance[];
  sequence: string;
  subentry_count: number;
}

export interface Transaction {
  id: string;
  hash: string;
  created_at: string;
  source_account: string;
  type: string;
  amount?: string;
  asset_type?: string;
  from?: string;
  to?: string;
}

export interface WalletState {
  wallet: StellarWallet | null;
  account: WalletAccount | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

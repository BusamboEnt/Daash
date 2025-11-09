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

// Ramp (On/Off-Ramp) Types
export enum RampType {
  ON_RAMP = 'on-ramp',
  OFF_RAMP = 'off-ramp',
}

export enum RampStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface RampTransaction {
  id: string;
  providerId: string;
  type: RampType;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: string;
  cryptoAsset: string;
  status: RampStatus;
  redirectUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

// KYC Types
export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVIEW = 'review',
}

export enum KYCLevel {
  NONE = 0,
  BASIC = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export interface KYCLimits {
  daily: number;
  weekly: number;
  monthly: number;
  perTransaction: number;
  currency: string;
}

export interface KYCInfo {
  userId: string;
  status: KYCStatus;
  level: KYCLevel;
  limits: KYCLimits;
  documentsSubmitted: string[];
  lastUpdated: Date;
  rejectionReason?: string;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'selfie';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  fileName: string;
}

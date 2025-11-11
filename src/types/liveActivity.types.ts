/**
 * Live Activity Types for iOS Live Activities & Dynamic Island
 *
 * Supports:
 * - Transaction notifications
 * - On-ramp purchase progress
 * - Subscription renewals
 *
 * iOS 16.1+ required for Live Activities
 * iOS 16.2+ required for Dynamic Island
 */

export enum LiveActivityType {
  TRANSACTION = 'transaction',
  ONRAMP = 'onramp',
  SUBSCRIPTION = 'subscription',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum OnRampStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SubscriptionStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Transaction Live Activity Attributes
 * Used when sending XLM, USDC, or other Stellar assets
 */
export interface TransactionActivityAttributes {
  type: LiveActivityType.TRANSACTION;
  amount: string;
  asset: string;
  recipient: string;
  recipientName?: string;
  status: TransactionStatus;
  progress: number; // 0-100
  txHash?: string;
  startTime?: number;
}

/**
 * On-Ramp Live Activity Attributes
 * Used when buying crypto via Ramp Network
 */
export interface OnRampActivityAttributes {
  type: LiveActivityType.ONRAMP;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount: string;
  cryptoAsset: string;
  status: OnRampStatus;
  progress: number; // 0-100
  provider: string;
  startTime?: number;
}

/**
 * Subscription Live Activity Attributes
 * Used when renewing Pro/Premium subscription
 */
export interface SubscriptionActivityAttributes {
  type: LiveActivityType.SUBSCRIPTION;
  tier: 'pro' | 'premium';
  amount: string;
  currency: string;
  status: SubscriptionStatus;
  progress: number; // 0-100
  validUntil?: string;
  startTime?: number;
}

/**
 * Union type for all Live Activity attributes
 */
export type LiveActivityAttributes =
  | TransactionActivityAttributes
  | OnRampActivityAttributes
  | SubscriptionActivityAttributes;

/**
 * Live Activity handle returned when starting an activity
 */
export interface LiveActivityHandle {
  id: string;
  activityId: string;
}

/**
 * Live Activity configuration options
 */
export interface LiveActivityOptions {
  /** Auto-dismiss after this many milliseconds (default: 5000) */
  dismissAfter?: number;
  /** Dismissal policy (default: 'after-date') */
  dismissPolicy?: 'immediate' | 'after-date';
}

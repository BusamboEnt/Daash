/**
 * Live Activity Service for iOS Live Activities & Dynamic Island
 *
 * Manages Live Activities for:
 * - Transaction status updates
 * - On-ramp purchase progress
 * - Subscription renewals
 *
 * Requirements:
 * - iOS 16.1+ for Live Activities
 * - iOS 16.2+ for Dynamic Island
 * - iPhone 14 Pro+ for Dynamic Island hardware
 *
 * Usage:
 * ```typescript
 * // Start activity
 * const activityId = await LiveActivityService.startTransactionActivity('tx-123', {
 *   type: LiveActivityType.TRANSACTION,
 *   amount: '100',
 *   asset: 'USDC',
 *   recipient: 'GXX...XX',
 *   recipientName: 'Sarah',
 *   status: TransactionStatus.PENDING,
 *   progress: 0,
 * });
 *
 * // Update progress
 * await LiveActivityService.updateTransactionActivity('tx-123', {
 *   status: TransactionStatus.CONFIRMING,
 *   progress: 50,
 * });
 *
 * // End activity
 * await LiveActivityService.endTransactionActivity('tx-123');
 * ```
 */

import { Platform } from 'react-native';
import {
  LiveActivityAttributes,
  TransactionActivityAttributes,
  OnRampActivityAttributes,
  SubscriptionActivityAttributes,
  LiveActivityOptions,
  LiveActivityType,
} from '../../types/liveActivity.types';

// Dynamic import for iOS-only library
let LiveActivities: any = null;
let isLiveActivitiesAvailable = false;

// Only import on iOS
if (Platform.OS === 'ios') {
  try {
    LiveActivities = require('react-native-live-activities').default;
    isLiveActivitiesAvailable = true;
    console.log('✅ Live Activities available (iOS 16.1+)');
  } catch (error) {
    console.warn('⚠️ Live Activities not available - iOS 16.1+ required');
    isLiveActivitiesAvailable = false;
  }
} else {
  console.log('ℹ️ Live Activities only available on iOS');
}

class LiveActivityService {
  private activities: Map<string, string> = new Map(); // txHash/id -> activityId
  private readonly WIDGET_NAME = 'DaashWalletWidget';

  /**
   * Check if Live Activities are supported on this device
   */
  async isSupported(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    if (!isLiveActivitiesAvailable) {
      return false;
    }

    try {
      const supported = await LiveActivities.areActivitiesEnabled();
      return supported;
    } catch (error) {
      console.warn('Error checking Live Activities support:', error);
      return false;
    }
  }

  /**
   * Check if Dynamic Island is available (iPhone 14 Pro+)
   */
  async isDynamicIslandAvailable(): Promise<boolean> {
    // Dynamic Island requires iOS 16.2+ and Pro hardware
    // The library doesn't have a direct check, but it will gracefully degrade
    const supported = await this.isSupported();
    return supported; // Will show as banner on non-Pro devices
  }

  // ==========================================
  // TRANSACTION LIVE ACTIVITIES
  // ==========================================

  /**
   * Start a transaction Live Activity
   *
   * @param txHash Transaction hash or temporary ID
   * @param attributes Transaction details
   * @param options Optional configuration
   * @returns Activity ID if successful, null otherwise
   */
  async startTransactionActivity(
    txHash: string,
    attributes: TransactionActivityAttributes,
    options?: LiveActivityOptions
  ): Promise<string | null> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        console.log('Live Activities not supported, skipping...');
        return null;
      }

      const activityData = {
        ...attributes,
        startTime: attributes.startTime || Date.now(),
      };

      console.log('🚀 Starting transaction Live Activity:', txHash);

      const activityId = await LiveActivities.startActivity(
        this.WIDGET_NAME,
        activityData
      );

      this.activities.set(txHash, activityId);

      console.log('✅ Transaction Live Activity started:', activityId);
      return activityId;
    } catch (error) {
      console.error('❌ Failed to start transaction Live Activity:', error);
      return null;
    }
  }

  /**
   * Update transaction Live Activity
   *
   * @param txHash Transaction hash
   * @param updates Partial attributes to update
   */
  async updateTransactionActivity(
    txHash: string,
    updates: Partial<TransactionActivityAttributes>
  ): Promise<void> {
    try {
      const activityId = this.activities.get(txHash);
      if (!activityId) {
        console.warn('No Live Activity found for transaction:', txHash);
        return;
      }

      await LiveActivities.updateActivity(activityId, updates);
      console.log(`📱 Updated transaction Live Activity: ${txHash} (${updates.progress}%)`);
    } catch (error) {
      console.error('Failed to update transaction Live Activity:', error);
    }
  }

  /**
   * End transaction Live Activity
   *
   * @param txHash Transaction hash
   * @param policy Dismissal policy (default: 'after-date')
   * @param dismissalDate When to dismiss (default: 5 seconds from now)
   */
  async endTransactionActivity(
    txHash: string,
    policy: 'immediate' | 'after-date' = 'after-date',
    dismissalDate?: number
  ): Promise<void> {
    try {
      const activityId = this.activities.get(txHash);
      if (!activityId) {
        console.warn('No Live Activity found to end for transaction:', txHash);
        return;
      }

      const dismissAt = dismissalDate || Date.now() + 5000; // 5 seconds default

      await LiveActivities.endActivity(activityId, policy, dismissAt);

      this.activities.delete(txHash);
      console.log('🏁 Ended transaction Live Activity:', txHash);
    } catch (error) {
      console.error('Failed to end transaction Live Activity:', error);
    }
  }

  // ==========================================
  // ON-RAMP LIVE ACTIVITIES
  // ==========================================

  /**
   * Start an on-ramp purchase Live Activity
   *
   * @param purchaseId Ramp purchase ID
   * @param attributes On-ramp details
   * @param options Optional configuration
   * @returns Activity ID if successful, null otherwise
   */
  async startOnRampActivity(
    purchaseId: string,
    attributes: OnRampActivityAttributes,
    options?: LiveActivityOptions
  ): Promise<string | null> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        console.log('Live Activities not supported, skipping...');
        return null;
      }

      const activityData = {
        ...attributes,
        startTime: attributes.startTime || Date.now(),
      };

      console.log('🚀 Starting on-ramp Live Activity:', purchaseId);

      const activityId = await LiveActivities.startActivity(
        this.WIDGET_NAME,
        activityData
      );

      this.activities.set(purchaseId, activityId);

      console.log('✅ On-ramp Live Activity started:', activityId);
      return activityId;
    } catch (error) {
      console.error('❌ Failed to start on-ramp Live Activity:', error);
      return null;
    }
  }

  /**
   * Update on-ramp Live Activity
   *
   * @param purchaseId Ramp purchase ID
   * @param updates Partial attributes to update
   */
  async updateOnRampActivity(
    purchaseId: string,
    updates: Partial<OnRampActivityAttributes>
  ): Promise<void> {
    try {
      const activityId = this.activities.get(purchaseId);
      if (!activityId) {
        console.warn('No Live Activity found for on-ramp:', purchaseId);
        return;
      }

      await LiveActivities.updateActivity(activityId, updates);
      console.log(`📱 Updated on-ramp Live Activity: ${purchaseId} (${updates.progress}%)`);
    } catch (error) {
      console.error('Failed to update on-ramp Live Activity:', error);
    }
  }

  /**
   * End on-ramp Live Activity
   *
   * @param purchaseId Ramp purchase ID
   * @param policy Dismissal policy (default: 'after-date')
   * @param dismissalDate When to dismiss (default: 3 seconds from now)
   */
  async endOnRampActivity(
    purchaseId: string,
    policy: 'immediate' | 'after-date' = 'after-date',
    dismissalDate?: number
  ): Promise<void> {
    try {
      const activityId = this.activities.get(purchaseId);
      if (!activityId) {
        console.warn('No Live Activity found to end for on-ramp:', purchaseId);
        return;
      }

      const dismissAt = dismissalDate || Date.now() + 3000; // 3 seconds default

      await LiveActivities.endActivity(activityId, policy, dismissAt);

      this.activities.delete(purchaseId);
      console.log('🏁 Ended on-ramp Live Activity:', purchaseId);
    } catch (error) {
      console.error('Failed to end on-ramp Live Activity:', error);
    }
  }

  // ==========================================
  // SUBSCRIPTION LIVE ACTIVITIES
  // ==========================================

  /**
   * Start a subscription renewal Live Activity
   *
   * @param subscriptionId Subscription ID
   * @param attributes Subscription details
   * @param options Optional configuration
   * @returns Activity ID if successful, null otherwise
   */
  async startSubscriptionActivity(
    subscriptionId: string,
    attributes: SubscriptionActivityAttributes,
    options?: LiveActivityOptions
  ): Promise<string | null> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        console.log('Live Activities not supported, skipping...');
        return null;
      }

      const activityData = {
        ...attributes,
        startTime: attributes.startTime || Date.now(),
      };

      console.log('🚀 Starting subscription Live Activity:', subscriptionId);

      const activityId = await LiveActivities.startActivity(
        this.WIDGET_NAME,
        activityData
      );

      this.activities.set(subscriptionId, activityId);

      console.log('✅ Subscription Live Activity started:', activityId);
      return activityId;
    } catch (error) {
      console.error('❌ Failed to start subscription Live Activity:', error);
      return null;
    }
  }

  /**
   * Update subscription Live Activity
   *
   * @param subscriptionId Subscription ID
   * @param updates Partial attributes to update
   */
  async updateSubscriptionActivity(
    subscriptionId: string,
    updates: Partial<SubscriptionActivityAttributes>
  ): Promise<void> {
    try {
      const activityId = this.activities.get(subscriptionId);
      if (!activityId) {
        console.warn('No Live Activity found for subscription:', subscriptionId);
        return;
      }

      await LiveActivities.updateActivity(activityId, updates);
      console.log(`📱 Updated subscription Live Activity: ${subscriptionId}`);
    } catch (error) {
      console.error('Failed to update subscription Live Activity:', error);
    }
  }

  /**
   * End subscription Live Activity
   *
   * @param subscriptionId Subscription ID
   * @param policy Dismissal policy (default: 'after-date')
   * @param dismissalDate When to dismiss (default: 4 seconds from now)
   */
  async endSubscriptionActivity(
    subscriptionId: string,
    policy: 'immediate' | 'after-date' = 'after-date',
    dismissalDate?: number
  ): Promise<void> {
    try {
      const activityId = this.activities.get(subscriptionId);
      if (!activityId) {
        console.warn('No Live Activity found to end for subscription:', subscriptionId);
        return;
      }

      const dismissAt = dismissalDate || Date.now() + 4000; // 4 seconds default

      await LiveActivities.endActivity(activityId, policy, dismissAt);

      this.activities.delete(subscriptionId);
      console.log('🏁 Ended subscription Live Activity:', subscriptionId);
    } catch (error) {
      console.error('Failed to end subscription Live Activity:', error);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * End all active Live Activities
   */
  async endAllActivities(): Promise<void> {
    try {
      console.log('🧹 Ending all Live Activities...');

      for (const [key, activityId] of this.activities.entries()) {
        try {
          await LiveActivities.endActivity(activityId, 'immediate');
          this.activities.delete(key);
        } catch (error) {
          console.error(`Failed to end activity ${key}:`, error);
        }
      }

      console.log('✅ All Live Activities ended');
    } catch (error) {
      console.error('Failed to end all Live Activities:', error);
    }
  }

  /**
   * Get all active Live Activities
   *
   * @returns Array of activity IDs
   */
  async getAllActivities(): Promise<string[]> {
    try {
      if (!isLiveActivitiesAvailable) {
        return [];
      }

      const activities = await LiveActivities.getAllActivities();
      return activities || [];
    } catch (error) {
      console.error('Failed to get all Live Activities:', error);
      return [];
    }
  }

  /**
   * Get activity ID by transaction/purchase/subscription ID
   *
   * @param id Transaction hash, purchase ID, or subscription ID
   * @returns Activity ID if found, null otherwise
   */
  getActivityId(id: string): string | null {
    return this.activities.get(id) || null;
  }

  /**
   * Check if an activity is currently active
   *
   * @param id Transaction hash, purchase ID, or subscription ID
   * @returns True if activity is active
   */
  isActivityActive(id: string): boolean {
    return this.activities.has(id);
  }

  /**
   * Get the number of active activities
   */
  getActiveActivityCount(): number {
    return this.activities.size;
  }
}

export default new LiveActivityService();

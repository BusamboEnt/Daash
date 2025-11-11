/**
 * Live Activity Test Screen
 *
 * This screen allows testing iOS Live Activities and Dynamic Island features
 * without performing actual transactions.
 *
 * Requirements:
 * - iOS 16.1+ for Live Activities
 * - iOS 16.2+ for Dynamic Island
 * - Development build (won't work in Expo Go)
 *
 * Test Scenarios:
 * 1. Transaction progress (0% → 100%)
 * 2. On-ramp purchase simulation
 * 3. Failed transaction
 * 4. Multiple activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import LiveActivityService from '../services/liveActivity/LiveActivityService';
import {
  LiveActivityType,
  TransactionStatus,
  OnRampStatus,
} from '../types/liveActivity.types';

const LiveActivityTestScreen: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  React.useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const supported = await LiveActivityService.isSupported();
    setIsSupported(supported);
    updateActiveCount();
  };

  const updateActiveCount = async () => {
    const count = LiveActivityService.getActiveActivityCount();
    setActiveCount(count);
  };

  /**
   * Test 1: Transaction Live Activity with progress
   */
  const testTransactionActivity = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Live Activities are only available on iOS 16.1+');
      return;
    }

    try {
      const txId = `test-tx-${Date.now()}`;

      // Start activity
      await LiveActivityService.startTransactionActivity(txId, {
        type: LiveActivityType.TRANSACTION,
        amount: '100',
        asset: 'USDC',
        recipient: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
        recipientName: 'Test User',
        status: TransactionStatus.PENDING,
        progress: 0,
      });

      Alert.alert('Live Activity Started', 'Check your Lock Screen or Dynamic Island!');

      // Simulate progress
      const steps = [
        { progress: 20, status: TransactionStatus.PENDING, delay: 1000 },
        { progress: 40, status: TransactionStatus.PENDING, delay: 1000 },
        { progress: 60, status: TransactionStatus.CONFIRMING, delay: 1000 },
        { progress: 80, status: TransactionStatus.CONFIRMING, delay: 1000 },
        { progress: 100, status: TransactionStatus.COMPLETED, delay: 1000 },
      ];

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        await LiveActivityService.updateTransactionActivity(txId, {
          status: step.status,
          progress: step.progress,
        });
      }

      // End activity after 5 seconds
      setTimeout(async () => {
        await LiveActivityService.endTransactionActivity(txId);
        Alert.alert('Test Complete', 'Transaction Live Activity ended');
        updateActiveCount();
      }, 5000);

      updateActiveCount();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Live Activity');
    }
  };

  /**
   * Test 2: On-Ramp Live Activity
   */
  const testOnRampActivity = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Live Activities are only available on iOS 16.1+');
      return;
    }

    try {
      const purchaseId = `test-purchase-${Date.now()}`;

      // Start activity
      await LiveActivityService.startOnRampActivity(purchaseId, {
        type: LiveActivityType.ONRAMP,
        fiatAmount: '500',
        fiatCurrency: 'USD',
        cryptoAmount: '50',
        cryptoAsset: 'USDC',
        status: OnRampStatus.INITIATED,
        progress: 10,
        provider: 'Ramp Network',
      });

      Alert.alert('On-Ramp Started', 'Check your Lock Screen or Dynamic Island!');

      // Simulate progress
      const steps = [
        { progress: 30, status: OnRampStatus.PROCESSING, delay: 1500 },
        { progress: 50, status: OnRampStatus.PROCESSING, delay: 1500 },
        { progress: 70, status: OnRampStatus.PROCESSING, delay: 1500 },
        { progress: 90, status: OnRampStatus.PROCESSING, delay: 1500 },
        { progress: 100, status: OnRampStatus.COMPLETED, delay: 1500 },
      ];

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        await LiveActivityService.updateOnRampActivity(purchaseId, {
          status: step.status,
          progress: step.progress,
        });
      }

      // End activity after 3 seconds
      setTimeout(async () => {
        await LiveActivityService.endOnRampActivity(purchaseId);
        Alert.alert('Test Complete', 'On-Ramp Live Activity ended');
        updateActiveCount();
      }, 3000);

      updateActiveCount();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Live Activity');
    }
  };

  /**
   * Test 3: Failed Transaction
   */
  const testFailedTransaction = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Live Activities are only available on iOS 16.1+');
      return;
    }

    try {
      const txId = `test-failed-${Date.now()}`;

      // Start activity
      await LiveActivityService.startTransactionActivity(txId, {
        type: LiveActivityType.TRANSACTION,
        amount: '999',
        asset: 'XLM',
        recipient: 'GXXX...XXXX',
        recipientName: 'Failed Test',
        status: TransactionStatus.PENDING,
        progress: 0,
      });

      Alert.alert('Transaction Started', 'Will fail in 2 seconds...');

      // Simulate progress then failure
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await LiveActivityService.updateTransactionActivity(txId, {
        status: TransactionStatus.PENDING,
        progress: 30,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await LiveActivityService.updateTransactionActivity(txId, {
        status: TransactionStatus.FAILED,
        progress: 0,
      });

      Alert.alert('Transaction Failed', 'Live Activity will dismiss in 3 seconds');

      // End activity after 3 seconds
      setTimeout(async () => {
        await LiveActivityService.endTransactionActivity(txId);
        updateActiveCount();
      }, 3000);

      updateActiveCount();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Live Activity');
    }
  };

  /**
   * Test 4: Quick Transaction (fast progress)
   */
  const testQuickTransaction = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Live Activities are only available on iOS 16.1+');
      return;
    }

    try {
      const txId = `test-quick-${Date.now()}`;

      await LiveActivityService.startTransactionActivity(txId, {
        type: LiveActivityType.TRANSACTION,
        amount: '10',
        asset: 'XLM',
        recipient: 'GXX...XX',
        status: TransactionStatus.PENDING,
        progress: 0,
      });

      // Fast progress (0.3s intervals)
      for (let i = 20; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await LiveActivityService.updateTransactionActivity(txId, {
          status: i >= 60 ? TransactionStatus.CONFIRMING : TransactionStatus.PENDING,
          progress: i,
        });
      }

      await LiveActivityService.updateTransactionActivity(txId, {
        status: TransactionStatus.COMPLETED,
        progress: 100,
      });

      setTimeout(async () => {
        await LiveActivityService.endTransactionActivity(txId);
        updateActiveCount();
      }, 2000);

      updateActiveCount();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Live Activity');
    }
  };

  /**
   * End all activities
   */
  const endAllActivities = async () => {
    try {
      await LiveActivityService.endAllActivities();
      Alert.alert('All Activities Ended', 'Live Activities have been cleared');
      updateActiveCount();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end activities');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Activity Testing</Text>
        <Text style={styles.subtitle}>iOS 16.1+ Required</Text>
      </View>

      {/* Support Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Support Status</Text>
        {isSupported === null ? (
          <Text style={styles.statusText}>Checking...</Text>
        ) : isSupported ? (
          <>
            <Text style={[styles.statusText, styles.statusSupported]}>
              ✓ Live Activities Supported
            </Text>
            <Text style={styles.statusInfo}>
              Active Activities: {activeCount}
            </Text>
          </>
        ) : (
          <Text style={[styles.statusText, styles.statusNotSupported]}>
            ✗ Not Supported
          </Text>
        )}
        {Platform.OS !== 'ios' && (
          <Text style={styles.warningText}>
            ⚠️ Live Activities are iOS-only
          </Text>
        )}
        {Platform.OS === 'ios' && !isSupported && (
          <Text style={styles.warningText}>
            ⚠️ Requires iOS 16.1+ and a development build
          </Text>
        )}
      </View>

      {/* Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Scenarios</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={testTransactionActivity}
        >
          <Text style={styles.buttonText}>
            1️⃣ Transaction (Full Progress)
          </Text>
          <Text style={styles.buttonDescription}>
            Simulates a complete transaction with progress updates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOnRampActivity}
        >
          <Text style={styles.buttonText}>
            2️⃣ On-Ramp Purchase
          </Text>
          <Text style={styles.buttonDescription}>
            Simulates buying crypto with Ramp Network
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testFailedTransaction}
        >
          <Text style={styles.buttonText}>
            3️⃣ Failed Transaction
          </Text>
          <Text style={styles.buttonDescription}>
            Simulates a transaction failure
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testQuickTransaction}
        >
          <Text style={styles.buttonText}>
            4️⃣ Quick Transaction
          </Text>
          <Text style={styles.buttonDescription}>
            Fast transaction (Stellar speed)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={endAllActivities}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>
            🧹 End All Activities
          </Text>
          <Text style={[styles.buttonDescription, styles.dangerButtonText]}>
            Clear all active Live Activities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            checkSupport();
            Alert.alert('Refreshed', 'Support status updated');
          }}
        >
          <Text style={styles.buttonText}>
            🔄 Refresh Status
          </Text>
          <Text style={styles.buttonDescription}>
            Check support and active count
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📱 What to Expect</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Lock Screen:</Text> Full transaction details with progress bar
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Dynamic Island:</Text> Compact progress indicator (iPhone 14 Pro+)
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Expanded View:</Text> Tap Dynamic Island to see details
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Banner:</Text> Falls back to banner on non-Pro models
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🛠️ Development Build Required</Text>
        <Text style={styles.infoText}>
          Live Activities require native modules and won't work in Expo Go.
        </Text>
        <Text style={styles.infoText}>
          To test:
        </Text>
        <Text style={styles.codeText}>
          1. eas build --profile development --platform ios
        </Text>
        <Text style={styles.codeText}>
          2. Install on your device
        </Text>
        <Text style={styles.codeText}>
          3. Run tests from this screen
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusSupported: {
    color: '#28a745',
    fontWeight: '600',
  },
  statusNotSupported: {
    color: '#dc3545',
    fontWeight: '600',
  },
  statusInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#ff9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dangerButtonText: {
    color: '#fff',
  },
  buttonDescription: {
    fontSize: 13,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    backgroundColor: '#fff',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  spacer: {
    height: 40,
  },
});

export default LiveActivityTestScreen;

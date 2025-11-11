/**
 * Wallet Limits Screen
 *
 * Displays wallet transaction limits, reserves, and restrictions.
 * Shows different limits based on KYC level and network conditions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { Menu, AlertCircle, Shield, TrendingUp, Wallet } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { StellarService } from '../services/stellarService';

interface WalletLimitsScreenProps {
  navigation: any;
}

interface LimitInfo {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'info';
}

const WalletLimitsScreen: React.FC<WalletLimitsScreenProps> = ({ navigation }) => {
  const wallet = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [reserveAmount, setReserveAmount] = useState('2.5');

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      setRefreshing(true);
      // Calculate actual reserve based on account
      if (wallet.wallet?.publicKey) {
        const account = await StellarService.getAccount(wallet.wallet.publicKey);
        if (account) {
          // Base reserve (1 XLM) + 0.5 XLM per subentry
          const baseReserve = 1;
          const subentryReserve = account.subentry_count * 0.5;
          const totalReserve = baseReserve + subentryReserve;
          setReserveAmount(totalReserve.toFixed(2));
        }
      }
    } catch (error) {
      console.error('Error loading limits:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const isTestnet = StellarService.isTestnet();

  const limits: LimitInfo[] = [
    {
      title: 'Minimum Balance Reserve',
      value: `${reserveAmount} XLM`,
      subtitle: 'Required minimum balance for account operation',
      icon: <Wallet size={24} color="#007AFF" />,
      status: 'info',
    },
    {
      title: 'Base Reserve',
      value: '1 XLM',
      subtitle: 'Base account reserve on Stellar network',
      icon: <Shield size={24} color="#34C759" />,
      status: 'good',
    },
    {
      title: 'Trustline Reserve',
      value: '0.5 XLM',
      subtitle: 'Additional reserve per asset trustline',
      icon: <TrendingUp size={24} color="#FF9500" />,
      status: 'warning',
    },
    {
      title: 'Transaction Fee',
      value: '0.00001 XLM',
      subtitle: 'Base fee per operation (network standard)',
      icon: <AlertCircle size={24} color="#007AFF" />,
      status: 'info',
    },
    {
      title: 'Daily Transaction Limit',
      value: 'Unlimited',
      subtitle: isTestnet ? 'No limits on testnet' : 'Based on KYC verification level',
      icon: <TrendingUp size={24} color="#34C759" />,
      status: 'good',
    },
    {
      title: 'Per Transaction Limit',
      value: 'Unlimited',
      subtitle: isTestnet ? 'No limits on testnet' : 'Subject to network conditions',
      icon: <AlertCircle size={24} color="#34C759" />,
      status: 'good',
    },
  ];

  const kycLimits = [
    {
      level: 'Basic (Unverified)',
      daily: 'Unlimited*',
      monthly: 'Unlimited*',
      note: '*Network fees apply',
    },
    {
      level: 'Level 1 (Verified)',
      daily: '$10,000',
      monthly: '$50,000',
      note: 'Basic identity verification',
    },
    {
      level: 'Level 2 (Enhanced)',
      daily: '$50,000',
      monthly: '$250,000',
      note: 'Enhanced verification with proof of address',
    },
    {
      level: 'Level 3 (Premium)',
      daily: 'Unlimited',
      monthly: 'Unlimited',
      note: 'Full KYC verification',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Limits</Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadLimits} />
        }
      >
        {/* Network Badge */}
        {isTestnet && (
          <View style={styles.testnetBadge}>
            <AlertCircle size={16} color="#FF9500" />
            <Text style={styles.testnetText}>
              Running on Stellar Testnet - No real money limits
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 About Wallet Limits</Text>
          <Text style={styles.infoText}>
            Stellar network requires a minimum balance (reserve) to keep your account active. This reserve increases with each trustline or asset you add.
          </Text>
          <Text style={styles.infoText}>
            Transaction limits may apply based on your verification level and local regulations.
          </Text>
        </View>

        {/* Current Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Wallet Limits</Text>
          {limits.map((limit, index) => (
            <View
              key={index}
              style={[
                styles.limitCard,
                limit.status === 'warning' && styles.limitCardWarning,
                limit.status === 'good' && styles.limitCardGood,
              ]}
            >
              <View style={styles.limitIcon}>{limit.icon}</View>
              <View style={styles.limitInfo}>
                <Text style={styles.limitTitle}>{limit.title}</Text>
                <Text style={styles.limitValue}>{limit.value}</Text>
                <Text style={styles.limitSubtitle}>{limit.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Reserve Calculation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reserve Calculation</Text>
          <View style={styles.calculationCard}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Base Reserve:</Text>
              <Text style={styles.calculationValue}>1.0 XLM</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Trustlines/Assets:</Text>
              <Text style={styles.calculationValue}>
                {wallet.account?.subentry_count || 0} × 0.5 XLM
              </Text>
            </View>
            <View style={styles.calculationDivider} />
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabelBold}>Total Reserved:</Text>
              <Text style={styles.calculationValueBold}>{reserveAmount} XLM</Text>
            </View>
            <Text style={styles.calculationNote}>
              This amount is locked and cannot be spent
            </Text>
          </View>
        </View>

        {/* KYC-Based Limits */}
        {!isTestnet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KYC Verification Limits</Text>
            <Text style={styles.sectionSubtitle}>
              Higher limits available with identity verification
            </Text>
            {kycLimits.map((kyc, index) => (
              <View key={index} style={styles.kycCard}>
                <View style={styles.kycHeader}>
                  <Text style={styles.kycLevel}>{kyc.level}</Text>
                  {index === 0 && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <View style={styles.kycLimits}>
                  <View style={styles.kycLimitRow}>
                    <Text style={styles.kycLimitLabel}>Daily:</Text>
                    <Text style={styles.kycLimitValue}>{kyc.daily}</Text>
                  </View>
                  <View style={styles.kycLimitRow}>
                    <Text style={styles.kycLimitLabel}>Monthly:</Text>
                    <Text style={styles.kycLimitValue}>{kyc.monthly}</Text>
                  </View>
                </View>
                <Text style={styles.kycNote}>{kyc.note}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => navigation.navigate('KYC' as never)}
            >
              <Shield size={20} color="#FFFFFF" />
              <Text style={styles.verifyButtonText}>Start Verification</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Important Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.noteCard}>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>
                Reserve amounts are returned when you close your account or remove trustlines
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>
                Transaction fees are paid to Stellar network validators
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>
                Network fees may increase during high traffic periods
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>
                Additional limits may apply for on-ramp/off-ramp services
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#8A784E',
  },
  menuButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  testnetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  testnetText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  limitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  limitCardWarning: {
    borderLeftColor: '#FF9500',
  },
  limitCardGood: {
    borderLeftColor: '#34C759',
  },
  limitIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  limitInfo: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  limitSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  calculationCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  calculationLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calculationValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  calculationDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  calculationNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  kycCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  kycLimits: {
    marginBottom: 8,
  },
  kycLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  kycLimitLabel: {
    fontSize: 14,
    color: '#666',
  },
  kycLimitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  kycNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  noteCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});

export default WalletLimitsScreen;

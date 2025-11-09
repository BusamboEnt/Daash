import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { ArrowDown, Wallet, DollarSign, AlertCircle, CreditCard } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { RampService } from '../services/rampService';
import { KYCStatus } from '../types/wallet';
import KYCScreen from './KYCScreen';

interface OffRampScreenProps {
  onClose?: () => void;
}

export default function OffRampScreen({ onClose }: OffRampScreenProps) {
  const wallet = useWallet();
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [estimatedFiat, setEstimatedFiat] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_STARTED);
  const [bankLinked, setBankLinked] = useState(false);

  const availableBalance = parseFloat(wallet.balance) || 0;

  useEffect(() => {
    checkKYCStatus();
  }, []);

  useEffect(() => {
    calculateEstimatedFiat();
  }, [cryptoAmount, fiatCurrency]);

  const checkKYCStatus = async () => {
    try {
      if (wallet.wallet) {
        const kycInfo = await RampService.getKYCStatus(wallet.wallet.publicKey);
        setKycStatus(kycInfo.status);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const calculateEstimatedFiat = () => {
    if (!cryptoAmount || isNaN(parseFloat(cryptoAmount))) {
      setEstimatedFiat('0');
      return;
    }

    // Simulated exchange rate (in production, this would come from an API)
    const exchangeRate = 10.0; // 1 XLM = 10 USD (example rate)
    const amount = parseFloat(cryptoAmount);
    const estimated = (amount * exchangeRate).toFixed(2);
    setEstimatedFiat(estimated);
  };

  const handleSetMaxAmount = () => {
    setCryptoAmount(availableBalance.toString());
  };

  const handleSellCrypto = async () => {
    if (!wallet.wallet) {
      Alert.alert('Error', 'No wallet found');
      return;
    }

    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(cryptoAmount) > availableBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough XLM to sell');
      return;
    }

    // Check KYC status
    if (kycStatus !== KYCStatus.APPROVED) {
      Alert.alert(
        'Verification Required',
        'You need to complete identity verification before selling crypto.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => setShowKYC(true) },
        ]
      );
      return;
    }

    // Check if bank account is linked
    if (!bankLinked) {
      Alert.alert(
        'Bank Account Required',
        'You need to link a bank account to receive funds.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Link Bank', onPress: handleLinkBank },
        ]
      );
      return;
    }

    try {
      setIsLoading(true);

      const transaction = await RampService.initiateOffRamp(
        wallet.wallet.publicKey,
        cryptoAmount,
        'STELLAR_XLM',
        fiatCurrency
      );

      Alert.alert(
        'Sell Order Created',
        `Your sell order for ${cryptoAmount} XLM has been created. Funds will be deposited to your linked bank account within 1-3 business days.`,
        [
          {
            text: 'OK',
            onPress: () => onClose?.(),
          },
        ]
      );
    } catch (error) {
      console.error('Error initiating off-ramp:', error);
      Alert.alert('Error', 'Failed to initiate sale. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkBank = () => {
    // In production, this would open bank linking flow
    Alert.alert(
      'Link Bank Account',
      'You will be redirected to securely link your bank account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Simulate bank linking
            Alert.alert('Success', 'Bank account linked successfully!');
            setBankLinked(true);
          },
        },
      ]
    );
  };

  if (showKYC) {
    return (
      <Modal visible={showKYC} animationType="slide">
        <KYCScreen
          onComplete={() => {
            setShowKYC(false);
            checkKYCStatus();
          }}
          onCancel={() => setShowKYC(false)}
        />
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sell Crypto</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* KYC Status Banner */}
        {kycStatus !== KYCStatus.APPROVED && (
          <TouchableOpacity
            style={styles.warningBanner}
            onPress={() => setShowKYC(true)}
          >
            <AlertCircle size={24} color="#F59E0B" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Verification Required</Text>
              <Text style={styles.warningText}>
                Complete identity verification to sell crypto
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Bank Account Banner */}
        {!bankLinked && kycStatus === KYCStatus.APPROVED && (
          <TouchableOpacity
            style={styles.infoBanner}
            onPress={handleLinkBank}
          >
            <CreditCard size={24} color="#3B82F6" />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Link Bank Account</Text>
              <Text style={styles.bannerText}>
                Connect your bank to receive funds
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Balance Display */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{availableBalance.toFixed(4)} XLM</Text>
        </View>

        {/* You Sell Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>You Sell</Text>
            <TouchableOpacity onPress={handleSetMaxAmount}>
              <Text style={styles.maxButton}>MAX</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputCard}>
            <Wallet size={24} color="#8A784E" />
            <TextInput
              style={styles.input}
              value={cryptoAmount}
              onChangeText={setCryptoAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="rgba(138, 120, 78, 0.3)"
            />
            <View style={styles.currencySelector}>
              <Text style={styles.currencyText}>XLM</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Minimum: 10 XLM • Available: {availableBalance.toFixed(4)} XLM
          </Text>
        </View>

        {/* Exchange Icon */}
        <View style={styles.exchangeIconContainer}>
          <View style={styles.exchangeIcon}>
            <ArrowDown size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* You Receive Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>You Receive (Estimated)</Text>
          <View style={styles.inputCard}>
            <DollarSign size={24} color="#8A784E" />
            <Text style={styles.estimatedAmount}>{estimatedFiat}</Text>
            <View style={styles.currencySelector}>
              <Text style={styles.currencyText}>{fiatCurrency}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exchange Rate</Text>
            <Text style={styles.detailValue}>1 XLM ≈ 10.00 {fiatCurrency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee</Text>
            <Text style={styles.detailValue}>1.5%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network Fee</Text>
            <Text style={styles.detailValue}>~0.00001 XLM</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>You'll Receive</Text>
            <Text style={styles.totalValue}>
              {estimatedFiat ? (parseFloat(estimatedFiat) * 0.985).toFixed(2) : '0.00'} {fiatCurrency}
            </Text>
          </View>
        </View>

        {/* Bank Account Info */}
        {bankLinked && (
          <View style={styles.bankCard}>
            <CreditCard size={20} color="#10B981" />
            <View style={styles.bankInfo}>
              <Text style={styles.bankTitle}>Bank Account</Text>
              <Text style={styles.bankDetails}>****1234 • Chase Bank</Text>
            </View>
          </View>
        )}

        {/* Sell Button */}
        <TouchableOpacity
          style={[
            styles.sellButton,
            (!cryptoAmount || isLoading || parseFloat(cryptoAmount) > availableBalance) &&
              styles.sellButtonDisabled,
          ]}
          onPress={handleSellCrypto}
          disabled={
            !cryptoAmount ||
            isLoading ||
            parseFloat(cryptoAmount) > availableBalance
          }
        >
          <Text style={styles.sellButtonText}>
            {isLoading ? 'Processing...' : 'Sell Crypto'}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Withdrawal Timeline</Text>
          <Text style={styles.infoText}>
            • Funds typically arrive in 1-3 business days
          </Text>
          <Text style={styles.infoText}>
            • ACH transfers may take up to 5 business days
          </Text>
          <Text style={styles.infoText}>
            • Wire transfers are processed within 24 hours
          </Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Exchange rates are indicative and may vary. Final rate will be determined at
          the time of transaction.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#8A784E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  bannerContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  balanceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#15803D',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  maxButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A784E',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  estimatedAmount: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  currencySelector: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  exchangeIconContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  exchangeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A784E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  bankCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  bankDetails: {
    fontSize: 14,
    color: '#15803D',
  },
  sellButton: {
    backgroundColor: '#8A784E',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  sellButtonDisabled: {
    opacity: 0.5,
  },
  sellButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4338CA',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
});

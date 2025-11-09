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
  Linking,
} from 'react-native';
import { ArrowDown, DollarSign, Wallet, AlertCircle } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { RampService } from '../services/rampService';
import { KYCStatus } from '../types/wallet';
import KYCScreen from './KYCScreen';

interface OnRampScreenProps {
  onClose?: () => void;
}

export default function OnRampScreen({ onClose }: OnRampScreenProps) {
  const wallet = useWallet();
  const [fiatAmount, setFiatAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [cryptoAsset, setCryptoAsset] = useState('STELLAR_XLM');
  const [estimatedCrypto, setEstimatedCrypto] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_STARTED);

  const supportedFiatCurrencies = RampService.getSupportedFiatCurrencies();
  const supportedCryptoAssets = RampService.getSupportedCryptoAssets();

  useEffect(() => {
    checkKYCStatus();
  }, []);

  useEffect(() => {
    calculateEstimatedCrypto();
  }, [fiatAmount, fiatCurrency, cryptoAsset]);

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

  const calculateEstimatedCrypto = () => {
    if (!fiatAmount || isNaN(parseFloat(fiatAmount))) {
      setEstimatedCrypto('0');
      return;
    }

    // Simulated exchange rate (in production, this would come from an API)
    const exchangeRate = 0.10; // 1 USD = 0.10 XLM (example rate)
    const amount = parseFloat(fiatAmount);
    const estimated = (amount * exchangeRate).toFixed(4);
    setEstimatedCrypto(estimated);
  };

  const handleBuyCrypto = async () => {
    if (!wallet.wallet) {
      Alert.alert('Error', 'No wallet found');
      return;
    }

    if (!fiatAmount || parseFloat(fiatAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    // Check KYC status
    if (kycStatus !== KYCStatus.APPROVED) {
      Alert.alert(
        'Verification Required',
        'You need to complete identity verification before buying crypto.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => setShowKYC(true) },
        ]
      );
      return;
    }

    // Check transaction limits
    const canTransact = await RampService.canPerformTransaction(
      wallet.wallet.publicKey,
      parseFloat(fiatAmount),
      fiatCurrency
    );

    if (!canTransact.allowed) {
      Alert.alert('Transaction Not Allowed', canTransact.reason || 'Unknown error');
      return;
    }

    try {
      setIsLoading(true);

      const transaction = await RampService.initiateOnRamp(
        wallet.wallet.publicKey,
        fiatCurrency,
        parseFloat(fiatAmount),
        cryptoAsset
      );

      if (transaction.redirectUrl) {
        // In production, open the Ramp widget
        Alert.alert(
          'Buy Crypto',
          'You will be redirected to complete your purchase.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: async () => {
                const supported = await Linking.canOpenURL(transaction.redirectUrl!);
                if (supported) {
                  await Linking.openURL(transaction.redirectUrl!);
                  onClose?.();
                } else {
                  Alert.alert('Error', 'Cannot open payment page');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error initiating on-ramp:', error);
      Alert.alert('Error', 'Failed to initiate purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Buy Crypto</Text>
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
                Complete identity verification to buy crypto
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* You Pay Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>You Pay</Text>
          <View style={styles.inputCard}>
            <DollarSign size={24} color="#8A784E" />
            <TextInput
              style={styles.input}
              value={fiatAmount}
              onChangeText={setFiatAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="rgba(138, 120, 78, 0.3)"
            />
            <View style={styles.currencySelector}>
              <Text style={styles.currencyText}>{fiatCurrency}</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Minimum: 50 {fiatCurrency} • Maximum: 10,000 {fiatCurrency}
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
            <Wallet size={24} color="#8A784E" />
            <Text style={styles.estimatedAmount}>{estimatedCrypto}</Text>
            <View style={styles.currencySelector}>
              <Text style={styles.currencyText}>XLM</Text>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exchange Rate</Text>
            <Text style={styles.detailValue}>1 {fiatCurrency} ≈ 0.10 XLM</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee</Text>
            <Text style={styles.detailValue}>2.9%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network Fee</Text>
            <Text style={styles.detailValue}>~0.00001 XLM</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {fiatAmount ? parseFloat(fiatAmount).toFixed(2) : '0.00'} {fiatCurrency}
            </Text>
          </View>
        </View>

        {/* Payment Methods Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Accepted Payment Methods</Text>
          <Text style={styles.infoText}>• Credit/Debit Card</Text>
          <Text style={styles.infoText}>• Bank Transfer</Text>
          <Text style={styles.infoText}>• Apple Pay / Google Pay</Text>
        </View>

        {/* Buy Button */}
        <TouchableOpacity
          style={[
            styles.buyButton,
            (!fiatAmount || isLoading) && styles.buyButtonDisabled,
          ]}
          onPress={handleBuyCrypto}
          disabled={!fiatAmount || isLoading}
        >
          <Text style={styles.buyButtonText}>
            {isLoading ? 'Processing...' : 'Continue to Payment'}
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          By continuing, you agree to Ramp Network's terms of service. Daash does not
          custody your funds during this transaction.
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
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  warningContent: {
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
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
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
    color: '#111827',
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
  buyButton: {
    backgroundColor: '#8A784E',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
});

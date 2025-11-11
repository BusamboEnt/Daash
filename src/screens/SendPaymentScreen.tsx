import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useWallet } from '../context/WalletContext';
import { Send, X, ChevronDown } from 'lucide-react-native';
import { StellarService } from '../services/stellarService';
import { StellarAsset, STELLAR_ASSETS } from '../types/wallet';

interface SendPaymentScreenProps {
  onClose: () => void;
}

interface AssetOption {
  asset: StellarAsset;
  balance: string;
}

const SendPaymentScreen: React.FC<SendPaymentScreenProps> = ({ onClose }) => {
  const wallet = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StellarAsset>(STELLAR_ASSETS.XLM);
  const [availableAssets, setAvailableAssets] = useState<AssetOption[]>([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Load available assets on mount
  useEffect(() => {
    loadAvailableAssets();
  }, [wallet.wallet?.publicKey]);

  const loadAvailableAssets = async () => {
    if (!wallet.wallet?.publicKey) return;

    try {
      setLoadingAssets(true);
      const balances = await StellarService.getAllBalances(wallet.wallet.publicKey);

      const assets: AssetOption[] = balances.map((balance) => {
        if (balance.asset_type === 'native') {
          return {
            asset: STELLAR_ASSETS.XLM,
            balance: balance.balance,
          };
        } else {
          // Check if it's USDC
          const usdcAsset = StellarService.getUSDCAsset();
          if (balance.asset_code === usdcAsset.code && balance.asset_issuer === usdcAsset.issuer) {
            return {
              asset: usdcAsset,
              balance: balance.balance,
            };
          }

          // Other assets
          return {
            asset: {
              code: balance.asset_code || 'Unknown',
              issuer: balance.asset_issuer,
              name: balance.asset_code || 'Unknown Asset',
              type: balance.asset_type as any,
              isNative: false,
            },
            balance: balance.balance,
          };
        }
      });

      setAvailableAssets(assets);

      // Set initial selected asset to first one (usually XLM)
      if (assets.length > 0) {
        setSelectedAsset(assets[0].asset);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      setAvailableAssets([{
        asset: STELLAR_ASSETS.XLM,
        balance: wallet.balance,
      }]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const getSelectedAssetBalance = (): string => {
    const assetOption = availableAssets.find(
      (a) => a.asset.code === selectedAsset.code && a.asset.issuer === selectedAsset.issuer
    );
    return assetOption?.balance || '0';
  };

  const handleSend = async () => {
    // Validation
    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter a recipient address');
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const availableBalance = parseFloat(getSelectedAssetBalance());

    if (amountNum > availableBalance) {
      Alert.alert('Error', `Insufficient ${selectedAsset.code} balance`);
      return;
    }

    // Confirm transaction
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedAsset.code} to:\n${recipient.substring(0, 8)}...${recipient.substring(
        recipient.length - 8
      )}${memo ? `\nMemo: ${memo}` : ''}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setIsSending(true);

              // Use the new sendPaymentWithAsset method if not XLM
              let txHash: string;
              if (selectedAsset.isNative) {
                // Use old method for XLM
                txHash = await wallet.sendPayment(recipient.trim(), amount, memo || undefined);
              } else {
                // Use new method for other assets
                if (!wallet.wallet?.secretKey) {
                  throw new Error('Wallet secret key not available');
                }
                txHash = await StellarService.sendPaymentWithAsset(
                  wallet.wallet.secretKey,
                  recipient.trim(),
                  amount,
                  selectedAsset,
                  memo || undefined
                );
              }

              Alert.alert('Success', `Transaction sent!\nHash: ${txHash.substring(0, 16)}...`, [
                {
                  text: 'OK',
                  onPress: onClose,
                },
              ]);

              // Refresh balance
              await wallet.refreshBalance();
            } catch (error) {
              console.error('Error sending payment:', error);
              Alert.alert('Error', 'Failed to send payment. Please try again.');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Send Payment</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {loadingAssets ? '...' : parseFloat(getSelectedAssetBalance()).toFixed(2)} {selectedAsset.code}
          </Text>
        </View>

        {/* Asset Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Asset</Text>
          <TouchableOpacity
            style={styles.assetSelector}
            onPress={() => setShowAssetPicker(!showAssetPicker)}
          >
            <Text style={styles.assetSelectorText}>{selectedAsset.code}</Text>
            <ChevronDown size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Asset Picker Dropdown */}
          {showAssetPicker && availableAssets.length > 0 && (
            <View style={styles.assetPicker}>
              {availableAssets.map((assetOption, index) => (
                <TouchableOpacity
                  key={`${assetOption.asset.code}-${index}`}
                  style={[
                    styles.assetOption,
                    selectedAsset.code === assetOption.asset.code && styles.assetOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAsset(assetOption.asset);
                    setShowAssetPicker(false);
                  }}
                >
                  <View>
                    <Text style={styles.assetOptionCode}>{assetOption.asset.code}</Text>
                    <Text style={styles.assetOptionName}>{assetOption.asset.name}</Text>
                  </View>
                  <Text style={styles.assetOptionBalance}>
                    {parseFloat(assetOption.balance).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput
            style={styles.input}
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            placeholderTextColor="#9CA3AF"
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount ({selectedAsset.code})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Memo (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a note"
            placeholderTextColor="#9CA3AF"
            value={memo}
            onChangeText={setMemo}
            maxLength={28}
          />
          <Text style={styles.helperText}>Maximum 28 characters</Text>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send Payment</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Double-check the recipient address before sending.
          </Text>
          <Text style={styles.disclaimerText}>
            Transactions on the Stellar network are irreversible.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A784E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#6B9F6E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#F5F5F5',
    lineHeight: 18,
    marginBottom: 4,
  },
  assetSelector: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetSelectorText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assetPicker: {
    marginTop: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  assetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  assetOptionSelected: {
    backgroundColor: 'rgba(107, 159, 110, 0.2)',
  },
  assetOptionCode: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  assetOptionName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assetOptionBalance: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SendPaymentScreen;

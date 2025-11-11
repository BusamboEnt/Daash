import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Plus } from 'lucide-react-native';
import { StellarService } from '../services/stellarService';
import { WalletBalance } from '../types/wallet';

interface AdvancedBalanceCardProps {
  balance?: number;
  currency?: string;
  percentageChange?: number;
  onCashOut?: () => void;
  onDeposit?: () => void;
  onAddAsset?: () => void;
  isLoading?: boolean;
  showEyeIcon?: boolean;
  publicKey?: string;
}

interface AssetDisplay {
  code: string;
  balance: string;
  icon: string;
}

const AdvancedBalanceCard: React.FC<AdvancedBalanceCardProps> = ({
  balance = 58892.05,
  currency = 'R',
  percentageChange = 12.76,
  onCashOut,
  onDeposit,
  onAddAsset,
  isLoading = false,
  showEyeIcon = true,
  publicKey,
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [assets, setAssets] = useState<AssetDisplay[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadAssets();
    }
  }, [publicKey, balance]); // Reload when balance changes (e.g., after adding assets)

  const loadAssets = async () => {
    if (!publicKey) return;

    try {
      setLoadingAssets(true);
      const balances = await StellarService.getAllBalances(publicKey);

      const displayAssets: AssetDisplay[] = balances.map((bal) => {
        if (bal.asset_type === 'native') {
          return {
            code: 'XLM',
            balance: parseFloat(bal.balance).toFixed(2),
            icon: '⭐',
          };
        } else {
          let icon = '💵';
          if (bal.asset_code === 'USDC') icon = '💵';
          return {
            code: bal.asset_code || 'Unknown',
            balance: parseFloat(bal.balance).toFixed(2),
            icon,
          };
        }
      });

      setAssets(displayAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Format balance with currency and thousands separator
  const formatBalance = (amount: number) => {
    return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
  };

  // Format percentage change
  const formatPercentage = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View style={styles.container}>
      {/* Balance Label */}
      <Text style={styles.balanceLabel}>YOUR BALANCE</Text>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        {/* Balance Display Section */}
        <View style={styles.balanceSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {isBalanceVisible ? formatBalance(balance) : '••••••'}
                </Text>
                {showEyeIcon && (
                  <TouchableOpacity
                    onPress={toggleBalanceVisibility}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {isBalanceVisible ? (
                      <Eye size={24} color="#FFFFFF" />
                    ) : (
                      <EyeOff size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Percentage Change Indicator */}
              {percentageChange !== null && isBalanceVisible && (
                <View style={styles.changeContainer}>
                  {percentageChange >= 0 ? (
                    <TrendingUp size={16} color="#6B9F6E" />
                  ) : (
                    <TrendingDown size={16} color="#FF6B6B" />
                  )}
                  <Text style={[
                    styles.changeText,
                    { color: percentageChange >= 0 ? '#6B9F6E' : '#FF6B6B' }
                  ]}>
                    {formatPercentage(percentageChange)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cashOutButton]}
            onPress={onCashOut}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <ArrowUp size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Cash Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={onDeposit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <ArrowDown size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Deposit</Text>
          </TouchableOpacity>
        </View>

        {/* Assets Section */}
        {publicKey && (
          <>
            <View style={styles.assetsDivider} />
            <View style={styles.assetsSection}>
              <Text style={styles.assetsTitle}>YOUR ASSETS</Text>

              {loadingAssets ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.assetsLoader} />
              ) : (
                <>
                  {assets.map((asset, index) => (
                    <View key={`${asset.code}-${index}`} style={styles.assetItem}>
                      <View style={styles.assetIcon}>
                        <Text style={styles.assetIconText}>{asset.icon}</Text>
                      </View>
                      <View style={styles.assetInfo}>
                        <Text style={styles.assetCode}>{asset.code}</Text>
                      </View>
                      <Text style={styles.assetBalance}>{asset.balance}</Text>
                    </View>
                  ))}

                  {onAddAsset && (
                    <TouchableOpacity
                      style={styles.addAssetButton}
                      onPress={onAddAsset}
                      activeOpacity={0.8}
                    >
                      <Plus size={16} color="#6B9F6E" />
                      <Text style={styles.addAssetText}>Add Asset (e.g., USDC)</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  balanceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceSection: {
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
    flex: 1,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 6,
  },
  cashOutButton: {
    backgroundColor: '#6B9F6E',
  },
  depositButton: {
    backgroundColor: '#6B9F6E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  assetsDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 20,
  },
  assetsSection: {
    marginTop: 4,
  },
  assetsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  assetsLoader: {
    marginVertical: 20,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
  },
  assetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 20,
  },
  assetInfo: {
    flex: 1,
  },
  assetCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
  },
  addAssetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B9F6E',
    marginLeft: 6,
  },
});

export default AdvancedBalanceCard;

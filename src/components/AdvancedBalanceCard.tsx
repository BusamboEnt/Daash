import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react-native';

interface AdvancedBalanceCardProps {
  balance?: number;
  currency?: string;
  percentageChange?: number;
  onCashOut?: () => void;
  onDeposit?: () => void;
  isLoading?: boolean;
  showEyeIcon?: boolean;
}

const AdvancedBalanceCard: React.FC<AdvancedBalanceCardProps> = ({
  balance = 58892.05,
  currency = 'R',
  percentageChange = 12.76,
  onCashOut,
  onDeposit,
  isLoading = false,
  showEyeIcon = true,
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

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
});

export default AdvancedBalanceCard;

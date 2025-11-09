import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BalanceCardProps {
  balance?: number;
  onCashOut?: () => void;
  onDeposit?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance = 58892.05,
  onCashOut,
  onDeposit
}) => {
  // Format balance with currency and thousands separator
  const formatBalance = (amount: number) => {
    return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
  };

  return (
    <View style={styles.container}>
      {/* Balance Label */}
      <Text style={styles.balanceLabel}>YOUR BALANCE</Text>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        {/* Balance Amount */}
        <Text style={styles.balanceAmount}>{formatBalance(balance)}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cashOutButton}
            onPress={onCashOut}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cash Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.depositButton}
            onPress={onDeposit}
            activeOpacity={0.8}
          >
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
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: -1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cashOutButton: {
    flex: 1,
    backgroundColor: '#6B9F6E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#6B9F6E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BalanceCard;

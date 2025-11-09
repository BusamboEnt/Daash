import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Transaction } from '../types/wallet';
import { StellarService } from '../services/stellarService';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react-native';

interface TransactionListProps {
  publicKey: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ publicKey }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [publicKey]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const txs = await StellarService.getTransactions(publicKey, 20);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSent = item.source_account === publicKey;

    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View
          style={[styles.iconContainer, isSent ? styles.sentIcon : styles.receivedIcon]}
        >
          {isSent ? (
            <ArrowUp size={20} color="#FFFFFF" />
          ) : (
            <ArrowDown size={20} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{isSent ? 'Sent' : 'Received'}</Text>
          <Text style={styles.transactionHash} numberOfLines={1} ellipsizeMode="middle">
            {item.hash}
          </Text>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[styles.amount, isSent && styles.sentAmount]}>
            {isSent ? '-' : '+'} {item.amount || '—'} XLM
          </Text>
          <Text style={styles.time}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Clock size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No transactions yet</Text>
      <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
    </View>
  );

  if (isLoading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sentIcon: {
    backgroundColor: '#FF6B6B',
  },
  receivedIcon: {
    backgroundColor: '#6B9F6E',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionHash: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B9F6E',
    marginBottom: 4,
  },
  sentAmount: {
    color: '#FF6B6B',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TransactionList;

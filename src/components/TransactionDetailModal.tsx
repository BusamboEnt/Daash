import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import {
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  CheckCircle,
  Calendar,
  Hash,
  User,
} from 'lucide-react-native';
import { Transaction } from '../types/wallet';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  userPublicKey: string;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  userPublicKey,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const isSent = transaction.source_account === userPublicKey;
  const otherAccount = isSent ? transaction.to : transaction.from;

  const handleCopy = (text: string, fieldName: string) => {
    // In a real app, you'd use Clipboard from @react-native-clipboard/clipboard
    console.log('Copied:', text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://stellarchain.io/transactions/${transaction.hash}`;
    Linking.openURL(explorerUrl);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={styles.statusSection}>
            <View
              style={[
                styles.statusIcon,
                isSent ? styles.sentBackground : styles.receivedBackground,
              ]}
            >
              {isSent ? (
                <ArrowUp size={32} color="#FFFFFF" />
              ) : (
                <ArrowDown size={32} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.statusTitle}>{isSent ? 'Sent' : 'Received'}</Text>
            <Text style={[styles.statusAmount, isSent && styles.sentAmount]}>
              {isSent ? '-' : '+'} {transaction.amount || '—'} XLM
            </Text>
            <View style={styles.statusBadge}>
              <CheckCircle size={16} color="#34C759" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          {/* Transaction Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transaction Information</Text>

            {/* Date & Time */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Calendar size={20} color="#8A784E" />
                <Text style={styles.infoLabel}>Date & Time</Text>
              </View>
              <Text style={styles.infoValue}>{formatFullDate(transaction.created_at)}</Text>
            </View>

            <View style={styles.divider} />

            {/* From Address */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <User size={20} color="#8A784E" />
                <Text style={styles.infoLabel}>From</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formatAddress(transaction.source_account)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() => handleCopy(transaction.source_account, 'from')}
            >
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {transaction.source_account}
              </Text>
              {copiedField === 'from' ? (
                <CheckCircle size={18} color="#34C759" />
              ) : (
                <Copy size={18} color="#8A784E" />
              )}
            </TouchableOpacity>

            {otherAccount && (
              <>
                <View style={styles.divider} />

                {/* To Address */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <User size={20} color="#8A784E" />
                    <Text style={styles.infoLabel}>To</Text>
                  </View>
                  <View style={styles.infoRight}>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {formatAddress(otherAccount)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addressContainer}
                  onPress={() => handleCopy(otherAccount, 'to')}
                >
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                    {otherAccount}
                  </Text>
                  {copiedField === 'to' ? (
                    <CheckCircle size={18} color="#34C759" />
                  ) : (
                    <Copy size={18} color="#8A784E" />
                  )}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider} />

            {/* Transaction Hash */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Hash size={20} color="#8A784E" />
                <Text style={styles.infoLabel}>Transaction Hash</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() => handleCopy(transaction.hash, 'hash')}
            >
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {transaction.hash}
              </Text>
              {copiedField === 'hash' ? (
                <CheckCircle size={18} color="#34C759" />
              ) : (
                <Copy size={18} color="#8A784E" />
              )}
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.explorerButton} onPress={handleViewOnExplorer}>
            <ExternalLink size={20} color="#8A784E" />
            <Text style={styles.explorerButtonText}>View on Stellar Explorer</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 12,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sentBackground: {
    backgroundColor: '#FF6B6B',
  },
  receivedBackground: {
    backgroundColor: '#6B9F6E',
  },
  statusTitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statusAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B9F6E',
    marginBottom: 12,
  },
  sentAmount: {
    color: '#FF6B6B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  explorerButtonText: {
    fontSize: 16,
    color: '#8A784E',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default TransactionDetailModal;

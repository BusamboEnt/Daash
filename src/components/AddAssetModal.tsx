/**
 * Add Asset Modal
 *
 * Allows users to add new assets (trustlines) to their Stellar wallet.
 * Currently supports USDC with ability to add more assets later.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StellarService } from '../services/stellarService';
import { StellarAsset, STELLAR_ASSETS } from '../types/wallet';
import { SecureStorageService } from '../services/secureStorage';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
  publicKey: string;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  visible,
  onClose,
  onAssetAdded,
  publicKey,
}) => {
  const [loading, setLoading] = useState(false);

  // Get USDC based on current network
  const usdcAsset = StellarService.getUSDCAsset();

  const handleAddAsset = async (asset: StellarAsset) => {
    try {
      setLoading(true);

      // Get secret key from secure storage
      const secretKey = await SecureStorageService.getSecretKey();
      if (!secretKey) {
        Alert.alert(
          'Error',
          'Could not retrieve wallet credentials. Please try again.'
        );
        setLoading(false);
        return;
      }

      // Check if already has trustline
      const hasTrustline = await StellarService.hasTrustline(
        publicKey,
        asset
      );

      if (hasTrustline) {
        Alert.alert(
          'Asset Already Added',
          `You already have ${asset.code} in your wallet.`
        );
        setLoading(false);
        return;
      }

      // Create trustline
      const txHash = await StellarService.createTrustline(secretKey, asset);

      console.log('Trustline created:', txHash);

      Alert.alert(
        'Asset Added Successfully',
        `${asset.code} has been added to your wallet. You can now receive and hold ${asset.code}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onAssetAdded();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding asset:', error);
      Alert.alert(
        'Failed to Add Asset',
        error.message || 'An error occurred while adding the asset. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Asset</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Add USDC to your wallet to hold and transact with it on the Stellar network.
            </Text>

            {/* USDC Asset Card */}
            <View style={styles.assetCard}>
              <View style={styles.assetIcon}>
                <Text style={styles.assetIconText}>💵</Text>
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetCode}>{usdcAsset.code}</Text>
                <Text style={styles.assetName}>{usdcAsset.name}</Text>
                <Text style={styles.assetDescription}>{usdcAsset.description}</Text>
                {StellarService.isTestnet() && (
                  <Text style={styles.testnetBadge}>TESTNET</Text>
                )}
              </View>
            </View>

            {/* Big Add Button */}
            <TouchableOpacity
              style={[styles.addButton, loading && styles.addButtonDisabled]}
              onPress={() => handleAddAsset(usdcAsset)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonText}>+ Add USDC to Wallet</Text>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ About Trustlines</Text>
              <Text style={styles.infoText}>
                • Requires a small XLM reserve (~0.5 XLM){'\n'}
                • Reserve is returned when you remove the asset{'\n'}
                • Your balance will show 0 until you receive USDC
              </Text>
            </View>

            {/* Coming Soon */}
            <View style={styles.comingSoonBox}>
              <Text style={styles.comingSoonText}>
                More assets coming soon
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 3,
    borderTopColor: '#FFD700',
  },
  modalContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#FFD700',
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.9,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  assetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  assetIconText: {
    fontSize: 32,
  },
  assetInfo: {
    flex: 1,
  },
  assetCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  assetName: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.9,
  },
  assetDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  testnetBadge: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '700',
    marginTop: 6,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  comingSoonBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  comingSoonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.6,
  },
});

export default AddAssetModal;

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
  ScrollView,
  Alert,
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
  const [selectedAsset, setSelectedAsset] = useState<StellarAsset | null>(null);

  // Get USDC based on current network
  const usdcAsset = StellarService.getUSDCAsset();

  const handleAddAsset = async (asset: StellarAsset) => {
    try {
      setLoading(true);
      setSelectedAsset(asset);

      // Get secret key from secure storage
      const secretKey = await SecureStorageService.getSecretKey();
      if (!secretKey) {
        Alert.alert(
          'Error',
          'Could not retrieve wallet credentials. Please try again.'
        );
        setLoading(false);
        setSelectedAsset(null);
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
        setSelectedAsset(null);
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
      setSelectedAsset(null);
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
            Add assets to your wallet to hold and transact with them on the Stellar network.
          </Text>

          <ScrollView style={styles.assetList} showsVerticalScrollIndicator={false}>
            {/* USDC Asset */}
            <View style={styles.assetCardWrapper}>
              <TouchableOpacity
                style={[
                  styles.assetCard,
                  loading && selectedAsset?.code === usdcAsset.code && styles.assetCardLoading,
                ]}
                onPress={() => handleAddAsset(usdcAsset)}
                disabled={loading}
                activeOpacity={0.7}
              >
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
              </TouchableOpacity>

              {/* Add Button - Separate for better visibility */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  loading && selectedAsset?.code === usdcAsset.code && styles.addButtonLoading,
                ]}
                onPress={() => handleAddAsset(usdcAsset)}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading && selectedAsset?.code === usdcAsset.code ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>+ Add to Wallet</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Coming Soon Section */}
            <View style={styles.comingSoonSection}>
              <Text style={styles.comingSoonTitle}>More Assets Coming Soon</Text>
              <Text style={styles.comingSoonText}>
                Additional Stellar assets will be available in future updates.
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ About Trustlines</Text>
              <Text style={styles.infoText}>
                On Stellar, you need to create a "trustline" to hold non-native assets like USDC. This tells the network you trust the issuer and want to hold their asset.
              </Text>
              <Text style={styles.infoText}>
                • Requires a small XLM reserve (~0.5 XLM)
              </Text>
              <Text style={styles.infoText}>
                • Reserve is returned when you remove the asset
              </Text>
              <Text style={styles.infoText}>
                • Your balance will show 0 until you receive the asset
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 34, // For safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    lineHeight: 20,
  },
  assetList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetCardWrapper: {
    marginBottom: 16,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  assetCardLoading: {
    opacity: 0.6,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 28,
  },
  assetInfo: {
    flex: 1,
  },
  assetCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  assetDescription: {
    fontSize: 12,
    color: '#999',
  },
  testnetBadge: {
    fontSize: 10,
    color: '#ff9800',
    fontWeight: '600',
    marginTop: 4,
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonLoading: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  comingSoonSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default AddAssetModal;

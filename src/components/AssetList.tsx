/**
 * Asset List Component
 *
 * Displays all assets in the user's Stellar wallet (XLM, USDC, etc.)
 * with their balances and an option to add more assets.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StellarService } from '../services/stellarService';
import { WalletBalance } from '../types/wallet';

interface AssetListProps {
  publicKey: string;
  onAddAsset: () => void;
  onRefresh?: () => void;
}

interface AssetDisplay {
  code: string;
  balance: string;
  icon: string;
  name: string;
  isNative: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ publicKey, onAddAsset, onRefresh }) => {
  const [assets, setAssets] = useState<AssetDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [publicKey]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const balances = await StellarService.getAllBalances(publicKey);

      // Convert balances to display format
      const displayAssets: AssetDisplay[] = balances.map((balance) => {
        if (balance.asset_type === 'native') {
          return {
            code: 'XLM',
            balance: parseFloat(balance.balance).toFixed(2),
            icon: '⭐',
            name: 'Stellar Lumens',
            isNative: true,
          };
        } else {
          // USDC or other assets
          let icon = '💵';
          let name = balance.asset_code || 'Unknown';

          if (balance.asset_code === 'USDC') {
            icon = '💵';
            name = 'USD Coin';
          }

          return {
            code: balance.asset_code || 'Unknown',
            balance: parseFloat(balance.balance).toFixed(2),
            icon,
            name,
            isNative: false,
          };
        }
      });

      setAssets(displayAssets);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const renderAssetItem = ({ item }: { item: AssetDisplay }) => (
    <View style={styles.assetItem}>
      <View style={styles.assetIcon}>
        <Text style={styles.assetIconText}>{item.icon}</Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetCode}>{item.code}</Text>
        <Text style={styles.assetName}>{item.name}</Text>
      </View>
      <View style={styles.assetBalance}>
        <Text style={styles.balanceText}>{item.balance}</Text>
        <Text style={styles.balanceCodeText}>{item.code}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading assets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Assets</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadAssets}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {assets.length > 0 ? (
        <FlatList
          data={assets}
          renderItem={renderAssetItem}
          keyExtractor={(item, index) => `${item.code}-${index}`}
          style={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No assets found</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addAssetButton} onPress={onAddAsset}>
        <Text style={styles.addAssetButtonIcon}>➕</Text>
        <Text style={styles.addAssetButtonText}>Add Asset (e.g., USDC)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  list: {
    marginBottom: 12,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 24,
  },
  assetInfo: {
    flex: 1,
  },
  assetCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 12,
    color: '#666',
  },
  assetBalance: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  balanceCodeText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginTop: 8,
  },
  addAssetButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addAssetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AssetList;

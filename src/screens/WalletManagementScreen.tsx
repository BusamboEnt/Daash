import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Key, Download, Upload, Eye, EyeOff, Trash2, RefreshCw, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const WalletManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const handleViewSeedPhrase = () => {
    Alert.alert(
      'View Recovery Phrase',
      'Make sure no one is watching your screen. Your recovery phrase gives full access to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Show', onPress: () => setShowSeedPhrase(true) },
      ]
    );
  };

  const handleExportWallet = () => {
    Alert.alert(
      'Export Wallet',
      'This will export your wallet data. Keep it secure!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export wallet') },
      ]
    );
  };

  const handleBackupWallet = () => {
    console.log('Backup wallet');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Your wallet will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => console.log('Clear cache') },
      ]
    );
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure? Make sure you have backed up your recovery phrase. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Delete wallet'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Management</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleViewSeedPhrase}>
            <View style={styles.menuItemLeft}>
              {showSeedPhrase ? (
                <Eye size={24} color="#8A784E" />
              ) : (
                <EyeOff size={24} color="#8A784E" />
              )}
              <Text style={styles.menuItemText}>View Recovery Phrase</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleBackupWallet}>
            <View style={styles.menuItemLeft}>
              <Upload size={24} color="#8A784E" />
              <Text style={styles.menuItemText}>Backup Wallet</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleExportWallet}>
            <View style={styles.menuItemLeft}>
              <Download size={24} color="#8A784E" />
              <Text style={styles.menuItemText}>Export Private Key</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Maintenance Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maintenance</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
            <View style={styles.menuItemLeft}>
              <RefreshCw size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Clear Cache</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>

          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteWallet}>
            <View style={styles.menuItemLeft}>
              <Trash2 size={24} color="#FF3B30" />
              <Text style={styles.dangerText}>Delete Wallet</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            Warning: Deleting your wallet will remove all data from this device. Make sure you
            have backed up your recovery phrase.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
  },
  dangerItem: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  dangerText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    color: '#FF9500',
    lineHeight: 18,
    backgroundColor: '#FFF5E5',
    padding: 12,
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default WalletManagementScreen;

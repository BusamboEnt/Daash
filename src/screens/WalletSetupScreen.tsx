import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useWallet } from '../context/WalletContext';
import { Wallet, Download, AlertCircle } from 'lucide-react-native';

interface WalletSetupScreenProps {
  onComplete: () => void;
}

const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({ onComplete }) => {
  const wallet = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      await wallet.createWallet();

      // Fund testnet account automatically
      if (wallet.wallet) {
        await wallet.fundTestnetAccount();
      }

      Alert.alert(
        'Wallet Created!',
        'Your wallet has been created and funded with testnet XLM. Please save your secret key securely.',
        [
          {
            text: 'OK',
            onPress: onComplete,
          },
        ]
      );
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = () => {
    Alert.prompt(
      'Import Wallet',
      'Enter your secret key (starts with S)',
      async (secretKey) => {
        if (!secretKey) return;

        try {
          setIsCreating(true);
          await wallet.importWallet(secretKey.trim());

          Alert.alert(
            'Wallet Imported!',
            'Your wallet has been imported successfully.',
            [
              {
                text: 'OK',
                onPress: onComplete,
              },
            ]
          );
        } catch (error) {
          console.error('Error importing wallet:', error);
          Alert.alert('Error', 'Invalid secret key. Please check and try again.');
        } finally {
          setIsCreating(false);
        }
      },
      'plain-text'
    );
  };

  if (isCreating || wallet.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Setting up your wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Wallet size={80} color="#FFFFFF" />
        <Text style={styles.title}>Welcome to Daash</Text>
        <Text style={styles.subtitle}>Your Stellar Wallet</Text>
      </View>

      <View style={styles.infoBox}>
        <AlertCircle size={20} color="#6B9F6E" />
        <Text style={styles.infoText}>
          You need a wallet to send and receive XLM on the Stellar network.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreateWallet}>
        <Wallet size={24} color="#FFFFFF" />
        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonTitle}>Create New Wallet</Text>
          <Text style={styles.buttonSubtitle}>Generate a new Stellar account</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleImportWallet}>
        <Download size={24} color="#FFFFFF" />
        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonTitle}>Import Wallet</Text>
          <Text style={styles.buttonSubtitle}>Use your existing secret key</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          🔒 Your secret key is stored securely on your device and never leaves it.
        </Text>
        <Text style={styles.disclaimerText}>
          ⚠️ Testnet Mode: This wallet uses Stellar testnet for development.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A784E',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#8A784E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#F5F5F5',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(107, 159, 110, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  disclaimer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#F5F5F5',
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default WalletSetupScreen;

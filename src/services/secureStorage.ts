import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const WALLET_SECRET_KEY = 'stellar_wallet_secret_key';
const WALLET_PUBLIC_KEY = 'stellar_wallet_public_key';

export class SecureStorageService {
  /**
   * Save wallet keys securely
   */
  static async saveWalletKeys(publicKey: string, secretKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(WALLET_PUBLIC_KEY, publicKey);
      await SecureStore.setItemAsync(WALLET_SECRET_KEY, secretKey);
    } catch (error) {
      console.error('Error saving wallet keys:', error);
      throw new Error('Failed to save wallet keys securely');
    }
  }

  /**
   * Get wallet public key
   */
  static async getPublicKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(WALLET_PUBLIC_KEY);
    } catch (error) {
      console.error('Error retrieving public key:', error);
      return null;
    }
  }

  /**
   * Get wallet secret key
   */
  static async getSecretKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(WALLET_SECRET_KEY);
    } catch (error) {
      console.error('Error retrieving secret key:', error);
      return null;
    }
  }

  /**
   * Check if wallet exists
   */
  static async hasWallet(): Promise<boolean> {
    try {
      const publicKey = await SecureStore.getItemAsync(WALLET_PUBLIC_KEY);
      const secretKey = await SecureStore.getItemAsync(WALLET_SECRET_KEY);
      return !!(publicKey && secretKey);
    } catch (error) {
      console.error('Error checking wallet existence:', error);
      return false;
    }
  }

  /**
   * Delete wallet keys (use with caution!)
   */
  static async deleteWallet(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(WALLET_PUBLIC_KEY);
      await SecureStore.deleteItemAsync(WALLET_SECRET_KEY);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }

  /**
   * Get both keys
   */
  static async getWalletKeys(): Promise<{ publicKey: string; secretKey: string } | null> {
    try {
      const publicKey = await SecureStore.getItemAsync(WALLET_PUBLIC_KEY);
      const secretKey = await SecureStore.getItemAsync(WALLET_SECRET_KEY);

      if (publicKey && secretKey) {
        return { publicKey, secretKey };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving wallet keys:', error);
      return null;
    }
  }
}

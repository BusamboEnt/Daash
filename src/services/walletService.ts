import * as StellarSdk from '@stellar/stellar-sdk/minimal';
import { SecureStorageService } from './secureStorage';
import { StellarWallet } from '../types/wallet';

export class WalletService {
  /**
   * Generate a new Stellar keypair
   */
  static generateKeypair(): StellarSdk.Keypair {
    return StellarSdk.Keypair.random();
  }

  /**
   * Create and save a new wallet
   */
  static async createWallet(): Promise<StellarWallet> {
    try {
      // Generate new keypair
      const keypair = this.generateKeypair();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();

      // Save to secure storage
      await SecureStorageService.saveWalletKeys(publicKey, secretKey);

      return {
        publicKey,
        secretKey,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Load existing wallet from secure storage
   */
  static async loadWallet(): Promise<StellarWallet | null> {
    try {
      const keys = await SecureStorageService.getWalletKeys();
      if (!keys) {
        return null;
      }

      return {
        publicKey: keys.publicKey,
        secretKey: keys.secretKey,
      };
    } catch (error) {
      console.error('Error loading wallet:', error);
      return null;
    }
  }

  /**
   * Check if wallet exists
   */
  static async hasWallet(): Promise<boolean> {
    return await SecureStorageService.hasWallet();
  }

  /**
   * Delete wallet (use with extreme caution!)
   */
  static async deleteWallet(): Promise<void> {
    await SecureStorageService.deleteWallet();
  }

  /**
   * Get keypair from secret key
   */
  static getKeypairFromSecret(secretKey: string): StellarSdk.Keypair {
    return StellarSdk.Keypair.fromSecret(secretKey);
  }

  /**
   * Validate Stellar public key
   */
  static isValidPublicKey(publicKey: string): boolean {
    return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey);
  }

  /**
   * Validate Stellar secret key
   */
  static isValidSecretKey(secretKey: string): boolean {
    return StellarSdk.StrKey.isValidEd25519SecretSeed(secretKey);
  }

  /**
   * Import wallet from secret key
   */
  static async importWallet(secretKey: string): Promise<StellarWallet> {
    try {
      // Validate secret key
      if (!this.isValidSecretKey(secretKey)) {
        throw new Error('Invalid secret key');
      }

      // Get keypair from secret
      const keypair = this.getKeypairFromSecret(secretKey);
      const publicKey = keypair.publicKey();

      // Save to secure storage
      await SecureStorageService.saveWalletKeys(publicKey, secretKey);

      return {
        publicKey,
        secretKey,
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Failed to import wallet');
    }
  }
}

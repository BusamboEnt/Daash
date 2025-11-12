import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const SETTINGS_KEY = '@daash_settings';

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  notificationsEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pin?: string;
  autoLockTimeout: number; // in minutes
  language: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  currency: 'USD',
  notificationsEnabled: true,
  pushNotifications: true,
  emailNotifications: true,
  biometricEnabled: false,
  pinEnabled: false,
  autoLockTimeout: 5,
  language: 'English',
};

export class SettingsService {
  /**
   * Load settings from storage
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        return { ...DEFAULT_SETTINGS, ...settings };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to storage
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Update a specific setting
   */
  static async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    const settings = await this.loadSettings();
    settings[key] = value;
    await this.saveSettings(settings);
  }

  /**
   * Reset all settings to defaults
   */
  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get biometric type (Face ID, Touch ID, etc.)
   */
  static async getBiometricType(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      return 'Biometric';
    } catch (error) {
      return 'Biometric';
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Daash',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  /**
   * Set PIN
   */
  static async setPIN(pin: string): Promise<void> {
    const settings = await this.loadSettings();
    settings.pin = pin;
    settings.pinEnabled = true;
    await this.saveSettings(settings);
  }

  /**
   * Verify PIN
   */
  static async verifyPIN(pin: string): Promise<boolean> {
    const settings = await this.loadSettings();
    return settings.pin === pin;
  }

  /**
   * Clear cache
   */
  static async clearCache(): Promise<void> {
    try {
      // Clear specific cache items while preserving wallet and settings
      const keysToKeep = [SETTINGS_KEY, '@daash_wallet_public', '@daash_wallet_secret'];
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Get cache size estimate
   */
  static async getCacheSize(): Promise<string> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToCheck = allKeys.filter(
        key => key !== SETTINGS_KEY &&
               key !== '@daash_wallet_public' &&
               key !== '@daash_wallet_secret'
      );

      if (keysToCheck.length === 0) {
        return '0 KB';
      }

      const items = await AsyncStorage.multiGet(keysToCheck);
      let totalSize = 0;

      items.forEach(([key, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });

      // Convert bytes to KB or MB
      if (totalSize < 1024) {
        return `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        return `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 'Unknown';
    }
  }
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsService, AppSettings } from '../services/settingsService';
import { Alert } from 'react-native';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
  updateNotificationsEnabled: (enabled: boolean) => Promise<void>;
  updatePushNotifications: (enabled: boolean) => Promise<void>;
  updateEmailNotifications: (enabled: boolean) => Promise<void>;
  updateBiometricEnabled: (enabled: boolean) => Promise<void>;
  updatePinEnabled: (enabled: boolean) => Promise<void>;
  setPIN: (pin: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
  updateAutoLockTimeout: (timeout: number) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheSize: () => Promise<string>;
  resetSettings: () => Promise<void>;
  isBiometricAvailable: () => Promise<boolean>;
  getBiometricType: () => Promise<string>;
  authenticateWithBiometric: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    currency: 'USD',
    notificationsEnabled: true,
    pushNotifications: true,
    emailNotifications: true,
    biometricEnabled: false,
    pinEnabled: false,
    autoLockTimeout: 5,
    language: 'English',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await SettingsService.loadSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const updateTheme = async (theme: 'light' | 'dark' | 'auto') => {
    try {
      await SettingsService.updateSetting('theme', theme);
      setSettings((prev) => ({ ...prev, theme }));
    } catch (error) {
      console.error('Error updating theme:', error);
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const updateCurrency = async (currency: string) => {
    try {
      await SettingsService.updateSetting('currency', currency);
      setSettings((prev) => ({ ...prev, currency }));
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency');
    }
  };

  const updateNotificationsEnabled = async (enabled: boolean) => {
    try {
      await SettingsService.updateSetting('notificationsEnabled', enabled);
      setSettings((prev) => ({ ...prev, notificationsEnabled: enabled }));

      // If disabling all notifications, also disable push and email
      if (!enabled) {
        await SettingsService.updateSetting('pushNotifications', false);
        await SettingsService.updateSetting('emailNotifications', false);
        setSettings((prev) => ({
          ...prev,
          pushNotifications: false,
          emailNotifications: false
        }));
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      Alert.alert('Error', 'Failed to update notifications');
    }
  };

  const updatePushNotifications = async (enabled: boolean) => {
    try {
      await SettingsService.updateSetting('pushNotifications', enabled);
      setSettings((prev) => ({ ...prev, pushNotifications: enabled }));
    } catch (error) {
      console.error('Error updating push notifications:', error);
      Alert.alert('Error', 'Failed to update push notifications');
    }
  };

  const updateEmailNotifications = async (enabled: boolean) => {
    try {
      await SettingsService.updateSetting('emailNotifications', enabled);
      setSettings((prev) => ({ ...prev, emailNotifications: enabled }));
    } catch (error) {
      console.error('Error updating email notifications:', error);
      Alert.alert('Error', 'Failed to update email notifications');
    }
  };

  const updateBiometricEnabled = async (enabled: boolean) => {
    try {
      // Check if biometric is available before enabling
      if (enabled) {
        const isAvailable = await SettingsService.isBiometricAvailable();
        if (!isAvailable) {
          Alert.alert(
            'Biometric Not Available',
            'Biometric authentication is not available on this device or not set up.'
          );
          return;
        }

        // Authenticate to confirm biometric works
        const authenticated = await SettingsService.authenticateWithBiometric();
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Biometric authentication failed.');
          return;
        }
      }

      await SettingsService.updateSetting('biometricEnabled', enabled);
      setSettings((prev) => ({ ...prev, biometricEnabled: enabled }));
    } catch (error) {
      console.error('Error updating biometric:', error);
      Alert.alert('Error', 'Failed to update biometric authentication');
    }
  };

  const updatePinEnabled = async (enabled: boolean) => {
    try {
      await SettingsService.updateSetting('pinEnabled', enabled);
      setSettings((prev) => ({ ...prev, pinEnabled: enabled }));
    } catch (error) {
      console.error('Error updating PIN:', error);
      Alert.alert('Error', 'Failed to update PIN lock');
    }
  };

  const setPIN = async (pin: string) => {
    try {
      await SettingsService.setPIN(pin);
      setSettings((prev) => ({ ...prev, pin, pinEnabled: true }));
    } catch (error) {
      console.error('Error setting PIN:', error);
      Alert.alert('Error', 'Failed to set PIN');
      throw error;
    }
  };

  const verifyPIN = async (pin: string): Promise<boolean> => {
    try {
      return await SettingsService.verifyPIN(pin);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  const updateAutoLockTimeout = async (timeout: number) => {
    try {
      await SettingsService.updateSetting('autoLockTimeout', timeout);
      setSettings((prev) => ({ ...prev, autoLockTimeout: timeout }));
    } catch (error) {
      console.error('Error updating auto-lock timeout:', error);
      Alert.alert('Error', 'Failed to update auto-lock timeout');
    }
  };

  const updateLanguage = async (language: string) => {
    try {
      await SettingsService.updateSetting('language', language);
      setSettings((prev) => ({ ...prev, language }));
      Alert.alert(
        'Language Updated',
        'Language has been updated. Please restart the app for changes to take effect.'
      );
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', 'Failed to update language');
    }
  };

  const clearCache = async () => {
    try {
      await SettingsService.clearCache();
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const getCacheSize = async (): Promise<string> => {
    try {
      return await SettingsService.getCacheSize();
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 'Unknown';
    }
  };

  const resetSettings = async () => {
    try {
      await SettingsService.resetSettings();
      await loadSettings();
      Alert.alert('Success', 'Settings have been reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  const isBiometricAvailable = async (): Promise<boolean> => {
    return await SettingsService.isBiometricAvailable();
  };

  const getBiometricType = async (): Promise<string> => {
    return await SettingsService.getBiometricType();
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    return await SettingsService.authenticateWithBiometric();
  };

  const value: SettingsContextType = {
    settings,
    isLoading,
    updateTheme,
    updateCurrency,
    updateNotificationsEnabled,
    updatePushNotifications,
    updateEmailNotifications,
    updateBiometricEnabled,
    updatePinEnabled,
    setPIN,
    verifyPIN,
    updateAutoLockTimeout,
    updateLanguage,
    clearCache,
    getCacheSize,
    resetSettings,
    isBiometricAvailable,
    getBiometricType,
    authenticateWithBiometric,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

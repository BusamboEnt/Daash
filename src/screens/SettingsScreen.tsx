import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronRight, Moon, DollarSign, Bell, Lock, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useSettings } from '../contexts/SettingsContext';
import { SetPINModal, AutoLockTimeoutModal, LanguageSelectorModal } from '../components';

interface SettingsScreenProps {
  onClose?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const {
    settings,
    isLoading,
    updateTheme,
    updateCurrency,
    updateNotificationsEnabled,
    updatePushNotifications,
    updateEmailNotifications,
    updateBiometricEnabled,
    updatePinEnabled,
    setPIN: setContextPIN,
    updateAutoLockTimeout,
    updateLanguage,
    clearCache,
    getCacheSize,
    resetSettings,
  } = useSettings();

  // Modal states
  const [setPINModalVisible, setSetPINModalVisible] = useState(false);
  const [timeoutModalVisible, setTimeoutModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'auto', label: 'Auto' },
  ];

  // Load cache size on mount
  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const handlePINToggle = async (enabled: boolean) => {
    if (enabled) {
      // Show modal to set PIN
      setSetPINModalVisible(true);
    } else {
      // Disable PIN
      await updatePinEnabled(false);
    }
  };

  const handleSetPIN = async (pin: string) => {
    try {
      await setContextPIN(pin);
    } catch (error) {
      console.error('Error setting PIN:', error);
    }
  };

  const handleChangePIN = () => {
    setSetPINModalVisible(true);
  };

  const handleAutoLockTimeoutSelect = async (timeout: number) => {
    await updateAutoLockTimeout(timeout);
  };

  const handleLanguageSelect = async (language: string) => {
    await updateLanguage(language);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      `This will clear ${cacheSize} of cached data. Your wallet and settings will not be affected. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            await loadCacheSize();
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Your wallet will not be affected. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
          },
        },
      ]
    );
  };

  const getTimeoutLabel = (minutes: number): string => {
    if (minutes === 60) return '1 hour';
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A784E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (onClose) {
              onClose();
            } else {
              navigation.navigate('MainTabs' as never);
              navigation.dispatch(DrawerActions.openDrawer());
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={20} color="#8A784E" />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeContainer}>
              {themes.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeButton,
                    settings.theme === themeOption.id && styles.themeButtonActive,
                  ]}
                  onPress={() => updateTheme(themeOption.id as any)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      settings.theme === themeOption.id && styles.themeButtonTextActive,
                    ]}
                  >
                    {themeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Currency Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#8A784E" />
            <Text style={styles.sectionTitle}>Currency</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.settingLabel}>Display Currency</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyButton,
                    settings.currency === curr && styles.currencyButtonActive,
                  ]}
                  onPress={() => updateCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      settings.currency === curr && styles.currencyButtonTextActive,
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#8A784E" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingRowLabel}>Enable Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={updateNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {settings.notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingRowLabel}>Push Notifications</Text>
                  <Switch
                    value={settings.pushNotifications}
                    onValueChange={updatePushNotifications}
                    trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingRowLabel}>Email Notifications</Text>
                  <Switch
                    value={settings.emailNotifications}
                    onValueChange={updateEmailNotifications}
                    trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color="#8A784E" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingRowLabel}>Biometric Authentication</Text>
                <Text style={styles.settingRowDescription}>
                  Use Face ID or Touch ID
                </Text>
              </View>
              <Switch
                value={settings.biometricEnabled}
                onValueChange={updateBiometricEnabled}
                trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingRowLabel}>PIN Lock</Text>
                <Text style={styles.settingRowDescription}>Require PIN to open app</Text>
              </View>
              <Switch
                value={settings.pinEnabled}
                onValueChange={handlePINToggle}
                trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {settings.pinEnabled && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.settingButton} onPress={handleChangePIN}>
                  <Text style={styles.settingButtonLabel}>Change PIN</Text>
                  <ChevronRight size={20} color="#8E8E93" />
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => setTimeoutModalVisible(true)}
            >
              <Text style={styles.settingButtonLabel}>Auto-Lock Timeout</Text>
              <View style={styles.settingButtonRight}>
                <Text style={styles.settingButtonValue}>
                  {getTimeoutLabel(settings.autoLockTimeout)}
                </Text>
                <ChevronRight size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Language & Region</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => setLanguageModalVisible(true)}
            >
              <Text style={styles.settingButtonLabel}>Language</Text>
              <View style={styles.settingButtonRight}>
                <Text style={styles.settingButtonValue}>{settings.language}</Text>
                <ChevronRight size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearCache}>
              <Text style={styles.dangerButtonText}>Clear Cache ({cacheSize})</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dangerButton} onPress={handleResetSettings}>
              <Text style={styles.dangerButtonText}>Reset Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      <SetPINModal
        visible={setPINModalVisible}
        onClose={() => setSetPINModalVisible(false)}
        onPINSet={handleSetPIN}
        mode={settings.pinEnabled ? 'change' : 'set'}
        currentPIN={settings.pin}
      />

      <AutoLockTimeoutModal
        visible={timeoutModalVisible}
        onClose={() => setTimeoutModalVisible(false)}
        currentTimeout={settings.autoLockTimeout}
        onSelect={handleAutoLockTimeoutSelect}
      />

      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        currentLanguage={settings.language}
        onSelect={handleLanguageSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#8A784E',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  themeButtonTextActive: {
    color: '#FFFFFF',
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  currencyButtonActive: {
    backgroundColor: '#8A784E',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  currencyButtonTextActive: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingRowLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingRowDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingButtonLabel: {
    fontSize: 16,
    color: '#333333',
  },
  settingButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingButtonValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 12,
  },
  dangerButton: {
    paddingVertical: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;

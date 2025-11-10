import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { ChevronRight, Moon, DollarSign, Bell, Lock, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface SettingsScreenProps {
  onClose?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const navigation = useNavigation();
  // Theme Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  // Currency Settings
  const [currency, setCurrency] = useState('USD');

  // Notification Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'auto', label: 'Auto' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (onClose ? onClose() : navigation.goBack())}
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
                    theme === themeOption.id && styles.themeButtonActive,
                  ]}
                  onPress={() => setTheme(themeOption.id as any)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      theme === themeOption.id && styles.themeButtonTextActive,
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
                    currency === curr && styles.currencyButtonActive,
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      currency === curr && styles.currencyButtonTextActive,
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
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingRowLabel}>Push Notifications</Text>
                  <Switch
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                    trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingRowLabel}>Email Notifications</Text>
                  <Switch
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
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
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
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
                value={pinEnabled}
                onValueChange={setPinEnabled}
                trackColor={{ false: '#E5E5EA', true: '#8A784E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonLabel}>Change PIN</Text>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonLabel}>Auto-Lock Timeout</Text>
              <View style={styles.settingButtonRight}>
                <Text style={styles.settingButtonValue}>5 minutes</Text>
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
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonLabel}>Language</Text>
              <View style={styles.settingButtonRight}>
                <Text style={styles.settingButtonValue}>English</Text>
                <ChevronRight size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerButton}>
              <Text style={styles.dangerButtonText}>Clear Cache</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dangerButton}>
              <Text style={styles.dangerButtonText}>Reset Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
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

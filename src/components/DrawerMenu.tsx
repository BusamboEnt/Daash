import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  User,
  Settings,
  Bell,
  Shield,
  Wallet,
  HelpCircle,
  FileText,
  Info,
  LogOut,
} from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  badge?: string;
}

const DrawerMenu: React.FC<DrawerContentComponentProps> = (props) => {
  const wallet = useWallet();
  const { unreadCount } = useNotifications();

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onPress: () => props.navigation.navigate('Profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onPress: () => props.navigation.navigate('Settings'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onPress: () => props.navigation.navigate('NotificationCenter'),
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: Shield,
      onPress: () => props.navigation.navigate('KYC'),
    },
    {
      id: 'wallet',
      label: 'Wallet Management',
      icon: Wallet,
      onPress: () => props.navigation.navigate('WalletManagement'),
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      onPress: () => props.navigation.navigate('Support'),
    },
    {
      id: 'legal',
      label: 'Legal',
      icon: FileText,
      onPress: () => props.navigation.navigate('Legal'),
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      onPress: () => props.navigation.navigate('About'),
    },
  ];

  const handleLogout = () => {
    // TODO: Implement wallet lock/logout functionality
    console.log('Logout pressed');
    props.navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#8A784E" />
          </View>
          <Text style={styles.userName}>Daash User</Text>
          {wallet.wallet && (
            <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
              {wallet.wallet.publicKey}
            </Text>
          )}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {parseFloat(wallet.balance).toFixed(2)} XLM
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color="#333333" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Lock Wallet</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#8A784E',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
    marginBottom: 12,
    maxWidth: '100%',
  },
  balanceContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8A784E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  menuSection: {
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default DrawerMenu;

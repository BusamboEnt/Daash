// IMPORTANT: This must be the first import for crypto support
import './polyfills';

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Home, Search, User } from 'lucide-react-native';
import { Header, AdvancedBalanceCard, TransactionList, DrawerMenu } from './src/components';
import AssetList from './src/components/AssetList';
import AddAssetModal from './src/components/AddAssetModal';
import { WalletProvider, useWallet } from './src/context/WalletContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import NotificationService from './src/services/notificationService';
import WalletSetupScreen from './src/screens/WalletSetupScreen';
import SendPaymentScreen from './src/screens/SendPaymentScreen';
import OnRampScreen from './src/screens/OnRampScreen';
import OffRampScreen from './src/screens/OffRampScreen';
import KYCScreen from './src/screens/KYCScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';
import WalletManagementScreen from './src/screens/WalletManagementScreen';
import SupportScreen from './src/screens/SupportScreen';
import LegalScreen from './src/screens/LegalScreen';
import NotificationCenterScreen from './src/screens/NotificationCenterScreen';

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

type DrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Settings: undefined;
  KYC: undefined;
  WalletManagement: undefined;
  Support: undefined;
  Legal: undefined;
  About: undefined;
  NotificationCenter: undefined;
};

type HomeProps = BottomTabScreenProps<TabParamList, 'Home'>;
type SearchProps = BottomTabScreenProps<TabParamList, 'Search'>;
type ProfileProps = BottomTabScreenProps<TabParamList, 'Profile'>;

const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function HomeScreen({ navigation }: HomeProps) {
  const wallet = useWallet();
  const { refreshNotifications } = useNotifications();
  const [showSendPayment, setShowSendPayment] = useState(false);
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [showOffRamp, setShowOffRamp] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);

  const handleSearch = (text: string) => {
    console.log('Search:', text);
  };

  const handleMenuPress = () => {
    navigation.getParent()?.openDrawer();
  };

  const handleNotificationPress = () => {
    navigation.getParent()?.navigate('NotificationCenter' as never);
  };

  const handleCashOut = () => {
    // Show options: Send or Sell
    setShowOffRamp(true);
  };

  const handleDeposit = () => {
    console.log('Deposit pressed');
    // Show On-Ramp screen for buying crypto
    setShowOnRamp(true);
  };

  const handleTestNotification = async () => {
    // Send a test notification
    await NotificationService.notifyTransaction('received', '10.5', 'XLM');
    // Refresh to update the badge
    await refreshNotifications();
    console.log('Test notification created!');
  };

  // Parse balance as number
  const balanceNumber = parseFloat(wallet.balance) || 0;

  // Show wallet setup if no wallet
  if (!wallet.wallet && wallet.isInitialized) {
    return (
      <WalletSetupScreen
        onComplete={() => {
          // Wallet created, refresh will happen automatically
        }}
      />
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Header
        onSearch={handleSearch}
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AdvancedBalanceCard
          balance={balanceNumber}
          currency="XLM"
          percentageChange={12.76}
          onCashOut={handleCashOut}
          onDeposit={handleDeposit}
          showEyeIcon={true}
          isLoading={wallet.isLoading}
        />
        {wallet.wallet && (
          <AssetList
            publicKey={wallet.wallet.publicKey}
            onAddAsset={() => setShowAddAsset(true)}
            onRefresh={() => wallet.refreshBalance()}
          />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Daash!</Text>
          <Text style={styles.text}>
            {wallet.wallet
              ? 'Your Stellar wallet is ready'
              : 'Create a wallet to get started'}
          </Text>
          {wallet.wallet && (
            <>
              <Text style={styles.publicKeyText} numberOfLines={1} ellipsizeMode="middle">
                {wallet.wallet.publicKey}
              </Text>
              <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                <Text style={styles.testButtonText}>Test Notification</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Send Payment Modal */}
      <Modal
        visible={showSendPayment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSendPayment(false)}
      >
        <SendPaymentScreen onClose={() => setShowSendPayment(false)} />
      </Modal>

      {/* On-Ramp Modal (Buy Crypto) */}
      <Modal
        visible={showOnRamp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOnRamp(false)}
      >
        <OnRampScreen onClose={() => setShowOnRamp(false)} />
      </Modal>

      {/* Off-Ramp Modal (Sell Crypto) */}
      <Modal
        visible={showOffRamp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOffRamp(false)}
      >
        <OffRampScreen onClose={() => setShowOffRamp(false)} />
      </Modal>

      {/* Add Asset Modal */}
      {wallet.wallet?.secretKey && (
        <AddAssetModal
          visible={showAddAsset}
          onClose={() => setShowAddAsset(false)}
          onAssetAdded={() => {
            wallet.refreshBalance();
          }}
          walletSecret={wallet.wallet.secretKey}
        />
      )}
    </View>
  );
}

function SearchScreen({ navigation }: SearchProps) {
  const wallet = useWallet();

  if (!wallet.wallet) {
    return (
      <View style={styles.emptyStateContainer}>
        <Search size={64} color="#9CA3AF" />
        <Text style={styles.emptyStateText}>No wallet found</Text>
        <Text style={styles.emptyStateSubtext}>Create a wallet to view transactions</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>Transactions</Text>
      </View>
      <TransactionList publicKey={wallet.wallet.publicKey} />
    </View>
  );
}

// Tab Navigator - wraps the bottom tabs
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Home color={color} size={26} />;
          } else if (route.name === 'Search') {
            return <Search color={color} size={26} />;
          } else if (route.name === 'Profile') {
            return <User color={color} size={26} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function SplashScreen() {
  return (
    <ImageBackground
      source={require('./assets/splashscreen.png')}
      style={styles.splashContainer}
      resizeMode="cover"
    >
      <Text style={styles.splashText}>Daash</Text>
    </ImageBackground>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <WalletProvider>
      <NotificationProvider>
        <NavigationContainer>
          <Drawer.Navigator
            drawerContent={(props) => <DrawerMenu {...props} />}
            screenOptions={{
              headerShown: false,
              drawerType: 'slide',
              drawerStyle: {
                width: 300,
              },
            }}
          >
            <Drawer.Screen name="MainTabs" component={TabNavigator} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="KYC" component={KYCScreen} />
            <Drawer.Screen name="WalletManagement" component={WalletManagementScreen} />
            <Drawer.Screen name="Support" component={SupportScreen} />
            <Drawer.Screen name="Legal" component={LegalScreen} />
            <Drawer.Screen name="About" component={AboutScreen} />
            <Drawer.Screen name="NotificationCenter" component={NotificationCenterScreen} />
          </Drawer.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#8A784E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A784E',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 20,
    color: '#F5F5F5',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 10,
  },
  publicKeyText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#F5F5F5',
    marginTop: 8,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonText: {
    color: '#8A784E',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#007AFF',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  transactionHeader: {
    padding: 20,
    paddingTop: 60,
  },
  transactionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    backgroundColor: '#8A784E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#F5F5F5',
    marginTop: 8,
    textAlign: 'center',
  },
});

// IMPORTANT: This must be the first import for crypto support
import './polyfills';

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Home, Search, User } from 'lucide-react-native';
import { Header, AdvancedBalanceCard, TransactionList } from './src/components';
import { WalletProvider, useWallet } from './src/context/WalletContext';
import WalletSetupScreen from './src/screens/WalletSetupScreen';
import SendPaymentScreen from './src/screens/SendPaymentScreen';
import OnRampScreen from './src/screens/OnRampScreen';
import OffRampScreen from './src/screens/OffRampScreen';

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

type HomeProps = BottomTabScreenProps<TabParamList, 'Home'>;
type SearchProps = BottomTabScreenProps<TabParamList, 'Search'>;
type ProfileProps = BottomTabScreenProps<TabParamList, 'Profile'>;

const Tab = createBottomTabNavigator<TabParamList>();

function HomeScreen({ navigation }: HomeProps) {
  const wallet = useWallet();
  const [showSendPayment, setShowSendPayment] = useState(false);
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [showOffRamp, setShowOffRamp] = useState(false);

  const handleSearch = (text: string) => {
    console.log('Search:', text);
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
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
      <Header onSearch={handleSearch} onMenuPress={handleMenuPress} />
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
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Daash!</Text>
          <Text style={styles.text}>
            {wallet.wallet
              ? 'Your Stellar wallet is ready'
              : 'Create a wallet to get started'}
          </Text>
          {wallet.wallet && (
            <Text style={styles.publicKeyText} numberOfLines={1} ellipsizeMode="middle">
              {wallet.wallet.publicKey}
            </Text>
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

function ProfileScreen({ navigation }: ProfileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Your Profile</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Name:</Text>
        <Text style={styles.infoValue}>John Doe</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>john@example.com</Text>
      </View>
    </View>
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
      <NavigationContainer>
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
      </NavigationContainer>
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

# Stellar P2P Wallet - React Native + TypeScript Specification

## Project Overview

Building a production-ready peer-to-peer cryptocurrency wallet using React Native with TypeScript on the Stellar network, featuring integrated fiat on/off-ramp capabilities.

### Technology Stack
- **Framework**: React Native (iOS & Android)
- **Language**: TypeScript
- **State Management**: Redux Toolkit with TypeScript
- **Navigation**: React Navigation v6
- **Blockchain**: Stellar Network
- **Backend**: Node.js + Express + TypeScript

---

## Project Setup

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
react-native >= 0.72.0
typescript >= 5.0.0
```

### Initialize Project

```bash
# Create new React Native project with TypeScript
npx react-native init StellarWallet --template react-native-template-typescript

cd StellarWallet

# Install core dependencies
npm install @stellar/stellar-sdk
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-native-keychain
npm install react-native-biometrics
npm install react-native-qrcode-svg
npm install react-native-camera
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install react-native-encrypted-storage

# Install dev dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# iOS specific
cd ios && pod install && cd ..
```

### TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "strict": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@store/*": ["src/store/*"],
      "@types/*": ["src/types/*"],
      "@hooks/*": ["src/hooks/*"],
      "@navigation/*": ["src/navigation/*"]
    },
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

---

## Project Structure

```
StellarWallet/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── wallet/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   └── AssetSelector.tsx
│   │   └── qr/
│   │       ├── QRScanner.tsx
│   │       └── QRGenerator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── CreateWalletScreen.tsx
│   │   │   ├── ImportWalletScreen.tsx
│   │   │   └── PinSetupScreen.tsx
│   │   ├── wallet/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── SendScreen.tsx
│   │   │   ├── ReceiveScreen.tsx
│   │   │   └── TransactionHistoryScreen.tsx
│   │   ├── ramp/
│   │   │   ├── OnRampScreen.tsx
│   │   │   ├── OffRampScreen.tsx
│   │   │   └── KYCScreen.tsx
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── SecurityScreen.tsx
│   │       └── BackupScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/
│   │   ├── stellar/
│   │   │   ├── StellarService.ts
│   │   │   ├── WalletService.ts
│   │   │   └── TransactionService.ts
│   │   ├── security/
│   │   │   ├── KeychainService.ts
│   │   │   ├── BiometricService.ts
│   │   │   └── EncryptionService.ts
│   │   ├── ramp/
│   │   │   ├── RampService.ts
│   │   │   └── MoneyGramService.ts
│   │   └── api/
│   │       ├── ApiClient.ts
│   │       └── endpoints.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── walletSlice.ts
│   │   │   ├── transactionSlice.ts
│   │   │   ├── authSlice.ts
│   │   │   └── rampSlice.ts
│   │   └── store.ts
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useTransactions.ts
│   │   ├── useBiometric.ts
│   │   └── useRamp.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── wallet.types.ts
│   │   ├── transaction.types.ts
│   │   ├── navigation.types.ts
│   │   └── api.types.ts
│   └── App.tsx
├── android/
├── ios/
├── __tests__/
├── package.json
└── tsconfig.json
```

---

## TypeScript Type Definitions

### **src/types/wallet.types.ts**

```typescript
import { Asset } from '@stellar/stellar-sdk';

export interface Wallet {
  id: string;
  publicKey: string;
  name: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

export interface Balance {
  asset: string;
  assetCode?: string;
  assetIssuer?: string;
  balance: string;
  limit?: string;
}

export interface WalletState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateWalletPayload {
  name: string;
  mnemonic?: string;
}

export interface SendPaymentPayload {
  destinationAddress: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
}
```

### **src/types/transaction.types.ts**

```typescript
export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  ON_RAMP = 'on-ramp',
  OFF_RAMP = 'off-ramp',
  TRUSTLINE = 'trustline',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction {
  id: string;
  hash: string;
  type: TransactionType;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  from: string;
  to: string;
  status: TransactionStatus;
  memo?: string;
  fee: string;
  createdAt: Date;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}
```

### **src/types/navigation.types.ts**

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  CreateWallet: undefined;
  ImportWallet: undefined;
  PinSetup: { publicKey: string };
};

export type MainTabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  History: undefined;
  Settings: undefined;
};

export type RampStackParamList = {
  OnRamp: undefined;
  OffRamp: undefined;
  KYC: undefined;
};

export type HomeScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'Home'
>;

export type SendScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'Send'
>;
```

### **src/types/api.types.ts**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RampTransaction {
  id: string;
  providerId: string;
  type: 'on-ramp' | 'off-ramp';
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: string;
  cryptoAsset: string;
  status: string;
  redirectUrl?: string;
  createdAt: Date;
}

export interface KYCStatus {
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  level: number;
  limits: {
    daily: number;
    monthly: number;
  };
}
```

---

## Core Services

### **src/services/stellar/StellarService.ts**

```typescript
import * as StellarSdk from '@stellar/stellar-sdk';

export type StellarNetwork = 'testnet' | 'public';

class StellarService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor(network: StellarNetwork = 'testnet') {
    const horizonUrl =
      network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org';

    this.server = new StellarSdk.Horizon.Server(horizonUrl);
    this.networkPassphrase =
      network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;
  }

  /**
   * Generate new keypair
   */
  generateKeypair(): { publicKey: string; secretKey: string } {
    const keypair = StellarSdk.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Validate Stellar address
   */
  isValidAddress(address: string): boolean {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address);
  }

  /**
   * Get account details
   */
  async getAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Failed to load account: ${error}`);
    }
  }

  /**
   * Get account balances
   */
  async getBalances(publicKey: string): Promise<Balance[]> {
    try {
      const account = await this.getAccount(publicKey);
      return account.balances.map((balance) => ({
        asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
        assetCode: balance.asset_type === 'native' ? undefined : balance.asset_code,
        assetIssuer: balance.asset_type === 'native' ? undefined : balance.asset_issuer,
        balance: balance.balance,
        limit: balance.limit,
      }));
    } catch (error) {
      throw new Error(`Failed to get balances: ${error}`);
    }
  }

  /**
   * Fund account on testnet using Friendbot
   */
  async fundTestnetAccount(publicKey: string): Promise<void> {
    if (this.networkPassphrase !== StellarSdk.Networks.TESTNET) {
      throw new Error('Friendbot only available on testnet');
    }

    try {
      await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    } catch (error) {
      throw new Error(`Failed to fund account: ${error}`);
    }
  }

  /**
   * Send payment
   */
  async sendPayment(
    sourceSecret: string,
    destinationId: string,
    amount: string,
    assetCode: string = 'XLM',
    assetIssuer?: string,
    memo?: string,
  ): Promise<{ hash: string; ledger: number }> {
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

      // Create asset
      const asset =
        assetCode === 'XLM'
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(assetCode, assetIssuer!);

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationId,
            asset: asset,
            amount: amount,
          }),
        )
        .addMemo(memo ? StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
        .setTimeout(30)
        .build();

      // Sign transaction
      transaction.sign(sourceKeypair);

      // Submit transaction
      const result = await this.server.submitTransaction(transaction);

      return {
        hash: result.hash,
        ledger: result.ledger,
      };
    } catch (error) {
      throw new Error(`Failed to send payment: ${error}`);
    }
  }

  /**
   * Stream incoming payments
   */
  streamPayments(
    publicKey: string,
    onPayment: (payment: any) => void,
    onError: (error: any) => void,
  ): () => void {
    const closeStream = this.server
      .payments()
      .forAccount(publicKey)
      .cursor('now')
      .stream({
        onmessage: (payment) => {
          if (payment.type === 'payment' && payment.to === publicKey) {
            onPayment(payment);
          }
        },
        onerror: onError,
      });

    return closeStream;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    publicKey: string,
    limit: number = 50,
  ): Promise<Transaction[]> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();

      const transactionList: Transaction[] = [];

      for (const tx of transactions.records) {
        const operations = await tx.operations();
        const operation = operations.records[0];

        if (operation.type === 'payment') {
          const paymentOp = operation as any;
          transactionList.push({
            id: tx.id,
            hash: tx.hash,
            type:
              paymentOp.to === publicKey
                ? TransactionType.RECEIVE
                : TransactionType.SEND,
            amount: paymentOp.amount,
            assetCode: paymentOp.asset_type === 'native' ? 'XLM' : paymentOp.asset_code,
            assetIssuer:
              paymentOp.asset_type === 'native' ? undefined : paymentOp.asset_issuer,
            from: paymentOp.from,
            to: paymentOp.to,
            status: TransactionStatus.COMPLETED,
            memo: tx.memo,
            fee: tx.fee_charged,
            createdAt: new Date(tx.created_at),
          });
        }
      }

      return transactionList;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error}`);
    }
  }

  /**
   * Add trustline for custom asset
   */
  async addTrustline(
    sourceSecret: string,
    assetCode: string,
    assetIssuer: string,
    limit?: string,
  ): Promise<{ hash: string }> {
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

      const asset = new StellarSdk.Asset(assetCode, assetIssuer);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: asset,
            limit: limit,
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      const result = await this.server.submitTransaction(transaction);

      return { hash: result.hash };
    } catch (error) {
      throw new Error(`Failed to add trustline: ${error}`);
    }
  }
}

export default new StellarService('testnet');
```

### **src/services/security/KeychainService.ts**

```typescript
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

interface StoredWallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

class KeychainService {
  private static SERVICE_NAME = 'StellarWallet';

  /**
   * Store wallet credentials securely
   */
  async storeWallet(publicKey: string, privateKey: string): Promise<void> {
    try {
      // Store in iOS Keychain / Android Keystore
      await Keychain.setGenericPassword(publicKey, privateKey, {
        service: `${KeychainService.SERVICE_NAME}_${publicKey}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });

      // Also store public key reference in encrypted storage
      const wallets = await this.getStoredWallets();
      wallets.push({ publicKey, encryptedPrivateKey: 'stored_in_keychain' });
      await EncryptedStorage.setItem('wallets', JSON.stringify(wallets));
    } catch (error) {
      throw new Error(`Failed to store wallet: ${error}`);
    }
  }

  /**
   * Retrieve wallet credentials
   */
  async retrieveWallet(publicKey: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${KeychainService.SERVICE_NAME}_${publicKey}`,
      });

      if (credentials) {
        return credentials.password; // This is the private key
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve wallet:', error);
      return null;
    }
  }

  /**
   * Get all stored wallet public keys
   */
  async getStoredWallets(): Promise<StoredWallet[]> {
    try {
      const walletsJson = await EncryptedStorage.getItem('wallets');
      return walletsJson ? JSON.parse(walletsJson) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete wallet from secure storage
   */
  async deleteWallet(publicKey: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: `${KeychainService.SERVICE_NAME}_${publicKey}`,
      });

      const wallets = await this.getStoredWallets();
      const updatedWallets = wallets.filter((w) => w.publicKey !== publicKey);
      await EncryptedStorage.setItem('wallets', JSON.stringify(updatedWallets));
    } catch (error) {
      throw new Error(`Failed to delete wallet: ${error}`);
    }
  }

  /**
   * Check if wallet exists
   */
  async walletExists(publicKey: string): Promise<boolean> {
    const wallets = await this.getStoredWallets();
    return wallets.some((w) => w.publicKey === publicKey);
  }

  /**
   * Store PIN securely
   */
  async storePin(pin: string): Promise<void> {
    try {
      await Keychain.setGenericPassword('user_pin', pin, {
        service: `${KeychainService.SERVICE_NAME}_pin`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      throw new Error(`Failed to store PIN: ${error}`);
    }
  }

  /**
   * Verify PIN
   */
  async verifyPin(inputPin: string): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${KeychainService.SERVICE_NAME}_pin`,
      });

      if (credentials) {
        return credentials.password === inputPin;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    try {
      const wallets = await this.getStoredWallets();
      for (const wallet of wallets) {
        await this.deleteWallet(wallet.publicKey);
      }
      await EncryptedStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }
}

export default new KeychainService();
```

### **src/services/security/BiometricService.ts**

```typescript
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<{
    available: boolean;
    biometryType?: BiometryTypes;
  }> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      return { available: false };
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(promptMessage: string = 'Verify your identity'): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Create biometric keys for signing
   */
  async createKeys(): Promise<{ publicKey: string }> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return { publicKey };
    } catch (error) {
      throw new Error(`Failed to create biometric keys: ${error}`);
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create signature using biometric authentication
   */
  async createSignature(
    payload: string,
    promptMessage: string = 'Sign transaction',
  ): Promise<{ success: boolean; signature?: string }> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });
      return { success, signature };
    } catch (error) {
      return { success: false };
    }
  }
}

export default new BiometricService();
```

---

## Redux Store Setup

### **src/store/store.ts**

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import authReducer from './slices/authSlice';
import rampReducer from './slices/rampSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    transaction: transactionReducer,
    auth: authReducer,
    ramp: rampReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wallet/setCurrentWallet'],
        // Ignore these paths in the state
        ignoredPaths: ['wallet.currentWallet.createdAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### **src/store/slices/walletSlice.ts**

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WalletState, Wallet, Balance, CreateWalletPayload } from '../../types/wallet.types';
import StellarService from '../../services/stellar/StellarService';
import KeychainService from '../../services/security/KeychainService';

const initialState: WalletState = {
  wallets: [],
  currentWallet: null,
  balances: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const createWallet = createAsyncThunk(
  'wallet/create',
  async (payload: CreateWalletPayload, { rejectWithValue }) => {
    try {
      const { publicKey, secretKey } = StellarService.generateKeypair();
      
      // Store in secure storage
      await KeychainService.storeWallet(publicKey, secretKey);
      
      const wallet: Wallet = {
        id: publicKey,
        publicKey,
        name: payload.name,
        isPrimary: true,
        createdAt: new Date(),
      };

      return wallet;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadWallets = createAsyncThunk(
  'wallet/loadWallets',
  async (_, { rejectWithValue }) => {
    try {
      const storedWallets = await KeychainService.getStoredWallets();
      
      const wallets: Wallet[] = storedWallets.map((w, index) => ({
        id: w.publicKey,
        publicKey: w.publicKey,
        name: `Wallet ${index + 1}`,
        isPrimary: index === 0,
        createdAt: new Date(),
      }));

      return wallets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBalances = createAsyncThunk(
  'wallet/fetchBalances',
  async (publicKey: string, { rejectWithValue }) => {
    try {
      const balances = await StellarService.getBalances(publicKey);
      return balances;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setCurrentWallet: (state, action: PayloadAction<Wallet>) => {
      state.currentWallet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearWalletState: (state) => {
      state.wallets = [];
      state.currentWallet = null;
      state.balances = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create wallet
    builder.addCase(createWallet.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createWallet.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wallets.push(action.payload);
      state.currentWallet = action.payload;
    });
    builder.addCase(createWallet.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Load wallets
    builder.addCase(loadWallets.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadWallets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.wallets = action.payload;
      if (action.payload.length > 0) {
        state.currentWallet = action.payload[0];
      }
    });
    builder.addCase(loadWallets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch balances
    builder.addCase(fetchBalances.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchBalances.fulfilled, (state, action) => {
      state.isLoading = false;
      state.balances = action.payload;
    });
    builder.addCase(fetchBalances.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentWallet, clearError, clearWalletState } = walletSlice.actions;
export default walletSlice.reducer;
```

### **src/store/slices/transactionSlice.ts**

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TransactionState, Transaction } from '../../types/transaction.types';
import { SendPaymentPayload } from '../../types/wallet.types';
import StellarService from '../../services/stellar/StellarService';
import KeychainService from '../../services/security/KeychainService';

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const sendPayment = createAsyncThunk(
  'transaction/sendPayment',
  async (
    {
      publicKey,
      payload,
    }: {
      publicKey: string;
      payload: SendPaymentPayload;
    },
    { rejectWithValue }
  ) => {
    try {
      // Retrieve private key from secure storage
      const privateKey = await KeychainService.retrieveWallet(publicKey);
      if (!privateKey) {
        throw new Error('Private key not found');
      }

      const result = await StellarService.sendPayment(
        privateKey,
        payload.destinationAddress,
        payload.amount,
        payload.assetCode,
        payload.assetIssuer,
        payload.memo
      );

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'transaction/fetchHistory',
  async (publicKey: string, { rejectWithValue }) => {
    try {
      const transactions = await StellarService.getTransactionHistory(publicKey);
      return transactions;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Send payment
    builder.addCase(sendPayment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendPayment.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(sendPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch history
    builder.addCase(fetchTransactionHistory.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTransactionHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.transactions = action.payload;
    });
    builder.addCase(fetchTransactionHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearTransactionError, addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
```

---

## Custom Hooks

### **src/hooks/useWallet.ts**

```typescript
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  createWallet,
  loadWallets,
  fetchBalances,
  setCurrentWallet,
} from '../store/slices/walletSlice';
import { Wallet, CreateWalletPayload } from '../types/wallet.types';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { wallets, currentWallet, balances, isLoading, error } = useAppSelector(
    (state) => state.wallet
  );

  const createNewWallet = useCallback(
    async (payload: CreateWalletPayload) => {
      return dispatch(createWallet(payload)).unwrap();
    },
    [dispatch]
  );

  const loadUserWallets = useCallback(async () => {
    return dispatch(loadWallets()).unwrap();
  }, [dispatch]);

  const refreshBalances = useCallback(async () => {
    if (currentWallet) {
      return dispatch(fetchBalances(currentWallet.publicKey)).unwrap();
    }
  }, [dispatch, currentWallet]);

  const switchWallet = useCallback(
    (wallet: Wallet) => {
      dispatch(setCurrentWallet(wallet));
    },
    [dispatch]
  );

  // Auto-refresh balances
  useEffect(() => {
    if (currentWallet) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentWallet, refreshBalances]);

  return {
    wallets,
    currentWallet,
    balances,
    isLoading,
    error,
    createNewWallet,
    loadUserWallets,
    refreshBalances,
    switchWallet,
  };
};
```

### **src/hooks/useBiometric.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import BiometricService from '../services/security/BiometricService';
import { BiometryTypes } from 'react-native-biometrics';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes | undefined>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const { available, biometryType: type } = await BiometricService.isBiometricAvailable();
    setIsAvailable(available);
    setBiometryType(type);
  };

  const authenticate = useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      if (!isAvailable) return false;

      setIsAuthenticating(true);
      try {
        const success = await BiometricService.authenticate(promptMessage);
        return success;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isAvailable]
  );

  const getBiometricType = (): string => {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Biometrics';
      default:
        return 'Biometric Authentication';
    }
  };

  return {
    isAvailable,
    biometryType,
    isAuthenticating,
    authenticate,
    getBiometricType,
  };
};
```

---

## Screen Examples

### **src/screens/wallet/HomeScreen.tsx**

```typescript
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { HomeScreenNavigationProp } from '../../types/navigation.types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { currentWallet, balances, isLoading, refreshBalances } = useWallet();

  useEffect(() => {
    if (currentWallet) {
      refreshBalances();
    }
  }, [currentWallet]);

  const getTotalBalanceUSD = (): string => {
    // Calculate total balance in USD (would need price API)
    const xlmBalance = balances.find((b) => b.asset === 'XLM');
    if (xlmBalance) {
      // Mock calculation - replace with real price
      const usdValue = parseFloat(xlmBalance.balance) * 0.12;
      return usdValue.toFixed(2);
    }
    return '0.00';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshBalances} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.walletName}>{currentWallet?.name}</Text>
        <Text style={styles.publicKey}>
          {currentWallet?.publicKey.substring(0, 8)}...
          {currentWallet?.publicKey.substring(currentWallet.publicKey.length - 8)}
        </Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>${getTotalBalanceUSD()}</Text>
        
        {/* Assets */}
        <View style={styles.assetsList}>
          {balances.map((balance, index) => (
            <View key={index} style={styles.assetItem}>
              <Text style={styles.assetCode}>{balance.asset}</Text>
              <Text style={styles.assetBalance}>{parseFloat(balance.balance).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Send')}
        >
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Receive')}
        >
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => {/* Navigate to On-Ramp */}}
        >
          <Text style={styles.actionButtonText}>Buy Crypto</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Preview */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6C5CE7',
  },
  walletName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  publicKey: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  assetsList: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  assetCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  assetBalance: {
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#00B894',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
});

export default HomeScreen;
```

### **src/screens/wallet/SendScreen.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch } from '../../store/store';
import { sendPayment } from '../../store/slices/transactionSlice';
import { useWallet } from '../../hooks/useWallet';
import { useBiometric } from '../../hooks/useBiometric';
import StellarService from '../../services/stellar/StellarService';

const SendScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWallet, balances } = useWallet();
  const { isAvailable: biometricAvailable, authenticate } = useBiometric();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('XLM');
  const [isLoading, setIsLoading] = useState(false);

  const validateAddress = (address: string): boolean => {
    return StellarService.isValidAddress(address);
  };

  const handleSend = async () => {
    // Validation
    if (!recipientAddress || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateAddress(recipientAddress)) {
      Alert.alert('Error', 'Invalid Stellar address');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    // Check balance
    const assetBalance = balances.find((b) => b.asset === selectedAsset);
    if (!assetBalance || parseFloat(assetBalance.balance) < numAmount) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Biometric or PIN authentication
    if (biometricAvailable) {
      const authenticated = await authenticate('Authenticate to send payment');
      if (!authenticated) {
        return;
      }
    }

    // Send payment
    setIsLoading(true);
    try {
      await dispatch(
        sendPayment({
          publicKey: currentWallet!.publicKey,
          payload: {
            destinationAddress: recipientAddress,
            amount,
            assetCode: selectedAsset,
            memo,
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Payment sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setRecipientAddress('');
            setAmount('');
            setMemo('');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to send payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          placeholder="GXXXXXXXXXXXXXXXXXXXXX"
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountContainer}>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Text style={styles.assetCode}>{selectedAsset}</Text>
        </View>

        <Text style={styles.label}>Memo (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a note"
          value={memo}
          onChangeText={setMemo}
          maxLength={28}
        />

        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    marginRight: 12,
  },
  assetCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  sendButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendScreen;
```

---

## Navigation Setup

### **src/navigation/RootNavigator.tsx**

```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootStackParamList } from '../types/navigation.types';
import { useWallet } from '../hooks/useWallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { loadUserWallets, wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = async () => {
    try {
      await loadUserWallets();
      const walletsExist = wallets.length > 0;
      setHasWallet(walletsExist);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasWallet ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
```

### **src/navigation/MainNavigator.tsx**

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from '../types/navigation.types';

// Screens
import HomeScreen from '../screens/wallet/HomeScreen';
import SendScreen from '../screens/wallet/SendScreen';
import ReceiveScreen from '../screens/wallet/ReceiveScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Send':
              iconName = focused ? 'send' : 'send-outline';
              break;
            case 'Receive':
              iconName = focused ? 'download' : 'download-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Wallet' }} />
      <Tab.Screen name="Send" component={SendScreen} />
      <Tab.Screen name="Receive" component={ReceiveScreen} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
```

---

## Environment Configuration

### **.env**

```bash
# Stellar Network
STELLAR_NETWORK=testnet
HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
HORIZON_URL_PUBLIC=https://horizon.stellar.org

# Backend API
API_BASE_URL=https://your-api.com/api
API_TIMEOUT=30000

# On-Ramp Providers
RAMP_API_KEY=your_ramp_api_key
MONEYGRAM_API_KEY=your_moneygram_api_key

# Analytics & Monitoring
SENTRY_DSN=your_sentry_dsn

# Feature Flags
ENABLE_BIOMETRIC=true
ENABLE_ON_RAMP=true
ENABLE_OFF_RAMP=true
```

### **src/config/index.ts**

```typescript
import Config from 'react-native-config';

export const config = {
  stellar: {
    network: Config.STELLAR_NETWORK || 'testnet',
    horizonUrl:
      Config.STELLAR_NETWORK === 'public'
        ? Config.HORIZON_URL_PUBLIC
        : Config.HORIZON_URL_TESTNET,
  },
  api: {
    baseUrl: Config.API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(Config.API_TIMEOUT || '30000'),
  },
  ramp: {
    apiKey: Config.RAMP_API_KEY,
  },
  features: {
    biometric: Config.ENABLE_BIOMETRIC === 'true',
    onRamp: Config.ENABLE_ON_RAMP === 'true',
    offRamp: Config.ENABLE_OFF_RAMP === 'true',
  },
};
```

---

## Testing

### **__tests__/services/StellarService.test.ts**

```typescript
import StellarService from '../../src/services/stellar/StellarService';

describe('StellarService', () => {
  describe('generateKeypair', () => {
    it('should generate valid keypair', () => {
      const { publicKey, secretKey } = StellarService.generateKeypair();
      
      expect(publicKey).toBeDefined();
      expect(secretKey).toBeDefined();
      expect(publicKey.startsWith('G')).toBe(true);
      expect(secretKey.startsWith('S')).toBe(true);
    });
  });

  describe('isValidAddress', () => {
    it('should validate correct Stellar address', () => {
      const validAddress = 'GABC...';
      expect(StellarService.isValidAddress(validAddress)).toBe(true);
    });

    it('should reject invalid address', () => {
      const invalidAddress = 'invalid';
      expect(StellarService.isValidAddress(invalidAddress)).toBe(false);
    });
  });
});
```

---

## Build & Deployment

### iOS Build

```bash
# Development
npx react-native run-ios

# Production build
cd ios
pod install
xcodebuild -workspace StellarWallet.xcworkspace \
  -scheme StellarWallet \
  -configuration Release \
  -archivePath build/StellarWallet.xcarchive \
  archive
```

### Android Build

```bash
# Development
npx react-native run-android

# Production build
cd android
./gradlew assembleRelease

# Generate signed APK
./gradlew bundleRelease
```

---

## Development Roadmap

### Phase 1: Core Wallet (6-8 weeks)
- [ ] Project setup and architecture
- [ ] Wallet creation and import
- [ ] Secure key storage
- [ ] Send/Receive XLM
- [ ] Transaction history
- [ ] Biometric authentication
- [ ] PIN security

### Phase 2: Enhanced Features (4-6 weeks)
- [ ] Multi-asset support
- [ ] QR code scanning
- [ ] Contact management
- [ ] Push notifications
- [ ] Price tracking
- [ ] Transaction memos

### Phase 3: On/Off-Ramp (6-8 weeks)
- [ ] KYC integration
- [ ] Ramp Network integration
- [ ] MoneyGram integration
- [ ] Bank linking
- [ ] Transaction limits
- [ ] Compliance features

### Phase 4: Polish & Launch (4-6 weeks)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing
- [ ] App Store submission
- [ ] Marketing materials

---

## Key Dependencies Summary

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@stellar/stellar-sdk": "^11.0.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.1.0",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/native-stack": "^6.9.13",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "react-native-keychain": "^8.1.2",
    "react-native-biometrics": "^3.0.1",
    "react-native-encrypted-storage": "^4.0.3",
    "react-native-qrcode-svg": "^6.2.0",
    "react-native-camera": "^4.2.1",
    "react-native-vector-icons": "^9.2.0",
    "axios": "^1.4.0"
  }
}
```

---

## Security Checklist

- [ ] Private keys stored in iOS Keychain / Android Keystore
- [ ] No hardcoded secrets or keys
- [ ] Biometric authentication implemented
- [ ] PIN/password protection
- [ ] Encrypted storage for sensitive data
- [ ] Certificate pinning for API calls
- [ ] Code obfuscation enabled
- [ ] Jailbreak/root detection
- [ ] Secure random number generation
- [ ] Input validation on all fields
- [ ] Rate limiting on sensitive operations

---

## Resources

- **Stellar Docs**: https://developers.stellar.org
- **React Native Docs**: https://reactnative.dev
- **TypeScript Docs**: https://www.typescriptlang.org
- **Redux Toolkit**: https://redux-toolkit.js.org
- **Stellar SDK**: https://github.com/stellar/js-stellar-sdk

---

**Ready to start building!** 🚀

This specification provides everything you need to build your Stellar wallet using React Native with TypeScript. Start with Phase 1 and progressively add features.

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { WalletService } from '../services/walletService';
import { StellarService } from '../services/stellarService';
import { StellarWallet, WalletAccount, WalletState } from '../types/wallet';

interface WalletContextType extends WalletState {
  createWallet: () => Promise<void>;
  loadWallet: () => Promise<void>;
  importWallet: (secretKey: string) => Promise<void>;
  deleteWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  fundTestnetAccount: () => Promise<void>;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    wallet: null,
    account: null,
    balance: '0',
    isLoading: false,
    error: null,
    isInitialized: false,
  });

  // Load wallet on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const hasWallet = await WalletService.hasWallet();
      if (hasWallet) {
        await loadWallet();
      } else {
        setState((prev) => ({ ...prev, isInitialized: true, isLoading: false }));
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to initialize wallet',
        isLoading: false,
        isInitialized: true,
      }));
    }
  };

  const createWallet = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Create new wallet
      const newWallet = await WalletService.createWallet();

      setState((prev) => ({
        ...prev,
        wallet: newWallet,
        isLoading: false,
        isInitialized: true,
      }));

      // Refresh balance
      await refreshBalance();
    } catch (error) {
      console.error('Error creating wallet:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to create wallet',
        isLoading: false,
      }));
    }
  };

  const loadWallet = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const loadedWallet = await WalletService.loadWallet();
      if (!loadedWallet) {
        setState((prev) => ({
          ...prev,
          error: 'No wallet found',
          isLoading: false,
          isInitialized: true,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        wallet: loadedWallet,
        isLoading: false,
        isInitialized: true,
      }));

      // Refresh balance
      await refreshBalance();
    } catch (error) {
      console.error('Error loading wallet:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load wallet',
        isLoading: false,
        isInitialized: true,
      }));
    }
  };

  const importWallet = async (secretKey: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const importedWallet = await WalletService.importWallet(secretKey);

      setState((prev) => ({
        ...prev,
        wallet: importedWallet,
        isLoading: false,
        isInitialized: true,
      }));

      // Refresh balance
      await refreshBalance();
    } catch (error) {
      console.error('Error importing wallet:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to import wallet',
        isLoading: false,
      }));
      throw error;
    }
  };

  const deleteWallet = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await WalletService.deleteWallet();

      setState({
        wallet: null,
        account: null,
        balance: '0',
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to delete wallet',
        isLoading: false,
      }));
    }
  };

  const refreshBalance = async () => {
    try {
      if (!state.wallet) {
        return;
      }

      const account = await StellarService.getAccount(state.wallet.publicKey);
      const balance = await StellarService.getBalance(state.wallet.publicKey);

      setState((prev) => ({
        ...prev,
        account,
        balance,
      }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      // Don't set error state for balance refresh failures
    }
  };

  const fundTestnetAccount = async () => {
    try {
      if (!state.wallet) {
        throw new Error('No wallet available');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await StellarService.fundTestnetAccount(state.wallet.publicKey);

      // Wait a bit for the network to process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Refresh balance
      await refreshBalance();

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error funding testnet account:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fund testnet account',
        isLoading: false,
      }));
      throw error;
    }
  };

  const sendPayment = async (
    destination: string,
    amount: string,
    memo?: string
  ): Promise<string> => {
    try {
      if (!state.wallet?.secretKey) {
        throw new Error('No wallet or secret key available');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const txHash = await StellarService.sendPayment(
        state.wallet.secretKey,
        destination,
        amount,
        memo
      );

      // Refresh balance after sending
      await refreshBalance();

      setState((prev) => ({ ...prev, isLoading: false }));

      return txHash;
    } catch (error) {
      console.error('Error sending payment:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to send payment',
        isLoading: false,
      }));
      throw error;
    }
  };

  const value: WalletContextType = {
    ...state,
    createWallet,
    loadWallet,
    importWallet,
    deleteWallet,
    refreshBalance,
    fundTestnetAccount,
    sendPayment,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

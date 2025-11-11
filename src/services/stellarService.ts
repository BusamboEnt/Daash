import * as StellarSdk from '@stellar/stellar-sdk';
import { WalletAccount, WalletBalance, Transaction, StellarAsset, TrustlineOptions, STELLAR_ASSETS } from '../types/wallet';
import LiveActivityService from './liveActivity/LiveActivityService';
import { LiveActivityType, TransactionStatus } from '../types/liveActivity.types';

// Use Testnet for development
const USE_TESTNET = true;

export class StellarService {
  private static server: StellarSdk.Horizon.Server;

  /**
   * Initialize Stellar server connection
   */
  static initialize() {
    if (USE_TESTNET) {
      this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      StellarSdk.Networks.TESTNET;
    } else {
      this.server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
      StellarSdk.Networks.PUBLIC;
    }
  }

  /**
   * Get server instance
   */
  static getServer(): StellarSdk.Horizon.Server {
    if (!this.server) {
      this.initialize();
    }
    return this.server;
  }

  /**
   * Fund account on testnet using Friendbot
   */
  static async fundTestnetAccount(publicKey: string): Promise<void> {
    if (!USE_TESTNET) {
      throw new Error('Friendbot only works on testnet');
    }

    try {
      const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
      console.log('Attempting to fund account via Friendbot:', friendbotUrl);

      const response = await fetch(friendbotUrl);

      const responseText = await response.text();
      console.log('Friendbot response status:', response.status);
      console.log('Friendbot response:', responseText.substring(0, 200));

      // Parse response as JSON to check for specific error messages
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        // Response might not be JSON
      }

      // Check if account was already funded (this is actually a success case)
      if (response.status === 400 && responseJson?.detail?.includes('already funded')) {
        console.log('Account was already funded previously - this is OK');
        return;
      }

      // Check for other errors
      if (!response.ok) {
        throw new Error(
          `Friendbot returned status ${response.status}: ${responseText.substring(0, 100)}`
        );
      }

      console.log('Account funded successfully via Friendbot');
    } catch (error: any) {
      console.error('Error funding testnet account:', error);
      const errorMessage = error?.message || 'Unknown error';
      throw new Error(`Failed to fund testnet account: ${errorMessage}`);
    }
  }

  /**
   * Get account details
   */
  static async getAccount(publicKey: string): Promise<WalletAccount | null> {
    try {
      const server = this.getServer();
      const account = await server.loadAccount(publicKey);

      return {
        id: account.id,
        account_id: account.account_id,
        balances: account.balances as WalletBalance[],
        sequence: account.sequence,
        subentry_count: account.subentry_count,
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Account doesn't exist yet
        return null;
      }
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
   * Get account balance (native XLM)
   */
  static async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.getAccount(publicKey);

      if (!account) {
        return '0';
      }

      // Find native balance
      const nativeBalance = account.balances.find(
        (balance) => balance.asset_type === 'native'
      );

      return nativeBalance?.balance || '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  /**
   * Check if account exists
   */
  static async accountExists(publicKey: string): Promise<boolean> {
    try {
      const account = await this.getAccount(publicKey);
      return account !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get recent transactions for account
   */
  static async getTransactions(
    publicKey: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    try {
      const server = this.getServer();
      const transactions = await server
        .transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();

      return transactions.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        created_at: tx.created_at,
        source_account: tx.source_account,
        type: tx.type || 'payment',
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Send payment with Live Activity support
   */
  static async sendPayment(
    sourceSecret: string,
    destinationPublicKey: string,
    amount: string,
    memo?: string,
    recipientName?: string
  ): Promise<string> {
    let activityStarted = false;
    const tempTxId = `pending-${Date.now()}`;

    try {
      const server = this.getServer();
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      // 1. Start Live Activity (iOS only, gracefully fails on Android)
      await LiveActivityService.startTransactionActivity(tempTxId, {
        type: LiveActivityType.TRANSACTION,
        amount,
        asset: 'XLM',
        recipient: destinationPublicKey,
        recipientName,
        status: TransactionStatus.PENDING,
        progress: 0,
      });
      activityStarted = true;

      // Load source account
      const sourceAccount = await server.loadAccount(sourcePublicKey);

      // Update: 20% - Account loaded
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.PENDING,
          progress: 20,
        });
      }

      // Build transaction
      let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: USE_TESTNET
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationPublicKey,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30);

      // Add memo if provided
      if (memo) {
        transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      const builtTransaction = transaction.build();

      // Sign transaction
      builtTransaction.sign(sourceKeypair);

      // Update: 40% - Transaction signed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.PENDING,
          progress: 40,
        });
      }

      // Submit transaction
      const result = await server.submitTransaction(builtTransaction);
      const txHash = result.hash;

      // Update: 60% - Transaction submitted
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.CONFIRMING,
          progress: 60,
          txHash,
        });

        // Update activity mapping to use real tx hash
        const activityId = LiveActivityService.getActivityId(tempTxId);
        if (activityId) {
          // Remove temp ID and add real hash
          LiveActivityService['activities'].delete(tempTxId);
          LiveActivityService['activities'].set(txHash, activityId);
        }
      }

      // Simulate confirmation progress (Stellar is fast, but we want to show progress)
      if (activityStarted) {
        await this.simulateConfirmationProgress(txHash);
      }

      // Update: 100% - Confirmed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(txHash, {
          status: TransactionStatus.COMPLETED,
          progress: 100,
        });

        // End activity after 5 seconds
        setTimeout(async () => {
          await LiveActivityService.endTransactionActivity(txHash);
        }, 5000);
      }

      return result.hash;
    } catch (error) {
      console.error('Error sending payment:', error);

      // Update Live Activity to failed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.FAILED,
          progress: 0,
        });

        // End activity after 3 seconds
        setTimeout(async () => {
          await LiveActivityService.endTransactionActivity(tempTxId);
        }, 3000);
      }

      throw new Error('Failed to send payment');
    }
  }

  /**
   * Simulate transaction confirmation progress
   * Stellar transactions are fast, but we want to show visual progress
   */
  private static async simulateConfirmationProgress(txHash: string): Promise<void> {
    const steps = [70, 80, 90];
    for (const progress of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5 second delay
      await LiveActivityService.updateTransactionActivity(txHash, {
        status: TransactionStatus.CONFIRMING,
        progress,
      });
    }
  }

  /**
   * Get network type
   */
  static isTestnet(): boolean {
    return USE_TESTNET;
  }

  /**
   * Get USDC asset for current network
   */
  static getUSDCAsset(): StellarAsset {
    return USE_TESTNET ? STELLAR_ASSETS.USDC_TESTNET : STELLAR_ASSETS.USDC_MAINNET;
  }

  /**
   * Get all balances including all assets
   */
  static async getAllBalances(publicKey: string): Promise<WalletBalance[]> {
    try {
      const account = await this.getAccount(publicKey);
      if (!account) {
        return [];
      }
      return account.balances;
    } catch (error) {
      console.error('Error fetching all balances:', error);
      return [];
    }
  }

  /**
   * Get balance for specific asset
   */
  static async getAssetBalance(publicKey: string, asset: StellarAsset): Promise<string> {
    try {
      const balances = await this.getAllBalances(publicKey);

      if (asset.isNative) {
        const nativeBalance = balances.find((b) => b.asset_type === 'native');
        return nativeBalance?.balance || '0';
      } else {
        const assetBalance = balances.find(
          (b) => b.asset_code === asset.code && b.asset_issuer === asset.issuer
        );
        return assetBalance?.balance || '0';
      }
    } catch (error) {
      console.error('Error fetching asset balance:', error);
      return '0';
    }
  }

  /**
   * Check if account has trustline for asset
   */
  static async hasTrustline(publicKey: string, asset: StellarAsset): Promise<boolean> {
    if (asset.isNative) {
      return true; // Native asset always has "trustline"
    }

    try {
      const balances = await this.getAllBalances(publicKey);
      return balances.some(
        (b) => b.asset_code === asset.code && b.asset_issuer === asset.issuer
      );
    } catch (error) {
      console.error('Error checking trustline:', error);
      return false;
    }
  }

  /**
   * Create trustline (add asset to wallet)
   */
  static async createTrustline(
    sourceSecret: string,
    asset: StellarAsset,
    options?: TrustlineOptions
  ): Promise<string> {
    if (asset.isNative) {
      throw new Error('Cannot create trustline for native asset');
    }

    try {
      const server = this.getServer();
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      // Load source account
      const sourceAccount = await server.loadAccount(sourcePublicKey);

      // Create the asset
      const stellarAsset = new StellarSdk.Asset(asset.code, asset.issuer!);

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: USE_TESTNET
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: stellarAsset,
            limit: options?.limit,
          })
        )
        .setTimeout(30)
        .build();

      // Sign transaction
      transaction.sign(sourceKeypair);

      // Submit transaction
      const result = await server.submitTransaction(transaction);

      console.log('Trustline created successfully:', result.hash);
      return result.hash;
    } catch (error) {
      console.error('Error creating trustline:', error);
      throw new Error('Failed to create trustline');
    }
  }

  /**
   * Remove trustline (remove asset from wallet)
   * Note: Can only remove if balance is 0
   */
  static async removeTrustline(
    sourceSecret: string,
    asset: StellarAsset
  ): Promise<string> {
    if (asset.isNative) {
      throw new Error('Cannot remove trustline for native asset');
    }

    try {
      const server = this.getServer();
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      // Check balance is 0
      const balance = await this.getAssetBalance(sourcePublicKey, asset);
      if (parseFloat(balance) !== 0) {
        throw new Error('Cannot remove trustline with non-zero balance');
      }

      // Load source account
      const sourceAccount = await server.loadAccount(sourcePublicKey);

      // Create the asset
      const stellarAsset = new StellarSdk.Asset(asset.code, asset.issuer!);

      // Build transaction with limit 0 to remove trustline
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: USE_TESTNET
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: stellarAsset,
            limit: '0', // Setting limit to 0 removes the trustline
          })
        )
        .setTimeout(30)
        .build();

      // Sign transaction
      transaction.sign(sourceKeypair);

      // Submit transaction
      const result = await server.submitTransaction(transaction);

      console.log('Trustline removed successfully:', result.hash);
      return result.hash;
    } catch (error) {
      console.error('Error removing trustline:', error);
      throw new Error('Failed to remove trustline');
    }
  }

  /**
   * Send payment with any asset (updated to support multi-asset)
   */
  static async sendPaymentWithAsset(
    sourceSecret: string,
    destinationPublicKey: string,
    amount: string,
    asset: StellarAsset,
    memo?: string,
    recipientName?: string
  ): Promise<string> {
    let activityStarted = false;
    const tempTxId = `pending-${Date.now()}`;

    try {
      const server = this.getServer();
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      // 1. Start Live Activity (iOS only, gracefully fails on Android)
      await LiveActivityService.startTransactionActivity(tempTxId, {
        type: LiveActivityType.TRANSACTION,
        amount,
        asset: asset.code,
        recipient: destinationPublicKey,
        recipientName,
        status: TransactionStatus.PENDING,
        progress: 0,
      });
      activityStarted = true;

      // Load source account
      const sourceAccount = await server.loadAccount(sourcePublicKey);

      // Update: 20% - Account loaded
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.PENDING,
          progress: 20,
        });
      }

      // Create Stellar Asset
      const stellarAsset = asset.isNative
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(asset.code, asset.issuer!);

      // Build transaction
      let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: USE_TESTNET
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationPublicKey,
            asset: stellarAsset,
            amount: amount,
          })
        )
        .setTimeout(30);

      // Add memo if provided
      if (memo) {
        transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      const builtTransaction = transaction.build();

      // Sign transaction
      builtTransaction.sign(sourceKeypair);

      // Update: 40% - Transaction signed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.PENDING,
          progress: 40,
        });
      }

      // Submit transaction
      const result = await server.submitTransaction(builtTransaction);
      const txHash = result.hash;

      // Update: 60% - Transaction submitted
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.CONFIRMING,
          progress: 60,
          txHash,
        });

        // Update activity mapping to use real tx hash
        const activityId = LiveActivityService.getActivityId(tempTxId);
        if (activityId) {
          // Remove temp ID and add real hash
          LiveActivityService['activities'].delete(tempTxId);
          LiveActivityService['activities'].set(txHash, activityId);
        }
      }

      // Simulate confirmation progress (Stellar is fast, but we want to show progress)
      if (activityStarted) {
        await this.simulateConfirmationProgress(txHash);
      }

      // Update: 100% - Confirmed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(txHash, {
          status: TransactionStatus.COMPLETED,
          progress: 100,
        });

        // End activity after 5 seconds
        setTimeout(async () => {
          await LiveActivityService.endTransactionActivity(txHash);
        }, 5000);
      }

      return result.hash;
    } catch (error) {
      console.error('Error sending payment:', error);

      // Update Live Activity to failed
      if (activityStarted) {
        await LiveActivityService.updateTransactionActivity(tempTxId, {
          status: TransactionStatus.FAILED,
          progress: 0,
        });

        // End activity after 3 seconds
        setTimeout(async () => {
          await LiveActivityService.endTransactionActivity(tempTxId);
        }, 3000);
      }

      throw new Error('Failed to send payment');
    }
  }
}

// Initialize on module load
StellarService.initialize();

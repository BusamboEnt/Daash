import * as StellarSdk from '@stellar/stellar-sdk';
import { WalletAccount, WalletBalance, Transaction } from '../types/wallet';

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(friendbotUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        console.log('Friendbot response status:', response.status);
        console.log('Friendbot response:', responseText.substring(0, 200));

        if (!response.ok) {
          throw new Error(
            `Friendbot returned status ${response.status}: ${responseText.substring(0, 100)}`
          );
        }

        // Try to parse as JSON
        try {
          JSON.parse(responseText);
          console.log('Account funded successfully via Friendbot');
        } catch (e) {
          console.warn('Friendbot response was not JSON:', responseText.substring(0, 100));
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Friendbot request timed out after 30 seconds');
        }
        throw fetchError;
      }
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
   * Send payment
   */
  static async sendPayment(
    sourceSecret: string,
    destinationPublicKey: string,
    amount: string,
    memo?: string
  ): Promise<string> {
    try {
      const server = this.getServer();
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      // Load source account
      const sourceAccount = await server.loadAccount(sourcePublicKey);

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

      // Submit transaction
      const result = await server.submitTransaction(builtTransaction);

      return result.hash;
    } catch (error) {
      console.error('Error sending payment:', error);
      throw new Error('Failed to send payment');
    }
  }

  /**
   * Get network type
   */
  static isTestnet(): boolean {
    return USE_TESTNET;
  }
}

// Initialize on module load
StellarService.initialize();

import { RampTransaction, RampType, RampStatus, KYCInfo, KYCStatus, KYCLevel } from '../types/wallet';

// Ramp Network Configuration
const RAMP_CONFIG = {
  hostAppName: 'Daash',
  hostLogoUrl: 'https://your-domain.com/logo.png',
  hostApiKey: process.env.RAMP_API_KEY || 'demo_api_key',
  url: 'https://buy.ramp.network',
  variant: 'mobile' as const,
};

export class RampService {
  /**
   * Initialize a Ramp Network on-ramp transaction
   * Opens Ramp Network widget for buying crypto with fiat
   */
  static async initiateOnRamp(
    userAddress: string,
    fiatCurrency: string = 'USD',
    fiatValue?: number,
    cryptoAsset: string = 'STELLAR_XLM'
  ): Promise<RampTransaction> {
    try {
      // In production, this would open the Ramp Network widget
      // For now, we'll simulate the transaction creation

      const transaction: RampTransaction = {
        id: `ramp_${Date.now()}`,
        providerId: 'ramp_network',
        type: RampType.ON_RAMP,
        fiatAmount: fiatValue || 0,
        fiatCurrency,
        cryptoAmount: '0', // Will be calculated by Ramp
        cryptoAsset,
        status: RampStatus.PENDING,
        redirectUrl: this.buildRampUrl(userAddress, fiatCurrency, fiatValue, cryptoAsset),
        createdAt: new Date(),
      };

      console.log('Initiating on-ramp transaction:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error initiating on-ramp:', error);
      throw new Error('Failed to initiate on-ramp transaction');
    }
  }

  /**
   * Initialize an off-ramp transaction
   * Converts crypto to fiat
   */
  static async initiateOffRamp(
    userAddress: string,
    cryptoAmount: string,
    cryptoAsset: string = 'STELLAR_XLM',
    fiatCurrency: string = 'USD'
  ): Promise<RampTransaction> {
    try {
      const transaction: RampTransaction = {
        id: `ramp_offramp_${Date.now()}`,
        providerId: 'ramp_network',
        type: RampType.OFF_RAMP,
        fiatAmount: 0, // Will be calculated
        fiatCurrency,
        cryptoAmount,
        cryptoAsset,
        status: RampStatus.PENDING,
        createdAt: new Date(),
      };

      console.log('Initiating off-ramp transaction:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error initiating off-ramp:', error);
      throw new Error('Failed to initiate off-ramp transaction');
    }
  }

  /**
   * Build Ramp Network widget URL with parameters
   */
  private static buildRampUrl(
    userAddress: string,
    fiatCurrency: string,
    fiatValue?: number,
    swapAsset: string = 'STELLAR_XLM'
  ): string {
    const params = new URLSearchParams({
      hostAppName: RAMP_CONFIG.hostAppName,
      hostLogoUrl: RAMP_CONFIG.hostLogoUrl,
      hostApiKey: RAMP_CONFIG.hostApiKey,
      swapAsset,
      userAddress,
      fiatCurrency,
      variant: RAMP_CONFIG.variant,
    });

    if (fiatValue) {
      params.append('fiatValue', fiatValue.toString());
    }

    return `${RAMP_CONFIG.url}?${params.toString()}`;
  }

  /**
   * Get transaction status
   */
  static async getTransactionStatus(transactionId: string): Promise<RampStatus> {
    try {
      // In production, this would query Ramp Network API
      // For now, we'll simulate status
      console.log('Checking transaction status:', transactionId);
      return RampStatus.PENDING;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw new Error('Failed to get transaction status');
    }
  }

  /**
   * Get user's KYC status
   */
  static async getKYCStatus(userId: string): Promise<KYCInfo> {
    try {
      // In production, this would query your backend/KYC provider
      // For now, we'll return a mock status
      const kycInfo: KYCInfo = {
        userId,
        status: KYCStatus.NOT_STARTED,
        level: KYCLevel.NONE,
        limits: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          perTransaction: 0,
          currency: 'USD',
        },
        documentsSubmitted: [],
        lastUpdated: new Date(),
      };

      console.log('KYC status for user:', kycInfo);
      return kycInfo;
    } catch (error) {
      console.error('Error getting KYC status:', error);
      throw new Error('Failed to get KYC status');
    }
  }

  /**
   * Check if user can perform transaction based on KYC limits
   */
  static async canPerformTransaction(
    userId: string,
    amount: number,
    currency: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const kycInfo = await this.getKYCStatus(userId);

      // Check KYC status
      if (kycInfo.status !== KYCStatus.APPROVED) {
        return {
          allowed: false,
          reason: 'KYC verification required. Please complete identity verification.',
        };
      }

      // Check transaction limits
      if (amount > kycInfo.limits.perTransaction) {
        return {
          allowed: false,
          reason: `Transaction amount exceeds limit of ${kycInfo.limits.perTransaction} ${currency}`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking transaction eligibility:', error);
      return {
        allowed: false,
        reason: 'Unable to verify transaction eligibility',
      };
    }
  }

  /**
   * Get supported fiat currencies
   */
  static getSupportedFiatCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'KRW'];
  }

  /**
   * Get supported crypto assets
   */
  static getSupportedCryptoAssets(): Array<{ code: string; name: string }> {
    return [
      { code: 'STELLAR_XLM', name: 'Stellar Lumens (XLM)' },
      { code: 'STELLAR_USDC', name: 'USD Coin (USDC)' },
    ];
  }
}

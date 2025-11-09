import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { RampService } from '../services/rampService';
import { KYCInfo, KYCStatus, KYCLevel } from '../types/wallet';

interface KYCScreenProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function KYCScreen({ onComplete, onCancel }: KYCScreenProps) {
  const wallet = useWallet();
  const [kycInfo, setKycInfo] = useState<KYCInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setIsLoading(true);
      if (wallet.wallet) {
        const status = await RampService.getKYCStatus(wallet.wallet.publicKey);
        setKycInfo(status);
      }
    } catch (error) {
      console.error('Error loading KYC status:', error);
      Alert.alert('Error', 'Failed to load KYC status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartKYC = () => {
    Alert.alert(
      'Start KYC Verification',
      'You will be redirected to our verification partner to complete your identity verification.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            // In production, this would redirect to KYC provider
            Alert.alert('KYC Flow', 'This would open the KYC verification flow in production');
          },
        },
      ]
    );
  };

  const getStatusIcon = () => {
    if (!kycInfo) return null;

    switch (kycInfo.status) {
      case KYCStatus.APPROVED:
        return <CheckCircle size={64} color="#10B981" />;
      case KYCStatus.REJECTED:
        return <XCircle size={64} color="#EF4444" />;
      case KYCStatus.PENDING:
      case KYCStatus.REVIEW:
        return <Clock size={64} color="#F59E0B" />;
      default:
        return <AlertCircle size={64} color="#9CA3AF" />;
    }
  };

  const getStatusText = () => {
    if (!kycInfo) return '';

    switch (kycInfo.status) {
      case KYCStatus.APPROVED:
        return 'Verified';
      case KYCStatus.REJECTED:
        return 'Verification Failed';
      case KYCStatus.PENDING:
        return 'Verification Pending';
      case KYCStatus.REVIEW:
        return 'Under Review';
      default:
        return 'Not Verified';
    }
  };

  const getStatusDescription = () => {
    if (!kycInfo) return '';

    switch (kycInfo.status) {
      case KYCStatus.APPROVED:
        return 'Your identity has been verified. You can now buy and sell crypto.';
      case KYCStatus.REJECTED:
        return kycInfo.rejectionReason || 'Your verification was not successful. Please contact support.';
      case KYCStatus.PENDING:
      case KYCStatus.REVIEW:
        return 'Your documents are being reviewed. This usually takes 1-2 business days.';
      default:
        return 'Complete identity verification to buy and sell crypto with fiat currency.';
    }
  };

  const getLevelName = (level: KYCLevel): string => {
    switch (level) {
      case KYCLevel.BASIC:
        return 'Basic';
      case KYCLevel.INTERMEDIATE:
        return 'Intermediate';
      case KYCLevel.ADVANCED:
        return 'Advanced';
      default:
        return 'None';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Identity Verification</Text>
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            {getStatusIcon()}
          </View>
          <Text style={styles.statusTitle}>{getStatusText()}</Text>
          <Text style={styles.statusDescription}>{getStatusDescription()}</Text>
        </View>

        {/* KYC Level Info */}
        {kycInfo && kycInfo.level > KYCLevel.NONE && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Verification Level</Text>
            <Text style={styles.infoValue}>{getLevelName(kycInfo.level)}</Text>
          </View>
        )}

        {/* Limits Info */}
        {kycInfo && kycInfo.status === KYCStatus.APPROVED && (
          <View style={styles.limitsCard}>
            <Text style={styles.limitsTitle}>Transaction Limits</Text>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Per Transaction:</Text>
              <Text style={styles.limitValue}>
                {kycInfo.limits.perTransaction.toLocaleString()} {kycInfo.limits.currency}
              </Text>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Daily:</Text>
              <Text style={styles.limitValue}>
                {kycInfo.limits.daily.toLocaleString()} {kycInfo.limits.currency}
              </Text>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Monthly:</Text>
              <Text style={styles.limitValue}>
                {kycInfo.limits.monthly.toLocaleString()} {kycInfo.limits.currency}
              </Text>
            </View>
          </View>
        )}

        {/* Requirements */}
        {kycInfo && kycInfo.status === KYCStatus.NOT_STARTED && (
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Required Documents</Text>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.requirementText}>Government-issued ID (Passport or Driver's License)</Text>
            </View>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.requirementText}>Proof of address (Utility bill or Bank statement)</Text>
            </View>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.requirementText}>Selfie for identity verification</Text>
            </View>
            <View style={styles.fileRequirementsNote}>
              <Text style={styles.noteText}>
                • Maximum file size: 5 MB per document
              </Text>
              <Text style={styles.noteText}>
                • Accepted formats: JPG, PNG, WebP, PDF
              </Text>
              <Text style={styles.noteText}>
                • Ensure documents are clear and readable
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {kycInfo && kycInfo.status === KYCStatus.NOT_STARTED && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartKYC}
            >
              <Text style={styles.primaryButtonText}>Start Verification</Text>
            </TouchableOpacity>
          )}

          {kycInfo && kycInfo.status === KYCStatus.APPROVED && onComplete && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onComplete}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          )}

          {onCancel && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onCancel}
            >
              <Text style={styles.secondaryButtonText}>
                {kycInfo?.status === KYCStatus.NOT_STARTED ? 'Maybe Later' : 'Close'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A784E',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#F5F5F5',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    color: '#F5F5F5',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  limitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  limitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limitLabel: {
    fontSize: 16,
    color: '#F5F5F5',
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requirementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 16,
    color: '#F5F5F5',
    lineHeight: 22,
  },
  fileRequirementsNote: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  noteText: {
    fontSize: 14,
    color: '#F5F5F5',
    marginBottom: 8,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8A784E',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FileText, Shield, Scale, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const LegalScreen: React.FC = () => {
  const navigation = useNavigation();
  const handleOpenDocument = (document: string) => {
    console.log('Open document:', document);
    // TODO: Navigate to document viewer or webview
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(DrawerActions.openDrawer());
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Legal Documents */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => handleOpenDocument('privacy')}
          >
            <View style={styles.legalLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5F5FF' }]}>
                <Shield size={24} color="#007AFF" />
              </View>
              <View style={styles.legalContent}>
                <Text style={styles.legalTitle}>Privacy Policy</Text>
                <Text style={styles.legalDescription}>
                  How we collect and use your data
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => handleOpenDocument('terms')}
          >
            <View style={styles.legalLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                <FileText size={24} color="#FF3B30" />
              </View>
              <View style={styles.legalContent}>
                <Text style={styles.legalTitle}>Terms of Service</Text>
                <Text style={styles.legalDescription}>
                  Rules and guidelines for using Daash
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => handleOpenDocument('licenses')}
          >
            <View style={styles.legalLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5FFE5' }]}>
                <Scale size={24} color="#34C759" />
              </View>
              <View style={styles.legalContent}>
                <Text style={styles.legalTitle}>Open Source Licenses</Text>
                <Text style={styles.legalDescription}>
                  Third-party software licenses
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Privacy Highlights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Privacy Rights</Text>
          <Text style={styles.infoText}>
            • We never sell your personal information
          </Text>
          <Text style={styles.infoText}>
            • Your wallet data is encrypted and stored locally
          </Text>
          <Text style={styles.infoText}>
            • We only collect data necessary for app functionality
          </Text>
          <Text style={styles.infoText}>
            • You can delete your account and data at any time
          </Text>
        </View>

        {/* Security Notice */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security Notice</Text>
          <Text style={styles.securityText}>
            Daash uses industry-standard security measures to protect your wallet and data.
            Your private keys are encrypted and never leave your device unless you explicitly
            export them.
          </Text>
          <Text style={styles.securityText}>
            Always keep your recovery phrase safe and never share it with anyone. Daash support
            will never ask for your recovery phrase or private keys.
          </Text>
        </View>

        {/* Compliance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compliance</Text>
          <Text style={styles.complianceText}>
            Daash complies with applicable financial regulations and KYC/AML requirements. By
            using our on-ramp and off-ramp services, you agree to provide accurate information
            and complete verification when required.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Legal Inquiries</Text>
          <Text style={styles.contactText}>
            For legal questions or concerns, please contact:
          </Text>
          <Text style={styles.contactEmail}>legal@daash.app</Text>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last updated: January 1, 2025</Text>

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
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  legalDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  complianceText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#8A784E',
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default LegalScreen;

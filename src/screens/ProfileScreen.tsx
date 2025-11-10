import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { User, Mail, Phone, MapPin, Edit2, Save, Copy, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const wallet = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // User profile data (would come from Supabase in production)
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1 234 567 8900',
    country: 'United States',
  });

  const handleCopyAddress = async () => {
    if (wallet.wallet) {
      // In a real app, you'd use Clipboard from @react-native-clipboard/clipboard
      console.log('Copied:', wallet.wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    // TODO: Save to Supabase
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleVerifyKYC = () => {
    // Navigate to KYC screen
    console.log('Navigate to KYC');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MainTabs' as never);
            navigation.dispatch(DrawerActions.openDrawer());
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          style={styles.editButton}
        >
          {isEditing ? (
            <Save size={24} color="#8A784E" />
          ) : (
            <Edit2 size={24} color="#8A784E" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={60} color="#8A784E" />
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wallet Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Balance</Text>
            <Text style={styles.infoValue}>
              {parseFloat(wallet.balance).toFixed(7)} XLM
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet Address</Text>
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
              {wallet.wallet?.publicKey || 'No wallet'}
            </Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
              {copied ? (
                <CheckCircle size={20} color="#34C759" />
              ) : (
                <Copy size={20} color="#8A784E" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>Stellar Testnet</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <User size={18} color="#8A784E" />
              <Text style={styles.labelText}>Full Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.fullName}
              onChangeText={(text) => setProfile({ ...profile, fullName: text })}
              editable={isEditing}
              placeholder="Enter your full name"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Mail size={18} color="#8A784E" />
              <Text style={styles.labelText}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              editable={isEditing}
              placeholder="Enter your email"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Phone size={18} color="#8A784E" />
              <Text style={styles.labelText}>Phone Number</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.phoneNumber}
              onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
              editable={isEditing}
              placeholder="Enter your phone number"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <MapPin size={18} color="#8A784E" />
              <Text style={styles.labelText}>Country</Text>
            </View>
            <TextInput
              style={styles.input}
              value={profile.country}
              onChangeText={(text) => setProfile({ ...profile, country: text })}
              editable={isEditing}
              placeholder="Enter your country"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* KYC Verification Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verification Status</Text>

          <View style={styles.kycContainer}>
            <View style={styles.kycLeft}>
              <Text style={styles.kycLabel}>KYC Verification</Text>
              <Text style={styles.kycStatus}>Not Verified</Text>
            </View>
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyKYC}>
              <Text style={styles.verifyButtonText}>Verify Now</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.kycDescription}>
            Complete KYC verification to increase your transaction limits and access premium
            features.
          </Text>
        </View>

        {/* Statistics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Statistics</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0 days</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
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
  editButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#8A784E',
  },
  changePhotoText: {
    fontSize: 16,
    color: '#8A784E',
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333333',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  kycContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycLeft: {
    flex: 1,
  },
  kycLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  kycStatus: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#8A784E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  kycDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A784E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen;

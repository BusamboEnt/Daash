import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import {
  Star,
  Share2,
  ExternalLink,
  Github,
  Twitter,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const appVersion = '1.0.0';
  const buildNumber = '100';

  const handleRateApp = () => {
    // TODO: Open app store rating
    console.log('Rate app');
  };

  const handleShareApp = () => {
    // TODO: Implement share functionality
    console.log('Share app');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://daash.app');
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/daash');
  };

  const handleOpenTwitter = () => {
    Linking.openURL('https://twitter.com/daash');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@daash.app');
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
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.appName}>Daash</Text>
          <Text style={styles.appTagline}>Your Stellar Wallet</Text>
          <Text style={styles.versionText}>
            Version {appVersion} ({buildNumber})
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
            <View style={styles.actionLeft}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.actionText}>Rate Daash</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} onPress={handleShareApp}>
            <View style={styles.actionLeft}>
              <Share2 size={24} color="#007AFF" />
              <Text style={styles.actionText}>Share with Friends</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Daash</Text>
          <Text style={styles.aboutText}>
            Daash is a modern, secure cryptocurrency wallet built on the Stellar network.
            Send, receive, and manage your digital assets with ease.
          </Text>
          <Text style={styles.aboutText}>
            Our mission is to make cryptocurrency accessible to everyone through a simple,
            beautiful, and secure wallet experience.
          </Text>
        </View>

        {/* Connect Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect with Us</Text>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenWebsite}>
            <View style={styles.linkLeft}>
              <ExternalLink size={22} color="#8A784E" />
              <Text style={styles.linkText}>Website</Text>
            </View>
            <Text style={styles.linkValue}>daash.app</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenGitHub}>
            <View style={styles.linkLeft}>
              <Github size={22} color="#333333" />
              <Text style={styles.linkText}>GitHub</Text>
            </View>
            <ExternalLink size={16} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenTwitter}>
            <View style={styles.linkLeft}>
              <Twitter size={22} color="#1DA1F2" />
              <Text style={styles.linkText}>Twitter</Text>
            </View>
            <ExternalLink size={16} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkButton} onPress={handleContactSupport}>
            <View style={styles.linkLeft}>
              <MessageCircle size={22} color="#34C759" />
              <Text style={styles.linkText}>Contact Support</Text>
            </View>
            <ExternalLink size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Technical Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Technical Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>Stellar Testnet</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stellar SDK</Text>
            <Text style={styles.infoValue}>v12.x</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Date</Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Credits</Text>
          <Text style={styles.creditsText}>
            Built with React Native and powered by the Stellar blockchain network.
          </Text>
          <Text style={styles.creditsText}>
            Icons by Lucide Icons. UI components designed with care.
          </Text>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Licenses</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2025 Daash. All rights reserved.</Text>

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
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8A784E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
  },
  linkValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  creditsText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  legalLink: {
    fontSize: 13,
    color: '#8A784E',
    fontWeight: '500',
  },
  legalDivider: {
    fontSize: 13,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  copyright: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AboutScreen;

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
  Mail,
  MessageCircle,
  HelpCircle,
  Book,
  Youtube,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@daash.app?subject=Daash Support Request');
  };

  const handleLiveChat = () => {
    console.log('Open live chat');
  };

  const handleFAQ = () => {
    Linking.openURL('https://daash.app/faq');
  };

  const handleDocumentation = () => {
    Linking.openURL('https://docs.daash.app');
  };

  const handleVideoTutorials = () => {
    Linking.openURL('https://youtube.com/@daash');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.openDrawer()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>
            Get support from our team or explore our help resources
          </Text>
        </View>

        {/* Contact Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Support</Text>

          <TouchableOpacity style={styles.supportItem} onPress={handleEmailSupport}>
            <View style={styles.supportLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                <Mail size={24} color="#FF3B30" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>Email Support</Text>
                <Text style={styles.supportDescription}>
                  Get help via email within 24 hours
                </Text>
              </View>
            </View>
            <ExternalLink size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.supportItem} onPress={handleLiveChat}>
            <View style={styles.supportLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5F5FF' }]}>
                <MessageCircle size={24} color="#007AFF" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>Live Chat</Text>
                <Text style={styles.supportDescription}>
                  Chat with our support team
                </Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Help Resources */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Help Resources</Text>

          <TouchableOpacity style={styles.resourceItem} onPress={handleFAQ}>
            <View style={styles.resourceLeft}>
              <HelpCircle size={24} color="#8A784E" />
              <Text style={styles.resourceText}>FAQs</Text>
            </View>
            <ExternalLink size={18} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.resourceItem} onPress={handleDocumentation}>
            <View style={styles.resourceLeft}>
              <Book size={24} color="#8A784E" />
              <Text style={styles.resourceText}>Documentation</Text>
            </View>
            <ExternalLink size={18} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.resourceItem} onPress={handleVideoTutorials}>
            <View style={styles.resourceLeft}>
              <Youtube size={24} color="#FF0000" />
              <Text style={styles.resourceText}>Video Tutorials</Text>
            </View>
            <ExternalLink size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Common Issues */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Issues</Text>

          <TouchableOpacity style={styles.issueItem}>
            <Text style={styles.issueText}>How to create a wallet?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.issueItem}>
            <Text style={styles.issueText}>How to send XLM?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.issueItem}>
            <Text style={styles.issueText}>How to complete KYC verification?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.issueItem}>
            <Text style={styles.issueText}>How to backup my wallet?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.issueItem}>
            <Text style={styles.issueText}>What are transaction fees?</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>Email: support@daash.app</Text>
          <Text style={styles.contactText}>Available: Mon-Fri, 9AM-5PM EST</Text>
        </View>

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
  heroSection: {
    backgroundColor: '#8A784E',
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#F5F5F5',
    textAlign: 'center',
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
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  supportLeft: {
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
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  badge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
    fontWeight: '500',
  },
  issueItem: {
    paddingVertical: 14,
  },
  issueText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  contactInfo: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SupportScreen;

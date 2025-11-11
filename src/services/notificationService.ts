import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
} from '../types/notification';
import { supabase } from '../config/supabase';

const NOTIFICATIONS_STORAGE_KEY = '@daash_notifications';
const NOTIFICATION_SETTINGS_KEY = '@daash_notification_settings';
const FCM_TOKEN_KEY = '@daash_fcm_token';

// Dynamically import Firebase with fallback for Expo Go
let messaging: any = null;
let isFirebaseAvailable = false;

try {
  messaging = require('@react-native-firebase/messaging').default;
  isFirebaseAvailable = true;
  console.log('✅ Firebase Cloud Messaging available');
} catch (error) {
  console.warn('⚠️ Firebase not available - running in Expo Go mode');
  isFirebaseAvailable = false;
}

class NotificationService {
  private fcmToken: string | null = null;

  /**
   * Initialize Firebase Cloud Messaging
   * Call this when app starts
   */
  async initialize(walletAddress?: string): Promise<void> {
    if (!isFirebaseAvailable || !messaging) {
      console.log('Firebase not available - skipping FCM initialization');
      return;
    }

    try {
      // Request permission
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Push notification permission not granted');
        return;
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (token && walletAddress) {
        // Register token with Supabase
        await this.registerFCMToken(token, walletAddress);
      }

      // Listen for token refresh
      this.setupTokenRefreshListener(walletAddress);

      // Handle foreground messages
      this.setupForegroundMessageHandler();

      // Handle background/quit state messages
      this.setupBackgroundMessageHandler();

      console.log('✅ Firebase Cloud Messaging initialized');
    } catch (error) {
      console.error('Error initializing FCM:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!isFirebaseAvailable || !messaging) {
      console.log('Firebase not available - skipping permission request');
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission denied');
            return false;
          }
        }
      }

      // Request iOS permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Push notification permission granted');
      } else {
        console.log('❌ Push notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token from device
   */
  async getFCMToken(): Promise<string | null> {
    if (!isFirebaseAvailable || !messaging) {
      return null;
    }

    try {
      // Check if we have cached token
      const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (cachedToken) {
        this.fcmToken = cachedToken;
        return cachedToken;
      }

      // Get new token
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
        return token;
      }

      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with Supabase
   */
  async registerFCMToken(fcmToken: string, walletAddress: string): Promise<void> {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        model: Platform.constants?.Model || 'unknown',
      };

      // Upsert token in Supabase
      const { error } = await supabase.from('push_tokens').upsert(
        {
          wallet_address: walletAddress,
          fcm_token: fcmToken,
          platform: Platform.OS,
          device_info: deviceInfo,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'wallet_address,platform',
        }
      );

      if (error) {
        console.error('Error registering FCM token:', error);
      } else {
        console.log('✅ FCM token registered with Supabase');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  /**
   * Unregister FCM token (on logout)
   */
  async unregisterFCMToken(walletAddress: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('wallet_address', walletAddress);

      if (error) {
        console.error('Error unregistering FCM token:', error);
      } else {
        console.log('✅ FCM token unregistered');
      }

      // Clear cached token
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.fcmToken = null;
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
    }
  }

  /**
   * Setup token refresh listener
   */
  private setupTokenRefreshListener(walletAddress?: string): void {
    if (!isFirebaseAvailable || !messaging || !walletAddress) return;

    messaging().onTokenRefresh(async (token: string) => {
      console.log('📱 FCM token refreshed');
      this.fcmToken = token;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await this.registerFCMToken(token, walletAddress);
    });
  }

  /**
   * Handle foreground messages
   */
  private setupForegroundMessageHandler(): void {
    if (!isFirebaseAvailable || !messaging) return;

    messaging().onMessage(async (remoteMessage: any) => {
      console.log('📬 Foreground notification received:', remoteMessage);

      // Create in-app notification
      if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;
        const data = remoteMessage.data || {};

        // Determine notification type
        let type = NotificationType.GENERAL;
        if (data.type === 'transaction_received') {
          type = NotificationType.TRANSACTION_RECEIVED;
        } else if (data.type === 'transaction_sent') {
          type = NotificationType.TRANSACTION_SENT;
        }

        await this.createAppNotification(
          type,
          title || 'Notification',
          body || '',
          data,
          NotificationPriority.HIGH
        );
      }
    });
  }

  /**
   * Handle background/quit state messages
   */
  private setupBackgroundMessageHandler(): void {
    if (!isFirebaseAvailable || !messaging) return;

    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('📬 Background notification received:', remoteMessage);
      // Background notifications are handled by Firebase automatically
    });
  }

  /**
   * Create and store an app notification
   */
  async createAppNotification(
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<AppNotification> {
    const notification: AppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      body,
      data,
      priority,
      read: false,
      timestamp: new Date(),
    };

    await this.saveNotification(notification);
    return notification;
  }

  /**
   * Save a notification to storage
   */
  private async saveNotification(notification: AppNotification): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      notifications.unshift(notification); // Add to beginning

      // Keep only last 100 notifications
      const trimmedNotifications = notifications.slice(0, 100);

      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(trimmedNotifications)
      );
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Get all stored notifications
   */
  async getAllNotifications(): Promise<AppNotification[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!notificationsJson) return [];

      const notifications = JSON.parse(notificationsJson);
      // Convert timestamp strings back to Date objects
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (!settingsJson) {
        // Default settings
        return {
          enabled: true,
          transactionNotifications: true,
          priceAlerts: true,
          securityAlerts: true,
          kycUpdates: true,
          generalNotifications: true,
          sound: true,
          vibration: true,
        };
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        enabled: true,
        transactionNotifications: true,
        priceAlerts: true,
        securityAlerts: true,
        kycUpdates: true,
        generalNotifications: true,
        sound: true,
        vibration: true,
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  /**
   * Send a transaction notification (creates in-app notification)
   * Push notification is sent from backend
   */
  async notifyTransaction(
    type: 'sent' | 'received',
    amount: string,
    asset: string = 'XLM'
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.transactionNotifications) return;

    const title = type === 'received' ? 'Payment Received' : 'Payment Sent';
    const body = `${type === 'received' ? '+' : '-'}${amount} ${asset}`;

    await this.createAppNotification(
      type === 'received'
        ? NotificationType.TRANSACTION_RECEIVED
        : NotificationType.TRANSACTION_SENT,
      title,
      body,
      { amount, asset, type: `transaction_${type}` },
      NotificationPriority.HIGH
    );
  }

  /**
   * Send a general notification
   */
  async notifyGeneral(title: string, body: string, data?: Record<string, any>): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.generalNotifications) return;

    await this.createAppNotification(
      NotificationType.GENERAL,
      title,
      body,
      data,
      NotificationPriority.MEDIUM
    );
  }

  /**
   * Send a security alert notification
   */
  async notifySecurityAlert(title: string, body: string, data?: Record<string, any>): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.securityAlerts) return;

    await this.createAppNotification(
      NotificationType.SECURITY_ALERT,
      title,
      body,
      data,
      NotificationPriority.URGENT
    );
  }

  /**
   * Send a KYC update notification
   */
  async notifyKYCUpdate(title: string, body: string, data?: Record<string, any>): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.kycUpdates) return;

    await this.createAppNotification(
      NotificationType.KYC_UPDATE,
      title,
      body,
      data,
      NotificationPriority.HIGH
    );
  }
}

export default new NotificationService();

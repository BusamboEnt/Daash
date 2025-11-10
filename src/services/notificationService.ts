import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
} from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = '@daash_notifications';
const NOTIFICATION_SETTINGS_KEY = '@daash_notification_settings';

// Configure how notifications are presented when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8A784E',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delaySeconds: number = 0
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
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
   * Send a transaction notification
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

    await this.scheduleNotification(title, body, { type: 'transaction', amount, asset });
    await this.createAppNotification(
      type === 'received'
        ? NotificationType.TRANSACTION_RECEIVED
        : NotificationType.TRANSACTION_SENT,
      title,
      body,
      { amount, asset },
      NotificationPriority.HIGH
    );
  }

  /**
   * Send a general notification
   */
  async notifyGeneral(title: string, body: string, data?: Record<string, any>): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.generalNotifications) return;

    await this.scheduleNotification(title, body, data);
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

    await this.scheduleNotification(title, body, data);
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

    await this.scheduleNotification(title, body, data);
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

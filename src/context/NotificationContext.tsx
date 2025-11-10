import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppNotification, NotificationSettings } from '../types/notification';
import NotificationService from '../services/notificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    transactionNotifications: true,
    priceAlerts: true,
    securityAlerts: true,
    kycUpdates: true,
    generalNotifications: true,
    sound: true,
    vibration: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();

    // Set up listeners for when notifications are received
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Refresh notifications when a new one is received
        refreshNotifications();
      }
    );

    // Set up listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap - navigate to relevant screen based on data
        const data = response.notification.request.content.data;
        // TODO: Add navigation logic based on notification data
      }
    );

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      setIsLoading(true);
      // Request permissions
      await NotificationService.requestPermissions();

      // Load notifications and settings
      await refreshNotifications();
      const loadedSettings = await NotificationService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const loadedNotifications = await NotificationService.getAllNotifications();
      setNotifications(loadedNotifications);

      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      await refreshNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await NotificationService.clearAllNotifications();
      await refreshNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      await NotificationService.updateSettings(newSettings);
      const updatedSettings = await NotificationService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

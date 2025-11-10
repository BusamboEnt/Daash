export enum NotificationType {
  TRANSACTION_RECEIVED = 'transaction_received',
  TRANSACTION_SENT = 'transaction_sent',
  PRICE_ALERT = 'price_alert',
  SECURITY_ALERT = 'security_alert',
  KYC_UPDATE = 'kyc_update',
  GENERAL = 'general',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  timestamp: Date;
  actionUrl?: string; // For navigation when tapped
}

export interface NotificationSettings {
  enabled: boolean;
  transactionNotifications: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  kycUpdates: boolean;
  generalNotifications: boolean;
  sound: boolean;
  vibration: boolean;
}

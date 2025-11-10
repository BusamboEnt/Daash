import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Bell,
  BellOff,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Shield,
  DollarSign,
  Info,
  Trash2,
  CheckCheck,
  X,
} from 'lucide-react-native';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification, NotificationType } from '../types/notification';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

const NotificationCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications();

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // TODO: Navigate based on notification type/data
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNotification(notificationId),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRANSACTION_RECEIVED:
        return <ArrowDown size={20} color="#6B9F6E" />;
      case NotificationType.TRANSACTION_SENT:
        return <ArrowUp size={20} color="#FF6B6B" />;
      case NotificationType.SECURITY_ALERT:
        return <Shield size={20} color="#FF9500" />;
      case NotificationType.KYC_UPDATE:
        return <DollarSign size={20} color="#8A784E" />;
      case NotificationType.PRICE_ALERT:
        return <DollarSign size={20} color="#007AFF" />;
      default:
        return <Info size={20} color="#8E8E93" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRANSACTION_RECEIVED:
        return '#E8F5E9';
      case NotificationType.TRANSACTION_SENT:
        return '#FFEBEE';
      case NotificationType.SECURITY_ALERT:
        return '#FFF3E0';
      case NotificationType.KYC_UPDATE:
        return '#F5F1E8';
      case NotificationType.PRICE_ALERT:
        return '#E3F2FD';
      default:
        return '#F5F5F5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) },
          ]}
        >
          {getNotificationIcon(item.type)}
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <X size={20} color="#8E8E93" />
        </TouchableOpacity>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BellOff size={64} color="#9CA3AF" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll receive notifications about transactions, security alerts, and more
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                <CheckCheck size={20} color="#8A784E" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
              <Trash2 size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : undefined}
        showsVerticalScrollIndicator={false}
      />
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
  headerActions: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  unreadBanner: {
    backgroundColor: '#8A784E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  unreadBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#8A784E',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A784E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NotificationCenterScreen;

import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import SearchBar from './SearchBar';
import MenuButton from './MenuButton';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  onSearch?: (text: string) => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuPress, onNotificationPress }) => {
  const { unreadCount } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <SearchBar
          placeholder="Daash Search"
          onSearch={onSearch}
        />
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.notificationButton}
        >
          <Bell size={24} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <MenuButton onPress={onMenuPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#8A784E',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  notificationButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Header;

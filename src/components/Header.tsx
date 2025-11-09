import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import SearchBar from './SearchBar';
import MenuButton from './MenuButton';

interface HeaderProps {
  onSearch?: (text: string) => void;
  onMenuPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuPress }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <SearchBar
          placeholder="Daash Search"
          onSearch={onSearch}
        />
        <MenuButton onPress={onMenuPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
});

export default Header;

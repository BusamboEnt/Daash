import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Home, Search, User } from 'lucide-react-native';

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

type HomeProps = BottomTabScreenProps<TabParamList, 'Home'>;
type SearchProps = BottomTabScreenProps<TabParamList, 'Search'>;
type ProfileProps = BottomTabScreenProps<TabParamList, 'Profile'>;

const Tab = createBottomTabNavigator<TabParamList>();

function HomeScreen({ navigation }: HomeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to Daash!</Text>
      <Text style={styles.text}>This is a React Native app with TypeScript and Bottom Tab Navigation</Text>
    </View>
  );
}

function SearchScreen({ navigation }: SearchProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Screen</Text>
      <Text style={styles.subtitle}>Find what you need</Text>
      <Text style={styles.text}>Search functionality goes here</Text>
    </View>
  );
}

function ProfileScreen({ navigation }: ProfileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Your Profile</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Name:</Text>
        <Text style={styles.infoValue}>John Doe</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>john@example.com</Text>
      </View>
    </View>
  );
}

function SplashScreen() {
  return (
    <ImageBackground
      source={require('./assets/splashscreen.png')}
      style={styles.splashContainer}
      resizeMode="cover"
    >
      <Text style={styles.splashText}>Daash</Text>
    </ImageBackground>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
            tabBarIcon: ({ focused, color, size }) => {
              if (route.name === 'Home') {
                return <Home color={color} size={26} />;
              } else if (route.name === 'Search') {
                return <Search color={color} size={26} />;
              } else if (route.name === 'Profile') {
                return <User color={color} size={26} />;
              }
              return null;
            },
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#8E8E93',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#007AFF',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
});

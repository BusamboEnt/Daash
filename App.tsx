import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, AbrilFatface_400Regular } from '@expo-google-fonts/abril-fatface';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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
      <Text style={styles.title}>🏠 Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to Daash!</Text>
      <Text style={styles.text}>This is a React Native app with TypeScript and Bottom Tab Navigation</Text>
    </View>
  );
}

function SearchScreen({ navigation }: SearchProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Search Screen</Text>
      <Text style={styles.subtitle}>Find what you need</Text>
      <Text style={styles.text}>Search functionality goes here</Text>
    </View>
  );
}

function ProfileScreen({ navigation }: ProfileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile Screen</Text>
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

function CustomSplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashText}>Daash</Text>
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  let [fontsLoaded] = useFonts({
    AbrilFatface_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded) {
          // Wait 3 seconds
          await new Promise(resolve => setTimeout(resolve, 3000));
          setShowSplash(false);
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || showSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>🏠</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>🔍</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>👤</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
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
    backgroundColor: '#5D5D5D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontFamily: 'AbrilFatface_400Regular',
    fontSize: 64,
    color: '#FFFFFF',
    fontWeight: 'normal',
  },
});

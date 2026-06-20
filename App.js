import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import { theme } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/notificationHelper';
import { SplashScreen } from './src/screens/Splash/SplashScreen';
import { OfflineOverlay } from './src/components/OfflineOverlay';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';

// Prevent the native splash screen from auto-hiding before the JS bundle is ready
if (ExpoSplashScreen && typeof ExpoSplashScreen.preventAutoHideAsync === 'function') {
  ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
}

// Initialize TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache stale duration
      cacheTime: 1000 * 60 * 30, // 30 minutes garbage collection duration
      refetchOnWindowFocus: false, // Prevents excessive fetches in hybrid/web layouts
      retry: 1,
    },
  },
});

const setNavBarBlack = () => {
  if (Platform.OS === 'android' && NavigationBar) {
    if (typeof NavigationBar.setBackgroundColorAsync === 'function') {
      NavigationBar.setBackgroundColorAsync('#000000').catch(() => {});
    }
    if (typeof NavigationBar.setButtonStyleAsync === 'function') {
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Request permission and register device push tokens on mount
    registerForPushNotificationsAsync();
    // Set Android navigation bar to solid black with light icons
    setNavBarBlack();
  }, []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#064e3b" translucent={false} />
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <OfflineOverlay />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: theme.colors.primary }} />
        <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NotificationProvider>
                <CartProvider>
                  <NavigationContainer onStateChange={setNavBarBlack}>
                    <StatusBar style="light" backgroundColor="transparent" translucent={true} />
                    <AppNavigator />
                  </NavigationContainer>
                </CartProvider>
              </NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </View>
      </View>
      <OfflineOverlay />
    </SafeAreaProvider>
  );
}

import React, { useEffect } from 'react';
import { View } from 'react-native';
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

export default function App() {
  useEffect(() => {
    // Request permission and register device push tokens on mount
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: theme.colors.primary }} />
        <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NotificationProvider>
                <CartProvider>
                  <NavigationContainer>
                    <StatusBar style="light" backgroundColor="transparent" translucent={true} />
                    <AppNavigator />
                  </NavigationContainer>
                </CartProvider>
              </NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

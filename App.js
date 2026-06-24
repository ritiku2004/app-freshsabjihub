import React, { useEffect, useState } from 'react';
import { View, Platform, Image, Text } from 'react-native';
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

import { OfflineOverlay } from './src/components/OfflineOverlay';

import * as NavigationBar from 'expo-navigation-bar';



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

    // Toggle splash screen off after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#15803D', justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar style="light" backgroundColor="#15803D" translucent={true} />
          
          {/* Logo container in the middle */}
          <View style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}>
            <Image 
              source={require('./assets/Logo/logo.png')} 
              style={{ width: 110, height: 110, resizeMode: 'contain' }} 
            />
          </View>

          {/* Modern bottom branding container */}
          <View style={{ position: 'absolute', bottom: 80, alignItems: 'center', width: '100%' }}>
            {/* Brand Title */}
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textTransform: 'uppercase' }}>
              Fresh Sabji Hub
            </Text>
            
            {/* Elegant Divider Line */}
            <View style={{ width: 40, height: 3, backgroundColor: '#FBBF24', borderRadius: 1.5, marginVertical: 12 }} />
            
            {/* Tagline in premium warm color */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FEF3C7', letterSpacing: 0.5, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18 }}>
              Fresh vegetables & fruits delivered to your doorstep 🥬
            </Text>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: theme.colors.primary }} />
        <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <AuthProvider>
                <CartProvider>
                  <NavigationContainer onStateChange={setNavBarBlack}>
                    <StatusBar style="light" backgroundColor="transparent" translucent={true} />
                    <AppNavigator />
                  </NavigationContainer>
                </CartProvider>
              </AuthProvider>
            </NotificationProvider>
          </QueryClientProvider>
        </View>
      </View>
      <OfflineOverlay />
    </SafeAreaProvider>
  );
}

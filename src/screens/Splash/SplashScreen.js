import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { theme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, rf } from '../../utils/responsive';
import * as ExpoSplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

export const SplashScreen = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  
  // Minimal fade transition for the whole container at the end
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide the native splash screen now that JS has loaded and our static splash is visible safely
    if (ExpoSplashScreen && typeof ExpoSplashScreen.hideAsync === 'function') {
      ExpoSplashScreen.hideAsync().catch(() => {});
    }

    // Show the splash screen for 1.5 seconds, then perform a quick, clean fade out
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Center Logo Content */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoContainerShadow}>
          <Image
            source={require('../../../assets/Logo/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Footer Slogan with extra bottom spacing */}
      <View 
        style={[
          styles.footer, 
          { 
            paddingBottom: Math.max(insets.bottom + moderateScale(48), moderateScale(72))
          }
        ]}
      >
        <Text style={styles.appName}>FRESH SABJI HUB</Text>
        <Text style={styles.slogan}>Farm Freshness Delivered Daily 🥬</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b', // Rich, deep organic forest green background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainerShadow: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    padding: moderateScale(12),
  },
  logoImage: {
    width: '90%',
    height: '90%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  appName: {
    color: '#ffffff',
    fontSize: rf(16),
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: moderateScale(6),
  },
  slogan: {
    color: '#A7F3D0', // Mint green tint
    fontSize: rf(12),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;

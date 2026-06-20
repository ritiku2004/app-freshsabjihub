import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { theme } from '../theme';
import { moderateScale, rf } from '../utils/responsive';

export const OfflineOverlay = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  
  // Animation state values
  const visibleAnim = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subscribe to real-time network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isCurrConnected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(isCurrConnected);
      
      Animated.timing(visibleAnim, {
        toValue: isCurrConnected ? 0 : 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  // Icon pulse effect loops when offline
  useEffect(() => {
    let pulse;
    if (!isConnected) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.12,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseScale.setValue(1);
    }

    return () => {
      if (pulse) pulse.stop();
    };
  }, [isConnected]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    
    // Animate checking icon rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ).start();

    // Fetch latest state manually
    const state = await NetInfo.refresh();
    const isCurrConnected = state.isConnected && state.isInternetReachable !== false;
    
    setTimeout(() => {
      setIsChecking(false);
      rotateAnim.setValue(0);
      setIsConnected(isCurrConnected);
      
      Animated.timing(visibleAnim, {
        toValue: isCurrConnected ? 0 : 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  if (isConnected && visibleAnim._value === 0) {
    return null;
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: visibleAnim,
          transform: [
            {
              scale: visibleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1.1, 1],
              }),
            },
          ],
        }
      ]}
      pointerEvents={isConnected ? 'none' : 'auto'}
    >
      <View style={styles.content}>
        {/* Animated WifiOff icon block */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseScale }] }]}>
          <WifiOff size={48} color={theme.colors.primary} />
        </Animated.View>

        {/* Text descriptions */}
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.description}>
          Your device isn't connected to the internet. Please check your mobile data or Wi-Fi settings.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleManualCheck}
          disabled={isChecking}
          activeOpacity={0.8}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.buttonRow}>
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }], marginRight: 8 }}>
                <RefreshCw size={18} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.buttonText}>Try Again</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999, // Layer on top of everything
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: rf(20),
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xxl,
  },
  retryButton: {
    width: '100%',
    height: moderateScale(48),
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: rf(14),
    fontWeight: '700',
  },
});

export default OfflineOverlay;

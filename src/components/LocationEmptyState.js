import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { MapPinOff, Bike } from 'lucide-react-native';
import { theme } from '../theme';
import { moderateScale, rf } from '../utils/responsive';

export const LocationEmptyState = ({ type, activeAddress, onAction }) => {
  // Animation setup
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const config = {
    missing: {
      title: 'Missing Address',
      desc: 'Please add a delivery address to view available products in your area.',
      btnText: 'Add Address',
    },
    outOfZone: {
      title: 'No Service Available',
      desc: '',
      btnText: 'Change Address',
    }
  };

  const stateConfig = config[type];

  return (
    <View style={{ padding: theme.spacing.xl, alignItems: 'center', marginTop: moderateScale(40) }}>
      <Animated.View 
        style={{ 
          width: 120, 
          height: 120, 
          backgroundColor: `${theme.colors.primary}15`, // Soft tinted background
          borderRadius: 60,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
          transform: [
            { scale: pulseAnim },
            { translateY: floatAnim }
          ]
        }} 
      >
        {type === 'missing' ? (
          <MapPinOff size={60} color={theme.colors.primary} />
        ) : (
          <Bike size={64} color={theme.colors.primary} />
        )}
      </Animated.View>
      <Text style={{ fontSize: rf(20), fontWeight: '800', color: theme.colors.text }}>{stateConfig.title}</Text>
      {stateConfig.desc ? (
        <Text style={{ fontSize: rf(14), color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}>
          {stateConfig.desc}
        </Text>
      ) : null}
      <TouchableOpacity 
        style={{ 
          marginTop: theme.spacing.xl, 
          backgroundColor: theme.colors.primary, 
          paddingHorizontal: theme.spacing.xxl, 
          paddingVertical: theme.spacing.md, 
          borderRadius: moderateScale(12), // Bit rounded, not pill
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={onAction}
        activeOpacity={0.8}
      >
        <Text style={{ color: theme.colors.white, fontWeight: '700', fontSize: rf(14) }}>{stateConfig.btnText}</Text>
      </TouchableOpacity>
    </View>
  );
};

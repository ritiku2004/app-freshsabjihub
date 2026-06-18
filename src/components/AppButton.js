import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { moderateScale } from '../utils/responsive';

export const AppButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline'
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';

  const buttonStyles = [
    styles.button,
    isSecondary && styles.secondaryButton,
    isDanger && styles.dangerButton,
    isOutline && styles.outlineButton,
    disabled && styles.disabledButton,
    style,
  ];

  const labelStyles = [
    styles.text,
    isSecondary && styles.secondaryText,
    isDanger && styles.dangerText,
    isOutline && styles.outlineText,
    disabled && styles.disabledText,
    textStyle,
  ];

  // If primary action and not disabled, render a beautiful green gradient background
  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={[buttonStyles, { overflow: 'hidden', backgroundColor: 'transparent', elevation: 0 }]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.primary, ...theme.shadows.sm }]} />
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.white} />
        ) : (
          <Text style={labelStyles}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Fallback for other variants (outline, secondary, danger, disabled)
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isSecondary ? theme.colors.primary : theme.colors.white}
        />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

  button: {
    height: moderateScale(50),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryLight,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    backgroundColor: theme.colors.lightGray,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg - 2,
    fontWeight: theme.typography.weights.bold,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';
import { moderateScale } from '../utils/responsive';

export const AppInput = ({
  value,
  onChangeText,
  placeholder,
  icon: IconComponent,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  label,
  style = {},
  containerStyle = {},
  ...props
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
      {IconComponent && (
        <View style={styles.iconContainer}>
          <IconComponent size={20} color={theme.colors.textSecondary} />
        </View>
      )}
      <TextInput
        style={[styles.input, IconComponent ? styles.inputWithIcon : null, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        {...props}
      />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(6),
  },
  container: {
    height: moderateScale(50),
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    height: '100%',
    outlineStyle: 'none',
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.xs,
  },
});

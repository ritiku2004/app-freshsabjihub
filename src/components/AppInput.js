import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
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
  style = {},
  containerStyle = {},
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
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
  );
};

const styles = StyleSheet.create({
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

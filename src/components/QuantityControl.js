import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { theme } from '../theme';
import { moderateScale } from '../utils/responsive';

export const QuantityControl = ({
  quantity = 0,
  onIncrement,
  onDecrement,
  maxQuantity = 99,
  style = {},
}) => {
  if (quantity === 0) {
    return (
      <TouchableOpacity
        style={[styles.addButton, style]}
        onPress={onIncrement}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>ADD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.controlContainer, style]}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onDecrement}
        activeOpacity={0.7}
      >
        <Minus size={16} color={theme.colors.white} strokeWidth={2.5} />
      </TouchableOpacity>
      
      <Text style={styles.quantityText}>{quantity}</Text>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onIncrement}
        disabled={quantity >= maxQuantity}
        activeOpacity={0.7}
      >
        <Plus size={16} color={theme.colors.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: theme.colors.primaryLight, 
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: moderateScale(6),
    height: moderateScale(28),
    width: moderateScale(68),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs + 1,
    letterSpacing: 0.5,
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary, 
    borderRadius: moderateScale(6),
    height: moderateScale(28),
    width: moderateScale(68),
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(2),
  },
  actionButton: {
    width: moderateScale(22),
    height: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    minWidth: 14,
  },
});

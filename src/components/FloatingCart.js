import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { CartContext } from '../context/CartContext';
import { moderateScale, rf } from '../utils/responsive';

export const FloatingCart = () => {
  const navigation = useNavigation();
  const { cartItems, cartTotalQuantity } = useContext(CartContext);

  if (cartItems.length === 0) return null;

  // Take the first 3 items to show as stacked thumbnails
  const displayItems = cartItems.slice(0, 3);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Cart')}
      activeOpacity={0.9}
    >
      {/* Stacked Thumbnails */}
      <View style={styles.thumbnailStack}>
        {displayItems.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.thumbnailWrapper,
              { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -14 },
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="contain" />
          </View>
        ))}
        {cartItems.length > 3 && (
          <View style={[styles.moreCountBadge, { zIndex: 5 }]}>
            <Text style={styles.moreCountText}>+{cartItems.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Cart Summary Text */}
      <View style={styles.textDetails}>
        <Text style={styles.mainTitle}>View cart</Text>
        <Text style={styles.subTitle}>
          {cartTotalQuantity} {cartTotalQuantity === 1 ? 'ITEM' : 'ITEMS'}
        </Text>
      </View>

      {/* Chevron Icon */}
      <ChevronRight size={20} color={theme.colors.white} strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: moderateScale(76), // Floats just above bottom navigation bar
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.success, // Blinkit Green #0C831F
    borderRadius: moderateScale(24),
    height: moderateScale(52),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.lg,
    zIndex: 999,
  },
  thumbnailStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '85%',
    height: '85%',
    borderRadius: moderateScale(12),
  },
  moreCountBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -14,
  },
  moreCountText: {
    fontSize: rf(9),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  textDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: theme.typography.weights.bold,
  },
  subTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    marginLeft: moderateScale(6),
  },
});

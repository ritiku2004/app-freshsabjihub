import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { theme } from '../theme';
import { QuantityControl } from './QuantityControl';
import { moderateScale, rf } from '../utils/responsive';

export const ProductCard = React.memo(({
  product,
  cartQuantity = 0,
  onPress,
  onIncrement,
  onDecrement,
  style = {},
}) => {
  const { name, price, discountPrice, unit, image, stock } = product;
  const hasDiscount = discountPrice && discountPrice < price;
  const isOutOfStock = stock <= 0;

  // Calculate discount percentage
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <TouchableOpacity
      style={[styles.card, isOutOfStock && styles.outOfStockCard, style]}
      onPress={onPress}
      disabled={isOutOfStock}
      activeOpacity={0.9}
    >
      {/* Product Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}

        {/* Veg Icon (Bottom Left) */}
        <View style={styles.vegIcon}>
          <View style={styles.vegDot} />
        </View>

        {/* Overlapping ADD Button (Bottom Right) */}
        {!isOutOfStock && (
          <View style={styles.addButtonWrapper}>
            <QuantityControl
              quantity={cartQuantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              maxQuantity={stock}
            />
          </View>
        )}
      </View>

      {/* Product Info Section */}
      <View style={styles.infoContainer}>
        
        {/* Unit Tag */}
        <View style={styles.unitTag}>
          <Text style={styles.unitText}>{unit}</Text>
        </View>

        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Delivery Time Placeholder */}
        <View style={styles.deliveryRow}>
          <Clock size={12} color="#16A34A" />
          <Text style={styles.deliveryText}>14 MINS</Text>
        </View>

        {/* Discount badge - only shown when there's an actual discount */}
        {hasDiscount && (
          <Text style={styles.discountText}>
            {discountPercent}% OFF
          </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{discountPrice || price}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>MRP ₹{price}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the product changes or its specific cart quantity changes.
  // We ignore function reference changes (onPress, onIncrement, onDecrement) because
  // parent components might re-create them every render, but they perform the exact same logical action.
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.cartQuantity === nextProps.cartQuantity
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%', 
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  outOfStockCard: {
    opacity: 0.6,
  },
  imageContainer: {
    height: moderateScale(115),
    backgroundColor: '#F8FAFC',
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockText: {
    color: '#FFFFFF',
    backgroundColor: theme.colors.error || '#EF4444',
    fontSize: rf(10),
    fontWeight: '800',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(4),
    letterSpacing: 0.5,
  },
  vegIcon: {
    position: 'absolute',
    bottom: moderateScale(8),
    left: moderateScale(8),
    width: moderateScale(14),
    height: moderateScale(14),
    borderWidth: 1,
    borderColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  vegDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#16A34A',
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: moderateScale(-14),
    right: moderateScale(0), // Flush right corner
    zIndex: 10,
    borderRadius: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    padding: moderateScale(10),
    flex: 1,
  },
  unitTag: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(4),
    marginBottom: moderateScale(6),
  },
  unitText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: '#475569',
  },
  name: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: rf(16),
    height: rf(32), // Forces exactly 2 lines of height
    marginBottom: moderateScale(6),
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  deliveryText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#475569',
    marginLeft: moderateScale(4),
  },
  discountText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: moderateScale(4),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginRight: moderateScale(6),
  },
  originalPrice: {
    fontSize: rf(11),
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
});

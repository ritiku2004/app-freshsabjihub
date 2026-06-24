import React, { useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share2, Truck, ShieldCheck, Leaf } from 'lucide-react-native';
import { theme } from '../../theme';
import { api } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { QuantityControl } from '../../components/QuantityControl';
import { ProductCard } from '../../components/ProductCard';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import styles from './styles';
import { moderateScale } from '../../utils/responsive';

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const { activeShop } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  // React Query: Fetch product info
  const { data: product, isLoading, isFetching, error, refetch: refetchProduct } = useQuery({
    queryKey: ['productDetails', productId],
    queryFn: () => api.getProductDetails(productId),
  });

  // React Query: Fetch category products as related recommendations
  const { data: relatedData, refetch: refetchRelated } = useQuery({
    queryKey: ['relatedProducts', product?.categoryId],
    queryFn: () => api.getProducts({ categoryId: product?.categoryId, limit: 4 }),
    enabled: !!product?.categoryId,
  });
  const relatedProducts = (relatedData?.products || []).filter((p) => p.id !== productId);

  useFocusEffect(
    useCallback(() => {
      refetchProduct();
      if (product?.categoryId) {
        refetchRelated();
      }
    }, [productId, product?.categoryId])
  );

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Order ${product.name} on Fresh Sabji Hub now! Fresh groceries delivered quickly.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getCartQuantity = () => {
    if (!product) return 0;
    const item = cartItems.find((ci) => String(ci.productId) === String(product.id));
    return item ? item.quantity : 0;
  };

  const getCartItemId = () => {
    if (!product) return null;
    const item = cartItems.find((ci) => String(ci.productId) === String(product.id));
    return item ? item.id : null;
  };

  const handleAdd = () => {
    if (product) addToCart(product, activeShop?.id);
  };

  const handleUpdateQty = (qty) => {
    if (product) updateQuantity(getCartItemId(), qty);
  };

  if (isLoading || isFetching) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]} locations={[0, 0.55, 1]} style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <ArrowLeft size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <Loader />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={{ color: theme.colors.error }}>Failed to load product details</Text>
          <TouchableOpacity
            style={{ marginTop: moderateScale(10), padding: moderateScale(10), backgroundColor: theme.colors.primary, borderRadius: moderateScale(5) }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#fff' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { name, price, discountPrice, unit, image, description, stock, rating } = product;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const currentQuantity = getCartQuantity();

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]} locations={[0, 0.55, 1]} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Product Card Image */}
        <View style={styles.imageCard}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
          {stock <= 0 && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>

        {/* Pricing Info Card */}
        <View style={styles.contentCard}>
          <View style={styles.metaRow}>
            {stock < 10 && stock > 0 ? (
              <Text style={styles.stockWarning}>Only {stock} left in stock!</Text>
            ) : null}
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.unit}>{unit}</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceLayout}>
              {hasDiscount ? (
                <>
                  <Text style={styles.discountPrice}>₹{discountPrice}</Text>
                  <Text style={styles.originalPrice}>₹{price}</Text>
                  <View style={styles.savingsLabel}>
                    <Text style={styles.savingsText}>{discountPercent}% OFF</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.discountPrice}>₹{price}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Product Description - only shown if description exists */}
        {!!description && description.trim().length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}

        {/* Product Specifications */}
        {product.features && product.features.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={{ marginTop: moderateScale(8) }}>
              {product.features.map((item, index) => (
                <View 
                  key={index} 
                  style={{ 
                    flexDirection: 'row', 
                    paddingVertical: moderateScale(10), 
                    borderBottomWidth: index === product.features.length - 1 ? 0 : 1, 
                    borderBottomColor: '#f1f5f9',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: moderateScale(13), color: '#64748b', fontWeight: '500', flex: 1 }}>
                    {item.feature_name}
                  </Text>
                  <Text style={{ fontSize: moderateScale(13), color: '#0f172a', fontWeight: '600', flex: 1.5, textAlign: 'right' }}>
                    {item.feature_value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Trust Indicators */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Why Choose Fresh Sabji Hub?</Text>

          <View style={styles.trustContainer}>
            <View style={styles.trustRow}>
              <View style={styles.iconContainer}>
                <Truck size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.trustTextContainer}>
                <Text style={styles.trustFeatureTitle}>Superfast Delivery</Text>
                <Text style={styles.trustFeatureDesc}>Get items at your doorstep quickly.</Text>
              </View>
            </View>

            <View style={styles.trustRow}>
              <View style={styles.iconContainer}>
                <Leaf size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.trustTextContainer}>
                <Text style={styles.trustFeatureTitle}>Freshness Sourced Daily</Text>
                <Text style={styles.trustFeatureDesc}>Products undergo rigorous quality checks before shipping.</Text>
              </View>
            </View>

            <View style={styles.trustRowLast}>
              <View style={styles.iconContainer}>
                <ShieldCheck size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.trustTextContainer}>
                <Text style={styles.trustFeatureTitle}>Safe & Sealed Packaging</Text>
                <Text style={styles.trustFeatureDesc}>Sealed packets with separate packaging for household supplies.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Suggestions List */}
        {relatedProducts.length > 0 && (
          <View style={{ marginBottom: theme.spacing.xl }}>
            <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
              <Text style={styles.sectionTitle}>You Might Also Like</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScroll}
            >
              {relatedProducts.map((prod) => {
                const qty = cartItems.find((ci) => String(ci.productId) === String(prod.id))?.quantity || 0;
                const cartItemId = cartItems.find((ci) => String(ci.productId) === String(prod.id))?.id || null;
                return (
                  <View key={prod.id} style={{ width: moderateScale(150), marginRight: theme.spacing.md }}>
                    <ProductCard
                      product={prod}
                      cartQuantity={qty}
                      onPress={() => navigation.push('ProductDetails', { productId: prod.id })}
                      onIncrement={() => addToCart(prod, activeShop?.id)}
                      onDecrement={() => updateQuantity(cartItemId, qty - 1)}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomStickyBar}>
        <View>
          <Text style={styles.stickyPriceLabel}>Total Price</Text>
          <Text style={styles.stickyPriceText}>
            ₹{(discountPrice || price) * (currentQuantity || 1)}
          </Text>
        </View>

        {stock > 0 ? (
          <QuantityControl
            quantity={currentQuantity}
            onIncrement={handleAdd}
            onDecrement={() => handleUpdateQty(currentQuantity - 1)}
            maxQuantity={stock}
            style={styles.stickyQuantityControl}
          />
        ) : (
          <View style={styles.disabledStickyButton}>
            <Text style={styles.disabledStickyButtonText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>
    </View>
  );
};

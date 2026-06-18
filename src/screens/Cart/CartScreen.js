import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Modal, TextInput, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, MapPin, ChevronRight, Sparkles, Trash2, ArrowRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { theme } from '../../theme';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { QuantityControl } from '../../components/QuantityControl';
import { LocationEmptyState } from '../../components/LocationEmptyState';
import { Loader } from '../../components/Loader';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const CartScreen = ({ navigation }) => {
  const { activeAddress, serviceAvailable, isAuthenticated } = useContext(AuthContext);
  const {
    cartItems,
    cartSubtotal,
    cartSavings,
    deliveryFee,
    handlingFee,
    cartGrandTotal,
    freeDeliveryThreshold,
    freeHandlingThreshold,
    deliveryDistanceKm,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  } = useContext(CartContext);

  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const load = async () => {
        setIsLoading(true);
        await fetchCart();
        if (active) setIsLoading(false);
      };
      load();
      return () => {
        active = false;
      };
    }, [fetchCart])
  );
  const insets = useSafeAreaInsets();

  const [deliveryTip, setDeliveryTip] = useState(0);
  const [isCustomTipVisible, setIsCustomTipVisible] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState('');

  // Fetch categories to display on empty cart screen
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const finalTotal = Math.max(0, cartGrandTotal + deliveryTip);

  // Calculate promo message
  let promoMessage = null;
  const distDelivery = freeDeliveryThreshold > 0 ? freeDeliveryThreshold - cartSubtotal : 0;
  const distHandling = freeHandlingThreshold > 0 ? freeHandlingThreshold - cartSubtotal : 0;

  if (distDelivery > 0 && distHandling > 0) {
    if (distDelivery <= distHandling) {
      promoMessage = `Add ₹${distDelivery} more for free delivery!`;
    } else {
      promoMessage = `Add ₹${distHandling} more for free handling!`;
    }
  } else if (distDelivery > 0) {
    promoMessage = `Add ₹${distDelivery} more for free delivery!`;
  } else if (distHandling > 0) {
    promoMessage = `Add ₹${distHandling} more for free handling!`;
  }

  const handleCheckout = () => {
    // Only proceed if there is at least 1 available item
    const availableItems = cartItems.filter(item => item.isAvailable);
    if (availableItems.length === 0) {
      Alert.alert('Empty Cart', 'You have no available items to checkout in your current location.');
      return;
    }
    
    if (!isAuthenticated) {
      navigation.navigate('Login', { 
        redirectTo: 'Checkout', 
        params: { deliveryTip, availableItems } 
      });
      return;
    }

    navigation.navigate('Checkout', { deliveryTip, availableItems });
  };

  const emptyIconScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (cartItems.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyIconScale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(emptyIconScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [cartItems.length]);

  // 1. Missing or Out-of-zone Delivery Address State
  if (!activeAddress || !serviceAvailable) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </LinearGradient>
        <LocationEmptyState 
          type={!activeAddress ? "missing" : "outOfZone"} 
          activeAddress={activeAddress}
          onAction={() => navigation.navigate('AddressManagement')} 
        />
      </View>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </LinearGradient>
        <Loader />
      </View>
    );
  }

  // 3. Empty Cart State
  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header with LinearGradient & Safe Area Padding */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.emptyScrollContent, { paddingBottom: 0 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty Illustration and Message */}
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIconWrapper, { transform: [{ scale: emptyIconScale }] }]}>
              <LinearGradient
                colors={['#DCFCE7', '#F0FDF4']}
                style={styles.emptyIconGradient}
              >
                <ShoppingBag size={moderateScale(48)} color={theme.colors.primary} />
                <View style={styles.sparkleBadge}>
                  <Sparkles size={moderateScale(14)} color={theme.colors.accent} />
                </View>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Add items to your cart to experience superfast 12-minute delivery at your doorstep!
            </Text>

            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.shopNowBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.shopNowBtnText}>Start Shopping</Text>
                <ArrowRight size={moderateScale(16)} color={theme.colors.white} style={{ marginLeft: moderateScale(6) }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Popular Categories suggestions */}
          {categories.length > 0 && (
            <View style={styles.popularCategoriesContainer}>
              <View style={styles.popularHeader}>
                <Text style={styles.popularTitle}>Shop Popular Categories</Text>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularScrollContent}
              >
                {categories.slice(0, 8).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.popularCatCard}
                    onPress={() => {
                      navigation.navigate('CategoryProducts', { categoryId: cat.id });
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.popularCatImageContainer}>
                      <Image source={{ uri: cat.image }} style={styles.popularCatImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.popularCatName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]} locations={[0, 0.55, 1]} style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length} items)</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart items list */}
        <View style={styles.card}>
          {cartItems.map((item) => (
            <View key={item.id} style={[styles.cartItemRow, item.isAvailable === false && { opacity: 0.5 }]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
                
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>₹{item.discountPrice || item.price}</Text>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <Text style={styles.itemOriginalPrice}>₹{item.price}</Text>
                  )}
                </View>

                {item.isAvailable === false && (
                  <Text style={styles.unavailableText}>Not available at current location</Text>
                )}
              </View>

              {item.isAvailable !== false ? (
                <QuantityControl
                  quantity={item.quantity}
                  onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                  maxQuantity={item.stock}
                />
              ) : (
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ padding: 4 }}>
                  <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Tipping Card Section */}
        <View style={styles.tipCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: moderateScale(16), paddingTop: moderateScale(16) }}>
            <View style={{ flex: 1, marginRight: moderateScale(10) }}>
              <Text style={{ fontSize: rf(14), fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: moderateScale(4) }}>Tip your delivery partner</Text>
              <Text style={{ fontSize: rf(11), color: theme.colors.textSecondary, lineHeight: rf(15) }}>
                Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
              </Text>
            </View>
            <View style={{ width: moderateScale(60), height: moderateScale(60), justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: rf(32) }}>🛵</Text>
            </View>
          </View>

          {/* Tipping Button Options */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: moderateScale(16) }}>
            {[20, 30, 50].map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipButton,
                  deliveryTip === tip ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : null,
                ]}
                onPress={() => setDeliveryTip(deliveryTip === tip ? 0 : tip)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tipText, deliveryTip === tip ? { color: theme.colors.white, fontWeight: 'bold' } : null]}>
                  {tip === 20 ? '😊 ' : tip === 30 ? '🤩 ' : '😍 '}₹{tip}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.tipButton,
                deliveryTip > 0 && ![20, 30, 50].includes(deliveryTip) ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : null,
              ]}
              onPress={() => setIsCustomTipVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tipText, deliveryTip > 0 && ![20, 30, 50].includes(deliveryTip) ? { color: theme.colors.white, fontWeight: 'bold' } : null]}>
                👏 Custom
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Bill Summary Card */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{cartSubtotal}</Text>
          </View>

          {cartSavings > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Product Discount</Text>
              <Text style={[styles.billValue, styles.billValueDiscount]}>-₹{cartSavings}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.billLabel}>Delivery Partner Fee</Text>
              {deliveryDistanceKm != null && deliveryDistanceKm > 0 && (
                <Text style={{ fontSize: rf(10), color: theme.colors.textSecondary, marginTop: 2 }}>
                  📍 {deliveryDistanceKm} km away
                </Text>
              )}
            </View>
            <Text style={deliveryFee === 0 ? styles.billValueFree : styles.billValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Handling & Packaging Charges</Text>
            <Text style={styles.billValue}>₹{handlingFee}</Text>
          </View>

          {deliveryTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Partner Tip</Text>
              <Text style={styles.billValue}>₹{deliveryTip}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalValue}>₹{finalTotal}</Text>
          </View>
        </View>

        {/* Promo Banner at bottom */}
        {promoMessage && (
          <View style={[styles.promoBanner, { marginTop: 0, marginBottom: moderateScale(16) }]}>
            <Sparkles size={moderateScale(16)} color={theme.colors.primary} />
            <Text style={styles.promoText}>{promoMessage}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
        <View style={styles.addressSnippetRow}>
          <MapPin size={16} color={theme.colors.primary} />
          <Text style={styles.addressSnippetText} numberOfLines={1}>
            {activeAddress
              ? `Delivering to: ${activeAddress.type} | ${activeAddress.flatNo}, ${activeAddress.addressLine}`
              : 'Please select a delivery address'}
          </Text>
        </View>

        <View style={styles.checkoutActionRow}>
          <View style={styles.checkoutPriceBox}>
            <Text style={styles.checkoutPriceText}>₹{finalTotal}</Text>
            <Text style={styles.checkoutPriceLabel}>TOTAL AMOUNT</Text>
          </View>
          
          <AppButton
            title={isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
            onPress={handleCheckout}
            style={[styles.checkoutButton, cartItems.filter(i => i.isAvailable).length === 0 && { opacity: 0.5 }]}
            textStyle={{ fontSize: rf(13) }}
            disabled={cartItems.filter(i => i.isAvailable).length === 0}
          />
        </View>
      </View>
      {/* Custom Tip Modal */}
      <Modal visible={isCustomTipVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '80%', borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.textPrimary }}>Custom Tip</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 15 }}>Enter tip amount in Rupees</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 20 }}
              keyboardType="number-pad"
              placeholder="e.g. 50"
              value={customTipAmount}
              onChangeText={setCustomTipAmount}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setIsCustomTipVisible(false)}
                style={{ padding: 10, marginRight: 10 }}
              >
                <Text style={{ color: theme.colors.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const parsed = parseInt(customTipAmount);
                  if (parsed > 0) setDeliveryTip(parsed);
                  setIsCustomTipVisible(false);
                  setCustomTipAmount('');
                }}
                style={{ backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Set Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

import React, { useState, useContext, useRef, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Clock,
  Mic,
  PhoneOff,
  BellOff,
  ChevronRight,
  Heart,
  Info,
  MapPin,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { api } from '../../services/api';
import { PaymentModal } from '../../components/PaymentModal';
import { Loader } from '../../components/Loader';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const CheckoutScreen = ({ route, navigation }) => {
  const { user, activeAddress, activeShop } = useContext(AuthContext);
  const { cartItems, cartSubtotal, cartGrandTotal, deliveryFee, handlingFee, clearCart, fetchCart } = useContext(CartContext);
  const insets = useSafeAreaInsets();

  const deliveryTip = route.params?.deliveryTip || 0;

  // States
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setIsLoading(true);
      fetchCart().finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [fetchCart])
  );

  // States
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [paymentSheetMode, setPaymentSheetMode] = useState('select'); // 'select' | 'process'
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'gpay' | 'phonepe' | 'cod'

  // Animated scroll value for header hide/show
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header fades + slides up over first 60px of scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  // Bill Calculations using backend values
  const donationAmount = 0;
  const itemsTotal = cartSubtotal;
  const grandTotal = cartGrandTotal + deliveryTip + donationAmount;
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (!activeAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address to place your order.');
      return;
    }
    if (!activeShop) {
      Alert.alert('Service Unavailable', 'We do not deliver to your selected address yet. Please change your delivery location.');
      return;
    }
    setPaymentSheetMode('process');
    setPaymentSheetVisible(true);
  };

  const handlePaymentSuccess = async (method) => {
    // Note: Do NOT setPaymentSheetVisible(false) here. 
    // We want the modal to show the "Success" animation while we wait.

    try {
      const orderPayload = {
        shopId: activeShop.id, // Must be present (checked earlier)
        addressId: activeAddress.id && !String(activeAddress.id).startsWith('addr') ? activeAddress.id : null,
        items: cartItems,
        totalAmount: grandTotal,
        tipAmount: deliveryTip,
        discountAmount: donationAmount > 0 ? 5 : 0,
        handlingFee: handlingFee,
        deliveryFee: deliveryFee,
        paymentMethod: method // gpay, phonepe, or cod
      };

      // Submit order via API
      const result = await api.submitOrder(orderPayload);
      
      if (result.success && result.data) {
        // Check if payment is required via WebView (for prepaid methods)
        if (result.data.paymentRequired) {
          setPaymentSheetVisible(false);
          navigation.navigate('PaymentWebView', {
            orderId: result.data.orderId,
            orderNumber: result.data.orderNumber,
            razorpayOrderId: result.data.razorpayOrderId,
            amount: result.data.amount,
            amountPaise: result.data.amountPaise,
            razorpayKeyId: result.data.razorpayKeyId,
            userName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
            userEmail: user?.email,
            userPhone: user?.phone_number || activeAddress?.receiverMobile || '',
            items: cartItems,
            address: activeAddress,
            paymentMethod: method // Pass the selected method to the WebView
          });
          return null; // Signals modal that we transitioned to WebView
        }

        // COD Flow
        const newOrder = {
          id: result.data.orderNumber,
          dbId: result.data.orderId,
          order_number: result.data.orderNumber,
          items: cartItems,
          totalAmount: grandTotal,
          status: result.data.status,
          createdAt: result.data.createdAt,
          paymentMethod: method === 'cod' ? 'Cash on Delivery' : method,
          address: activeAddress,
        };

        const ordersKey = `@grocery_orders_${user?.id || 'guest'}`;
        const savedOrdersStr = await AsyncStorage.getItem(ordersKey);
        let currentOrders = [];
        if (savedOrdersStr) {
          currentOrders = JSON.parse(savedOrdersStr);
        }
        currentOrders.unshift(newOrder);
        await AsyncStorage.setItem(ordersKey, JSON.stringify(currentOrders));

        // Clear cart
        clearCart();

        // Return newOrder to PaymentModal so it knows the API call succeeded
        return newOrder;
      } else {
        throw new Error('Order submission failed');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong while placing your order.');
      throw e;
    }
  };

  const handleAnimationComplete = (newOrder) => {
    setPaymentSheetVisible(false);
    
    if (newOrder) {
      // Redirect immediately to Order Details screen, resetting the stack so back goes to Home
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          { name: 'OrderDetails', params: { order: newOrder } },
        ],
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Static Header — matches other screens */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <ArrowLeft size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Checkout</Text>
          </View>
        </LinearGradient>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Static Header — matches other screens */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
        locations={[0, 0.55, 1]}
        style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>Checkout</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Estimate Card */}
        <View style={styles.deliveryEstimateCard}>
          <View style={styles.estimateIconWrapper}>
            <Clock size={20} color={theme.colors.success} />
          </View>
          <View style={styles.estimateDetails}>
            <Text style={styles.estimateTitle}>Standard Delivery</Text>
            <Text style={styles.estimateSubtitle}>Shipment of {totalQuantity} items</Text>
          </View>
        </View>

        {/* Items Container Card */}
        <View style={styles.itemsContainerCard}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {/* Product Photo Rounded box */}
              <View style={styles.itemImageWrapper}>
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
              </View>

              {/* Product Description details */}
              <View style={styles.itemMiddle}>
                <View>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemWeight}>{item.unit}</Text>
                </View>
              </View>

              {/* Static Price and Qty */}
              <View style={styles.itemRight}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{(item.discountPrice || item.price) * item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bill Details Summary Card */}
        <View style={styles.billDetailsCard}>
          <Text style={styles.sectionTitle}>Bill details</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{itemsTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Handling charge</Text>
            <Text style={styles.billValue}>₹{handlingFee}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery partner fee</Text>
            <Text style={deliveryFee === 0 ? styles.billValueFree : styles.billValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          {deliveryTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery partner tip</Text>
              <Text style={styles.billValue}>₹{deliveryTip}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Grand total</Text>
            <Text style={styles.billTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Double-Decker Sticky Bottom Bar */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
        {/* Top deck Address preview (Static) */}
        <View style={styles.addressSnippetRow}>
          <View style={styles.addressSnippetLeft}>
            <Text style={{ fontSize: rf(14) }}>🏠</Text>
            <Text style={styles.addressSnippetText} numberOfLines={1}>
              {activeAddress
                ? `Delivering to ${activeAddress.receiverName || user?.first_name || 'Customer'}: ${activeAddress.flatNo}, ${activeAddress.addressLine}`
                : 'Please select a delivery address'}
            </Text>
          </View>
        </View>

        {/* Bottom deck actions: UPI + Green custom Place Order Button */}
        <View style={styles.checkoutActionRow}>
          <TouchableOpacity
            style={styles.payMethodContainer}
            onPress={() => {
              setPaymentSheetMode('select');
              setPaymentSheetVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={{ width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(6), borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', marginRight: theme.spacing.sm }}>
              {selectedMethod === 'gpay' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#1A73E8' }}>G</Text>
              ) : selectedMethod === 'phonepe' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#5F259F' }}>Pe</Text>
              ) : selectedMethod === 'paytm' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#00B9F1' }}>Py</Text>
              ) : selectedMethod === 'bhim' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#E66928' }}>Bh</Text>
              ) : selectedMethod === 'upi' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#10B981' }}>UPI</Text>
              ) : selectedMethod === 'card_netbanking' ? (
                <Text style={{ fontSize: rf(16) }}>💳</Text>
              ) : (
                <Text style={{ fontSize: rf(16) }}>💵</Text>
              )}
            </View>
            <View>
              <Text style={styles.payMethodLabel}>PAY USING ▴</Text>
              <Text style={styles.payMethodValue}>
                {selectedMethod === 'gpay' ? 'Google Pay UPI' :
                 selectedMethod === 'phonepe' ? 'PhonePe UPI' :
                 selectedMethod === 'paytm' ? 'Paytm UPI' :
                 selectedMethod === 'bhim' ? 'BHIM UPI' :
                 selectedMethod === 'upi' ? 'Pay via UPI App' :
                 selectedMethod === 'card_netbanking' ? 'Card / Net Banking' :
                 'Cash on Delivery'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.greenPlaceOrderBtn}
            onPress={handlePlaceOrder}
            activeOpacity={0.9}
          >
            <View style={styles.btnPriceBox}>
              <Text style={styles.btnPriceText}>₹{grandTotal}</Text>
              <Text style={styles.btnPriceLabel}>TOTAL</Text>
            </View>
            <View style={styles.btnDivider} />
            <Text style={styles.btnRightText}>Place Order ‣</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Gateway Modal Sheet */}
      <PaymentModal
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        totalAmount={grandTotal}
        onPaymentSuccess={handlePaymentSuccess}
        onAnimationComplete={handleAnimationComplete}
        mode={paymentSheetMode}
        selectedMethod={selectedMethod}
        onSelectMethod={(method) => {
          setSelectedMethod(method);
          setPaymentSheetVisible(false);
        }}
      />
    </View>
  );
};

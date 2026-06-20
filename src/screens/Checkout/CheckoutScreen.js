import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Alert, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
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
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../config/env';
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
  const [selectedMethod, setSelectedMethod] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'upi' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentParams, setPaymentParams] = useState(null);

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

  const handlePlaceOrder = async () => {
    if (!activeAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address to place your order.');
      return;
    }
    if (!activeShop) {
      Alert.alert('Service Unavailable', 'We do not deliver to your selected address yet. Please change your delivery location.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatusText('Placing your order...');

    try {
      const orderPayload = {
        shopId: activeShop.id,
        addressId: activeAddress.id && !String(activeAddress.id).startsWith('addr') ? activeAddress.id : null,
        items: cartItems,
        totalAmount: grandTotal,
        tipAmount: deliveryTip,
        discountAmount: donationAmount > 0 ? 5 : 0,
        handlingFee: handlingFee,
        deliveryFee: deliveryFee,
        paymentMethod: selectedMethod
      };

      const result = await api.submitOrder(orderPayload);
      
      if (result.success && result.data) {
        if (result.data.paymentRequired) {
          setPaymentStatusText('Opening payment application...');
          setPaymentParams({
            orderId: result.data.orderId,
            orderNumber: result.data.orderNumber,
            razorpayOrderId: result.data.razorpayOrderId,
            amount: result.data.amount,
            amountPaise: result.data.amountPaise,
            razorpayKeyId: result.data.razorpayKeyId,
            userName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
            userEmail: user?.email,
            userPhone: user?.phone_number || activeAddress?.receiverMobile || '',
          });
        } else {
          // COD Flow
          await handleOrderSuccess({
            id: result.data.orderNumber,
            dbId: result.data.orderId,
            order_number: result.data.orderNumber,
            items: cartItems,
            totalAmount: grandTotal,
            status: result.data.status,
            createdAt: result.data.createdAt,
            paymentMethod: 'Cash on Delivery',
            address: activeAddress,
          });
        }
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
      Alert.alert('Order Failed', 'Failed to place your order. Please check your connection and try again.');
    }
  };

  const handleOrderSuccess = async (newOrder) => {
    try {
      const ordersKey = `@grocery_orders_${user?.id || 'guest'}`;
      const savedOrdersStr = await AsyncStorage.getItem(ordersKey);
      let currentOrders = [];
      if (savedOrdersStr) {
        currentOrders = JSON.parse(savedOrdersStr);
      }
      currentOrders.unshift(newOrder);
      await AsyncStorage.setItem(ordersKey, JSON.stringify(currentOrders));

      clearCart();
      setIsSuccess(true);
      setPaymentStatusText('Order placed successfully!');

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentParams(null);
        navigation.reset({
          index: 1,
          routes: [
            { name: 'MainTabs' },
            { name: 'OrderDetails', params: { order: newOrder } },
          ],
        });
      }, 1500);
    } catch (e) {
      console.error('Error in handleOrderSuccess:', e);
      setIsProcessing(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView payment status:', data.status);

      if (data.status === 'success') {
        setPaymentStatusText('Confirming payment signature...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
          const response = await fetch(`${API_BASE_URL}/user/orders/verify`, {
            method: 'POST',
            headers: {
              ...api.getHeaders?.()
            },
            signal: controller.signal,
            body: JSON.stringify({
              orderId: paymentParams.orderId,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpayOrderId: data.razorpay_order_id,
              razorpaySignature: data.razorpay_signature
            })
          });
          clearTimeout(timeoutId);

          const resData = await response.json();
          if (response.ok && resData.success) {
            const confirmedOrder = {
              id: paymentParams.orderNumber,
              dbId: paymentParams.orderId,
              order_number: paymentParams.orderNumber,
              totalAmount: paymentParams.amount,
              status: 'Processing',
              payment_status: 'Paid',
              createdAt: new Date().toISOString(),
              items: cartItems,
              address: activeAddress
            };
            await handleOrderSuccess(confirmedOrder);
          } else {
            throw new Error(resData.message || 'Signature verification failed');
          }
        } catch (verifyError) {
          clearTimeout(timeoutId);
          console.error('Verification error:', verifyError);
          
          const pendingOrder = {
            id: paymentParams.orderNumber,
            dbId: paymentParams.orderId,
            order_number: paymentParams.orderNumber,
            totalAmount: paymentParams.amount,
            status: 'Pending Payment',
            payment_status: 'Pending',
            createdAt: new Date().toISOString(),
            items: cartItems,
            address: activeAddress
          };

          Alert.alert(
            'Payment Verification Pending',
            'We could not verify your payment immediately. If money was deducted, your order will confirm automatically. Check order details.',
            [
              {
                text: 'View Order Details',
                onPress: () => {
                  setIsProcessing(false);
                  setPaymentParams(null);
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'MainTabs' },
                      { name: 'OrderDetails', params: { order: pendingOrder } },
                    ],
                  });
                }
              }
            ]
          );
        }
      } else if (data.status === 'cancelled' || data.status === 'failed') {
        setIsProcessing(false);
        setPaymentParams(null);
        Alert.alert('Payment Incomplete', 'The payment was cancelled or failed. You can complete it from your Order details.');
      } else if (data.status === 'error') {
        setIsProcessing(false);
        setPaymentParams(null);
        Alert.alert('Payment Error', 'An error occurred while opening the payment app.');
      }
    } catch (err) {
      console.error('Parse WebView Message Error:', err);
    }
  };

  const handleWebViewRequest = (request) => {
    const { url } = request;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:blank')) {
      return true;
    }
    Linking.openURL(url).catch((err) => {
      console.error('Deep Link Error:', err);
    });
    return false;
  };

  const getHtmlContent = () => {
    if (!paymentParams) return '';
    const isMock = paymentParams.razorpayOrderId && paymentParams.razorpayOrderId.startsWith('order_mock_');
    
    let prefillMethod = 'upi';
    let mappedProvider = '';
    if (selectedMethod === 'gpay') {
      mappedProvider = 'google_pay';
    } else if (selectedMethod === 'phonepe') {
      mappedProvider = 'phonepe';
    } else if (selectedMethod === 'paytm') {
      mappedProvider = 'paytm';
    } else if (selectedMethod === 'bhim') {
      mappedProvider = 'bhim';
    }

    if (isMock) {
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            setTimeout(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'success',
                razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                razorpay_order_id: "${paymentParams.razorpayOrderId}",
                razorpay_signature: 'mock_signature_verified'
              }));
            }, 1000);
          </script>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <script>
          const options = {
            key: "${paymentParams.razorpayKeyId}",
            amount: "${paymentParams.amountPaise}",
            currency: "INR",
            name: "Fresh Sabji Hub",
            description: "Order #${paymentParams.orderNumber}",
            order_id: "${paymentParams.razorpayOrderId}",
            prefill: {
              name: "${paymentParams.userName || 'Customer'}",
              email: "${paymentParams.userEmail || ''}",
              contact: "${paymentParams.userPhone || ''}",
              method: "${prefillMethod}"
              ${mappedProvider ? `, provider: '${mappedProvider}'` : ''}
            },
            theme: { color: "#10B981" },
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'success',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }));
            },
            modal: {
              ondismiss: function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
              }
            }
          };
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'failed',
              error_description: response.error.description
            }));
          });
          window.onload = function() {
            try {
              rzp.open();
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'error' }));
            }
          };
        </script>
      </body>
      </html>
    `;
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

        {/* Payment Method Selection Card */}
        <View style={styles.paymentMethodCard}>
          <Text style={styles.sectionTitle}>Select Payment Option</Text>
          
          <TouchableOpacity
            style={[styles.paymentOptionRow, selectedMethod === 'gpay' && styles.paymentOptionRowActive]}
            onPress={() => setSelectedMethod('gpay')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#E8F0FE' }]}>
                <Text style={{ fontSize: rf(14), fontWeight: 'bold', color: '#1A73E8' }}>G</Text>
              </View>
              <Text style={styles.optionLabel}>Google Pay UPI</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'gpay' && styles.radioCircleActive]}>
              {selectedMethod === 'gpay' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOptionRow, selectedMethod === 'phonepe' && styles.paymentOptionRowActive]}
            onPress={() => setSelectedMethod('phonepe')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Text style={{ fontSize: rf(14), fontWeight: 'bold', color: '#5F259F' }}>Pe</Text>
              </View>
              <Text style={styles.optionLabel}>PhonePe UPI</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'phonepe' && styles.radioCircleActive]}>
              {selectedMethod === 'phonepe' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOptionRow, selectedMethod === 'paytm' && styles.paymentOptionRowActive]}
            onPress={() => setSelectedMethod('paytm')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#E0F7FA' }]}>
                <Text style={{ fontSize: rf(14), fontWeight: 'bold', color: '#00B9F1' }}>Py</Text>
              </View>
              <Text style={styles.optionLabel}>Paytm UPI</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'paytm' && styles.radioCircleActive]}>
              {selectedMethod === 'paytm' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOptionRow, selectedMethod === 'upi' && styles.paymentOptionRowActive]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: rf(12), fontWeight: 'bold', color: '#10B981' }}>UPI</Text>
              </View>
              <Text style={styles.optionLabel}>Other UPI App</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'upi' && styles.radioCircleActive]}>
              {selectedMethod === 'upi' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOptionRow, selectedMethod === 'cod' && styles.paymentOptionRowActive]}
            onPress={() => setSelectedMethod('cod')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Text style={{ fontSize: rf(14) }}>💵</Text>
              </View>
              <Text style={styles.optionLabel}>Cash on Delivery (COD)</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'cod' && styles.radioCircleActive]}>
              {selectedMethod === 'cod' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
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

        {/* Bottom deck actions: Selected Method + Green Place Order Button */}
        <View style={styles.checkoutActionRow}>
          <View style={styles.payMethodContainer}>
            <View style={{ width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(6), borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', marginRight: theme.spacing.sm }}>
              {selectedMethod === 'gpay' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#1A73E8' }}>G</Text>
              ) : selectedMethod === 'phonepe' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#5F259F' }}>Pe</Text>
              ) : selectedMethod === 'paytm' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#00B9F1' }}>Py</Text>
              ) : selectedMethod === 'upi' ? (
                <Text style={{ fontSize: rf(16), fontWeight: 'bold', color: '#10B981' }}>UPI</Text>
              ) : (
                <Text style={{ fontSize: rf(16) }}>💵</Text>
              )}
            </View>
            <View>
              <Text style={styles.payMethodLabel}>PAYING WITH</Text>
              <Text style={styles.payMethodValue}>
                {selectedMethod === 'gpay' ? 'Google Pay' :
                 selectedMethod === 'phonepe' ? 'PhonePe' :
                 selectedMethod === 'paytm' ? 'Paytm' :
                 selectedMethod === 'upi' ? 'UPI App' :
                 'Cash on Delivery'}
              </Text>
            </View>
          </View>
          
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

      {/* Hidden WebView for background processing */}
      {paymentParams && (
        <WebView
          source={{ html: getHtmlContent() }}
          style={{ width: 0, height: 0, position: 'absolute', opacity: 0 }}
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={handleWebViewRequest}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />
      )}

      {/* Premium Full-Screen Processing Overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          {isSuccess ? (
            <View style={styles.successContainer}>
              <CheckCircle2 size={64} color={theme.colors.success} />
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successSubtitle}>Your order has been placed successfully</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{paymentStatusText}</Text>
              <Text style={styles.loadingSubtitle}>Please do not close the app or press back</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

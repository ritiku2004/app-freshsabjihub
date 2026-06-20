import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Alert, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
      if (route.params?.retryOrder) {
        setIsLoading(false);
        return;
      }
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
    }, [fetchCart, route.params?.retryOrder])
  );

  // States
  const [selectedMethod] = useState('upi');
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

  const retryOrder = route.params?.retryOrder;
  const isRetry = !!retryOrder;

  const displayItems = isRetry ? retryOrder.items : cartItems;
  const displayDeliveryFee = isRetry ? (retryOrder.deliveryFee || 0) : deliveryFee;
  const displayHandlingFee = isRetry ? (retryOrder.handlingFee || 0) : handlingFee;
  const displayTip = isRetry ? (retryOrder.tipAmount || 0) : deliveryTip;
  const displayGrandTotal = isRetry ? retryOrder.totalAmount : (cartGrandTotal + deliveryTip);
  const displayAddress = isRetry ? retryOrder.address : activeAddress;
  const totalQuantity = displayItems.reduce((acc, item) => acc + item.quantity, 0);
  const donationAmount = 0;
  const itemsTotal = isRetry ? (displayGrandTotal - displayDeliveryFee - displayHandlingFee - displayTip) : cartSubtotal;
  const grandTotal = displayGrandTotal;

  const handlePlaceOrder = async () => {
    if (!isRetry && !displayAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address to place your order.');
      return;
    }
    if (!isRetry && !activeShop) {
      Alert.alert('Service Unavailable', 'We do not deliver to your selected address yet. Please change your delivery location.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatusText(isRetry ? 'Initiating retry payment...' : 'Placing your order...');

    try {
      if (isRetry) {
        const resData = await api.retryPayment(retryOrder.dbId || retryOrder.id);
        setIsProcessing(false);

        if (resData.success) {
          const rawPhone = user?.phone_number || retryOrder.address?.receiverMobile || '';
          const cleanedPhone = rawPhone.replace(/\D/g, '');
          const finalPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : (cleanedPhone || '9999999999');
          const finalEmail = (user?.email && user.email.includes('@')) ? user.email.trim() : 'customer@freshsabjihub.com';
          const finalName = `${retryOrder.address?.receiverName || user?.first_name || ''}`.trim() || 'Customer';

          navigation.navigate('PaymentWebView', {
            orderId: retryOrder.dbId || retryOrder.id,
            orderNumber: retryOrder.order_number || retryOrder.id,
            razorpayOrderId: resData.data.razorpayOrderId,
            amount: resData.data.amount,
            amountPaise: resData.data.amountPaise,
            razorpayKeyId: resData.data.razorpayKeyId,
            userName: finalName,
            userEmail: finalEmail,
            userPhone: finalPhone,
            items: retryOrder.items || [],
            address: retryOrder.address,
            paymentMethod: selectedMethod
          });
        } else {
          throw new Error(resData.message || 'Failed to initiate retry order');
        }
        return;
      }

      const orderPayload = {
        shopId: activeShop.id,
        addressId: displayAddress.id && !String(displayAddress.id).startsWith('addr') ? displayAddress.id : null,
        items: displayItems,
        totalAmount: grandTotal,
        tipAmount: displayTip,
        discountAmount: donationAmount > 0 ? 5 : 0,
        handlingFee: displayHandlingFee,
        deliveryFee: displayDeliveryFee,
        paymentMethod: selectedMethod
      };

      const result = await api.submitOrder(orderPayload);
      
      if (result.success && result.data) {
        if (result.data.paymentRequired) {
          setIsProcessing(false);
          const rawPhone = user?.phone_number || displayAddress?.receiverMobile || '';
          const cleanedPhone = rawPhone.replace(/\D/g, '');
          const finalPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : (cleanedPhone || '9999999999');
          const finalEmail = (user?.email && user.email.includes('@')) ? user.email.trim() : 'customer@freshsabjihub.com';
          const finalName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Customer';

          navigation.navigate('PaymentWebView', {
            orderId: result.data.orderId,
            orderNumber: result.data.orderNumber,
            razorpayOrderId: result.data.razorpayOrderId,
            amount: result.data.amount,
            amountPaise: result.data.amountPaise,
            razorpayKeyId: result.data.razorpayKeyId,
            userName: finalName,
            userEmail: finalEmail,
            userPhone: finalPhone,
            items: displayItems,
            address: displayAddress,
            paymentMethod: selectedMethod
          });
        } else {
          // COD Flow
          await handleOrderSuccess({
            id: result.data.orderNumber,
            dbId: result.data.orderId,
            order_number: result.data.orderNumber,
            items: displayItems,
            totalAmount: grandTotal,
            status: result.data.status,
            createdAt: result.data.createdAt,
            paymentMethod: 'Cash on Delivery',
            address: displayAddress,
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
              status: 'Placed',
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
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
          {displayItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {/* Product Photo Rounded box */}
              <View style={styles.itemImageWrapper}>
                <Image source={{ uri: item.image || item.image_url }} style={styles.itemImage} resizeMode="contain" />
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
          {/* Payment options removed for direct Razorpay checkout */}
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
            <Text style={styles.billValue}>₹{displayHandlingFee}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery partner fee</Text>
            <Text style={displayDeliveryFee === 0 ? styles.billValueFree : styles.billValue}>
              {displayDeliveryFee === 0 ? 'FREE' : `₹${displayDeliveryFee}`}
            </Text>
          </View>

          {displayTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery partner tip</Text>
              <Text style={styles.billValue}>₹{displayTip}</Text>
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
              {displayAddress
                ? `Delivering to ${displayAddress.receiverName || user?.first_name || 'Customer'}: ${displayAddress.flatNo || ''}, ${displayAddress.addressLine || ''}`
                : 'Please select a delivery address'}
            </Text>
          </View>
        </View>

        {/* Bottom deck actions: Selected Method + Green Place Order Button */}
        <View style={styles.checkoutActionRow}>
          <TouchableOpacity
            style={[styles.greenPlaceOrderBtn, { flex: 1, marginLeft: 0 }]}
            onPress={handlePlaceOrder}
            activeOpacity={0.9}
          >
            <View style={styles.btnPriceBox}>
              <Text style={styles.btnPriceText}>₹{grandTotal}</Text>
              <Text style={styles.btnPriceLabel}>TOTAL</Text>
            </View>
            <View style={styles.btnDivider} />
            <Text style={styles.btnRightText}>Pay & Place Order ‣</Text>
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
    </SafeAreaView>
  );
};

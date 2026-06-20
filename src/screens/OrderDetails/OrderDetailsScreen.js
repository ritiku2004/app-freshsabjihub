import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { theme } from '../../theme';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../config/env';
import { AuthContext } from '../../context/AuthContext';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const OrderDetailsScreen = ({ route, navigation }) => {
  const { order: initialOrder, orderId } = route.params || {};
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const insets = useSafeAreaInsets();
  const [tick, setTick] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (order) return;

    const fetchOrder = async () => {
      try {
        const backendOrders = await api.getUserOrders();
        if (backendOrders && Array.isArray(backendOrders)) {
          const mappedOrders = backendOrders.map(o => {
            const parts = (o.address_line1 || '').split('||');
            const flatNo = parts[0] || '';
            const addressLine = parts[1] || '';

            return {
              id: o.order_number,
              dbId: o.id,
              createdAt: o.created_at,
              totalAmount: Number(o.total_amount),
              status: o.status,
              deliveryFee: Number(o.delivery_fee),
              handlingFee: Number(o.handling_fee),
              tipAmount: Number(o.tip_amount),
              discountAmount: Number(o.discount_amount),
              address: o.address_line1 ? {
                flatNo,
                addressLine,
                receiverName: o.receiver_name,
                receiverMobile: o.receiver_mobile,
                city: o.city,
                state: o.state,
                zipcode: o.zipcode,
              } : null,
              items: (o.items || []).map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.price),
                image: item.image_url
              }))
            };
          });

          const found = mappedOrders.find(o => 
            String(o.dbId) === String(orderId) || 
            String(o.id) === String(orderId)
          );

          if (found) {
            setOrder(found);
          } else {
            Alert.alert('Error', 'Order details not found.');
            navigation.goBack();
          }
        } else {
          Alert.alert('Error', 'Failed to fetch order details.');
          navigation.goBack();
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        Alert.alert('Error', 'Failed to load order details.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Animated scroll value for header fade/slide
  const scrollY = useRef(new Animated.Value(0)).current;
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

  // Re-run status check every 5 seconds to show progress updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    const orderDbId = order.dbId || order.id;
    try {
      const response = await fetch(`${API_BASE_URL}/user/orders/${orderDbId}/retry`, {
        method: 'POST',
        headers: {
          ...api.getHeaders?.()
        }
      });

      const resData = await response.json();
      setIsRetrying(false);

      if (response.ok && resData.success) {
        navigation.navigate('PaymentWebView', {
          orderId: orderDbId,
          orderNumber: order.order_number || order.orderNumber,
          razorpayOrderId: resData.data.razorpayOrderId,
          amount: resData.data.amount,
          amountPaise: resData.data.amountPaise,
          razorpayKeyId: resData.data.razorpayKeyId,
          userName: `${order.address?.receiverName || ''}`.trim(),
          userEmail: '',
          userPhone: user?.phone_number || order.address?.receiverMobile || '',
          items: order.items || [],
          address: order.address,
          paymentMethod: 'upi' // Set general UPI app selection as fallback/default on retry
        });
      } else {
        throw new Error(resData.message || 'Failed to initiate retry order');
      }
    } catch (err) {
      console.error('Retry Payment Request Failed:', err);
      setIsRetrying(false);
      Alert.alert('Retry Failed', err.message || 'We could not initiate the payment retry. Please check your network and try again.');
    }
  };

  const getOrderStatus = (orderObj) => {
    if (orderObj.status === 'Pending Payment') {
      return { step: 0, text: 'Pending Payment' };
    }
    if (orderObj.status === 'Cancelled') {
      return { step: -1, text: 'Cancelled' };
    }

    const orderTime = orderObj.created_at || orderObj.createdAt;
    const elapsedMs = new Date().getTime() - new Date(orderTime).getTime();
    if (elapsedMs < 15000) {
      return {
        step: 1, // Processing
        text: 'Processing',
      };
    } else if (elapsedMs < 35000) {
      return {
        step: 2, // Out for Delivery
        text: 'Out for Delivery',
      };
    } else {
      return {
        step: 3, // Delivered
        text: 'Delivered',
      };
    }
  };

  if (loading || !order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const statusInfo = getOrderStatus(order);
  const orderCreatedAt = order.created_at || order.createdAt;
  
  const dateFormatted = new Date(orderCreatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculations for billing details
  const itemsTotal = order.items.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
  const deliveryFee = order.delivery_fee !== undefined ? Number(order.delivery_fee) : (order.totalAmount > 300 ? 0 : 15);
  const handlingFee = order.handling_fee !== undefined ? Number(order.handling_fee) : 5;
  const tipAmount = order.tipAmount || 0;
  const discountAmount = order.discountAmount || 0;

  return (
    <View style={styles.container}>
      {/* Animated Gradient Header */}
      <Animated.View
        style={[
          styles.headerAnimWrapper,
          { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <ArrowLeft size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: moderateScale(70) }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        
        {/* Pending Payment Warning Card */}
        {order.status === 'Pending Payment' && (
          <View style={styles.paymentWarningCard}>
            <Text style={styles.paymentWarningTitle}>⚠️ Action Required: Payment Pending</Text>
            <Text style={styles.paymentWarningSubtitle}>
              Your payment verification is pending. Please click the "Retry Payment" button at the bottom to complete your transaction, otherwise this order will be cancelled.
            </Text>
          </View>
        )}

        {/* Status Tracker Stepper Timeline */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>Delivery Progress</Text>
          
          <View style={styles.timeline}>
            
            {/* Step 1: Order Placed */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, statusInfo.step >= 1 && styles.timelineDotActive]} />
                <View style={[styles.timelineLine, statusInfo.step >= 2 && styles.timelineLineActive]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepTitle, statusInfo.step >= 1 && styles.stepTitleActive]}>Order Confirmed</Text>
                <Text style={styles.stepSubtitle}>We have received and approved your order</Text>
              </View>
            </View>

            {/* Step 2: Out for Delivery */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, statusInfo.step >= 2 && styles.timelineDotActive]} />
                <View style={[styles.timelineLine, statusInfo.step >= 3 && styles.timelineLineActive]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepTitle, statusInfo.step >= 2 && styles.stepTitleActive]}>Out for Delivery</Text>
                <Text style={styles.stepSubtitle}>Our delivery partner is bringing your package</Text>
              </View>
            </View>

            {/* Step 3: Delivered */}
            <View style={[styles.timelineStep, { minHeight: 0 }]}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, statusInfo.step >= 3 && styles.timelineDotActive]} />
              </View>
              <View style={[styles.timelineRight, { paddingBottom: moderateScale(0) }]}>
                <Text style={[styles.stepTitle, statusInfo.step >= 3 && styles.stepTitleActive]}>Delivered</Text>
                <Text style={styles.stepSubtitle}>Arrived safe & sound at your location</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Order Info Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Summary</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>{order.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placed On</Text>
            <Text style={styles.detailValue}>{dateFormatted}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{order.paymentMethod || 'Google Pay UPI'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Address</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {order.address
                ? `${order.address.flatNo}, ${order.address.addressLine}`
                : 'Selected Address'}
            </Text>
          </View>
        </View>

        {/* Purchased Items Card */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionHeader}>Items Ordered</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemImageWrapper}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>Qty: {item.quantity} x {item.unit}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.discountPrice || item.price) * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Price Summary Breakdown */}
        <View style={styles.billCard}>
          <Text style={styles.sectionHeader}>Bill Summary</Text>

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
            <Text style={styles.billValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          {tipAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery partner tip</Text>
              <Text style={styles.billValue}>₹{tipAmount}</Text>
            </View>
          )}

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Promo discount</Text>
              <Text style={[styles.billValue, styles.billValueDiscount]}>-₹{discountAmount}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

      </Animated.ScrollView>

      {/* Sticky Bottom Footer for Unpaid Orders (Retry Payment Button) */}
      {order.status === 'Pending Payment' && (
        <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetryPayment}
            activeOpacity={0.8}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.retryButtonText}>Retry Payment (₹{parseFloat(order.totalAmount).toFixed(2)})</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ClipboardList, ShoppingCart, RotateCcw, Package, ChevronRight, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react-native';
import { theme } from '../../theme';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { AppButton } from '../../components/AppButton';
import { Loader } from '../../components/Loader';
import { LocationEmptyState } from '../../components/LocationEmptyState';
import { api } from '../../services/api';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const OrdersScreen = ({ navigation }) => {
  const { user, activeAddress, serviceAvailable, isAuthenticated } = useContext(AuthContext);
  const { orderAgain } = useContext(CartContext);
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0); // Forces re-render for live order tracking

  const loadOrders = async () => {
    setIsLoading(true);
    if (!user || !user.id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    try {
      // 1. Try to load from backend
      const backendOrders = await api.getUserOrders();
      if (backendOrders && Array.isArray(backendOrders) && backendOrders.length > 0) {
        // Map backend orders to match React Native app expectations
        const mappedOrders = backendOrders.map(order => {
          const parts = (order.address_line1 || '').split('||');
          const flatNo = parts[0] || '';
          const addressLine = parts[1] || '';

          return {
            id: order.order_number, // Use ORDxxxxx
            dbId: order.id,
            createdAt: order.created_at, // Use database creation timestamp
            totalAmount: Number(order.total_amount),
            status: order.status,
            deliveryFee: Number(order.delivery_fee),
            handlingFee: Number(order.handling_fee),
            tipAmount: Number(order.tip_amount),
            discountAmount: Number(order.discount_amount),
            address: order.address_line1 ? {
              flatNo,
              addressLine,
              receiverName: order.receiver_name,
              receiverMobile: order.receiver_mobile,
              city: order.city,
              state: order.state,
              zipcode: order.zipcode,
            } : null,
            items: (order.items || []).map(item => ({
              id: item.id,
              productId: item.product_id,
              name: item.product_name,
              quantity: item.quantity,
              price: Number(item.price),
              image: item.image_url // Fetched from joined products table
            }))
          };
        });

        setOrders(mappedOrders);
        await AsyncStorage.setItem(`@grocery_orders_${user.id}`, JSON.stringify(mappedOrders));
      } else {
        // Fallback to AsyncStorage cache
        const savedOrdersStr = await AsyncStorage.getItem(`@grocery_orders_${user.id}`);
        if (savedOrdersStr) {
          setOrders(JSON.parse(savedOrdersStr));
        } else {
          setOrders([]);
        }
      }
    } catch (e) {
      console.error('Failed to load orders from backend, falling back to cache:', e);
      const savedOrdersStr = await AsyncStorage.getItem(`@grocery_orders_${user.id}`);
      if (savedOrdersStr) {
        setOrders(JSON.parse(savedOrdersStr));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Re-load orders on focus
  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigation.navigate('Login', { redirectTo: 'OrdersTab' });
        return;
      }
      loadOrders();
    }, [user, isAuthenticated])
  );

  // Live order status updates (re-renders every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Get delivery status based on order status or simulated time elapsed
  const getOrderStatus = (item) => {
    const status = item.status;
    if (status === 'Pending Payment' || status === 'Placed') {
      return { text: 'Waiting for Confirmation', color: '#D97706', bg: '#FEF3C7' };
    }
    if (status === 'Cancelled') {
      return { text: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' };
    }
    if (status === 'Processing') {
      return { text: 'Order Confirmed', color: '#10B981', bg: '#DCFCE7' };
    }
    if (status === 'Shipped') {
      return { text: 'On the Way', color: theme.colors.primary, bg: theme.colors.primaryLight };
    }
    if (status === 'Delivered') {
      return { text: 'Delivered', color: theme.colors.textSecondary, bg: theme.colors.lightGray };
    }
    return { text: status || 'Waiting for Confirmation', color: theme.colors.accent, bg: theme.colors.accentLight };
  };

  const handleOrderAgain = async (item) => {
    try {
      const res = await orderAgain(item.items);
      if (res.success) {
        if (res.unavailableItems && res.unavailableItems.length > 0) {
          Alert.alert(
            'Items Added',
            `Available items have been added to your cart.\n\nThe following items are currently out of stock and were skipped:\n${res.unavailableItems.map(name => `• ${name}`).join('\n')}`,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Checkout')
              }
            ]
          );
        } else {
          navigation.navigate('Checkout');
        }
      } else {
        Alert.alert('Unavailable', res.message || 'All items in this order are currently out of stock.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to repopulate order items.');
    }
  };

  const renderOrderItem = ({ item }) => {
    const status = getOrderStatus(item);
    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusLeftBorderColor = 
      status.text === 'Delivered' ? '#E2E8F0' :
      status.text === 'Out for Delivery' ? theme.colors.primary :
      theme.colors.accent;

    const itemsSummary = item.items.map((i) => i.name).join(', ');

    return (
      <TouchableOpacity
        style={[styles.orderCard, { borderLeftWidth: 4, borderLeftColor: statusLeftBorderColor }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        {/* Header section */}
        <View style={styles.orderHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.packageIconBg}>
              <Package size={14} color={theme.colors.primary} />
            </View>
            <View style={{ marginLeft: moderateScale(8) }}>
              <Text style={styles.orderIdText} numberOfLines={1}>ID: {item.id}</Text>
              <Text style={styles.dateText}>{dateFormatted}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: status.bg, flexDirection: 'row', alignItems: 'center' }]}>
            {status.text === 'Delivered' ? (
              <CheckCircle2 size={10} color={status.color} style={{ marginRight: 4 }} />
            ) : status.text === 'Out for Delivery' ? (
              <Clock size={10} color={status.color} style={{ marginRight: 4 }} />
            ) : (
              <AlertCircle size={10} color={status.color} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>

        {/* Thumbnail Preview row */}
        <View style={styles.orderItemsPreviewRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: moderateScale(4) }}
          >
            {item.items.slice(0, 4).map((orderItem, idx) => (
              <View key={idx} style={styles.thumbnailWrapper}>
                <Image source={{ uri: orderItem.image }} style={styles.thumbnailImage} resizeMode="contain" />
                <View style={styles.thumbnailBadge}>
                  <Text style={styles.thumbnailBadgeText}>{orderItem.quantity}</Text>
                </View>
              </View>
            ))}
            {item.items.length > 4 && (
              <View style={styles.moreItemsCircle}>
                <Text style={styles.moreItemsText}>+{item.items.length - 4}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Content details */}
        <View style={styles.itemsRow}>
          <Text style={styles.itemText} numberOfLines={1}>
            {itemsSummary}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: moderateScale(4) }}>
            <Text style={styles.totalAmountText}>Total Paid: ₹{item.totalAmount}</Text>
            <Text style={styles.deliveryTimeInfo}>
              {status.text === 'Delivered'
                ? 'Delivered to ' + (item.address?.type || 'Home')
                : 'ETA: 10 mins'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Action button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.orderDetailsLinkBtn}
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
          >
            <Text style={styles.orderDetailsLinkText}>View Details</Text>
            <ChevronRight size={14} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.customOrderAgainBtn}
            onPress={() => handleOrderAgain(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.customOrderAgainBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <RotateCcw size={12} color={theme.colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.customOrderAgainBtnText}>Order Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!activeAddress || !serviceAvailable) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Your Orders</Text>
        </LinearGradient>
        <LocationEmptyState 
          type={!activeAddress ? "missing" : "outOfZone"} 
          activeAddress={activeAddress}
          onAction={() => navigation.navigate('AddressManagement')} 
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Your Orders</Text>
        </LinearGradient>
        <Loader />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
        >
          <Text style={styles.headerTitle}>Your Orders</Text>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <LinearGradient
              colors={['#DCFCE7', '#F0FDF4']}
              style={styles.emptyIconGradient}
            >
              <ClipboardList size={moderateScale(48)} color={theme.colors.primary} />
              <View style={styles.sparkleBadge}>
                <Sparkles size={moderateScale(14)} color={theme.colors.accent} />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.emptyText}>No orders placed yet</Text>
          <Text style={styles.emptySubtext}>Your order history will appear here once you place your first order.</Text>
          
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
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
        locations={[0, 0.55, 1]}
        style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
      >
        <Text style={styles.headerTitle}>Your Orders</Text>
      </LinearGradient>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />
    </View>
  );
};

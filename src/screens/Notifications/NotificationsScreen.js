import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Package, Tag, Info } from 'lucide-react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

// Mock Notification Data
const NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered Successfully!',
    message: 'Your order #ORD-8492 has been delivered to your address. Enjoy your groceries!',
    time: '10 mins ago',
    isRead: false,
    clickable: true,
  },
  {
    id: '2',
    type: 'promo',
    title: '50% OFF on Fresh Fruits 🍎',
    message: 'Grab fresh farm apples and oranges at half price today. Limited stock available!',
    time: '2 hours ago',
    isRead: false,
    clickable: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Welcome to Grocery App!',
    message: 'Thank you for joining us. We guarantee 10-minute delivery for all your needs.',
    time: '1 day ago',
    isRead: true,
    clickable: false,
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Out for Delivery',
    message: 'Ritik is on the way with your order #ORD-8491. Please keep your phone reachable.',
    time: '2 days ago',
    isRead: true,
    clickable: true,
  }
];

export const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const renderIcon = (type) => {
    switch(type) {
      case 'order': return <Package size={20} color={theme.colors.white} />;
      case 'promo': return <Tag size={20} color={theme.colors.white} />;
      default: return <Info size={20} color={theme.colors.white} />;
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'order': return '#10B981'; // Green
      case 'promo': return '#F59E0B'; // Orange
      default: return '#3B82F6'; // Blue
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      activeOpacity={item.clickable ? 0.7 : 1}
      onPress={() => {
        if(item.clickable) {
          if (item.type === 'order') navigation.navigate('OrdersTab');
          else if (item.type === 'promo') navigation.navigate('CategoriesTab');
        }
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) }]}>
        {renderIcon(item.type)}
      </View>
      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary]}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </LinearGradient>

      {NOTIFICATIONS.length > 0 ? (
        <FlatList
          data={NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Bell size={40} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySubtitle}>When you get notifications, they'll show up here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: moderateScale(16),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  backButton: {
    padding: moderateScale(4),
    marginRight: moderateScale(12),
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: moderateScale(24),
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#F0FDF4', // Extremely light green tint for unread
    borderColor: '#DCFCE7',
    borderWidth: 1,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(4),
  },
  title: {
    fontSize: rf(14),
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: moderateScale(8),
  },
  unreadTitle: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
  timeText: {
    fontSize: rf(11),
    color: '#94A3B8',
  },
  messageText: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    lineHeight: rf(18),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(8),
  },
  emptySubtitle: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Package, Tag, Info, CheckSquare, Trash2 } from 'lucide-react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

import { useNotifications } from '../../context/NotificationContext';

export const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

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
      onPress={async () => {
        await markAsRead(item.id);
        if(item.clickable) {
          if (item.type === 'order' || item.type === 'order_status') {
            // Navigate to order details or tab
            if (item.data?.orderId) {
              navigation.navigate('OrderDetails', { orderId: item.data.orderId });
            } else {
              navigation.navigate('OrdersTab');
            }
          }
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
        colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
        locations={[0, 0.55, 1]}
        style={[styles.header, { paddingTop: moderateScale(12) }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>
      </LinearGradient>

      {notifications.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn} activeOpacity={0.7}>
            <CheckSquare size={16} color="#475569" />
            <Text style={styles.actionBtnText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={[styles.actionBtn, styles.clearBtn]} activeOpacity={0.7}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.actionBtnText, styles.clearBtnText]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
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
    paddingBottom: moderateScale(12),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: moderateScale(12),
    paddingVertical: moderateScale(4),
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(4),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  actionBtnText: {
    color: '#475569',
    fontSize: rf(12),
    fontWeight: '600',
    marginLeft: moderateScale(6),
  },
  clearBtn: {
    backgroundColor: '#FEF2F2',
  },
  clearBtnText: {
    color: '#EF4444',
  },
});

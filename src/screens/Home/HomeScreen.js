import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, User, Search, Mic, Bell, Flame, Tag } from 'lucide-react-native';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { Loader } from '../../components/Loader';
import { AnimatedSearchPlaceholder } from '../../components/AnimatedSearchPlaceholder';
import { LocationEmptyState } from '../../components/LocationEmptyState';
import { BannerCarousel } from '../../components/BannerCarousel';
import { BrandedFooter } from '../../components/BrandedFooter';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

const formatETA = (mins) => {
  if (!mins) return '---';
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hrs} ${hrs > 1 ? 'hrs' : 'hr'}`;
  }
  return `${hrs} ${hrs > 1 ? 'hrs' : 'hr'} ${remainingMins} mins`;
};

export const HomeScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { activeAddress, activeShop, serviceAvailable, isFetchingShop, deliveryETA, isAuthenticated } = useContext(AuthContext);
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const { unreadCount } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  // React Query calls
  const { data: banners = [], isLoading: isLoadingBanners, refetch: refetchBanners } = useQuery({
    queryKey: ['banners'],
    queryFn: api.getBanners,
  });

  const homeTopBanners = banners.filter(
    (b) => b.location === 'home_top' || b.location === 'hometop'
  );
  const homeMiddleBanners = banners.filter(
    (b) => b.location === 'home_middle' || b.location === 'homemiddle'
  );

  const { data: categories = [], isLoading: isLoadingCategories, isFetching: isFetchingCategories, isError: isErrorCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories', activeShop?.id],
    queryFn: api.getCategories,
    enabled: !!activeShop?.id,
  });

  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts, isError: isErrorProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['homeAllProducts', activeShop?.id],
    queryFn: () => api.getProducts({ shopId: activeShop?.id, limit: 100 }),
    enabled: !!activeShop?.id,
  });

  useFocusEffect(
    useCallback(() => {
      refetchBanners();
      if (activeShop?.id) {
        refetchCategories();
        refetchProducts();
      }
    }, [activeShop?.id])
  );
  
  const allProducts = productsData?.products || [];

  const trendingProducts = allProducts.filter(p => p.type === 'trending');
  const bestDealProducts = allProducts.filter(p => p.type === 'best_deal');

  const isCategoriesLoading = activeShop?.id ? (isLoadingCategories || isFetchingCategories || isErrorCategories) : false;
  const isProductsLoading = activeShop?.id ? (isLoadingProducts || isFetchingProducts || isErrorProducts) : false;

  const categoriesWithProducts = categories
    .map((cat) => {
      const products = allProducts.filter((p) => p.categoryId === cat.id);
      return { ...cat, products };
    })
    .filter((cat) => cat.products.length > 0)
    .slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.id : null;
  };

  const isScreenLoading = isFetchingShop || isLoadingBanners || isCategoriesLoading || isProductsLoading;

  if (isScreenLoading && activeAddress) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        {/* Index 0: Address Row */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary]}
          style={{ paddingTop: moderateScale(16), paddingHorizontal: theme.spacing.lg, paddingBottom: moderateScale(0) }}
        >
          <View style={styles.addressRow}>
            <TouchableOpacity
              style={styles.addressLeft}
              onPress={() => {
                navigation.navigate('AddressManagement');
              }}
              activeOpacity={0.7}
            >
              <View>
                <Text style={{ fontSize: rf(11), fontWeight: '800', color: '#DCFCE7', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {serviceAvailable ? 'Deliver in' : 'Service'}
                </Text>
                <Text style={{ fontSize: rf(20), fontWeight: '900', color: theme.colors.white, marginTop: moderateScale(1) }}>
                  {serviceAvailable ? formatETA(deliveryETA) : 'Out of Zone'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(4) }}>
                  <Text style={{ fontSize: rf(13), fontWeight: '700', color: theme.colors.white, maxWidth: 220 }} numberOfLines={1}>
                    {activeAddress
                      ? `${activeAddress.type} - ${activeAddress.flatNo}, ${activeAddress.addressLine}`
                      : 'Select Address'}
                  </Text>
                  <ChevronDown size={12} color={theme.colors.white} style={{ marginLeft: moderateScale(3) }} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: moderateScale(10), position: 'relative' }]}
                activeOpacity={0.8}
              >
                <Bell size={18} color={theme.colors.white} />
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: theme.colors.error, borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!isAuthenticated) {
                    navigation.navigate('Login', { redirectTo: 'Profile' });
                  } else {
                    navigation.navigate('Profile');
                  }
                }}
                style={[styles.headerIconBtn, { backgroundColor: theme.colors.white }]}
                activeOpacity={0.8}
              >
                <User size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Index 1: Sticky Search Bar Row */}
        <View style={{ zIndex: 100, elevation: 5 }}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            style={{ paddingTop: moderateScale(16), paddingHorizontal: theme.spacing.lg, paddingBottom: moderateScale(16) }}
          >
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.searchBarCurvyButton}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.9}
              >
                <Search size={20} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.xs }} />
                <AnimatedSearchPlaceholder isVisible={true} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ position: 'absolute', right: moderateScale(12), top: moderateScale(9), padding: moderateScale(8) }}
                onPress={() => navigation.navigate('Search', { startVoice: true })}
                activeOpacity={0.7}
              >
                <Mic size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Loader Content Area */}
        <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Index 0: Address Row (Scrolls away) */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary]}
          style={{ paddingTop: moderateScale(16), paddingHorizontal: theme.spacing.lg, paddingBottom: moderateScale(0) }}
        >
          <View style={styles.addressRow}>
            <TouchableOpacity
              style={styles.addressLeft}
              onPress={() => {
                navigation.navigate('AddressManagement');
              }}
              activeOpacity={0.7}
            >
              <View>
                <Text style={{ fontSize: rf(11), fontWeight: '800', color: '#DCFCE7', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {serviceAvailable ? 'Deliver in' : 'Service'}
                </Text>
                <Text style={{ fontSize: rf(20), fontWeight: '900', color: theme.colors.white, marginTop: moderateScale(1) }}>
                  {serviceAvailable ? formatETA(deliveryETA) : 'Out of Zone'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(4) }}>
                  <Text style={{ fontSize: rf(13), fontWeight: '700', color: theme.colors.white, maxWidth: 220 }} numberOfLines={1}>
                    {activeAddress
                      ? `${activeAddress.type} - ${activeAddress.flatNo}, ${activeAddress.addressLine}`
                      : 'Select Address'}
                  </Text>
                  <ChevronDown size={12} color={theme.colors.white} style={{ marginLeft: moderateScale(3) }} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: moderateScale(10), position: 'relative' }]}
                activeOpacity={0.8}
              >
                <Bell size={18} color={theme.colors.white} />
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: theme.colors.error, borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!isAuthenticated) {
                    navigation.navigate('Login', { redirectTo: 'Profile' });
                  } else {
                    navigation.navigate('Profile');
                  }
                }}
                style={[styles.headerIconBtn, { backgroundColor: theme.colors.white }]}
                activeOpacity={0.8}
              >
                <User size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Index 1: Sticky Search Bar Row */}
        <View style={{ zIndex: 100, elevation: 5 }}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            style={{ paddingTop: moderateScale(16), paddingHorizontal: theme.spacing.lg, paddingBottom: moderateScale(16) }}
          >
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.searchBarCurvyButton}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.9}
              >
                <Search size={20} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.xs }} />
                <AnimatedSearchPlaceholder isVisible={true} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ position: 'absolute', right: moderateScale(12), top: moderateScale(9), padding: moderateScale(8) }}
                onPress={() => navigation.navigate('Search', { startVoice: true })}
                activeOpacity={0.7}
              >
                <Mic size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Index 2: Main Body (White Background) */}
        <View style={{ backgroundColor: theme.colors.white, paddingBottom: theme.spacing.xxl, flex: 1 }}>

            {/* Main Content Area */}
            {!activeAddress ? (
          <LocationEmptyState 
            type="missing" 
            onAction={() => navigation.navigate('AddressManagement')} 
          />
        ) : !serviceAvailable ? (
          <LocationEmptyState 
            type="outOfZone" 
            activeAddress={activeAddress} 
            onAction={() => navigation.navigate('AddressManagement')} 
          />
        ) : (
          <View>
            {/* Shop By Category Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

        {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCircleCard}
                onPress={() => navigation.navigate('CategoryProducts', { categoryId: cat.id })}
                activeOpacity={0.8}
              >
                <View style={styles.categoryImageContainer}>
                  <Image source={{ uri: cat.image }} style={styles.categoryCircleImage} resizeMode="cover" />
                </View>
                <Text style={styles.categoryCircleName} numberOfLines={1} ellipsizeMode="tail">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

            {homeTopBanners.length > 0 && (
              <View style={[styles.bannersContainer, { marginTop: theme.spacing.sm }]}>
                <BannerCarousel banners={homeTopBanners} navigation={navigation} />
              </View>
            )}


          {/* Trending Now Section */}
            {trendingProducts.length > 0 && (
              <View>
                <View style={styles.trendingHeader}>
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                  <View style={styles.trendingBadge}>
                    <Flame size={10} color="#EA580C" style={{ marginRight: 3 }} />
                    <Text style={styles.trendingBadgeText}>Hot</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productsHorizontalScroll}
                >
                  {trendingProducts.map((prod) => (
                    <View key={prod.id} style={styles.horizontalCardWrapper}>
                      <ProductCard
                        product={prod}
                        cartQuantity={getCartQuantity(prod.id)}
                        onPress={() => navigation.navigate('ProductDetails', { productId: prod.id })}
                        onIncrement={() => addToCart(prod, activeShop.id)}
                        onDecrement={() => updateQuantity(getCartItemId(prod.id), getCartQuantity(prod.id) - 1)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Best Deals Section */}
            {bestDealProducts.length > 0 && (
              <View>
                <View style={styles.bestDealHeader}>
                  <Text style={styles.sectionTitle}>Best Deals</Text>
                  <View style={styles.bestDealBadge}>
                    <Tag size={10} color="#059669" style={{ marginRight: 3 }} />
                    <Text style={styles.bestDealBadgeText}>Savings</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productsHorizontalScroll}
                >
                  {bestDealProducts.map((prod) => (
                    <View key={prod.id} style={styles.horizontalCardWrapper}>
                      <ProductCard
                        product={prod}
                        cartQuantity={getCartQuantity(prod.id)}
                        onPress={() => navigation.navigate('ProductDetails', { productId: prod.id })}
                        onIncrement={() => addToCart(prod, activeShop.id)}
                        onDecrement={() => updateQuantity(getCartItemId(prod.id), getCartQuantity(prod.id) - 1)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

        {categoriesWithProducts.map((cat, index) => (
            <React.Fragment key={cat.id}>
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{cat.name}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { categoryId: cat.id })}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productsHorizontalScroll}
                >
                  {cat.products.map((prod) => (
                    <View key={prod.id} style={styles.horizontalCardWrapper}>
                      <ProductCard
                        product={prod}
                        cartQuantity={getCartQuantity(prod.id)}
                        onPress={() => navigation.navigate('ProductDetails', { productId: prod.id })}
                        onIncrement={() => addToCart(prod, activeShop.id)}
                        onDecrement={() => updateQuantity(getCartItemId(prod.id), getCartQuantity(prod.id) - 1)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              {index === 1 && homeMiddleBanners.length > 0 && (
                <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                  <BannerCarousel banners={homeMiddleBanners} navigation={navigation} />
                </View>
              )}
            </React.Fragment>
          ))}
          <BrandedFooter />
          </View>
        )}

        </View>
      </ScrollView>

    </View>
  );
};

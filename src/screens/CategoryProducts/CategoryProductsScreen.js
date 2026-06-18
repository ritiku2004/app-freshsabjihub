import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SlidersHorizontal, Info, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { api } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { ProductCard } from '../../components/ProductCard';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price-low-to-high' },
  { label: 'Price: High to Low', value: 'price-high-to-low' },
  { label: 'Discount', value: 'discount' },
];

export const CategoryProductsScreen = ({ route, navigation }) => {
  const { categoryId } = route.params || {};
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const { activeShop } = useContext(AuthContext);

  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [filterVisible, setFilterVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [productsList, setProductsList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // React Query: Get categories list to extract this category's title & subcategories
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const currentCategory = categories.find((cat) => cat.id === categoryId) || {
    name: 'Products',
    subcategories: ['All'],
  };

  // React Query: Fetch products matching category, subcategory, sort, and page
  const { data, isLoading, isFetching, refetch: refetchProducts } = useQuery({
    queryKey: ['categoryProducts', categoryId, selectedSubcategory, sortBy, page, activeShop?.id],
    queryFn: () =>
      api.getProducts({
        shopId: activeShop?.id,
        categoryId,
        subcategory: selectedSubcategory,
        sortBy,
        page,
        limit: 4, // low limit to easily test pagination/lazy loading
      }),
    enabled: !!activeShop?.id,
  });

  useFocusEffect(
    useCallback(() => {
      refetchCategories();
      if (activeShop?.id) {
        refetchProducts();
      }
    }, [categoryId, selectedSubcategory, sortBy, page, activeShop?.id])
  );

  // Handle data updates and append for pagination
  useEffect(() => {
    if (data) {
      if (page === 1) {
        setProductsList(data.products);
      } else {
        // Append items avoiding duplicate ids
        setProductsList((prev) => {
          const prevIds = prev.map((item) => item.id);
          const newUnique = data.products.filter((item) => !prevIds.includes(item.id));
          return [...prev, ...newUnique];
        });
      }
      setLoadingMore(false);
    }
  }, [data, page]);

  // Reset pagination when filter/sort configurations alter
  const handleSubcategoryChange = (sub) => {
    setSelectedSubcategory(sub);
    setPage(1);
    setProductsList([]);
  };

  const handleSortChange = (option) => {
    setSortBy(sortBy === option ? 'default' : option);
    setPage(1);
    setProductsList([]);
    setFilterVisible(false); // Close drawer after selection
  };

  const handleLoadMore = () => {
    if (data?.hasMore && !isFetching && !loadingMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.id : null;
  };

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      cartQuantity={getCartQuantity(item.id)}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      onIncrement={() => addToCart(item, activeShop?.id)}
      onDecrement={() => updateQuantity(getCartItemId(item.id), getCartQuantity(item.id) - 1)}
      style={{ width: '48%', marginBottom: theme.spacing.md }}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]} locations={[0, 0.55, 1]} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentCategory.name}</Text>
        </View>
        <TouchableOpacity onPress={() => setFilterVisible(true)} activeOpacity={0.7}>
          <SlidersHorizontal size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Products list or Loader */}
      {(isLoading || isFetching) && page === 1 ? (
        <Loader />
      ) : productsList.length > 0 ? (
        <FlatList
          data={productsList}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.gridRow}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => {
            if (loadingMore || (isFetching && page > 1)) {
              return (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              );
            }
            if (!data?.hasMore) {
              return (
                <View style={{ paddingVertical: moderateScale(20), alignItems: 'center' }}>
                  <Text style={{ fontSize: rf(11), color: theme.colors.textSecondary }}>
                    No more products to show
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Info size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No products available in this subcategory.</Text>
        </View>
      )}

      {/* Filter Bottom Drawer */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort & Filter</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.filterOptionRow}
                onPress={() => handleSortChange(item.value)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === item.value ? styles.filterOptionTextActive : null,
                  ]}
                >
                  {item.label}
                </Text>
                {sortBy === item.value && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

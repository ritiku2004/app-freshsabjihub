import React, { useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Loader } from '../../components/Loader';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { api } from '../../services/api';
import { BannerCarousel } from '../../components/BannerCarousel';
import { LocationEmptyState } from '../../components/LocationEmptyState';
import { AuthContext } from '../../context/AuthContext';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const CategoriesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeAddress, activeShop, serviceAvailable, isFetchingShop } = useContext(AuthContext);

  // React Query: Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories, isFetching: isFetchingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories', activeShop?.id],
    queryFn: api.getCategories,
    enabled: !!activeShop?.id,
  });

  const { data: banners = [], refetch: refetchBanners } = useQuery({
    queryKey: ['banners'],
    queryFn: api.getBanners,
  });

  useFocusEffect(
    useCallback(() => {
      refetchBanners();
      if (activeShop?.id) {
        refetchCategories();
      }
    }, [activeShop?.id])
  );

  const categoryBanners = banners.filter(
    (b) => b.location === 'category_top' || b.location === 'categorytop'
  );

  const isLoading = isLoadingCategories || isFetchingCategories || isFetchingShop || (activeAddress && !activeShop);

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.primary, '#A7F3D0']} 
        locations={[0, 0.55, 1]} 
        style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
      >
        <Text style={styles.headerTitle}>All Categories</Text>
      </LinearGradient>

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
      ) : isLoading ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Category Promo Banner */}
          {categoryBanners.length > 0 && (
            <View style={{ marginBottom: theme.spacing.lg, marginHorizontal: -theme.spacing.md }}>
              <BannerCarousel banners={categoryBanners} />
            </View>
          )}

          <View style={styles.grid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.card}
                onPress={() => navigation.navigate('CategoryProducts', { categoryId: cat.id })}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: cat.image }} style={styles.image} resizeMode="cover" />
                </View>
                <Text style={styles.name} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

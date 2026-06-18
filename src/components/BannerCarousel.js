import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import { PromoBanner } from './PromoBanner';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export const BannerCarousel = ({ banners = [], containerStyle = {} }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `banner-${index}`}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.bannerWrapper}>
            <PromoBanner {...item} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
  },
  bannerWrapper: {
    width: screenWidth,
    paddingHorizontal: 0,
  },
});

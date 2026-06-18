import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import { PromoBanner } from './PromoBanner';
import { theme } from '../theme';
import { moderateScale } from '../utils/responsive';

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
      {banners.length > 1 && (
        <View style={styles.indicatorRow}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.dotActive : null
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: moderateScale(4),
    position: 'relative', // Allows absolute indicator positioning overlay
  },
  bannerWrapper: {
    width: screenWidth,
    paddingHorizontal: theme.spacing.lg, // Float card with screen margins
  },
  indicatorRow: {
    position: 'absolute',
    bottom: moderateScale(18), // Floating overlay inside the banner card bottom area
    left: 0,
    right: 0,
    flexDirection: 'row', // Horizontal alignment
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Keeps indicators on top of FlatList contents
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Translucent white for visibility on dark graphics
    marginHorizontal: moderateScale(4),
    // Soft shadow for visibility on light graphics
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  dotActive: {
    backgroundColor: '#FFFFFF', // Clean solid white active pill
    width: moderateScale(16), // Stretched active indicator
  },
});

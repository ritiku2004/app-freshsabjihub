import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { moderateScale, rf } from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

export const PromoBanner = ({ title, subtitle, description, imageUri, image, backgroundColor, textColor, buttonText }) => {
  const source = typeof image === 'string' ? { uri: image } : (image ? image : { uri: imageUri });
  const isHero = !!(source && source.uri && (source.uri.includes('hero_banner') || source.uri.includes('hero6_banner')));

  return (
    <View style={[styles.bannerCard, { backgroundColor: backgroundColor || '#FFFFFF' }]}>
      <Image 
        source={source} 
        style={[
          styles.backgroundImageStyle,
          isHero 
            ? { left: moderateScale(-180), width: screenWidth + moderateScale(180) } 
            : { left: 0, width: '100%' }
        ]}
        resizeMode="cover"
      />
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          {subtitle ? (
            <View style={[styles.badge, { backgroundColor: '#E8FBEB' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{subtitle}</Text>
            </View>
          ) : null}
          
          <Text style={styles.bannerTitle} numberOfLines={2}>
            {title}
          </Text>
          
          {description ? (
            <Text style={styles.bannerDesc} numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.shopNowButton} activeOpacity={0.8}>
            <Text style={styles.shopNowText}>{buttonText || 'Shop Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    width: '100%',
    borderRadius: 0,
    height: moderateScale(190), // Height 190 keeps original aspect ratio to prevent cropping on the right
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0,
  },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: moderateScale(22),
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  bannerLeft: {
    width: '60%', // Constrain text overlay to the left half, leaving the right side for the couple graphic
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(20),
    marginBottom: moderateScale(6),
  },
  badgeText: {
    fontSize: rf(9),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: rf(18),
    fontWeight: '900', // Heavy bold header
    lineHeight: rf(21),
    color: '#1E293B',
    marginBottom: moderateScale(6),
  },
  bannerDesc: {
    fontSize: rf(11),
    color: '#64748B',
    fontWeight: '500',
    lineHeight: rf(14),
    marginBottom: moderateScale(10),
  },
  shopNowButton: {
    backgroundColor: '#16A34A', // Solid green CTA button matching mockup
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(5),
  },
  shopNowText: {
    color: theme.colors.white,
    fontSize: rf(11),
    fontWeight: '800',
  },
});

import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useWindowDimensions, Animated, Easing, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AppButton } from '../../components/AppButton';
import styles from './styles';

import { Rocket, ShieldCheck, Tag } from 'lucide-react-native';
import { theme } from '../../theme';

const slides = [
  {
    id: 's1',
    title: 'Superfast Delivery',
    description: 'Get your fresh groceries delivered to your doorstep quickly and securely.',
    icon: Rocket,
  },
  {
    id: 's2',
    title: 'Freshness Guaranteed',
    description: 'Directly sourced from local farms to maintain the highest quality and freshness.',
    icon: ShieldCheck,
  },
  {
    id: 's3',
    title: 'Daily Offers & Discounts',
    description: 'Enjoy premium discounts, promo codes, and special packages every day.',
    icon: Tag,
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Animated values
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const footerSlideAnim = useRef(new Animated.Value(50)).current;
  const ringRotateAnim = useRef(new Animated.Value(0)).current;

  // Continuous background ring rotation
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Mount fade-in & spring entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.spring(footerSlideAnim, {
        toValue: 0,
        friction: 6,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    navigation.replace('MainTabs');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  // Background Opacities for Color Blending
  const bg1Opacity = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const bg2Opacity = scrollX.interpolate({
    inputRange: [0, width, 2 * width],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const bg3Opacity = scrollX.interpolate({
    inputRange: [width, 2 * width],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const ringRotation = ringRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSlide = ({ item, index }) => {
    const IconComponent = item.icon;
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    // Icon scale & rotation parallax
    const iconScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const iconRotation = scrollX.interpolate({
      inputRange,
      outputRange: ['-50deg', '0deg', '50deg'],
      extrapolate: 'clamp',
    });

    // Title slides left to right
    const titleTranslateX = scrollX.interpolate({
      inputRange,
      outputRange: [-80, 0, 80],
      extrapolate: 'clamp',
    });

    // Description slides right to left
    const descTranslateX = scrollX.interpolate({
      inputRange,
      outputRange: [80, 0, -80],
      extrapolate: 'clamp',
    });

    // Smooth opacity fade
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        {/* Animated Rotating Ring and Glassmorphic Icon Wrapper */}
        <View style={styles.iconWrapper}>
          <Animated.View style={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: 125,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderStyle: 'dashed',
            opacity: 0.18,
            transform: [{ rotate: ringRotation }],
          }} />
          
          <Animated.View style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 18,
            elevation: 10,
            transform: [{ scale: iconScale }, { rotate: iconRotation }],
          }}>
            <IconComponent size={96} color={theme.colors.primary} />
          </Animated.View>
        </View>

        <Animated.Text style={[
          styles.title, 
          { opacity: textOpacity, transform: [{ translateX: titleTranslateX }] }
        ]}>
          {item.title}
        </Animated.Text>

        <Animated.Text style={[
          styles.description, 
          { opacity: textOpacity, transform: [{ translateX: descTranslateX }] }
        ]}>
          {item.description}
        </Animated.Text>
      </View>
    );
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, backgroundColor: '#FFFFFF' }]}>
      {/* Background color blending layers */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#ECFDF5', opacity: bg1Opacity }]} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#EFF6FF', opacity: bg2Opacity }]} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF7ED', opacity: bg3Opacity }]} />
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
        style={styles.slideList}
      />

      <Animated.View style={[styles.footer, { transform: [{ translateY: footerSlideAnim }] }]}>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.7}>
          <Text style={styles.actionText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const scaleX = scrollX.interpolate({
              inputRange,
              outputRange: [1, 2.5, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  { 
                    transform: [{ scaleX }], 
                    opacity: dotOpacity, 
                    backgroundColor: theme.colors.primary 
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.7}>
          <Text style={styles.actionTextActive}>
            {activeIndex === slides.length - 1 ? "Start" : "Next"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

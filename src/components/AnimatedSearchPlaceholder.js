import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { moderateScale, rf } from '../utils/responsive';

const placeholders = [
  'Search "atta"',
  'Search "dal"',
  'Search "coke"',
  'Search "milk"',
  'Search "bread"',
  'Search "paneer"',
];

export const AnimatedSearchPlaceholder = ({ isVisible }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isVisible) {
      // Pause animation if not visible
      return;
    }

    const intervalId = setInterval(() => {
      // Animate from 0 to -moderateScale(35)
      Animated.timing(translateY, {
        toValue: -moderateScale(35),
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // After animation completes, instantly snap back and swap text
        translateY.setValue(0);
        setCurrentIndex((prev) => (prev + 1) % placeholders.length);
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isVisible, translateY]);

  if (!isVisible) return null;

  const nextIndex = (currentIndex + 1) % placeholders.length;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={{ transform: [{ translateY }] }}>
        {/* Current Text moving up */}
        <View style={styles.textContainer}>
          <Text style={styles.text}>{placeholders[currentIndex]}</Text>
        </View>
        {/* Next Text coming from bottom */}
        <View style={styles.textContainer}>
          <Text style={styles.text}>{placeholders[nextIndex]}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: moderateScale(44), // Matches AppInput padding and icon width
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    height: moderateScale(46), // Must match search container height
  },
  textContainer: {
    height: moderateScale(24),
    justifyContent: 'center',
    marginTop: moderateScale(11), // Adjust vertical centering
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
  },
});

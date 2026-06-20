import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { moderateScale, rf } from '../utils/responsive';

export const BrandedFooter = () => {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.titleText}>India's fresh grocery app ❤️</Text>
      <Text style={styles.brandText}>fresh sabji hub</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(48),
    backgroundColor: '#F8FAFC', // Match screen backgrounds
    width: '100%',
  },
  divider: {
    width: '85%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: moderateScale(28),
  },
  titleText: {
    fontSize: rf(26),
    fontWeight: '900',
    color: '#D1D5DB', // Faded light gray text
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: rf(16),
    fontWeight: '800',
    color: '#E5E7EB', // Even more faded lowercase logo style
    marginTop: moderateScale(16),
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});

export default BrandedFooter;

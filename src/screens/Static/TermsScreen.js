import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ArrowLeft, BookOpen, User, Smartphone, ShoppingBag, RotateCcw, Copyright, AlertTriangle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TermsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.secondary]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7} 
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom + 16, theme.spacing.xl) }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryIconContainer}>
            <BookOpen size={24} color="#047857" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Terms of Service Summary</Text>
            <Text style={styles.summaryText}>
              By using FreshCart, you agree to our service terms. Below are the key terms regarding your account, orders, delivery, and refunds.
            </Text>
          </View>
        </View>

        {/* Effective Date */}
        <View style={styles.introContainer}>
          <Text style={styles.heading}>FreshCart Terms of Service</Text>
          <Text style={styles.date}>Effective Date: June 2026</Text>
        </View>

        {/* Card list */}
        <View style={styles.cardsContainer}>

          {/* Section 1 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <BookOpen size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>1. Acceptance of Terms</Text>
            </View>
            <Text style={styles.cardBody}>
              By downloading, accessing, or using the FreshCart application ("App"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access or use our services.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <User size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>2. User Accounts</Text>
            </View>
            <Text style={styles.cardBody}>
              To place orders, you must create a verified account. You are responsible for safeguarding your login credentials (including OTP tokens sent to your email) and for all activities that occur under your profile.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <Smartphone size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>3. Use of the App</Text>
            </View>
            <Text style={styles.cardBody}>
              You agree to use the App only for lawful, personal purposes. Violations or attempts to violate app security, including accessing unauthorized accounts or data scraping, will result in immediate termination.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <ShoppingBag size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>4. Orders, Pricing & Delivery</Text>
            </View>
            <Text style={styles.cardBody}>
              All product prices are subject to change without notice. Delivery timelines are estimates, and while we strive to meet them, FreshCart is not liable for minor delays outside our control (e.g. extreme weather or transit conditions).
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <RotateCcw size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>5. Returns & Refunds</Text>
            </View>
            <Text style={styles.cardBody}>
              If you receive incorrect, damaged, or defective items, you must contact our customer support team within 24 hours of delivery. Refunds or replacements are issued at our sole discretion after proper verification.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <Copyright size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>6. Intellectual Property</Text>
            </View>
            <Text style={styles.cardBody}>
              The App and its original content, features, and brand design are the exclusive property of FreshCart and its licensors. Any reuse or duplication of assets is strictly prohibited without prior written consent.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.termsCard}>
            <View style={styles.cardHeader}>
              <AlertTriangle size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>7. Limitation of Liability</Text>
            </View>
            <Text style={styles.cardBody}>
              In no event shall FreshCart, its directors, partners, or employees be liable for any indirect, incidental, or special damages resulting from your use of the App or inability to access the service.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={[styles.termsCard, { marginBottom: moderateScale(20) }]}>
            <View style={styles.cardHeader}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>8. Changes to Terms</Text>
            </View>
            <Text style={styles.cardBody}>
              We reserve the right to modify or replace these Terms at any time. By continuing to access or use our App after revisions become effective, you agree to be bound by the updated terms.
            </Text>
          </View>

        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    paddingHorizontal: theme.spacing.lg, 
    paddingTop: moderateScale(10), 
    paddingBottom: moderateScale(22), 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: {
    padding: moderateScale(4),
    marginRight: theme.spacing.sm,
  },
  headerTitle: { 
    fontSize: rf(19), 
    fontWeight: theme.typography.weights.bold, 
    color: theme.colors.white 
  },
  scrollContainer: {
    paddingBottom: theme.spacing.xl,
  },
  summaryBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: moderateScale(24),
    backgroundColor: '#E8FBEB',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: rf(14.5),
    fontWeight: '700',
    color: '#065F46',
    marginBottom: moderateScale(2),
  },
  summaryText: {
    fontSize: rf(12),
    color: '#065F46',
    lineHeight: rf(17.5),
  },
  introContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: moderateScale(22),
  },
  heading: { 
    fontSize: rf(19), 
    fontWeight: '800', 
    color: theme.colors.textPrimary 
  },
  date: { 
    fontSize: rf(12.5), 
    color: theme.colors.textSecondary, 
    marginTop: moderateScale(4) 
  },
  cardsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: moderateScale(16),
  },
  termsCard: {
    backgroundColor: theme.colors.white, 
    padding: moderateScale(16), 
    borderRadius: theme.borderRadius.md, 
    marginBottom: theme.spacing.md, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  cardTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginLeft: moderateScale(10),
  },
  cardBody: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    lineHeight: rf(19.5),
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { ArrowLeft, Sprout, ShieldCheck, Award, Smile, Clock, Heart, Leaf, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AboutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.secondary]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={[styles.header, { paddingTop: moderateScale(12) }]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7} 
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom + 16, theme.spacing.xl) }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Section */}
        <LinearGradient 
          colors={[theme.colors.primaryLight, '#F8FAFC']} 
          style={styles.heroSection}
        >
          <View style={styles.logoOuterCircle}>
            <View style={styles.logoInnerCircle}>
              <Image source={require('../../../assets/Logo/logo.png')} style={styles.logoImage} />
            </View>
          </View>
          <Text style={styles.heroTitle}>FreshCart</Text>
          <Text style={styles.heroSubtitle}>Nourishing Lives, Freshly & Fast</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>100% ORGANIC PROMISE</Text>
          </View>
        </LinearGradient>

        {/* Narrative / Intro */}
        <View style={styles.section}>
          <Text style={styles.welcomeText}>Welcome to the Future of Grocery</Text>
          <Text style={styles.paragraph}>
            At FreshCart, we believe that access to clean, fresh, and nutritious food is a fundamental right. We are rewriting the rules of the grocery supply chain to bring farm-fresh produce and daily household essentials straight to your home.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Smile size={22} color={theme.colors.primary} />
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Happy Users</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={22} color={theme.colors.primary} />
            <Text style={styles.statNumber}>15 Min</Text>
            <Text style={styles.statLabel}>Avg Delivery</Text>
          </View>
          <View style={styles.statCard}>
            <Sprout size={22} color={theme.colors.primary} />
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Partner Farms</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={22} color={theme.colors.primary} />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Quality Check</Text>
          </View>
        </View>

        {/* Pillars / Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Core Pillars</Text>
          
          {/* Pillar 1 */}
          <View style={styles.pillarCard}>
            <View style={styles.pillarIconContainer}>
              <Sprout size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Direct From Local Farms</Text>
              <Text style={styles.pillarDescription}>
                We partner directly with regional growers and local micro-warehouses to maintain premium quality checks and skip middleman delays.
              </Text>
            </View>
          </View>

          {/* Pillar 2 */}
          <View style={styles.pillarCard}>
            <View style={styles.pillarIconContainer}>
              <Zap size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Hyperlocal & Superfast</Text>
              <Text style={styles.pillarDescription}>
                Our cold-chain logistics system keeps temperature-controlled bags optimized so items arrive fresh and fast.
              </Text>
            </View>
          </View>

          {/* Pillar 3 */}
          <View style={styles.pillarCard}>
            <View style={styles.pillarIconContainer}>
              <ShieldCheck size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Absolute Safety First</Text>
              <Text style={styles.pillarDescription}>
                Multi-layer disinfection, touchless packing, and continuous sanitization protocols ensure total safety from farm to fork.
              </Text>
            </View>
          </View>
        </View>

        {/* Narrative / Promise card */}
        <LinearGradient 
          colors={[theme.colors.primary, theme.colors.secondary]} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={styles.promiseCard}
        >
          <View style={styles.promiseContent}>
            <Heart size={32} color={theme.colors.white} style={styles.promiseIcon} />
            <Text style={styles.promiseTitle}>Our Green Commitment</Text>
            <Text style={styles.promiseDescription}>
              We are dedicated to sustainable delivery. Over 90% of our packaging is biodegradable, and we actively work with our delivery network to minimize our carbon footprint.
            </Text>
          </View>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerSubtext}>Proudly serving healthy living</Text>
          <Text style={styles.footerHeart}>Made with 💚 for fresh eating</Text>
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
    paddingTop: moderateScale(12), 
    paddingBottom: moderateScale(12), 
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
  heroSection: {
    alignItems: 'center',
    paddingTop: moderateScale(36),
    paddingBottom: moderateScale(28),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoOuterCircle: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(14),
  },
  logoInnerCircle: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: rf(26),
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    marginTop: moderateScale(4),
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(16),
    marginTop: moderateScale(12),
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: rf(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: moderateScale(24),
  },
  welcomeText: {
    fontSize: rf(17),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(8),
  },
  paragraph: {
    fontSize: rf(13.5),
    color: theme.colors.textSecondary,
    lineHeight: rf(21),
    textAlign: 'left',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: moderateScale(24),
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(16),
    alignItems: 'center',
    marginBottom: moderateScale(14),
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  statNumber: {
    fontSize: rf(19),
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: moderateScale(8),
  },
  statLabel: {
    fontSize: rf(11.5),
    color: theme.colors.textSecondary,
    marginTop: moderateScale(2),
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: rf(17),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(14),
  },
  pillarCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  pillarIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(14),
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: rf(14.5),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(4),
  },
  pillarDescription: {
    fontSize: rf(12.5),
    color: theme.colors.textSecondary,
    lineHeight: rf(18),
  },
  promiseCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: moderateScale(24),
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  promiseContent: {
    padding: moderateScale(22),
    alignItems: 'center',
  },
  promiseIcon: {
    marginBottom: moderateScale(10),
  },
  promiseTitle: {
    color: theme.colors.white,
    fontSize: rf(17),
    fontWeight: 'bold',
    marginBottom: moderateScale(6),
  },
  promiseDescription: {
    color: '#ECFDF5',
    fontSize: rf(12.5),
    lineHeight: rf(18.5),
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: moderateScale(36),
    marginBottom: moderateScale(24),
  },
  footerText: {
    fontSize: rf(12.5),
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  footerSubtext: {
    fontSize: rf(11),
    color: theme.colors.textSecondary,
    marginTop: moderateScale(2),
  },
  footerHeart: {
    fontSize: rf(11),
    color: theme.colors.textSecondary,
    marginTop: moderateScale(4),
    fontWeight: '500',
  },
});

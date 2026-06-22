import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { ArrowLeft, Lock, ShieldCheck, Eye, Share2, FileText, Mail, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PrivacyScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom + 16, theme.spacing.xl) }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Trust Header Banner */}
        <View style={styles.trustBanner}>
          <View style={styles.trustIconContainer}>
            <ShieldCheck size={26} color="#059669" />
          </View>
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Your Privacy is Our Priority</Text>
            <Text style={styles.trustText}>
              We encrypt all transactions, never sell your data, and use industry-standard protocols to safeguard your info.
            </Text>
          </View>
        </View>

        {/* Effective Date */}
        <View style={styles.introContainer}>
          <Text style={styles.heading}>Fresh Sabji Hub Privacy Policy</Text>
          <Text style={styles.date}>Effective Date: June 2026</Text>
        </View>

        {/* Card list */}
        <View style={styles.cardsContainer}>

          {/* Section 1 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <FileText size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>1. Introduction</Text>
            </View>
            <Text style={styles.cardBody}>
              Welcome to Fresh Sabji Hub ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This policy covers all information collected through our mobile application, and any related delivery, marketing, or customer services.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <Eye size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>2. Information We Collect</Text>
            </View>
            <Text style={styles.cardBody}>
              We collect information you voluntarily provide (name, email, phone number, address) when setting up your profile or checking out. We also gather automated device telemetry (IP address, operating system, unique identifiers) to help improve system stability.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <Lock size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>3. How We Use Your Data</Text>
            </View>
            <Text style={styles.cardBody}>
              We use personal information to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Securely authenticate and manage your login sessions.</Text>
              <Text style={styles.bulletItem}>• Process, pack, and deliver your grocery orders.</Text>
              <Text style={styles.bulletItem}>• Send automated delivery notifications and real-time support status.</Text>
              <Text style={styles.bulletItem}>• Review feedback and resolve active support inquiries.</Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <Share2 size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>4. Information Sharing</Text>
            </View>
            <Text style={styles.cardBody}>
              We only share your information with your direct consent, to comply with legal authorities, or to execute logistics (e.g. sharing delivery addresses with drivers and processing card payments). We never sell your details to advertising networks.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>5. Data Security & Retention</Text>
            </View>
            <Text style={styles.cardBody}>
              We employ strict physical, electronic, and administrative controls. We retain your customer details only for as long as your account is active or as necessary to comply with tax and audit regulations.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.policyCard}>
            <View style={styles.cardHeader}>
              <UserCheck size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>6. Your Rights</Text>
            </View>
            <Text style={styles.cardBody}>
              You hold the right to view, modify, or delete your personal details. You can update your profile parameters or request account deletion at any time directly through the Profile panel in the app.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={[styles.policyCard, { marginBottom: moderateScale(20) }]}>
            <View style={styles.cardHeader}>
              <Mail size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>7. Contact Us</Text>
            </View>
            <Text style={styles.cardBody}>
              Have questions, concerns, or requests regarding this policy? Reach out directly to our Data Protection Officer:
            </Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL('mailto:privacy@freshsabjihub.com')}
              style={styles.emailLinkButton}
              activeOpacity={0.7}
            >
              <Mail size={16} color={theme.colors.primary} />
              <Text style={styles.emailLinkText}>privacy@freshsabjihub.com</Text>
            </TouchableOpacity>
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
  trustBanner: {
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
  trustIconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  trustContent: {
    flex: 1,
  },
  trustTitle: {
    fontSize: rf(14.5),
    fontWeight: '700',
    color: '#065F46',
    marginBottom: moderateScale(2),
  },
  trustText: {
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
  policyCard: {
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
  bulletList: {
    marginTop: moderateScale(6),
    paddingLeft: moderateScale(4),
  },
  bulletItem: {
    fontSize: rf(12.5),
    color: theme.colors.textSecondary,
    lineHeight: rf(19),
    marginBottom: moderateScale(4),
  },
  emailLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(12),
    alignSelf: 'flex-start',
    backgroundColor: '#E8FBEB',
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(14),
  },
  emailLinkText: {
    fontSize: rf(13),
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: moderateScale(6),
  },
});

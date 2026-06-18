import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Clock, ChevronRight, ChevronDown, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';
import { api } from '../../services/api';

export const ContactScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const handleEmail = () => {
    Linking.openURL('mailto:support@freshsabjihub.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+9118004190099');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/9118004190099?text=Hello%20FreshSabjiHub%20Support');
  };

  const handleMap = () => {
    const address = '123 Grocery Lane, Fresh Valley, Silicon Valley, CA 94000';
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://www.google.com/maps/search/?api=1&query=${address}`
    });
    Linking.openURL(url);
  };

  const subjects = [
    'Order & Delivery Issues',
    'Return & Refund Queries',
    'Bulk & Corporate Orders',
    'App & Technical Issues',
    'Payment Queries',
    'Other Inquiry'
  ];

  const handleSubmit = async () => {
    if (!subject) {
      Alert.alert('Error', 'Please select a subject for your query.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for your query.');
      return;
    }

    try {
      setLoading(true);
      await api.submitSupportQuery(subject, description);
      Alert.alert(
        'Success',
        'Your query has been submitted successfully! We will get back to you soon.'
      );
      setDescription('');
      setSubject('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit support query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.secondary]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7} 
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <Text style={styles.heading}>We'd Love to Hear From You</Text>
          <Text style={styles.paragraph}>
            Our dedicated team is standing by to assist you. Choose your preferred channel to get in touch with us:
          </Text>
        </View>

        {/* Contact Methods List */}
        <View style={styles.cardsContainer}>
          
          {/* WhatsApp Card */}
          <TouchableOpacity 
            style={[styles.contactCard, styles.highlightedCard]} 
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8FBEB' }]}>
              <MessageSquare size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.contactDetails}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.contactTitle}>Live WhatsApp Chat</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>INSTANT</Text>
                </View>
              </View>
              <Text style={styles.contactSubtitle}>Best for returns, refunds & order issues</Text>
              <Text style={styles.actionText}>Start conversation</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Call Card */}
          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
              <Phone size={22} color="#D97706" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactTitle}>Call Customer Care</Text>
              <Text style={styles.contactSubtitle}>Speak directly with our support team</Text>
              <Text style={styles.contactValue}>+91 1800-419-0099</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Email Card */}
          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Mail size={22} color="#2563EB" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>For bulk orders & corporate feedback</Text>
              <Text style={styles.contactValue}>support@freshsabjihub.com</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Head Office Card */}
          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={handleMap}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
              <MapPin size={22} color="#64748B" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactTitle}>Corporate Office</Text>
              <Text style={styles.contactSubtitle}>Silicon Valley, CA 94000</Text>
              <Text style={styles.contactValue}>123 Grocery Lane, Fresh Valley</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

        </View>

        {/* Operating Hours / SLA Banner */}
        <View style={styles.hoursBanner}>
          <Clock size={20} color={theme.colors.primary} style={styles.hoursIcon} />
          <View style={styles.hoursContent}>
            <Text style={styles.hoursTitle}>Operating Hours</Text>
            <Text style={styles.hoursText}>
              Phone lines are active daily from <Text style={styles.boldText}>6:00 AM to 11:00 PM</Text>. Inquiries sent via Email or WhatsApp outside these hours will be handled first thing in the morning.
            </Text>
          </View>
        </View>

        {/* Support Query Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Send Us a Message</Text>
          


          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>What is your query related to? *</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setShowSubjectPicker(!showSubjectPicker)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pickerSelectorText, !subject && styles.placeholderText]}>
                {subject || 'Select a subject...'}
              </Text>
              <ChevronDown size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {showSubjectPicker && (
              <View style={styles.dropdownContainer}>
                {subjects.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.dropdownItem,
                      subject === item && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setSubject(item);
                      setShowSubjectPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      subject === item && styles.selectedDropdownItemText
                    ]}>
                      {item}
                    </Text>
                    {subject === item && <Check size={16} color={theme.colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Describe your query *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Describe details of your query or issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: Platform.OS === 'ios' ? moderateScale(48) : moderateScale(22), 
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
  introSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(8),
  },
  heading: { 
    fontSize: rf(21), 
    fontWeight: '800', 
    color: theme.colors.textPrimary, 
    marginBottom: moderateScale(8) 
  },
  paragraph: { 
    fontSize: rf(13.5), 
    color: theme.colors.textSecondary, 
    lineHeight: rf(20) 
  },
  cardsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: moderateScale(16),
  },
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
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
  highlightedCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  iconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: { 
    flex: 1,
    marginLeft: moderateScale(14) 
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactTitle: { 
    fontSize: rf(15), 
    fontWeight: '700', 
    color: theme.colors.textPrimary, 
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
    marginRight: moderateScale(8),
  },
  badgeText: {
    color: '#065F46',
    fontSize: rf(8.5),
    fontWeight: '800',
  },
  contactSubtitle: { 
    fontSize: rf(12), 
    color: theme.colors.textSecondary, 
    marginTop: moderateScale(2) 
  },
  contactValue: { 
    fontSize: rf(13.5), 
    fontWeight: '600',
    color: theme.colors.textPrimary, 
    marginTop: moderateScale(4) 
  },
  actionText: {
    fontSize: rf(13),
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: moderateScale(6),
  },
  hoursBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: moderateScale(12),
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(16),
    flexDirection: 'row',
  },
  hoursIcon: {
    marginRight: moderateScale(12),
    marginTop: moderateScale(1),
  },
  hoursContent: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: rf(14.5),
    fontWeight: '700',
    color: '#166534',
    marginBottom: moderateScale(4),
  },
  hoursText: {
    fontSize: rf(12.5),
    color: '#166534',
    lineHeight: rf(18.5),
  },
  boldText: {
    fontWeight: '700',
  },
  formContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: moderateScale(20),
    marginBottom: moderateScale(30),
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  formTitle: {
    fontSize: rf(16.5),
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: moderateScale(10),
  },
  inputGroup: {
    marginBottom: moderateScale(16),
  },
  fieldLabel: {
    fontSize: rf(12.5),
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(6),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md - 2,
    paddingHorizontal: moderateScale(12),
    paddingVertical: Platform.OS === 'ios' ? moderateScale(10) : moderateScale(8),
    fontSize: rf(13.5),
    color: theme.colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    height: moderateScale(100),
    textAlignVertical: 'top',
  },
  pickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md - 2,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    backgroundColor: '#FAFAFA',
  },
  pickerSelectorText: {
    fontSize: rf(13.5),
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  dropdownContainer: {
    marginTop: moderateScale(4),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md - 2,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedDropdownItem: {
    backgroundColor: '#ECFDF5',
  },
  dropdownItemText: {
    fontSize: rf(13),
    color: theme.colors.textPrimary,
  },
  selectedDropdownItemText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(8),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: rf(14.5),
    fontWeight: '700',
  },
});

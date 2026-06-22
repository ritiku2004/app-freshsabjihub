import React, { useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert, Modal, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  MapPinned,
  Share2,
  Info,
  PhoneCall,
  Lock,
  FileText,
  LogOut,
  ChevronRight,
  X,
  Edit2,
  Camera,
} from 'lucide-react-native';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import styles from './styles';
import { TextInput } from 'react-native';
import { moderateScale, rf } from '../../utils/responsive';
import { API_BASE_URL } from '../../config/env';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Loader } from '../../components/Loader';

const resolveAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('uploads/')) {
    const base = API_BASE_URL.replace('/api/v1', '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (Platform.OS !== 'web') {
      try {
        const apiHost = API_BASE_URL.split('/')[2]; // e.g. "192.168.29.177:3000"
        return url
          .replace('localhost:3000', apiHost)
          .replace('127.0.0.1:3000', apiHost)
          .replace('10.0.2.2:3000', apiHost);
      } catch (e) {
        return url;
      }
    }
    return url;
  }
  return null;
};

const ABOUT_CONTENT = `Fresh Sabji Hub is a modern grocery delivery platform designed to bring fresh vegetables, daily utilities, pantry goods, snacks, and sweet desserts to your doorstep quickly.

Founded with a vision to streamline household supplies, we coordinate with local farmers and micro-warehouses to maintain premium quality checks and cold chain logistics. Thank you for choosing us!`;

const CONTACT_CONTENT = `Need help with an active order or have feedback for our team? Reach out to us:

📧 Email Support: support@freshsabjihub.com
📞 Phone Support: +91 1800-419-0099
🕒 Operating Hours: 6:00 AM - 11:00 PM (All days)

We aim to resolve all email inquiries within 2 hours.`;

const PRIVACY_CONTENT = `At Fresh Sabji Hub, we prioritize your personal privacy. We collect basic details such as your phone number, name, and delivery addresses to fulfill orders and process transactions.

We encrypt transaction data via Secure Sockets Layer (SSL) and utilize AsyncStorage for secure offline session configurations. We do not sell your personal data to third parties. For complete terms, visit freshsabjihub.com/privacy.`;

const TERMS_CONTENT = `By accessing and placing orders on Fresh Sabji Hub, you agree to comply with our delivery parameters:

1. Delivery Slot Targets: While we aim for quick delivery, ETA estimates may fluctuate during heavy rain or festival hours.
2. Order Cancellation: Orders cannot be cancelled once they transition to the "Out for Delivery" status.
3. Pricing & Taxes: Bill summaries incorporate delivery partner tipping allowances and flat packaging fees.`;

const PRESET_AVATARS = [
  { emoji: '🍅', color: '#FEE2E2', label: 'Tomato' },
  { emoji: '🥦', color: '#D1FAE5', label: 'Broccoli' },
  { emoji: '🥕', color: '#FFEDD5', label: 'Carrot' },
  { emoji: '🥑', color: '#E0F2FE', label: 'Avocado' },
  { emoji: '🍓', color: '#FFF1F2', label: 'Strawberry' },
  { emoji: '🍋', color: '#FEF9C3', label: 'Lemon' },
  { emoji: '🍇', color: '#F3E8FF', label: 'Grapes' },
  { emoji: '🍉', color: '#ECFDF5', label: 'Watermelon' },
  { emoji: '🍎', color: '#FEF2F2', label: 'Apple' },
];

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser, refreshProfile, isAuthenticated } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigation.navigate('Login', { redirectTo: 'Profile' });
        return;
      }

      let isMounted = true;
      setIsLoading(true);
      refreshProfile().finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [isAuthenticated])
  );

  // Edit Profile States
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Download Fresh Sabji Hub now! Get fresh groceries delivered to your home quickly. PlayStore link: https://play.google.com/store/apps/freshsabjihub',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of your session?')) {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } else {
      Alert.alert('Logout Confirmation', 'Are you sure you want to log out of your session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]);
    }
  };

  const openInfoModal = (title, content) => {
    setModalDetails({ title, content });
    setModalVisible(true);
  };

  const handleOpenEditProfile = () => {
    const currentName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
    setEditName(currentName);
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone_number || '');
    setSelectedAvatar(user?.profile_picture_url || '');
    setEditProfileVisible(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library to set a profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setIsUpdating(true);
        const uploadedUrl = await api.uploadAvatar(pickedUri);
        setSelectedAvatar(uploadedUrl);
        
        // Save the avatar immediately in the local user context
        const newUserData = {
          ...user,
          profile_picture_url: uploadedUrl,
        };
        await updateUser(newUserData);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to pick or upload image. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (editEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    if (editPhone.trim()) {
      if (editPhone.trim().length < 10) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        return;
      }
    }

    try {
      setIsUpdating(true);
      const updatedUser = await api.updateProfile(
        editName.trim(),
        editEmail.trim() || null,
        editPhone.trim() || null,
        selectedAvatar || null
      );
      
      const newUserData = {
        ...user,
        ...updatedUser,
        name: editName.trim(), // sync locally
        phone_number: editPhone.trim() || null, // sync locally
      };
      await updateUser(newUserData);
      setEditProfileVisible(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || 'User';
  
  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        : 'U';

  const avatarUri = resolveAvatarUrl(user?.profile_picture_url);
  const isCustomUrl = !!avatarUri;
  const hasEmojiAvatar = user?.profile_picture_url && PRESET_AVATARS.some((a) => a.emoji === user.profile_picture_url);
  const activeAvatarColor = user?.profile_picture_url
    ? PRESET_AVATARS.find((a) => a.emoji === user.profile_picture_url)?.color || theme.colors.primary
    : theme.colors.primary;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]} locations={[0, 0.55, 1]} style={[styles.header, { paddingTop: moderateScale(12) }]}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </LinearGradient>

      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            onPress={handleOpenEditProfile}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
            onPressIn={() => setIsAvatarHovered(true)}
            onPressOut={() => setIsAvatarHovered(false)}
            {...(Platform.OS === 'web' ? {
              onMouseEnter: () => setIsAvatarHovered(true),
              onMouseLeave: () => setIsAvatarHovered(false),
            } : {})}
          >
            <View style={[
              styles.avatarContainer,
              { backgroundColor: activeAvatarColor },
              isAvatarHovered && styles.avatarContainerHovered
            ]}>
              {isCustomUrl ? (
                <Image 
                  source={{ uri: avatarUri }} 
                  style={{ width: moderateScale(60), height: moderateScale(60), borderRadius: moderateScale(30), opacity: isAvatarHovered ? 0.5 : 1 }} 
                  onError={(e) => console.log('Profile Avatar Load Error:', e.nativeEvent.error)}
                />
              ) : hasEmojiAvatar ? (
                <Text style={{ fontSize: moderateScale(30), opacity: isAvatarHovered ? 0.5 : 1 }}>{user.profile_picture_url}</Text>
              ) : (
                <Text style={[styles.avatarText, { opacity: isAvatarHovered ? 0.5 : 1 }]}>{userInitials}</Text>
              )}
              {isAvatarHovered && (
                <View style={styles.hoverCameraOverlay}>
                  <Camera size={20} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.cameraIconContainer}>
              <Camera size={11} color="#FFF" style={{ marginTop: -0.5 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.profileDetails, { flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userPhone} numberOfLines={1}>{user?.email || 'No email added'}</Text>
                {user?.phone_number ? (
                  <Text style={[styles.userPhone, { color: theme.colors.textSecondary, fontSize: rf(11), marginTop: 2 }]} numberOfLines={1}>
                    {user.phone_number}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={handleOpenEditProfile} style={styles.editProfileBtn} activeOpacity={0.7}>
                <Edit2 size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu list items */}
        <View style={styles.menuContainer}>
          {/* Address Book */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddressManagement')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <MapPinned size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Address Book</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Share App */}
          <TouchableOpacity style={styles.menuItem} onPress={handleShareApp} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Share2 size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Share App</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* About Us */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Info size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>About Us</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Contact Us */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Contact')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <PhoneCall size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Contact Us</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Terms')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <FileText size={20} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <AppButton
          title="Log Out"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutText}
          variant="outline"
        />
      </ScrollView>
      )}

      {/* Info/Terms Display Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalDetails.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBodyText}>{modalDetails.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} transparent animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)} activeOpacity={0.7}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ alignItems: 'center', marginVertical: moderateScale(16) }}>
                <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={{ position: 'relative' }}>
                  <View style={[
                    styles.avatarContainer,
                    {
                      width: moderateScale(80),
                      height: moderateScale(80),
                      borderRadius: moderateScale(40),
                      backgroundColor: selectedAvatar && PRESET_AVATARS.some(a => a.emoji === selectedAvatar)
                        ? PRESET_AVATARS.find(a => a.emoji === selectedAvatar).color
                        : theme.colors.primary,
                      marginRight: 0,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }
                  ]}>
                    {resolveAvatarUrl(selectedAvatar) ? (
                      <Image 
                        source={{ uri: resolveAvatarUrl(selectedAvatar) }} 
                        style={{ width: moderateScale(80), height: moderateScale(80), borderRadius: moderateScale(40) }} 
                        onError={(e) => console.log('Modal Avatar Load Error:', e.nativeEvent.error)}
                      />
                    ) : selectedAvatar ? (
                      <Text style={{ fontSize: moderateScale(40) }}>{selectedAvatar}</Text>
                    ) : (
                      <Text style={[styles.avatarText, { fontSize: rf(26) }]}>{userInitials}</Text>
                    )}
                  </View>
                  <View style={[styles.cameraIconContainer, { bottom: 0, right: 0, width: moderateScale(26), height: moderateScale(26), borderRadius: moderateScale(13), borderWidth: 2, borderColor: theme.colors.white }]}>
                    <Camera size={13} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <Text style={{ fontSize: rf(11), color: theme.colors.textSecondary, paddingTop: moderateScale(10), fontWeight: '600' }}>
                  Tap to upload custom photo
                </Text>
              </View>

              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your phone number"
                value={editPhone}
                onChangeText={(txt) => setEditPhone(txt.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.formLabel}>Choose Your Organic Avatar</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.avatarListContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.avatarOption,
                    { backgroundColor: '#E5E7EB' },
                    !selectedAvatar && styles.selectedAvatarOption,
                  ]}
                  onPress={() => setSelectedAvatar('')}
                >
                  <Text style={{ fontSize: rf(11), fontWeight: 'bold', color: theme.colors.textSecondary }}>None</Text>
                </TouchableOpacity>

                {PRESET_AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.label}
                    style={[
                      styles.avatarOption,
                      { backgroundColor: avatar.color },
                      selectedAvatar === avatar.emoji && styles.selectedAvatarOption,
                    ]}
                    onPress={() => setSelectedAvatar(avatar.emoji)}
                  >
                    <Text style={styles.avatarOptionEmoji}>{avatar.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setEditProfileVisible(false)}
                style={styles.cancelBtn}
                disabled={isUpdating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                style={[styles.saveBtn, { opacity: isUpdating ? 0.7 : 1 }]}
                disabled={isUpdating}
              >
                <Text style={styles.saveBtnText}>{isUpdating ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

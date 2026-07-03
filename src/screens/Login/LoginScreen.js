import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { theme } from '../../theme';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import styles from './styles';
import { moderateScale } from '../../utils/responsive';

import { api } from '../../services/api';

export const LoginScreen = ({ route, navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (route.params?.redirectTo === 'OrdersTab') {
        // Prevent default back navigation to the OrdersTab redirect trap
        e.preventDefault();
        // Go back to the safe HomeTab instead
        navigation.navigate('MainTabs', { screen: 'HomeTab' });
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  const validatePhone = (phoneStr) => {
    const clean = phoneStr.replace(/[^0-9]/g, '');
    return clean.length === 10;
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) return;
    
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      await api.sendOtp(cleanPhone);
      setLoading(false);
      navigation.navigate('OTP', { 
        phone: cleanPhone,
        redirectTo: route.params?.redirectTo,
        params: route.params?.params
      });
    } catch (err) {
      setLoading(false);
      alert(err.message || 'Failed to send OTP. Try again later.');
    }
  };

  const isFormValid = validatePhone(phone);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header Graphic/Logo */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image source={require('../../../assets/Logo/logo.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.welcomeTitle}>Fresh Sabji Hub</Text>
            <Text style={styles.welcomeSubtitle}>Fresh groceries delivered to you</Text>
          </View>

          {/* Login Card */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Enter Mobile Number</Text>
            
            <AppInput
              value={phone}
              onChangeText={(txt) => setPhone(txt.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={{ marginBottom: moderateScale(16) }}
            />

            <AppButton
              title="Continue"
              onPress={handleSendOTP}
              disabled={!isFormValid}
              loading={loading}
              style={styles.button}
            />
          </View>

          {/* Privacy Note */}
          <Text style={[styles.footerText, { marginTop: moderateScale(20) }]}>
            By continuing, you agree to our{' '}
            <Text
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              onPress={() => navigation.navigate('Terms')}
            >
              Terms of Service
            </Text>
            {' '}&{' '}
            <Text
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              onPress={() => navigation.navigate('Privacy')}
            >
              Privacy Policy.
            </Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

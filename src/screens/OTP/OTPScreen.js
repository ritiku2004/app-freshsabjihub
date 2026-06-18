import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { AppButton } from '../../components/AppButton';
import { api } from '../../services/api';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';

export const OTPScreen = ({ route, navigation }) => {
  const { email } = route.params || { email: '' };
  const { login } = useContext(AuthContext);
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textInputRef = useRef(null);

  useEffect(() => {
    // Countdown resend timer
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      // Validate custom OTP with the backend
      const response = await api.verifyOtp(email, code);

      // Response contains { user, token }.
      const userData = { ...response.user };

      // Merge cart if guestId exists
      const guestId = await AsyncStorage.getItem('@grocery_guest_id');
      if (guestId) {
        try {
          await api.mergeCarts(guestId, userData.id);
          await AsyncStorage.removeItem('@grocery_guest_id');
        } catch (mergeErr) {
          console.error('Failed to merge cart on login:', mergeErr);
        }
      }

      await login(userData, response.token);

      // Redirect to target screen if specified and reset stack to prevent back-looping to OTP/Login
      if (route.params?.redirectTo) {
        const target = route.params.redirectTo;
        const targetParams = route.params.params || {};

        if (target === 'OrdersTab' || target === 'HomeTab' || target === 'CategoriesTab' || target === 'CartTab') {
          try {
            navigation.popToTop();
            setTimeout(() => {
              navigation.navigate('MainTabs', { screen: target, params: targetParams });
            }, 50);
          } catch (e) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
            setTimeout(() => {
              navigation.navigate('MainTabs', { screen: target, params: targetParams });
            }, 50);
          }
        } else {
          try {
            navigation.popToTop();
            setTimeout(() => {
              navigation.navigate(target, targetParams);
            }, 50);
          } catch (e) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
            setTimeout(() => {
              navigation.navigate(target, targetParams);
            }, 50);
          }
        }
      } else {
        try {
          navigation.popToTop();
        } catch (e) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setCode('');
    setError('');

    try {
      await api.sendOtp(email);
      setTimer(30);
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleBoxPress = () => {
    textInputRef.current?.focus();
  };

  // Render individual character boxes mapping to characters
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = code[i] || '';
      const isFocused = i === code.length;
      boxes.push(
        <View
          key={i}
          style={[styles.otpBox, isFocused ? styles.otpBoxActive : null]}
        >
          <Text style={styles.otpText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.scrollContent}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>OTP Verification</Text>
              <Text style={styles.subtitle}>
                We have sent a verification code to
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(8) }}>
                <Text style={styles.phoneText}>{email}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: moderateScale(12) }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: rf(14) }}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* OTP Code Card */}
            <View style={styles.card}>
              {/* Hidden Input field to control keyboards and state */}
              <TextInput
                ref={textInputRef}
                value={code}
                onChangeText={(txt) => {
                  setError('');
                  setCode(txt.replace(/[^0-9]/g, ''));
                }}
                keyboardType="numeric"
                maxLength={6}
                style={{ position: 'absolute', opacity: 0, width: moderateScale(0), height: moderateScale(0) }}
                caretHidden
              />

              {/* Visual Grid representing code digits */}
              <TouchableWithoutFeedback onPress={handleBoxPress}>
                <View style={styles.otpContainer}>{renderOtpBoxes()}</View>
              </TouchableWithoutFeedback>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Resend OTP layout */}
              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.resendLabel}>Resend code in {timer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tips Card Removed */}

              <AppButton
                title="Verify & Proceed"
                onPress={handleVerify}
                disabled={code.length !== 6}
                loading={loading}
                style={styles.button}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
};

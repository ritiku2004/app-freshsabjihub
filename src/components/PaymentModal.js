import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Platform } from 'react-native';
import { ShieldAlert, CheckCircle, Banknote, Smartphone, X, ChevronRight, CreditCard } from 'lucide-react-native';
import { theme } from '../theme';
import { moderateScale } from '../utils/responsive';
import { Loader } from './Loader';

const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay UPI',
    scheme: 'tez://upi',
    iconColor: '#1A73E8',
    description: 'Pay using installed Google Pay app',
  },
  {
    id: 'phonepe',
    name: 'PhonePe UPI',
    scheme: 'phonepe://',
    iconColor: '#5F259F',
    description: 'Pay using installed PhonePe app',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    scheme: 'paytmmp://',
    iconColor: '#00B9F1',
    description: 'Pay using installed Paytm app',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    scheme: 'bhim://',
    iconColor: '#E66928',
    description: 'Pay using installed BHIM UPI app',
  }
];

export const PaymentModal = ({
  visible,
  onClose,
  totalAmount,
  onPaymentSuccess,
  mode = 'select',           // 'select' | 'process'
  selectedMethod = 'gpay',   // 'gpay' | 'phonepe' | 'cod' | 'card_netbanking'
  onSelectMethod,
  onAnimationComplete,
}) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableUpiApps, setAvailableUpiApps] = useState([]);
  const [checkingApps, setCheckingApps] = useState(true);

  // Trigger simulated transaction only when in process mode
  useEffect(() => {
    if (visible && mode === 'process') {
      runPaymentSimulation();
    }
  }, [visible, mode]);

  // Check which UPI apps are actually installed on the user's device
  useEffect(() => {
    const checkUpiApps = async () => {
      const detected = [];
      for (const app of UPI_APPS) {
        try {
          const supported = await Linking.canOpenURL(app.scheme);
          if (supported) {
            detected.push(app);
          }
        } catch (e) {
          // Ignore unsupported schemes on check
        }
      }
      // Fallback: If no apps are found (e.g. Simulator/Expo Go), show a generic UPI app selection
      if (detected.length === 0) {
        setAvailableUpiApps([
          {
            id: 'upi',
            name: 'Pay via UPI App',
            scheme: 'upi://pay',
            iconColor: theme.colors.primary,
            description: 'Pay using PhonePe, Paytm, or any other installed UPI app',
          }
        ]);
      } else {
        setAvailableUpiApps(detected);
      }
      setCheckingApps(false);
    };

    if (visible && mode === 'select') {
      checkUpiApps();
    }
  }, [visible, mode]);

  const runPaymentSimulation = async () => {
    setProcessing(true);
    setSuccess(false);
    
    try {
      // Wait for the actual API call to finish
      const result = await onPaymentSuccess(selectedMethod);
      
      if (result === null) {
        setProcessing(false);
        return;
      }

      setProcessing(false);
      setSuccess(true);
      
      // Show success checkmark for 1 second before navigating
      setTimeout(() => {
        setSuccess(false);
        if (onAnimationComplete) {
          onAnimationComplete(result);
        }
      }, 1000);
    } catch (e) {
      setProcessing(false);
      onClose(); // Close modal so parent can handle error
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldAlert size={18} color={theme.colors.secondary} style={styles.shieldIcon} />
              <Text style={styles.headerText}>
                {mode === 'process' ? 'Secure Checkout' : 'Select Payment Method'}
              </Text>
            </View>
            {mode === 'select' && (
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Body Content */}
          {mode === 'process' ? (
            success ? (
              <View style={styles.statusContainer}>
                <CheckCircle size={64} color={theme.colors.success} fill={theme.colors.primaryLight} />
                <Text style={[styles.statusTitle, { color: theme.colors.success }]}>Payment Successful!</Text>
                <Text style={styles.statusSubtitle}>Your order has been placed successfully</Text>
              </View>
            ) : (
              <View style={[styles.statusContainer, { paddingVertical: theme.spacing.md }]}>
                <View style={{ height: 260, width: '100%' }}>
                  <Loader text="Processing Payment..." />
                </View>
                <Text style={[styles.statusSubtitle, { marginTop: 10 }]}>Do not press back or close the app</Text>
              </View>
            )
          ) : (
            <View style={styles.body}>
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Bill Total</Text>
                <Text style={styles.amountText}>₹{totalAmount}</Text>
              </View>

              {/* Installed UPI Apps */}
              <Text style={styles.sectionTitle}>Recommended UPI Apps</Text>
              
              {checkingApps ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />
              ) : (
                availableUpiApps.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    style={[styles.methodCard, selectedMethod === app.id && styles.methodCardActive]}
                    onPress={() => onSelectMethod(app.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodLeft}>
                      <View style={[styles.methodIconContainer, selectedMethod === app.id && styles.methodIconContainerActive]}>
                        <Smartphone size={20} color={selectedMethod === app.id ? app.iconColor : theme.colors.textSecondary} />
                      </View>
                      <View>
                        <Text style={styles.methodName}>{app.name}</Text>
                        <Text style={styles.methodDesc}>{app.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))
              )}

              {/* Other Options */}
              <Text style={styles.sectionTitle}>More Payment Options</Text>

              {/* Credit/Debit Cards, Wallets, Netbanking */}
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'card_netbanking' && styles.methodCardActive]}
                onPress={() => onSelectMethod('card_netbanking')}
                activeOpacity={0.8}
              >
                <View style={styles.methodLeft}>
                  <View style={[styles.methodIconContainer, selectedMethod === 'card_netbanking' && styles.methodIconContainerActive]}>
                    <CreditCard size={20} color={selectedMethod === 'card_netbanking' ? theme.colors.primary : theme.colors.textSecondary} />
                  </View>
                  <View>
                    <Text style={styles.methodName}>Cards, Wallets, Netbanking</Text>
                    <Text style={styles.methodDesc}>Pay securely via Credit/Debit card or Netbanking</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Cash on Delivery */}
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardActive]}
                onPress={() => onSelectMethod('cod')}
                activeOpacity={0.8}
              >
                <View style={styles.methodLeft}>
                  <View style={[styles.methodIconContainer, selectedMethod === 'cod' && styles.methodIconContainerActive]}>
                    <Banknote size={20} color={selectedMethod === 'cod' ? theme.colors.primary : theme.colors.textSecondary} />
                  </View>
                  <View>
                    <Text style={styles.methodName}>Cash on Delivery (COD)</Text>
                    <Text style={styles.methodDesc}>Pay cash or scan QR code on delivery</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.footerNote}>🛡️ 100% Secure Payments</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.xl + 10,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    marginRight: theme.spacing.xs,
  },
  headerText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  body: {
    padding: theme.spacing.lg,
  },
  amountCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  amountLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  amountText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  methodCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  methodIconContainerActive: {
    backgroundColor: theme.colors.white,
  },
  methodName: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  methodDesc: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: moderateScale(2),
  },
  footerNote: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing.lg,
  },
  statusContainer: {
    paddingVertical: theme.spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  statusSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

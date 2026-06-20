import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../config/env';
import { CartContext } from '../../context/CartContext';
import { moderateScale, rf } from '../../utils/responsive';

export const PaymentWebViewScreen = ({ route, navigation }) => {
  const { 
    orderId, 
    orderNumber, 
    razorpayOrderId, 
    amount, 
    amountPaise, 
    razorpayKeyId,
    userName, 
    userEmail, 
    userPhone,
    paymentMethod = 'upi' // Default to standard UPI list
  } = route.params;

  // Sanitize name, email, and contact number to avoid Razorpay prompt screens
  const rawPhone = userPhone || '';
  const cleanedPhone = String(rawPhone).replace(/\D/g, '');
  const finalPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : (cleanedPhone || '9999999999');
  const finalEmail = (userEmail && String(userEmail).includes('@')) ? String(userEmail).trim() : 'customer@freshsabjihub.com';
  const finalName = (userName && String(userName).trim()) ? String(userName).trim() : 'Customer';

  // Map frontend payment method keys to Razorpay checkout configuration
  let prefillMethod = '';
  let mappedProvider = '';

  if (paymentMethod === 'gpay') {
    prefillMethod = 'upi';
    mappedProvider = 'google_pay';
  } else if (paymentMethod === 'phonepe') {
    prefillMethod = 'upi';
    mappedProvider = 'phonepe';
  } else if (paymentMethod === 'paytm') {
    prefillMethod = 'upi';
    mappedProvider = 'paytm';
  } else if (paymentMethod === 'bhim') {
    prefillMethod = 'upi';
    mappedProvider = 'bhim';
  } else if (paymentMethod === 'upi') {
    prefillMethod = 'upi';
  } else if (paymentMethod === 'card_netbanking') {
    prefillMethod = 'card';
  }

  const insets = useSafeAreaInsets();
  const { clearCart } = useContext(CartContext);
  const [isVerifying, setIsVerifying] = useState(false);

  const isMock = false; // Completely disable simulator

  // Simulated HTML if mock order ID is generated (no active keys), otherwise loaded live Razorpay SDK
  const htmlContent = isMock ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body {
          margin: 0;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
        }
        .card {
          background-color: #ffffff;
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03);
          width: 100%;
          max-width: 360px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        h2 {
          color: #111827;
          margin-top: 0;
          margin-bottom: 8px;
          font-size: 21px;
          font-weight: 800;
        }
        p {
          color: #4b5563;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .amount {
          font-size: 32px;
          font-weight: 800;
          color: #10B981;
          margin-bottom: 24px;
        }
        .btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-success {
          background-color: #10B981;
          color: #ffffff;
        }
        .btn-fail {
          background-color: #EF4444;
          color: #ffffff;
        }
        .btn-cancel {
          background-color: #e5e7eb;
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>🛠️ Payment Simulator</h2>
        <p>No valid Razorpay credentials are set in your backend. Use this sandbox simulator to test the complete transaction state machine.</p>
        
        <div class="amount">₹${amount}</div>
        
        <button class="btn btn-success" onclick="simulateSuccess()">🟢 Simulate Success</button>
        <button class="btn btn-fail" onclick="simulateFailure()">🔴 Simulate Failure</button>
        <button class="btn btn-cancel" onclick="simulateCancel()">⚪ Cancel Transaction</button>
      </div>

      <script>
        function simulateSuccess() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: 'success',
            razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            razorpay_order_id: "${razorpayOrderId}",
            razorpay_signature: 'mock_signature_verified'
          }));
        }

        function simulateFailure() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: 'failed',
            error_description: 'Mock Payment Simulation: Transaction declined due to insufficient funds.'
          }));
        }

        function simulateCancel() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: 'cancelled'
          }));
        }
      </script>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #374151;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #10B981;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        .text {
          font-size: 15px;
          font-weight: 500;
          color: #6B7280;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body>
      <div class="loader"></div>
      <div class="text">Opening Secure Checkout...</div>

      <script>
        const options = {
          key: "${razorpayKeyId}",
          amount: "${amountPaise}",
          currency: "INR",
          name: "Fresh Sabji Hub",
          description: "Order #${orderNumber}",
          order_id: "${razorpayOrderId}",
          webview_intent: true,
          prefill: {
            name: "${finalName}",
            email: "${finalEmail}",
            contact: "${finalPhone}"
            ${prefillMethod ? `, method: '${prefillMethod}'` : ''}
            ${mappedProvider ? `, provider: '${mappedProvider}'` : ''}
          },
          theme: {
            color: "#10B981"
          },
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'success',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }));
          },
          modal: {
            ondismiss: function () {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'cancelled'
              }));
            }
          }
        };

        const rzp = new Razorpay(options);

        rzp.on('payment.failed', function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: 'failed',
            error_code: response.error.code,
            error_description: response.error.description,
            razorpay_payment_id: response.error.metadata.payment_id
          }));
        });

        window.onload = function() {
          try {
            rzp.open();
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'error',
              message: e.message
            }));
          }
        };
      </script>
    </body>
    </html>
  `;

  const [isLoadingWebview, setIsLoadingWebview] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log('WebView navigation state change:', url);
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:blank')) {
      handleShouldStartLoadWithRequest({ url });
    }
  };

  const onMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView payment status message received:', data.status);

      if (data.status === 'success') {
        setIsVerifying(true);
        // Call backend verification
        try {
          const response = await fetch(`${API_BASE_URL}/user/orders/verify`, {
            method: 'POST',
            headers: {
              ...api.getHeaders?.()
            },
            body: JSON.stringify({
              orderId: orderId,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpayOrderId: data.razorpay_order_id,
              razorpaySignature: data.razorpay_signature
            })
          });

          const resData = await response.json();
          if (response.ok && resData.success) {
            clearCart();
            // Success! Navigate to OrderDetails
            const orderPayload = {
              id: orderNumber,
              dbId: orderId,
              order_number: orderNumber,
              totalAmount: amount,
              status: 'Placed',
              payment_status: 'Paid',
              createdAt: new Date().toISOString(),
              items: route.params.items || [],
              address: route.params.address
            };

            Alert.alert('Payment Successful', 'Your order has been confirmed!', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'MainTabs' },
                      { name: 'OrderDetails', params: { order: orderPayload } },
                    ],
                  });
                }
              }
            ]);
          } else {
            throw new Error(resData.message || 'Signature verification failed');
          }
        } catch (verifyError) {
          console.error('Verify Payment Error:', verifyError);
          setIsVerifying(false);
          Alert.alert(
            'Verification Failed',
            'We could not verify your payment signature, but if your money was deducted, our backend will reconcile it automatically within 15 minutes. Check Order details.',
            [
              {
                text: 'View Order Details',
                onPress: () => {
                  const fallbackOrder = {
                    id: orderNumber,
                    dbId: orderId,
                    order_number: orderNumber,
                    totalAmount: amount,
                    status: 'Pending Payment',
                    payment_status: 'Pending',
                    createdAt: new Date().toISOString(),
                    items: route.params.items || [],
                    address: route.params.address
                  };
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'MainTabs' },
                      { name: 'OrderDetails', params: { order: fallbackOrder } },
                    ],
                  });
                }
              }
            ]
          );
        }
      } else if (data.status === 'cancelled') {
        Alert.alert(
          'Payment Cancelled',
          'Your payment was cancelled. You can complete your order anytime from the cart.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else if (data.status === 'failed') {
        Alert.alert(
          'Payment Failed', 
          data.error_description || 'The transaction was declined by the bank/gateway.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else if (data.status === 'error') {
        Alert.alert('Checkout Error', 'Failed to initialize the Razorpay checkout overlay.');
        navigation.goBack();
      }
    } catch (e) {
      console.error('PostMessage Parse Error:', e);
    }
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    console.log('WebView navigating to:', url);

    // If it's a standard web HTTP load, let WebView handle it
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:blank')) {
      return true;
    }

    let targetUrl = url;

    // Handle intent:// schemes generated by Razorpay
    if (url.startsWith('intent://')) {
      try {
        const matches = url.match(/intent:\/\/([^#]+)/);
        if (matches && matches[1]) {
          targetUrl = 'upi://' + matches[1];
          console.log('Parsed intent:// to upi:// link:', targetUrl);
        }
      } catch (e) {
        console.error('Error parsing intent URL:', e);
      }
    }

    // Force redirection to the selected app's native scheme if available
    if (targetUrl.startsWith('upi://')) {
      const upiQuery = targetUrl.replace('upi://', '');
      if (paymentMethod === 'gpay') {
        targetUrl = 'tez://upi/' + upiQuery;
      } else if (paymentMethod === 'phonepe') {
        targetUrl = 'phonepe://' + upiQuery;
      } else if (paymentMethod === 'paytm') {
        targetUrl = 'paytmmp://' + upiQuery;
      } else if (paymentMethod === 'bhim') {
        targetUrl = 'bhim://' + upiQuery;
      }
      console.log('Redirecting to target UPI scheme:', targetUrl);
    }

    // Handle deep linking for GPay, PhonePe, Paytm, UPI etc. by directly attempting to launch the URL.
    Linking.openURL(targetUrl)
      .catch((err) => {
        console.error('Error opening UPI url:', err);
        Alert.alert(
          'App Redirection Failed',
          'Could not open the selected UPI payment application. Please ensure the app is installed and try again.'
        );
      });

    return false; // Blocks WebView load for custom schemes
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isVerifying) {
        e.preventDefault();
        return;
      }

      if (e.data.action.type === 'RESET') {
        return;
      }

      e.preventDefault();
      setPendingAction(e.data.action);
      setShowCancelModal(true);
    });

    return unsubscribe;
  }, [navigation, isVerifying, orderId, orderNumber, amount, route.params.items, route.params.address]);

  const injectedJavaScript = `
    (function() {
      function hideTargetElements() {
        // Hide Razorpay merchant header (various selectors Razorpay uses)
        const headerSelectors = [
          '[class*="header"]',
          '[class*="Header"]',
          '[class*="merchant"]',
          '[class*="Merchant"]',
          '[class*="razorpay-header"]',
          '[class*="checkout-header"]',
          '.header',
          '.merchant-header',
          '.razorpay-header',
          '#razorpay-header'
        ];
        headerSelectors.forEach(sel => {
          try {
            const matched = document.querySelectorAll(sel);
            matched.forEach(item => {
              const rect = item.getBoundingClientRect();
              // Only hide elements near the top of the page (header region)
              if (rect.top >= 0 && rect.top < 120 && rect.width > 100) {
                item.style.setProperty('display', 'none', 'important');
              }
            });
          } catch(e) {}
        });

        // Hide by merchant name text content
        const allDivs = document.querySelectorAll('div, header, nav, section');
        allDivs.forEach(el => {
          try {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < 80 && rect.height > 0 && rect.height < 100 && rect.width > 200) {
              const text = el.textContent || '';
              if (text.includes('Fresh Sabji') || text.includes('Sabji Hub') || text.includes('FreshSabji')) {
                el.style.setProperty('display', 'none', 'important');
              }
            }
          } catch(e) {}
        });

        // Existing selectors
        const elements = document.querySelectorAll('div, span, p, h1, h2, h3, section, button');
        elements.forEach(el => {
          if (el.textContent && (el.textContent === 'Price Summary' || el.textContent.includes('Price Summary'))) {
            const parent = el.closest('div');
            if (parent) {
              parent.style.setProperty('display', 'none', 'important');
            }
          }
          if (el.textContent && (el.textContent.includes('Using as') || el.textContent.includes('Using as +91'))) {
            const parent = el.closest('div');
            if (parent) {
              parent.style.setProperty('display', 'none', 'important');
            }
          }
        });

        const selectors = [
          '[class*="price-summary"]',
          '[class*="priceSummary"]',
          '[class*="user-info"]',
          '[class*="userInfo\"]',
          '[class*="contact"]',
          '.price-summary-container',
          '.user-info-container'
        ];
        selectors.forEach(sel => {
          const matched = document.querySelectorAll(sel);
          matched.forEach(item => {
            item.style.setProperty('display', 'none', 'important');
          });
        });
      }
      hideTargetElements();
      setInterval(hideTargetElements, 100);
    })();
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor: '#15803d' }]}>
      {/* WebView Wrapper */}
      <View style={[styles.webViewWrapper, { paddingBottom: insets.bottom }]}>
        {!isVerifying ? (
          <>
            <WebView
              source={{ html: htmlContent }}
              style={styles.webView}
              onMessage={onMessage}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadEnd={() => setIsLoadingWebview(false)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              mixedContentMode="always"
              allowFileAccess={true}
              injectedJavaScript={injectedJavaScript}
            />
            {isLoadingWebview && (
              <View style={[StyleSheet.absoluteFill, styles.verifyingContainer, { backgroundColor: '#ffffff' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.verifyingText}>
                  Opening {paymentMethod === 'gpay' ? 'Google Pay' : paymentMethod === 'phonepe' ? 'PhonePe' : paymentMethod === 'paytm' ? 'Paytm' : 'your UPI app'}...
                </Text>
                <Text style={styles.verifyingWarning}>Please do not close the app or tap back</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.verifyingText}>Verifying signature and confirming order...</Text>
            <Text style={styles.verifyingWarning}>Please do not close the app or tap back</Text>
          </View>
        )}
      </View>

      {/* Premium Custom Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24
        }}>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 10
          }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>⚠️</Text>
            <Text style={{
              fontSize: 18,
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              Cancel Payment?
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#64748b',
              textAlign: 'center',
              lineHeight: 18,
              marginBottom: 24
            }}>
              Are you sure you want to cancel the payment? Your order will not be completed and your cart will remain active.
            </Text>
            
            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowCancelModal(false);
                  setPendingAction(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#475569', fontWeight: '700', fontSize: 14 }}>Keep Paying</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCancelModal(false);
                  if (pendingAction) {
                    navigation.dispatch(pendingAction);
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#ef4444',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: moderateScale(54),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: rf(16),
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
  },
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  verifyingText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  verifyingWarning: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shield } from 'lucide-react-native';
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

  const isMock = razorpayOrderId && razorpayOrderId.startsWith('order_mock_');

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
          prefill: {
            name: "${userName || 'Customer'}",
            email: "${userEmail || ''}",
            contact: "${userPhone || ''}"
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
              status: 'Processing',
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
          'Your payment was cancelled. You can complete this payment anytime from your order history.',
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
      } else if (data.status === 'failed') {
        Alert.alert(
          'Payment Failed', 
          data.error_description || 'The transaction was declined by the bank/gateway.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Order details so user can retry payment
                const failedOrder = {
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
                    { name: 'OrderDetails', params: { order: failedOrder } },
                  ],
                });
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

    // Handle deep linking for GPay, PhonePe, Paytm, UPI etc. by directly attempting to launch the URL.
    // This is more robust as it bypasses OS package visibility filtering rules.
    Linking.openURL(url)
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
      // If we are currently verifying signature, prevent leaving
      if (isVerifying) {
        e.preventDefault();
        return;
      }

      // Allow reset actions to proceed
      if (e.data.action.type === 'RESET') {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Cancel Payment?',
        'If you exit now, your order will remain pending. You can complete the payment anytime from your order details.',
        [
          { text: 'Keep Paying', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
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
    });

    return unsubscribe;
  }, [navigation, isVerifying, orderId, orderNumber, amount, route.params.items, route.params.address]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}>
      {/* Secure Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isVerifying}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Shield size={16} color={theme.colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>100% Secure Checkout</Text>
        </View>
      </View>

      {/* WebView Wrapper */}
      <View style={styles.webViewWrapper}>
        {!isVerifying ? (
          <WebView
            source={{ html: htmlContent }}
            style={styles.webView}
            onMessage={onMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowFileAccess={true}
          />
        ) : (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.verifyingText}>Verifying signature and confirming order...</Text>
            <Text style={styles.verifyingWarning}>Please do not close the app or tap back</Text>
          </View>
        )}
      </View>
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

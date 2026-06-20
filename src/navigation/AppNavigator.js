import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Loader } from '../components/Loader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Store, LayoutGrid, ShoppingCart, RotateCcw } from 'lucide-react-native';

import { theme } from '../theme';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import Screens
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { OTPScreen } from '../screens/OTP/OTPScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { CategoriesScreen } from '../screens/Categories/CategoriesScreen';
import { CategoryProductsScreen } from '../screens/CategoryProducts/CategoryProductsScreen';
import { ProductDetailsScreen } from '../screens/ProductDetails/ProductDetailsScreen';
import { CartScreen } from '../screens/Cart/CartScreen';
import { CheckoutScreen } from '../screens/Checkout/CheckoutScreen';
import { OrdersScreen } from '../screens/Orders/OrdersScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { AddressManagementScreen } from '../screens/AddressManagement/AddressManagementScreen';
import { OrderDetailsScreen } from '../screens/OrderDetails/OrderDetailsScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { PaymentWebViewScreen } from '../screens/Checkout/PaymentWebViewScreen';
import { AboutScreen } from '../screens/Static/AboutScreen';
import { PrivacyScreen } from '../screens/Static/PrivacyScreen';
import { TermsScreen } from '../screens/Static/TermsScreen';
import { ContactScreen } from '../screens/Static/ContactScreen';
import { moderateScale, rf } from '../utils/responsive';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom bottom tab bar with top-border active indicator
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 6;
  
  return (
    <View style={[tabStyles.tabBar, { paddingBottom: bottomPadding, height: moderateScale(56) + bottomPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const iconColor = isFocused ? theme.colors.primary : '#9CA3AF';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={tabStyles.tabItem}
          >
            {/* Top active indicator line */}
            <View style={[tabStyles.activeIndicator, isFocused && tabStyles.activeIndicatorVisible]} />

            {/* Icon */}
            {options.tabBarIcon && options.tabBarIcon({ color: iconColor, size: 24, focused: isFocused })}

            {/* Badge for cart */}
            {options.tabBarBadge !== undefined && (
              <View style={tabStyles.badge}>
                <Text style={tabStyles.badgeText}>{options.tabBarBadge}</Text>
              </View>
            )}

            {/* Label */}
            <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: moderateScale(68),
    paddingBottom: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: { width: moderateScale(0), height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: moderateScale(2),
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: moderateScale(0),
    left: '20%',
    right: '20%',
    height: moderateScale(3),
    borderRadius: moderateScale(0),
    backgroundColor: 'transparent',
  },
  activeIndicatorVisible: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: rf(11),
    marginTop: moderateScale(3),
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: moderateScale(6),
    right: '22%',
    backgroundColor: theme.colors.accent || '#F97316',
    borderRadius: moderateScale(8),
    minWidth: 16,
    height: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(3),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: rf(9),
    fontWeight: '700',
  },
});

// Component for continuous Cart animation
const AnimatedCartIcon = ({ color, size, itemCount }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (itemCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600, // Pause between pulses
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    }
  }, [itemCount]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <ShoppingCart size={size} color={color} />
    </Animated.View>
  );
};

// Bottom Tab Navigator containing 4 tabs
const BottomTabNavigator = () => {
  const { cartTotalQuantity } = useContext(CartContext);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <AnimatedCartIcon color={color} size={size} itemCount={cartTotalQuantity} />,
          tabBarBadge: cartTotalQuantity > 0 ? cartTotalQuantity : undefined,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Order Again',
          tabBarIcon: ({ color, size }) => <RotateCcw size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator = () => {
  const { hasCompletedOnboarding, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}
      
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      
      {/* Protected/other screens */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
      <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      
      <Stack.Group>
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

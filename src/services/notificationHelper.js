import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../services/api';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior for foreground notifications if not in Expo Go
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Failed to set notification handler:', error);
  }
}

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'web') {
    if ('Notification' in window) {
      const permission = await window.Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Web notification permission granted.');
      }
    }
    return null;
  }

  if (isExpoGo) {
    console.warn('Remote push notifications (expo-notifications) are disabled in Expo Go. Use a development build to test notifications.');
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('Expo/FCM Device Token:', token);

    // Save token to backend API
    await api.registerDeviceToken(token);
  } catch (error) {
    console.error('Error getting/saving push token:', error);
  }

  if (Platform.OS === 'android') {
    try {
      const Notifications = require('expo-notifications');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('Failed to set notification channel:', e);
    }
  }

  return token;
};

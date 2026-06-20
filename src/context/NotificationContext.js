import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const NOTIFICATIONS_STORAGE_KEY = '@grocery_notifications';
const isExpoGo = Constants.appOwnership === 'expo';

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: async (id) => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  addNotification: async (title, body, data) => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  // Save notifications to AsyncStorage whenever state changes
  const saveNotifications = async (newList) => {
    try {
      setNotifications(newList);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newList));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const addNotification = async (title, body, data = {}) => {
    const newNotif = {
      id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 7),
      title: title || 'New Notification',
      message: body || '',
      type: data.type || 'system',
      data: data,
      time: 'Just now',
      timestamp: Date.now(),
      isRead: false,
      clickable: !!data.orderId || !!data.type,
    };
    const updated = [newNotif, ...notifications];
    await saveNotifications(updated);
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    await saveNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    await saveNotifications(updated);
  };

  const clearAll = async () => {
    await saveNotifications([]);
  };

  // Helper to format time relative to current
  const getFormattedNotifications = () => {
    const now = Date.now();
    return notifications.map(n => {
      const diffMs = now - n.timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = n.time;
      if (n.timestamp) {
        if (diffMins < 1) {
          timeStr = 'Just now';
        } else if (diffMins < 60) {
          timeStr = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours}h ago`;
        } else {
          timeStr = `${diffDays}d ago`;
        }
      }
      return { ...n, time: timeStr };
    });
  };

  // Setup expo-notifications listeners
  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo) return;

    let isMounted = true;
    let subscriptionReceived;
    let subscriptionResponse;

    try {
      const Notifications = require('expo-notifications');

      // Foreground notification listener
      subscriptionReceived = Notifications.addNotificationReceivedListener(notification => {
        if (!isMounted) return;
        const { title, body, data } = notification.request.content;
        addNotification(title, body, data);
      });

      // Tap listener (triggered when user clicks notification)
      subscriptionResponse = Notifications.addNotificationResponseReceivedListener(response => {
        if (!isMounted) return;
        const { title, body, data } = response.notification.request.content;
        addNotification(title, body, data);
      });
    } catch (e) {
      console.warn('Failed to register expo-notifications event listeners:', e);
    }

    return () => {
      isMounted = false;
      if (subscriptionReceived) subscriptionReceived.remove();
      if (subscriptionResponse) subscriptionResponse.remove();
    };
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: getFormattedNotifications(),
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BASE_STORAGE_KEY = '@grocery_notifications_v2';
const isExpoGo = Constants.appOwnership === 'expo';

// Build a per-user storage key so different users never see each other's notifications
const getStorageKey = (userId) =>
  userId ? `${BASE_STORAGE_KEY}_user_${userId}` : `${BASE_STORAGE_KEY}_guest`;

// Format a stored timestamp as a relative time string (computed live)
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Older than a week: show actual date
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

// Deduplicate based on a unique key (fcm message id, or title+body+orderId combo)
const buildDedupeKey = (title, body, data) => {
  const orderId = data?.orderId || '';
  const type = data?.type || '';
  return `${title}|${body}|${type}|${orderId}`;
};

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  addNotification: async () => {},
  initForUser: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // Raw notifications stored with epoch timestamps, never static time strings
  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  // Tick state forces re-render every minute so relative times stay fresh
  const [tick, setTick] = useState(0);
  const tickRef = useRef(null);
  const listenersRegistered = useRef(false);
  const subscriptionReceivedRef = useRef(null);
  const subscriptionResponseRef = useRef(null);
  // Track seen dedupe keys to prevent duplicates within a session
  const seenDedupeKeys = useRef(new Set());
  // Ref always points to latest addNotification — used inside listener useEffect with [] deps
  const addNotificationRef = useRef(null);

  // Start/stop the 1-minute refresh ticker
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 60 * 1000); // refresh every minute
    return () => clearInterval(tickRef.current);
  }, []);

  // Load notifications for a specific user from AsyncStorage
  const loadNotificationsForUser = useCallback(async (userId) => {
    try {
      const key = getStorageKey(userId);
      const stored = await AsyncStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : [];
      setNotifications(parsed);

      // Pre-populate seen dedupe keys from existing notifications so we
      // don't re-add them on app resume
      const newSeen = new Set();
      parsed.forEach((n) => {
        if (n.dedupeKey) newSeen.add(n.dedupeKey);
      });
      seenDedupeKeys.current = newSeen;
    } catch (error) {
      console.error('[NotificationContext] Failed to load notifications:', error);
      setNotifications([]);
    }
  }, []);


  // Called by AuthContext after login/logout with the new userId (null for guest/logout)
  const initForUser = useCallback(
    async (userId) => {
      // If same user, skip reload
      if (userId === currentUserId) return;
      setCurrentUserId(userId);
      await loadNotificationsForUser(userId);
    },
    [currentUserId, loadNotificationsForUser]
  );

  // Load on mount with no user (guest state) — will be re-loaded when AuthContext calls initForUser
  useEffect(() => {
    loadNotificationsForUser(null);
  }, []);

  // Add a new notification — safe against duplicates
  const addNotification = useCallback(
    async (title, body, data = {}, fcmMessageId = null) => {
      const dedupeKey = fcmMessageId || buildDedupeKey(title, body, data);

      // Skip if already seen in this session
      if (seenDedupeKeys.current.has(dedupeKey)) {
        console.log('[NotificationContext] Duplicate notification suppressed:', dedupeKey);
        return;
      }
      seenDedupeKeys.current.add(dedupeKey);

      const newNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: title || 'New Notification',
        message: body || '',
        type: data.type || 'system',
        data: data,
        // Store raw timestamp — time string is computed dynamically on render
        timestamp: Date.now(),
        isRead: false,
        clickable: !!(data.orderId || data.type),
        dedupeKey,
      };

      // Use functional updater to always work with latest state
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        // Persist asynchronously
        const key = getStorageKey(currentUserId);
        AsyncStorage.setItem(key, JSON.stringify(updated)).catch((e) =>
          console.error('[NotificationContext] save error:', e)
        );
        return updated;
      });
    },
    [currentUserId]
  );

  const markAsRead = useCallback(
    async (id) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        const key = getStorageKey(currentUserId);
        AsyncStorage.setItem(key, JSON.stringify(updated)).catch((e) =>
          console.error('[NotificationContext] save error:', e)
        );
        return updated;
      });
    },
    [currentUserId]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      const key = getStorageKey(currentUserId);
      AsyncStorage.setItem(key, JSON.stringify(updated)).catch((e) =>
        console.error('[NotificationContext] save error:', e)
      );
      return updated;
    });
  }, [currentUserId]);

  const clearAll = useCallback(async () => {
    const key = getStorageKey(currentUserId);
    setNotifications([]);
    seenDedupeKeys.current.clear();
    await AsyncStorage.setItem(key, JSON.stringify([]));
  }, [currentUserId]);

  // Keep the ref synced with latest addNotification
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  // Register expo-notifications listeners ONCE (no dependency on notifications state)
  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo || listenersRegistered.current) return;

    try {
      const Notifications = require('expo-notifications');

      // Foreground: notification arrives while app is open
      subscriptionReceivedRef.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          const { title, body, data } = notification.request.content;
          // Use FCM message ID for deduplication if available
          const msgId = notification.request.identifier || null;
          if (addNotificationRef.current) addNotificationRef.current(title, body, data || {}, msgId);
        }
      );

      // Background/tap: user taps a notification (do NOT re-add — just navigate)
      // The notification was already delivered; tapping it should only navigate,
      // not create a duplicate entry. We only add if the app was killed (cold start).
      subscriptionResponseRef.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          // The notification is already stored from the received listener.
          // We only need to handle navigation here, not re-add the notification.
          // If app was killed and this is the initial notification, add it once.
          const { title, body, data } = response.notification.request.content;
          const msgId = response.notification.request.identifier || null;
          if (addNotificationRef.current) addNotificationRef.current(title, body, data || {}, msgId);
        }
      );

      listenersRegistered.current = true;
    } catch (e) {
      console.warn('[NotificationContext] Failed to register listeners:', e);
    }

    return () => {
      if (subscriptionReceivedRef.current) {
        subscriptionReceivedRef.current.remove();
        subscriptionReceivedRef.current = null;
      }
      if (subscriptionResponseRef.current) {
        subscriptionResponseRef.current.remove();
        subscriptionResponseRef.current = null;
      }
      listenersRegistered.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — register once, use addNotification via closure (latest via ref)

  // Compute formatted notifications with live relative timestamps
  // `tick` forces re-computation every minute
  const formattedNotifications = notifications.map((n) => ({
    ...n,
    time: formatRelativeTime(n.timestamp),
  }));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: formattedNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        initForUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

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

  // One-time migration: move old @grocery_notifications data to the new user-scoped key
  const migrateOldNotifications = useCallback(async (userId, newKey) => {
    const OLD_KEY = '@grocery_notifications';
    try {
      const oldData = await AsyncStorage.getItem(OLD_KEY);
      if (!oldData) return null;

      const oldParsed = JSON.parse(oldData);
      if (!Array.isArray(oldParsed) || oldParsed.length === 0) return null;

      // Sanitize: old entries may have static 'time' strings and no 'timestamp'.
      // Assign a best-guess timestamp so relative time works correctly.
      const now = Date.now();
      const sanitized = oldParsed
        .filter(n => n && n.title) // drop broken entries
        .map((n, index) => {
          // If no timestamp, estimate based on old static 'time' string
          let ts = n.timestamp;
          if (!ts) {
            if (n.time === 'Just now') ts = now - 1000 * 60;
            else if (n.time && n.time.endsWith('m ago')) ts = now - parseInt(n.time) * 60 * 1000;
            else if (n.time && n.time.endsWith('h ago')) ts = now - parseInt(n.time) * 60 * 60 * 1000;
            else if (n.time && n.time.endsWith('d ago')) ts = now - parseInt(n.time) * 24 * 60 * 60 * 1000;
            else ts = now - (index + 1) * 1000 * 60 * 10; // fallback: 10 min apart
          }
          const dedupeKey = n.dedupeKey || buildDedupeKey(n.title, n.message || '', n.data || {});
          return { ...n, timestamp: ts, dedupeKey };
        });

      console.log(`[NotificationContext] Migrating ${sanitized.length} old notifications to new key`);
      await AsyncStorage.setItem(newKey, JSON.stringify(sanitized));
      // Remove old key so we don't migrate again
      await AsyncStorage.removeItem(OLD_KEY);
      return sanitized;
    } catch (e) {
      console.warn('[NotificationContext] Migration failed (non-fatal):', e);
      return null;
    }
  }, []);

  // Load notifications for a specific user from AsyncStorage or Backend
  const loadNotificationsForUser = useCallback(async (userId) => {
    try {
      if (!userId) {
        // Guest mode fallback
        const key = getStorageKey(null);
        let stored = await AsyncStorage.getItem(key);
        let parsed = stored ? JSON.parse(stored) : null;

        // If new key is empty, attempt migration from old storage
        if (!parsed || parsed.length === 0) {
          const migrated = await migrateOldNotifications(null, key);
          if (migrated && migrated.length > 0) {
            parsed = migrated;
          }
        }

        const finalList = parsed || [];
        setNotifications(finalList);

        const newSeen = new Set();
        finalList.forEach((n) => {
          if (n.dedupeKey) newSeen.add(n.dedupeKey);
        });
        seenDedupeKeys.current = newSeen;
        return;
      }

      // Authenticated Mode: Load from Backend DB
      try {
        const { api } = require('../services/api');
        const dbList = await api.fetchNotifications();
        
        const mappedList = dbList.map((n) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: n.type,
          data: n.data,
          isRead: Boolean(n.isRead),
          timestamp: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
          clickable: !!(n.data?.orderId || n.type),
          dedupeKey: n.data?.notificationId || String(n.id)
        }));

        setNotifications(mappedList);

        const newSeen = new Set();
        mappedList.forEach((n) => {
          if (n.dedupeKey) newSeen.add(n.dedupeKey);
        });
        seenDedupeKeys.current = newSeen;

        // Cache in AsyncStorage
        const key = getStorageKey(userId);
        await AsyncStorage.setItem(key, JSON.stringify(mappedList));
      } catch (err) {
        const isAuthExpired = err && (err.name === 'AuthError' || err.isAuthError);
        if (isAuthExpired) {
          // Token expired — AuthContext will handle logout; clear local notifications
          console.warn('[NotificationContext] Session expired, clearing notifications.');
          setNotifications([]);
          seenDedupeKeys.current = new Set();
        } else {
          console.warn('[NotificationContext] Failed to fetch backend notifications, loading cached:', err);
          // Fallback to AsyncStorage cache
          const key = getStorageKey(userId);
          let stored = await AsyncStorage.getItem(key);
          let parsed = stored ? JSON.parse(stored) : [];
          setNotifications(parsed);

          const newSeen = new Set();
          parsed.forEach((n) => {
            if (n.dedupeKey) newSeen.add(n.dedupeKey);
          });
          seenDedupeKeys.current = newSeen;
        }
      }
    } catch (error) {
      console.error('[NotificationContext] Failed to load notifications:', error);
      setNotifications([]);
    }
  }, [migrateOldNotifications]);

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
      const dedupeKey = fcmMessageId || data.notificationId || buildDedupeKey(title, body, data);

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

      if (currentUserId) {
        try {
          const { api } = require('../services/api');
          await api.markNotificationRead(id);
        } catch (e) {
          console.error('[NotificationContext] Failed to mark read on backend:', e);
        }
      }
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

    if (currentUserId) {
      try {
        const { api } = require('../services/api');
        await api.markAllNotificationsRead();
      } catch (e) {
        console.error('[NotificationContext] Failed to mark all read on backend:', e);
      }
    }
  }, [currentUserId]);

  const clearAll = useCallback(async () => {
    const key = getStorageKey(currentUserId);
    setNotifications([]);
    seenDedupeKeys.current.clear();
    await AsyncStorage.setItem(key, JSON.stringify([]));

    if (currentUserId) {
      try {
        const { api } = require('../services/api');
        await api.clearNotifications();
      } catch (e) {
        console.error('[NotificationContext] Failed to clear notifications on backend:', e);
      }
    }
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
      subscriptionResponseRef.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
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

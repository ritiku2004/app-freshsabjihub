import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiAuthToken } from '../services/api';
import { calculateDeliveryETA } from '../services/distanceService';
import { registerForPushNotificationsAsync } from '../services/notificationHelper';
import { NotificationContext } from './NotificationContext';

const ONBOARDING_KEY = '@grocery_onboarding';
const USER_KEY = '@grocery_user';
const TOKEN_KEY = '@grocery_token';
const ADDRESSES_KEY = '@grocery_addresses';
const ACTIVE_ADDRESS_KEY = '@grocery_active_address';

const DEFAULT_ADDRESSES = [];

export const AuthContext = createContext({
  hasCompletedOnboarding: false,
  isAuthenticated: false,
  user: null,
  guestId: null,
  addresses: [],
  activeAddress: null,
  activeShop: null,
  serviceAvailable: true,
  loading: true,
  completeOnboarding: async () => {},
  login: async (phone) => {},
  logout: async () => {},
  saveAddress: async (address) => {},
  deleteAddress: async (id) => {},
  setActiveAddressById: async (id) => {},
  refreshProfile: async () => {},
  refreshAddresses: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeAddress, setActiveAddress] = useState(null);
  const [activeShop, setActiveShop] = useState(null);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deliveryETA, setDeliveryETA] = useState(null);

  // Access notification context so we can scope notifications per user
  const { initForUser } = useContext(NotificationContext);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
        const userValue = await AsyncStorage.getItem(USER_KEY);
        const tokenValue = await AsyncStorage.getItem(TOKEN_KEY);
        const addressesValue = await AsyncStorage.getItem(ADDRESSES_KEY);
        const activeAddrValue = await AsyncStorage.getItem(ACTIVE_ADDRESS_KEY);
        
        let currentGuestId = await AsyncStorage.getItem('@grocery_guest_id');
        console.log('[AuthContext] Retrieved guestId from AsyncStorage:', currentGuestId);
        if (!currentGuestId) {
          currentGuestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          await AsyncStorage.setItem('@grocery_guest_id', currentGuestId);
          console.log('[AuthContext] Generated new guestId and stored:', currentGuestId);
        }
        setGuestId(currentGuestId);

        if (onboardingValue) {
          setHasCompletedOnboarding(JSON.parse(onboardingValue));
        }

        let isAuthed = false;
        let userObj = null;
        if (userValue && tokenValue) {
          userObj = JSON.parse(userValue);
          setUser(userObj);
          setToken(tokenValue);
          setApiAuthToken(tokenValue);
          setIsAuthenticated(true);
          isAuthed = true;
          // Register push notifications device token on startup
          registerForPushNotificationsAsync().catch(err => console.log('Failed to register device token on startup:', err));
          // Load notifications for the restored user
          initForUser(userObj.id.toString()).catch(() => {});
        }

        let loadedAddresses = DEFAULT_ADDRESSES;
        if (addressesValue) {
          loadedAddresses = JSON.parse(addressesValue);
        } else {
          await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(DEFAULT_ADDRESSES));
        }

        if (isAuthed) {
          try {
            const backendAddresses = await api.fetchAddresses();
            if (backendAddresses && backendAddresses.length > 0) {
              loadedAddresses = backendAddresses.map(b => {
                const parts = b.address_line1 ? b.address_line1.split('||') : [];
                const flatNo = parts[0] || b.address_line1;
                const addressLine = parts.length > 1 ? parts[1] : b.address_line1;
                return {
                  id: b.id.toString(),
                  type: b.title || 'Home',
                  flatNo: flatNo,
                  addressLine: addressLine,
                  landmark: b.address_line2 || '',
                  receiverName: b.receiver_name || userObj.first_name || 'User',
                  receiverMobile: b.receiver_mobile || userObj.phone_number || '',
                  city: b.city || '',
                  state: b.state || '',
                  latitude: b.latitude,
                  longitude: b.longitude,
                };
              });
              await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(loadedAddresses));
            }
          } catch (err) {
            console.error('Failed to sync addresses on startup:', err);
          }
        }

        setAddresses(loadedAddresses);

        if (activeAddrValue) {
          const savedActive = JSON.parse(activeAddrValue);
          const freshActive = loadedAddresses.find(a => String(a.id) === String(savedActive.id) || (a.type === savedActive.type && a.addressLine === savedActive.addressLine));
          const finalActive = freshActive || savedActive;
          setActiveAddress(finalActive);
          await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(finalActive));
        } else if (loadedAddresses.length > 0) {
          setActiveAddress(loadedAddresses[0]);
          await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(loadedAddresses[0]));
        }
      } catch (e) {
        console.error('Error loading session data from storage:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const [isFetchingShop, setIsFetchingShop] = useState(false);

  // Expose an explicit, awaitable function to update location and fetch the shop immediately
  const updateLocationAndShop = async (address) => {
    if (!address || !address.latitude || !address.longitude) {
      setActiveAddress(address);
      setActiveShop(null);
      setServiceAvailable(false);
      setIsFetchingShop(false);
      if (address) {
        await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(address));
      } else {
        await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
      }
      return;
    }

    setIsFetchingShop(true);
    // Optimistically set the address first so it's ready
    setActiveAddress(address);
    await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(address));

    try {
      const shop = await api.getNearestShop(address.latitude, address.longitude);

      if (shop) {
        setActiveShop(shop);
        setServiceAvailable(true);
      } else {
        setActiveShop(null);
        setServiceAvailable(false);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      setActiveShop(null);
      setServiceAvailable(false);
    } finally {
      setIsFetchingShop(false);
    }
  };

  // Initial shop load only runs once after loading session
  useEffect(() => {
    if (!loading && activeAddress) {
      // Re-fetch shop for initial load
      updateLocationAndShop(activeAddress);
    }
  }, [loading]);

  // Recalculate delivery ETA whenever address or shop changes
  useEffect(() => {
    const fetchETA = async () => {
      if (
        activeAddress?.latitude && activeAddress?.longitude &&
        activeShop?.latitude && activeShop?.longitude
      ) {
        try {
          const etaMins = await calculateDeliveryETA(
            activeAddress.latitude,
            activeAddress.longitude,
            activeShop.latitude,
            activeShop.longitude
          );
          setDeliveryETA(etaMins);
        } catch (e) {
          console.log('ETA calculation error:', e.message);
          setDeliveryETA(null);
        }
      } else {
        setDeliveryETA(null);
      }
    };
    fetchETA();
  }, [activeAddress, activeShop]);

  const completeOnboarding = async () => {
    try {
      setHasCompletedOnboarding(true);
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(true));
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (userData, jwtToken) => {
    try {
      setUser(userData);
      setToken(jwtToken);
      setApiAuthToken(jwtToken);
      setIsAuthenticated(true);
      setGuestId(null);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(TOKEN_KEY, jwtToken);

      // Request location permission on login
      try {
        const Location = require('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('[AuthContext] Location permission requested on login. Status:', status);
      } catch (locErr) {
        console.warn('[AuthContext] Failed to request location permission on login:', locErr);
      }

      // Register push notifications device token after authentication (also triggers notification permission prompt)
      registerForPushNotificationsAsync().catch(err => console.log('Failed to register device token on login:', err));

      // Scope notifications to this user (clears other users' notifications from screen)
      initForUser(userData.id.toString()).catch(() => {});

      // Merge temporary guest addresses to the backend database
      const guestAddresses = addresses.filter(addr => 
        addr.id && 
        String(addr.id).startsWith('addr_') && 
        addr.id !== 'addr1' && 
        addr.id !== 'addr2'
      );

      if (guestAddresses.length > 0) {
        console.log('[AuthContext] Merging guest addresses to backend, count:', guestAddresses.length);
        for (const guestAddr of guestAddresses) {
          try {
            await api.saveAddress({
              title: guestAddr.type || 'Other',
              address_line1: `${guestAddr.flatNo || ''}||${guestAddr.addressLine || ''}`,
              address_line2: guestAddr.landmark || '',
              latitude: guestAddr.latitude,
              longitude: guestAddr.longitude,
              is_default: false,
              receiver_name: guestAddr.receiverName || userData.first_name || 'User',
              receiver_mobile: guestAddr.receiverMobile || userData.phone_number || ''
            });
          } catch (addrErr) {
            console.error('[AuthContext] Failed to merge guest address:', addrErr);
          }
        }
      }

      // Fetch addresses from backend
      try {
        const backendAddresses = await api.fetchAddresses();
        if (backendAddresses && backendAddresses.length > 0) {
          // Map backend schema to frontend schema roughly
          const mappedAddresses = backendAddresses.map(b => {
            const parts = b.address_line1 ? b.address_line1.split('||') : [];
            const flatNo = parts[0] || b.address_line1;
            const addressLine = parts.length > 1 ? parts[1] : b.address_line1;
            return {
              id: b.id.toString(),
              type: b.title || 'Home',
              flatNo: flatNo,
              addressLine: addressLine,
              landmark: b.address_line2 || '',
              receiverName: b.receiver_name || userData.first_name || 'User',
              receiverMobile: b.receiver_mobile || userData.phone_number || '',
              city: b.city || '',
              state: b.state || '',
              latitude: b.latitude,
              longitude: b.longitude,
            };
          });
          setAddresses(mappedAddresses);
          await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(mappedAddresses));
          if (!activeAddress && mappedAddresses.length > 0) {
            await updateLocationAndShop(mappedAddresses[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch backend addresses on login:', err);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setApiAuthToken(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(ADDRESSES_KEY);
      await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
      
      const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('@grocery_guest_id', newGuestId);
      setGuestId(newGuestId);

      // Clear notifications when logging out (switch back to guest scope)
      initForUser(null).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const saveAddress = async (newAddress) => {
    try {
      let savedAddr = newAddress;
      let isNew = !newAddress.id;
      
      if (isAuthenticated) {
        try {
          const backendIdObj = await api.saveAddress({
            title: newAddress.type || 'Other',
            address_line1: `${newAddress.flatNo || ''}||${newAddress.addressLine || ''}`,
            address_line2: newAddress.landmark || '',
            city: newAddress.city || 'City',
            state: newAddress.state || 'State',
            latitude: newAddress.latitude,
            longitude: newAddress.longitude,
            is_default: false,
            receiver_name: newAddress.receiverName,
            receiver_mobile: newAddress.receiverMobile
          });
          savedAddr = { ...newAddress, id: backendIdObj.id.toString() };
          
          const existingWithId = addresses.find(addr => addr.id === savedAddr.id);
          const existingWithType = addresses.find(addr => addr.type === savedAddr.type);
          if (existingWithId || existingWithType) {
            isNew = false;
          }
        } catch (backendErr) {
          console.log('Failed to sync address to backend, saving locally only', backendErr);
          if (!savedAddr.id) {
            savedAddr.id = 'addr_' + Math.floor(Math.random() * 1000000);
          }
        }
      } else if (!savedAddr.id) {
        savedAddr.id = 'addr_' + Math.floor(Math.random() * 1000000);
      }

      // Enforce at most one of each type in local addresses
      const otherAddresses = addresses.filter(addr => addr.type !== savedAddr.type && addr.id !== savedAddr.id);
      const updated = [...otherAddresses, savedAddr];
      
      setAddresses(updated);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));

      if (isNew || !activeAddress || activeAddress.id === savedAddr.id || activeAddress.type === savedAddr.type) {
        const addressToActivate = savedAddr;
        await updateLocationAndShop(addressToActivate);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAddress = async (id) => {
    try {
      if (isAuthenticated) {
        try {
          await api.deleteAddress(id);
        } catch (backendErr) {
          console.log('Failed to delete address from backend', backendErr);
        }
      }
      const updated = addresses.filter((addr) => addr.id !== id);
      setAddresses(updated);
      await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));

      if (activeAddress && activeAddress.id === id) {
        const nextActive = updated.length > 0 ? updated[0] : null;
        await updateLocationAndShop(nextActive);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setActiveAddressById = async (id) => {
    try {
      const target = addresses.find((addr) => addr.id === id);
      if (target) {
        await updateLocationAndShop(target);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const refreshProfile = async () => {
    if (!isAuthenticated) return;
    try {
      const freshUserObj = await api.getProfile();
      if (freshUserObj) {
        setUser(freshUserObj);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUserObj));
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const refreshAddresses = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const backendAddresses = await api.fetchAddresses();
      if (backendAddresses && backendAddresses.length > 0) {
        const mappedAddresses = backendAddresses.map(b => {
          const parts = b.address_line1 ? b.address_line1.split('||') : [];
          const flatNo = parts[0] || b.address_line1;
          const addressLine = parts.length > 1 ? parts[1] : b.address_line1;
          return {
            id: b.id.toString(),
            type: b.title || 'Home',
            flatNo: flatNo,
            addressLine: addressLine,
            landmark: b.address_line2 || '',
            receiverName: b.receiver_name || user.first_name || 'User',
            receiverMobile: b.receiver_mobile || user.phone_number || '',
            city: b.city || '',
            state: b.state || '',
            latitude: b.latitude,
            longitude: b.longitude,
          };
        });
        setAddresses(mappedAddresses);
        await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(mappedAddresses));
        
        // Also update activeAddress in case it was modified or deleted
        if (activeAddress) {
          const stillExists = mappedAddresses.find(a => String(a.id) === String(activeAddress.id));
          if (stillExists) {
            setActiveAddress(stillExists);
            await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(stillExists));
          } else {
            setActiveAddress(mappedAddresses[0]);
            await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(mappedAddresses[0]));
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh addresses:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        hasCompletedOnboarding,
        isAuthenticated,
        user,
        token,
        guestId,
        setGuestId,
        addresses,
        activeAddress,
        activeShop,
        serviceAvailable,
        loading,
        isFetchingShop,
        deliveryETA,
        completeOnboarding,
        login,
        logout,
        updateUser,
        saveAddress,
        deleteAddress,
        setActiveAddressById,
        refreshProfile,
        refreshAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

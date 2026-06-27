import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Home, Briefcase, MapPin, Trash2, Check, Navigation, ChevronDown } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';
import { Loader } from '../../components/Loader';
import { api } from '../../services/api';
 
export const AddressManagementScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const {
    addresses,
    activeAddress,
    saveAddress,
    deleteAddress,
    setActiveAddressById,
    refreshAddresses,
  } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setIsLoading(true);
      refreshAddresses().finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [])
  );
  const insets = useSafeAreaInsets();
 
  // Form States
  const [addressType, setAddressType] = useState('Home'); // 'Home' | 'Office' | 'Other'
  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [cityName, setCityName] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [area, setArea] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const webviewRef = React.useRef(null);
  const isTyping = React.useRef(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const shops = await api.getShops();
        const cities = [...new Set(shops.filter(s => s.is_active).map(s => s.city))];
        setAvailableCities(cities);
      } catch (err) {
        console.log('Failed to fetch cities:', err);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    const existing = addresses.find(addr => addr.type === addressType);
    if (existing) {
      setReceiverName(existing.receiverName || '');
      setReceiverMobile(existing.receiverMobile || '');
      setCityName(existing.city || '');
      setArea(existing.addressLine || '');
      setFlatNo(existing.flatNo || '');
      setLandmark(existing.landmark || '');
      setLatitude(existing.latitude || null);
      setLongitude(existing.longitude || null);
      setEditingAddressId(existing.id);

      if (isMapReady && webviewRef.current && existing.latitude && existing.longitude) {
         webviewRef.current.injectJavaScript(`window.setCenter(${existing.latitude}, ${existing.longitude}, 13); true;`);
      }
    } else {
      setReceiverName('');
      setReceiverMobile('');
      setCityName('');
      setArea('');
      setFlatNo('');
      setLandmark('');
      setLatitude(null);
      setLongitude(null);
      setEditingAddressId(null);
    }
  }, [addressType, addresses, isMapReady, availableCities]);

  // Sync addressType with activeAddress selection
  useEffect(() => {
    if (activeAddress && activeAddress.type) {
      setAddressType(activeAddress.type);
    } else {
      setAddressType('Home');
    }
  }, [activeAddress]);

  // Static HTML template to prevent WebView re-rendering on state changes
  const mapHtml = React.useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: true}).setView([28.6139, 77.2090], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        var marker = L.marker([28.6139, 77.2090], {draggable: true}).addTo(map);

        marker.on('dragend', function (e) {
          var coords = e.target.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: coords.lat, lng: coords.lng }));
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
        });

        window.setCenter = function(lat, lng, zoomLevel) {
          map.setView([lat, lng], zoomLevel || 13);
          marker.setLatLng([lat, lng]);
        };
      </script>
    </body>
    </html>
  `, []);

  const handleMapLoad = () => {
    setIsMapReady(true);
    const existing = addresses.find(addr => addr.type === addressType);
    if (existing && existing.latitude && existing.longitude) {
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(`window.setCenter(${existing.latitude}, ${existing.longitude}, 13); true;`);
      }
    } else {
      // New address: fetch approximate location by IP
      fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.latitude && data.longitude) {
            setLatitude(data.latitude);
            setLongitude(data.longitude);
            if (webviewRef.current) {
              webviewRef.current.injectJavaScript(`window.setCenter(${data.latitude}, ${data.longitude}, 12); true;`);
            }
          }
        })
        .catch(err => console.log('IP Location Error:', err));
    }
  };

  // Automatically point map to the city when user enters city name
  useEffect(() => {
    if (!cityName.trim()) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const results = await Location.geocodeAsync(cityName.trim());
        if (results && results.length > 0) {
          const best = results[0];
          setLatitude(best.latitude);
          setLongitude(best.longitude);
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`window.setCenter(${best.latitude}, ${best.longitude}, 12); true;`);
          }
        }
      } catch(e) {
        console.log('City geocoding failed:', e);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [cityName]);

  // Refined search when user enters area/colony/sector
  useEffect(() => {
    if (!area.trim() || !cityName.trim()) return;

    const timeoutId = setTimeout(async () => {
      try {
        const query = `${area.trim()}, ${cityName.trim()}`;
        const results = await Location.geocodeAsync(query);
        if (results && results.length > 0) {
          const best = results[0];
          setLatitude(best.latitude);
          setLongitude(best.longitude);
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`window.setCenter(${best.latitude}, ${best.longitude}, 14); true;`);
          }
        }
      } catch(e) {
        console.log('Area geocoding failed, staying on city:', e);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [area]);

  const handleSave = async () => {
    if (!receiverName.trim() || !receiverMobile.trim() || !cityName.trim() || !area.trim() || !flatNo.trim()) {
      Alert.alert('Fields Required', 'Please fill in all required fields.');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Location Required', 'Please set a location on the map.');
      return;
    }

    if (receiverMobile.trim().length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsProcessing(true);

    const payload = {
      id: editingAddressId || undefined,
      type: addressType,
      receiverName: receiverName.trim(),
      receiverMobile: receiverMobile.trim(),
      city: cityName.trim(),
      flatNo: flatNo.trim(),
      addressLine: area.trim(),
      landmark: landmark.trim(),
      latitude,
      longitude,
    };

    // Await the entire shop resolution process
    await saveAddress(payload);
    
    // Force React Query to wipe out the old cache and prepare new data
    await queryClient.invalidateQueries();
    
    // Clear form
    setReceiverName('');
    setReceiverMobile('');
    setCityName('');
    setArea('');
    setFlatNo('');
    setLandmark('');
    setLatitude(null);
    setLongitude(null);
    
    setIsProcessing(false);
    
    // Redirect instantly to fresh data
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'Home':
        return <Home size={18} color={theme.colors.primary} />;
      case 'Office':
      case 'Work':
        return <Briefcase size={18} color={theme.colors.primary} />;
      default:
        return <MapPin size={18} color={theme.colors.primary} />;
    }
  };

  const isFormValid = receiverName.trim() && receiverMobile.trim().length >= 10 && cityName.trim() && area.trim() && flatNo.trim() && latitude && longitude;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: moderateScale(12) }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
        </LinearGradient>
        <Loader />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: moderateScale(12) }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} disabled={isProcessing}>
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
        </LinearGradient>

        {isProcessing && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 100, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 10, color: theme.colors.primary, fontWeight: 'bold' }}>Updating Location...</Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
        {/* Saved Addresses list */}
        {addresses.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {addresses.map((item) => {
              const isActive = activeAddress && activeAddress.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.addressCard, isActive ? styles.addressCardActive : null]}
                  onPress={async () => {
                    setIsProcessing(true);
                    await setActiveAddressById(item.id);
                    await queryClient.invalidateQueries();
                    setIsProcessing(false);
                    navigation.navigate('MainTabs', { screen: 'HomeTab' });
                  }}
                  activeOpacity={0.8}
                  disabled={isProcessing}
                >
                  <View style={styles.addressLeft}>
                    {getAddressIcon(item.type)}
                    <View style={styles.addressDetails}>
                      <Text style={styles.addressType}>
                        {item.type} {isActive && '(Active)'}
                      </Text>
                      {item.receiverName && item.receiverMobile && (
                        <Text style={{ fontSize: rf(13), fontWeight: 'bold', color: theme.colors.textPrimary, marginTop: moderateScale(2), marginBottom: moderateScale(2) }}>
                          {item.receiverName} • {item.receiverMobile}
                        </Text>
                      )}
                      <Text style={styles.addressLine} numberOfLines={2}>
                        {item.flatNo}, {item.addressLine}. Landmark: {item.landmark}. City: {item.city || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isActive && (
                      <Check size={18} color={theme.colors.primary} style={{ marginRight: moderateScale(12) }} />
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => deleteAddress(item.id), style: 'destructive' },
                        ]);
                      }}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add/Edit Address Form Header */}
        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>
          {editingAddressId ? `Edit ${addressType} Address` : `Add ${addressType} Address`}
        </Text>
        
        <View style={styles.formCard}>
          {/* Address Type pills */}
          <View style={styles.typeRow}>
            {['Home', 'Office', 'Other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  addressType === type ? styles.typePillActive : null,
                ]}
                onPress={() => setAddressType(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeText,
                    addressType === type ? styles.typeTextActive : null,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <AppInput
            label="Receiver's Full Name *"
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="e.g. John Doe"
            containerStyle={styles.input}
          />
 
          <AppInput
            label="Receiver's Mobile Number *"
            value={receiverMobile}
            onChangeText={(txt) => setReceiverMobile(txt.replace(/[^0-9]/g, ''))}
            placeholder="10-digit mobile number"
            keyboardType="numeric"
            maxLength={10}
            containerStyle={styles.input}
          />
 
          <Text style={{ fontSize: moderateScale(13), fontWeight: '600', color: theme.colors.textPrimary, marginBottom: moderateScale(6) }}>City *</Text>
          <TouchableOpacity
            style={styles.pickerSelector}
            onPress={() => setShowCityPicker(!showCityPicker)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pickerSelectorText, !cityName && styles.placeholderText]}>
              {cityName || 'Select City'}
            </Text>
            <ChevronDown size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {showCityPicker && (
            <View style={styles.dropdownContainer}>
              {availableCities.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    cityName === item && styles.selectedDropdownItem
                  ]}
                  onPress={() => {
                    setCityName(item);
                    setShowCityPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    cityName === item && styles.selectedDropdownItemText
                  ]}>
                    {item}
                  </Text>
                  {cityName === item && <Check size={16} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
 
          <AppInput
            label="Area / Colony / Sector *"
            value={area}
            onChangeText={(txt) => { isTyping.current = true; setArea(txt); }}
            placeholder="e.g. Bapu Nagar"
            containerStyle={styles.input}
          />
 
          <AppInput
            label="House No. / Building / Floor *"
            value={flatNo}
            onChangeText={setFlatNo}
            placeholder="e.g. Flat 101, A-Wing"
            containerStyle={styles.input}
          />
 
          <AppInput
            label="Nearby Landmark"
            value={landmark}
            onChangeText={(txt) => { isTyping.current = true; setLandmark(txt); }}
            placeholder="e.g. Near City Mall"
            containerStyle={styles.input}
          />

          {/* My Location Button */}
          <TouchableOpacity 
            style={{ 
              marginBottom: moderateScale(12),
              width: '100%',
              backgroundColor: '#ecfdf5', 
              paddingHorizontal: moderateScale(16), 
              paddingVertical: moderateScale(10), 
              borderRadius: moderateScale(8), 
              borderStyle: 'dashed',
              borderWidth: 1, 
              borderColor: theme.colors.primary, 
              flexDirection: 'row', 
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={async () => {
              setIsProcessing(true);
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Allow location access to use this feature.');
                  setIsProcessing(false);
                  return;
                }
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const lat = location.coords.latitude;
                const lon = location.coords.longitude;
                setLatitude(lat);
                setLongitude(lon);
                
                if (webviewRef.current) {
                  webviewRef.current.injectJavaScript(`window.setCenter(${lat}, ${lon}, 13); true;`);
                }

                const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                if (geocode && geocode.length > 0) {
                  const place = geocode[0];
                  if (!area) setArea(place.street || place.name || '');
                  if (!cityName) setCityName(place.city || place.subregion || '');
                  if (!landmark) setLandmark(place.district || '');
                }
              } catch (e) {
                Alert.alert('Error', 'Failed to get current location.');
              }
              setIsProcessing(false);
            }}
          >
            <Navigation size={16} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: moderateScale(8), fontSize: rf(13) }}>Use Current Location</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: theme.colors.textPrimary, marginTop: moderateScale(10), marginBottom: moderateScale(10) }}>Select your exact delivery location *</Text>
          
          {/* Real Map Inline */}
          <View style={{ height: moderateScale(200), width: '100%', borderRadius: moderateScale(12), overflow: 'hidden', marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border }}>
            <WebView
              ref={webviewRef}
              source={{ html: mapHtml }}
              onLoadEnd={handleMapLoad}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.lat && data.lng) {
                    setLatitude(data.lat);
                    setLongitude(data.lng);
                  }
                } catch (e) {}
              }}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
            

          </View>
 
          <AppButton
            title={editingAddressId ? "Update Address" : "Save Address"}
            onPress={handleSave}
            disabled={!isFormValid}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Map modal removed as it's now inline */}
    </View>
   </KeyboardAvoidingView>
  );
};

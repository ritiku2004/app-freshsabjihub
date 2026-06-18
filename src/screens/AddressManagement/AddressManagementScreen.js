import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Home, Briefcase, MapPin, Trash2, Check, Navigation } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import styles from './styles';
import { moderateScale, rf } from '../../utils/responsive';
import { Loader } from '../../components/Loader';
 
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
  const [flatNo, setFlatNo] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const webviewRef = React.useRef(null);
  const isTyping = React.useRef(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    const existing = addresses.find(addr => addr.type === addressType);
    if (existing) {
      setReceiverName(existing.receiverName || '');
      setReceiverMobile(existing.receiverMobile || '');
      setFlatNo(existing.flatNo || '');
      setAddressLine(existing.addressLine || '');
      setLandmark(existing.landmark || '');
      setZipcode(existing.zipcode || '');
      setLatitude(existing.latitude || null);
      setLongitude(existing.longitude || null);
      setEditingAddressId(existing.id);

      if (isMapReady && webviewRef.current && existing.latitude && existing.longitude) {
         webviewRef.current.injectJavaScript(`window.setCenter(${existing.latitude}, ${existing.longitude}, 17); true;`);
      }
    } else {
      setReceiverName('');
      setReceiverMobile('');
      setFlatNo('');
      setAddressLine('');
      setLandmark('');
      setZipcode('');
      setLatitude(null);
      setLongitude(null);
      setEditingAddressId(null);
    }
  }, [addressType, addresses, isMapReady]);

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
          map.setView([lat, lng], zoomLevel || 17);
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
        webviewRef.current.injectJavaScript(`window.setCenter(${existing.latitude}, ${existing.longitude}, 17); true;`);
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

  useEffect(() => {
    if (!isTyping.current) return;
    
    const timeoutId = setTimeout(async () => {
      const fullAddress = `${addressLine} ${landmark} ${zipcode}`.trim();
      if (fullAddress.length > 8) {
        try {
          const results = await Location.geocodeAsync(fullAddress);
          if (results && results.length > 0) {
            const best = results[0];
            setLatitude(best.latitude);
            setLongitude(best.longitude);
            if (webviewRef.current) {
              webviewRef.current.injectJavaScript(`window.setCenter(${best.latitude}, ${best.longitude}, 16); true;`);
            }
          }
        } catch(e) {
          console.log('Geocoding failed:', e);
        }
      }
      isTyping.current = false;
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [addressLine, landmark, zipcode]);

  const handleSave = async () => {
    if (!receiverName.trim() || !receiverMobile.trim() || !flatNo.trim() || !addressLine.trim() || !landmark.trim() || !zipcode.trim()) {
      Alert.alert('Fields Required', 'Please fill in all form fields, including Zip Code.');
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

    if (zipcode.trim().length < 5) {
      Alert.alert('Invalid Zip Code', 'Please enter a valid Zip Code.');
      return;
    }

    setIsProcessing(true);

    const payload = {
      id: editingAddressId || undefined,
      type: addressType,
      receiverName: receiverName.trim(),
      receiverMobile: receiverMobile.trim(),
      flatNo: flatNo.trim(),
      addressLine: addressLine.trim(),
      landmark: landmark.trim(),
      zipcode: zipcode.trim(),
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
    setFlatNo('');
    setAddressLine('');
    setLandmark('');
    setZipcode('');
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

  const isFormValid = receiverName.trim() && receiverMobile.trim().length >= 10 && flatNo.trim() && addressLine.trim() && landmark.trim() && zipcode.trim().length >= 5 && latitude && longitude;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.secondary]}
          locations={[0, 0.55, 1]}
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
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
          style={[styles.header, { paddingTop: Math.max(insets.top, moderateScale(22)) }]}
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
                        {item.flatNo}, {item.addressLine}. Landmark: {item.landmark}. Zip: {item.zipcode || 'N/A'}
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
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Receiver's Full Name"
            containerStyle={styles.input}
          />
 
          <AppInput
            value={receiverMobile}
            onChangeText={(txt) => setReceiverMobile(txt.replace(/[^0-9]/g, ''))}
            placeholder="Receiver's Mobile Number"
            keyboardType="numeric"
            maxLength={10}
            containerStyle={styles.input}
          />
 
          <AppInput
            value={flatNo}
            onChangeText={setFlatNo}
            placeholder="Flat / House No. / Floor / Building"
            containerStyle={styles.input}
          />
 
          <AppInput
            value={addressLine}
            onChangeText={(txt) => { isTyping.current = true; setAddressLine(txt); }}
            placeholder="Area / Sector / Street / Locality"
            containerStyle={styles.input}
          />
 
          <AppInput
            value={landmark}
            onChangeText={(txt) => { isTyping.current = true; setLandmark(txt); }}
            placeholder="Nearby Landmark (e.g. Near Mall)"
            containerStyle={styles.input}
          />
 
          <AppInput
            value={zipcode}
            onChangeText={(txt) => { isTyping.current = true; setZipcode(txt.replace(/[^0-9]/g, '')); }}
            placeholder="Zip Code / Pincode"
            keyboardType="numeric"
            maxLength={6}
            containerStyle={styles.input}
          />

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
            
            {/* My Location Button */}
            <TouchableOpacity 
              style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: theme.colors.white, paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(8), borderRadius: moderateScale(20), elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, flexDirection: 'row', alignItems: 'center' }}
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
                    webviewRef.current.injectJavaScript(`window.setCenter(${lat}, ${lon}, 17); true;`);
                  }

                  const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                  if (geocode && geocode.length > 0) {
                    const place = geocode[0];
                    if (!addressLine) setAddressLine(place.street || place.name || '');
                    if (!zipcode) setZipcode(place.postalCode || '');
                    if (!landmark) setLandmark(place.subregion || place.city || '');
                  }
                } catch (e) {
                  Alert.alert('Error', 'Failed to get current location.');
                }
                setIsProcessing(false);
              }}
            >
              <Navigation size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: moderateScale(6), fontSize: rf(12) }}>Current Location</Text>
            </TouchableOpacity>
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

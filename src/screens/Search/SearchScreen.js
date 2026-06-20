import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Search, Mic, X, Plus, Minus, SearchCode, ChevronDown, Bell, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { theme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { useDebounce } from '../../hooks/useDebounce';
import { moderateScale, rf } from '../../utils/responsive';

const formatETA = (mins) => {
  if (!mins) return '---';
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hrs} ${hrs > 1 ? 'hrs' : 'hr'}`;
  }
  return `${hrs} ${hrs > 1 ? 'hrs' : 'hr'} ${remainingMins} mins`;
};

const RECENT_SEARCHES_KEY = '@grocery_recent_searches';

export const SearchScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeShop, activeAddress, deliveryETA, isAuthenticated } = useContext(AuthContext);
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const { unreadCount } = useNotifications();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Starting...');

  const debouncedQuery = useDebounce(query, 300);
  const textInputRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
    if (route.params?.startVoice) {
      setVoiceStatus('Starting voice recognition...');
      setIsListening(true);
    } else {
      // Auto-focus input on mount
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 200);
    }
  }, [route.params]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 1 && activeShop?.id) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedQuery, activeShop?.id]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  };

  const saveRecentSearch = async (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    try {
      const filtered = recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep last 5
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent search:', e);
    }
  };

  const performSearch = async (searchStr) => {
    setLoading(true);
    try {
      const data = await api.getProducts({ shopId: activeShop.id, search: searchStr, limit: 20 });
      setResults(data.products || []);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (selectedStr) => {
    setQuery(selectedStr);
    saveRecentSearch(selectedStr);
    Keyboard.dismiss();
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
    textInputRef.current?.focus();
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.quantity : 0;
  };

  const getCartItemId = (productId) => {
    const item = cartItems.find((ci) => String(ci.productId) === String(productId));
    return item ? item.id : null;
  };

  // Voice Search WebView code (uses Web Speech API)
  const speechHtml = `
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Not supported' }));
        } else {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-IN';
          
          recognition.onstart = () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'start' }));
          };
          
          recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'result', text }));
          };
          
          recognition.onerror = (event) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: event.error }));
          };
          
          recognition.onend = () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'end' }));
          };
          
          recognition.start();
        }
      </script>
    </body>
    </html>
  `;

  const handleSpeechMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'start') {
        setVoiceStatus('Listening... Speak now');
      } else if (data.type === 'result') {
        handleSelectQuery(data.text);
        setIsListening(false);
      } else if (data.type === 'error') {
        setVoiceStatus('Could not hear you clearly. Select a suggestion.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const popularSuggestions = ['Tomato', 'Milk', 'Paneer', 'Onion', 'Potato', 'Apple', 'Banana'];

  return (
    <View style={styles.container}>
      {/* Header with address and search bar */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary]}
        style={{ paddingTop: Math.max(insets.top, moderateScale(16)), paddingHorizontal: theme.spacing.lg, paddingBottom: moderateScale(16) }}
      >
        {/* Address Row */}
        <View style={styles.addressRow}>
          <TouchableOpacity
            style={styles.addressLeft}
            onPress={() => {
              navigation.navigate('AddressManagement');
            }}
            activeOpacity={0.7}
          >
            <View>
              <Text style={{ fontSize: rf(11), fontWeight: '800', color: '#DCFCE7', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Deliver in
              </Text>
              <Text style={{ fontSize: rf(20), fontWeight: '900', color: theme.colors.white, marginTop: moderateScale(1) }}>
                {formatETA(deliveryETA)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(4) }}>
                <Text style={{ fontSize: rf(13), fontWeight: '700', color: theme.colors.white, maxWidth: 220 }} numberOfLines={1}>
                  {activeAddress
                    ? `${activeAddress.type} - ${activeAddress.flatNo}, ${activeAddress.addressLine}`
                    : 'Select Address'}
                </Text>
                <ChevronDown size={12} color={theme.colors.white} style={{ marginLeft: moderateScale(3) }} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: moderateScale(10), position: 'relative' }]}
              activeOpacity={0.8}
            >
              <Bell size={18} color={theme.colors.white} />
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: theme.colors.error, borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!isAuthenticated) {
                  navigation.navigate('Login', { redirectTo: 'Profile' });
                } else {
                  navigation.navigate('Profile');
                }
              }}
              style={[styles.headerIconBtn, { backgroundColor: theme.colors.white }]}
              activeOpacity={0.8}
            >
              <User size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar row under it */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(12) }}>
          <View style={[styles.searchBarWrapper, { backgroundColor: '#FFFFFF', flex: 1 }]}>
            <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              ref={textInputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                if (text.trim() === '') {
                  setResults([]);
                }
              }}
              placeholder="Search for groceries, farm-fresh veg..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={() => handleSelectQuery(query)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
                <X size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setVoiceStatus('Starting voice recognition...'); setIsListening(true); }} style={styles.micButton}>
                <Mic size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Main body area */}
      {query.trim().length < 1 ? (
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={async () => { setRecentSearches([]); await AsyncStorage.removeItem(RECENT_SEARCHES_KEY); }}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentSearchesContainer}>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchTag}
                    onPress={() => handleSelectQuery(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recentSearchText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Keywords suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Keywords</Text>
            <View style={styles.popularSuggestionsContainer}>
              {popularSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionTag}
                  onPress={() => handleSelectQuery(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Guidelines info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Farm-to-Door Freshness 🥬</Text>
            <Text style={styles.infoDesc}>All vegetables and fruits are sourced fresh daily from local farmers to guarantee taste and health.</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loaderText}>Searching catalog...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsGrid}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => (
                <View style={styles.productCardWrapper}>
                  <ProductCard
                    product={item}
                    cartQuantity={getCartQuantity(item.id)}
                    onPress={() => {
                      saveRecentSearch(query);
                      navigation.navigate('ProductDetails', { productId: item.id });
                    }}
                    onIncrement={() => addToCart(item, activeShop.id)}
                    onDecrement={() => updateQuantity(getCartItemId(item.id), getCartQuantity(item.id) - 1)}
                  />
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No matches found for "{query}"</Text>
              <Text style={styles.emptySubtext}>Try adjusting your spelling or searching for another grocery category</Text>
            </View>
          )}
        </View>
      )}

      {/* Voice Search Modal */}
      {isListening && (
        <View style={styles.voiceModalContainer}>
          <View style={styles.voiceCard}>
            <View style={styles.voiceMicCircle}>
              <Mic size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.voiceTitle}>Listening for Search</Text>
            <Text style={styles.voiceDesc}>{voiceStatus}</Text>

            <Text style={styles.voiceSuggestHeader}>Popular Suggestions:</Text>
            <View style={styles.voiceSuggestionsRow}>
              {popularSuggestions.slice(0, 4).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.voiceSuggestTag}
                  onPress={() => { handleSelectQuery(item); setIsListening(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.voiceSuggestText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.voiceCloseButton} onPress={() => setIsListening(false)} activeOpacity={0.8}>
              <Text style={styles.voiceCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <WebView
            source={{ html: speechHtml }}
            style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            onMessage={handleSpeechMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm + 2,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    height: moderateScale(42),
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: rf(14),
    color: theme.colors.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  micButton: {
    padding: theme.spacing.xs,
  },
  body: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  clearAllText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recentSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentSearchTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recentSearchText: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  popularSuggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.xs,
  },
  suggestionTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  suggestionText: {
    fontSize: rf(13),
    color: theme.colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  infoTitle: {
    fontSize: rf(14),
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: rf(12),
    color: '#B45309',
    lineHeight: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderText: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  resultsGrid: {
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  productCardWrapper: {
    width: '48%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: rf(16),
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: rf(13),
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  voiceModalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  voiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  voiceMicCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  voiceTitle: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceDesc: {
    fontSize: rf(14),
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    minHeight: 40,
  },
  voiceSuggestHeader: {
    fontSize: rf(13),
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  voiceSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 28,
    width: '100%',
  },
  voiceSuggestTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceSuggestText: {
    fontSize: rf(12),
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  voiceCloseButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceCloseText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
});

import { API_BASE_URL } from '../config/env';
import { Platform } from 'react-native';

// Helper to simulate network latency for mocked endpoints
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let authToken = null;

export const setApiAuthToken = (token) => {
  authToken = token;
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  getHeaders,
  // Request OTP from backend
  sendOtp: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to send OTP');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  // Verify custom OTP
  verifyOtp: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Login failed');
      }
      const data = await response.json();
      return data.data; // Should contain { user, token }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/profile`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch profile');
      }
      const data = await response.json();
      return data.data; // The user object
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (name, email, phoneNumber, profilePictureUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, phone_number: phoneNumber, profile_picture_url: profilePictureUrl }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update profile');
      }
      const data = await response.json();
      return data.data; // The updated user
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Fetch promotional offer banners from Backend
  getBanners: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/catalog/banners`);
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();

      // Map backend fields to what the frontend expects
      return (data.data || []).map(b => ({
        id: b.id.toString(),
        title: b.title,
        subtitle: b.subtitle || '',
        description: b.description || '',
        image: b.image_url ? b.image_url.replace('http://', 'https://') : null,
        backgroundColor: b.background_color,
        textColor: b.text_color,
        location: b.location
      }));
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },

  // Fetch shop by zipcode
  getShopByZipcode: async (zipcode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/catalog/shop-by-zipcode/${zipcode}`);
      if (!response.ok) {
        if (response.status === 404) return null; // No shop found
        throw new Error('Failed to fetch shop');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching shop by zipcode:', error);
      return null;
    }
  },

  // Fetch nearest shop by latitude and longitude (15km radius check handled by backend)
  getNearestShop: async (latitude, longitude) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/catalog/nearest-shop?latitude=${latitude}&longitude=${longitude}`);
      if (!response.ok) {
        if (response.status === 404) return null; // No shop found
        throw new Error('Failed to fetch nearest shop');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching nearest shop:', error);
      return null;
    }
  },

  // Fetch all categories from Backend
  getCategories: async ({ queryKey }) => {
    try {
      const shopId = queryKey?.[1] || '';
      const url = shopId ? `${API_BASE_URL}/user/catalog/categories?shopId=${shopId}` : `${API_BASE_URL}/user/catalog/categories`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return (data.data || []).map(c => ({
        ...c,
        id: String(c.id),
        image: c.image_url ? c.image_url.replace('http://', 'https://') : null
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Fetch products from Backend
  getProducts: async ({
    shopId,
    categoryId,
    subcategory = 'All',
    search = '',
    sortBy = 'default',
    page = 1,
    limit = 6,
  } = {}) => {
    try {
      if (!shopId) return { products: [], hasMore: false, totalCount: 0 };

      const response = await fetch(`${API_BASE_URL}/user/shop-inventory/${shopId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const responseData = await response.json();
      let filtered = responseData.data || [];

      // Map backend shop_products schema to the frontend expectations
      filtered = filtered.map(p => ({
        ...p,
        id: String(p.product_id || p.id),
        name: p.product_name || p.name,
        categoryId: String(p.category_id),
        categoryIds: p.category_ids ? String(p.category_ids).split(',') : [String(p.category_id)],
        image: p.image_url ? p.image_url.replace('http://', 'https://') : null,
        price: Number(p.price) || 0,
        discountPrice: p.discount_percentage ? Number(p.price) - (Number(p.price) * (Number(p.discount_percentage) / 100)) : Number(p.price),
        unit: `${p.quantity} ${p.quantity_type}`,
        stock: p.is_available ? 50 : 0,
        rating: 4.5, // Mock rating
      }));

      // Filter by Category
      if (categoryId) {
        filtered = filtered.filter((p) => p.categoryIds.includes(String(categoryId)));
      }

      // Filter by Search Query
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedItems = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;

      return {
        products: paginatedItems,
        hasMore,
        totalCount: filtered.length,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], hasMore: false, totalCount: 0 };
    }
  },

  // Fetch product detail by ID from Backend
  getProductDetails: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/catalog/products/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      const p = data.data;

      return {
        ...p,
        image: (p.image_url || p.image) ? (p.image_url || p.image).replace('http://', 'https://') : null,
        price: Number(p.mrp_price) || 0,
        discountPrice: p.discount_percentage ? Number(p.mrp_price) - (Number(p.mrp_price) * (Number(p.discount_percentage) / 100)) : Number(p.mrp_price),
        unit: `${p.quantity} ${p.quantity_type}`,
        stock: 50,
        rating: 4.5,
      };
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Fetch User Addresses
  fetchAddresses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/addresses`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  },

  // Save User Address
  saveAddress: async (addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(addressData),
      });
      if (!response.ok) throw new Error('Failed to save address');
      const data = await response.json();
      return data.data; // contains id
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  },

  // Delete User Address
  deleteAddress: async (addressId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete address');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Submit order checkout
  submitOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit order');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  },

  // Fetch all user orders from backend
  getUserOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/orders`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Upload user avatar image
  uploadAvatar: async (imageUri) => {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/user/auth/upload`);

        // Add auth token if present
        if (authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response && response.data && response.data.url) {
                resolve(response.data.url);
              } else {
                reject(new Error('Invalid response structure from server'));
              }
            } catch (err) {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(response.message || `Upload failed with status ${xhr.status}`));
            } catch (err) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        const formData = new FormData();
        const uriParts = imageUri.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'avatar.jpg';
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const type = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('avatar', {
          uri: imageUri,
          name: fileName,
          type: type,
        });

        xhr.send(formData);
      } catch (error) {
        console.error('Upload avatar error:', error);
        reject(error);
      }
    });
  },

  // Register push notifications device token
  registerDeviceToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/token/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error('Failed to register device token');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in registerDeviceToken:', error);
      throw error;
    }
  },

  mergeCarts: async (guestId, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/cart/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, userId }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to merge carts');
      }
      return await response.json();
    } catch (error) {
      console.error('Merge carts API error:', error);
      throw error;
    }
  },

  submitSupportQuery: async (subject, description, email, name, phone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/support/query`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ subject, description, email, name, phone }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit support query');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in submitSupportQuery API:', error);
      throw error;
    }
  },

  retryPayment: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/orders/${orderId}/retry`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to initiate retry order');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in retryPayment API:', error);
      throw error;
    }
  },

  getShops: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/catalog/shops`);
      if (!response.ok) throw new Error('Failed to fetch shops');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  },
};

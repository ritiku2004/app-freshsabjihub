import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { API_BASE_URL } from '../config/env';
import { AuthContext } from './AuthContext';

export const CartContext = createContext({
  cartItems: [],
  cartTotalQuantity: 0,
  cartSubtotal: 0,
  cartSavings: 0,
  deliveryFee: 0,
  handlingFee: 0,
  taxAmount: 0,
  cartGrandTotal: 0,
  freeDeliveryThreshold: 0,
  freeHandlingThreshold: 0,
  addToCart: async (product) => {},
  removeFromCart: async (productId) => {},
  updateQuantity: async (productId, quantity) => {},
  clearCart: async () => {},
  orderAgain: async (items) => {},
  fetchCart: async () => {},
});

export const CartProvider = ({ children }) => {
  const { user, guestId, activeShop, activeAddress } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState({ total_price: 0 });

  // Helper to fetch the latest cart state from the backend
  const fetchCart = useCallback(async () => {
    const userIdParam = user?.id ? `userId=${user.id}` : '';
    const guestIdParam = (!user?.id && guestId) ? `guestId=${guestId}` : '';

    console.log('[CartContext] fetchCart called. user:', user?.id, 'guestId:', guestId, 'activeShop:', activeShop?.id);

    if (!userIdParam && !guestIdParam) {
      console.log('[CartContext] fetchCart returning early - no userId or guestId');
      setCartItems([]);
      setCartData({ total_price: 0 });
      return;
    }
    try {
      const shopIdParam = activeShop?.id ? `&shopId=${activeShop.id}` : '';
      const addressIdParam = activeAddress?.id ? `&addressId=${activeAddress.id}` : '';
      const queryStr = [userIdParam, guestIdParam].filter(Boolean).join('') + shopIdParam + addressIdParam;

      const url = `${API_BASE_URL}/user/cart?${queryStr}`;
      console.log('[CartContext] Fetching cart from url:', url);

      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      console.log('[CartContext] Fetch cart response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[CartContext] Fetch cart data:', JSON.stringify(data));
        const cart = data.data;
        
        // Map backend cart structure to frontend expectations
        const mappedItems = (cart.items || []).map(item => ({
          ...item,
          id: item.id, // This is cart_items.id
          productId: item.product_id,
          name: item.name,
          price: Number(item.price),
          discountPrice: Number(item.price) - (Number(item.price) * (Number(item.discount_percentage || 0) / 100)),
          unit: `${item.size} ${item.quantity_type}`,
          image: item.image_url,
          quantity: item.quantity,
          stock: 100,
          isAvailable: Number(item.is_available) !== 0,
        }));

        setCartItems(mappedItems);
        setCartData(cart);
      }
    } catch (e) {
      console.error('Failed to load cart from Backend', e);
    }
  }, [user?.id, guestId, activeShop?.id, activeAddress?.id]);

  // Load cart when user, guestId, activeShop or activeAddress changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const syncTimeoutRef = React.useRef(null);

  const queueFetchCart = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      fetchCart();
    }, 500); // 500ms debounce
  };

  const addToCart = async (product, shopId) => {
    // Optimistic UI update
    setCartItems(prev => {
      const existing = prev.find(item => String(item.productId) === String(product.id));
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: 'temp-' + Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        unit: product.unit,
        image: product.image,
        quantity: 1,
        stock: 100,
        isAvailable: true,
      }];
    });

    if (!user?.id && !guestId) return;

    try {
      const payload = {
        shopId: shopId,
        productId: product.id,
        quantity: 1
      };
      if (user?.id) {
        payload.userId = user.id;
      } else {
        payload.guestId = guestId;
      }

      const response = await fetch(`${API_BASE_URL}/user/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        queueFetchCart();
      } else {
        // Rollback on failure
        queueFetchCart();
      }
    } catch (e) {
      console.error('Failed to add item to cart', e);
      queueFetchCart();
    }
  };

  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    try {
      const response = await fetch(`${API_BASE_URL}/user/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        queueFetchCart();
      } else {
        queueFetchCart();
      }
    } catch (e) {
      console.error('Failed to remove item from cart', e);
      queueFetchCart();
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (String(cartItemId).startsWith('temp-')) {
      // If it's a temporary ID, it means the POST request is still in flight.
      // Do the optimistic update anyway, but avoid PUTing to a fake ID.
      setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
      queueFetchCart();
      return;
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }
    
    setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    try {
      const response = await fetch(`${API_BASE_URL}/user/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        queueFetchCart();
      } else {
        queueFetchCart();
      }
    } catch (e) {
      console.error('Failed to update cart item quantity', e);
      queueFetchCart();
    }
  };

  const clearCart = async () => {
    const userIdParam = user?.id ? `userId=${user.id}` : '';
    const guestIdParam = (!user?.id && guestId) ? `guestId=${guestId}` : '';
    if (!userIdParam && !guestIdParam) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/cart?${[userIdParam, guestIdParam].filter(Boolean).join('')}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCartItems([]);
        setCartData({ total_price: 0 });
      }
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  };

  const orderAgain = async (items) => {
    if (!user || !user.id) {
      return { success: false, message: 'Please log in to reorder items.' };
    }
    if (!activeShop || !activeShop.id) {
      return { success: false, message: 'No active shop found. Please set your zipcode first.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/shop-inventory/${activeShop.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shop inventory');
      }
      const data = await response.json();
      const shopInventory = data.data || [];

      const availableItems = [];
      const unavailableItems = [];

      for (const orderItem of items) {
        const prod = shopInventory.find(p => String(p.product_id || p.id) === String(orderItem.productId));
        if (prod && Number(prod.is_available) !== 0) {
          availableItems.push(orderItem);
        } else {
          unavailableItems.push(orderItem.name);
        }
      }

      if (availableItems.length === 0) {
        return {
          success: false,
          message: 'All products in this order are currently out of stock or unavailable at the nearby shop.'
        };
      }

      await Promise.all(availableItems.map(item =>
        fetch(`${API_BASE_URL}/user/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            shopId: activeShop.id,
            productId: item.productId,
            quantity: item.quantity
          })
        })
      ));

      await fetchCart();

      return {
        success: true,
        unavailableItems
      };
    } catch (error) {
      console.error('Error reordering items:', error);
      throw error;
    }
  };

  // Calculate shopping statistics directly from backend data
  const cartTotalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Use backend computed values
  const pricing = cartData.pricing || { subtotal: 0, savings: 0, deliveryFee: 0, handlingFee: 0, taxAmount: 0, grandTotal: 0 };
  
  const cartSubtotal = pricing.subtotal || 0;
  const cartSavings = pricing.savings || 0;
  const deliveryFee = pricing.deliveryFee || 0;
  const handlingFee = pricing.handlingFee || 0;
  const taxAmount = pricing.taxAmount || 0;
  const cartGrandTotal = pricing.grandTotal || 0;
  const freeDeliveryThreshold = pricing.freeDeliveryThreshold || 0;
  const freeHandlingThreshold = pricing.freeHandlingThreshold || 0;
  const deliveryDistanceKm = pricing.distanceKm || null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotalQuantity,
        cartSubtotal,
        cartSavings,
        deliveryFee,
        handlingFee,
        taxAmount,
        cartGrandTotal,
        freeDeliveryThreshold,
        freeHandlingThreshold,
        deliveryDistanceKm,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orderAgain,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

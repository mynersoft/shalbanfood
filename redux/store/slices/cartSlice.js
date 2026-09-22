// store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Safe localStorage access (client-side only)
const getCartFromStorage = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const cartData = localStorage.getItem('shalbanCart');
    if (!cartData) return [];
    
    const items = JSON.parse(cartData);
    
    // Validate and sanitize cart data
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => 
      item &&
      typeof item === 'object' &&
      item._id &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save to localStorage (client-side only)
const saveCartToStorage = (items) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('shalbanCart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Calculate total quantity
const calculateTotalQty = (items) => {
  return items.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);
};

// Initial state - always empty on server
const initialState = {
  items: [],
  qty: 0,
  _hydrated: false, // Track if cart has been hydrated from storage
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload || {};

      // Validate input
      if (!product || !product._id) {
        console.warn('Invalid product in addToCart action');
        return state;
      }

      const existingIndex = state.items.findIndex((item) => item._id === product._id);

      if (existingIndex >= 0) {
        // Update existing item
        state.items[existingIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          ...product,
          quantity: Math.max(1, quantity),
        });
      }

      state.qty = calculateTotalQty(state.items);
      saveCartToStorage(state.items);
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      state.qty = calculateTotalQty(state.items);
      saveCartToStorage(state.items);
    },

    // Increase quantity by 1
    incrementQty: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item._id === productId);
      
      if (item) {
        item.quantity += 1;
        state.qty = calculateTotalQty(state.items);
        saveCartToStorage(state.items);
      }
    },

    // Decrease quantity by 1
    decrementQty: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item._id === productId);
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter((item) => item._id !== productId);
        }
        state.qty = calculateTotalQty(state.items);
        saveCartToStorage(state.items);
      }
    },

    // Update specific quantity
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      
      if (quantity < 1) {
        // If quantity is less than 1, remove the item
        state.items = state.items.filter((item) => item._id !== productId);
      } else {
        const item = state.items.find((item) => item._id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      state.qty = calculateTotalQty(state.items);
      saveCartToStorage(state.items);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.qty = 0;
      saveCartToStorage([]);
    },

    // Set cart with new items array
    setCart: (state, action) => {
      const items = action.payload || [];
      
      // Validate items
      const validItems = Array.isArray(items) ? items.filter(item => 
        item &&
        typeof item === 'object' &&
        item._id &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      ) : [];
      
      state.items = validItems;
      state.qty = calculateTotalQty(validItems);
      saveCartToStorage(validItems);
    },

    // Initialize cart from localStorage (client-side only)
    initCartFromStorage: (state) => {
      // Only hydrate once
      if (state._hydrated) return;
      
      const items = getCartFromStorage();
      state.items = items;
      state.qty = calculateTotalQty(items);
      state._hydrated = true;
    },

    // Sync cart with backend (after login)
    syncCartWithBackend: (state, action) => {
      const backendItems = action.payload || [];
      
      if (!Array.isArray(backendItems)) return;
      
      // Merge local cart with backend cart
      const localItems = [...state.items];
      const mergedItems = [...backendItems];
      
      // Add local items that don't exist in backend
      localItems.forEach(localItem => {
        const existsInBackend = mergedItems.some(
          backendItem => backendItem.product?._id === localItem._id || backendItem._id === localItem._id
        );
        
        if (!existsInBackend) {
          mergedItems.push(localItem);
        }
      });
      
      state.items = mergedItems;
      state.qty = calculateTotalQty(mergedItems);
      saveCartToStorage(mergedItems);
    },

    // Reset hydration state (for testing/development)
    resetHydration: (state) => {
      state._hydrated = false;
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;


export const selectCartTotal = (state) => {
	return state.cart.items.reduce((total, item) => {
		const price = Number(
			item.price ?? item.salePrice ?? item.regularPrice ?? 0
		);

		const quantity = Number(item.quantity ?? 0);

		return total + price * quantity;
	}, 0);
};

export const selectCartTotalItems = (state) => state.cart.qty;
export const selectCartItemQuantity = (productId) => (state) =>
  state.cart.items.find((item) => item._id === productId)?.quantity || 0;
export const selectIsCartHydrated = (state) => state.cart._hydrated;

// Actions
export const {
  addToCart,
  removeFromCart,
  incrementQty,
  decrementQty,
  updateQuantity,
  clearCart,
  setCart,
  initCartFromStorage,
  syncCartWithBackend,
  resetHydration,
} = cartSlice.actions;

export default cartSlice.reducer;
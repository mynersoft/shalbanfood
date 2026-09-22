import { createSlice } from "@reduxjs/toolkit";

// Helper to safely load from localStorage (client-side only)
const getInitialWishlist = () => {
    if (typeof window === "undefined") {
        return { items: [], qty: 0 };
    }

    try {
        const wishlistData = localStorage.getItem("wishlist");
        if (!wishlistData) return { items: [], qty: 0 };

        const items = JSON.parse(wishlistData);
        const validItems = Array.isArray(items)
            ? items.filter(item => item && typeof item === "object" && item._id)
            : [];

        return {
            items: validItems,
            qty: validItems.length
        };
    } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
        return { items: [], qty: 0 };
    }
};

// Initial state - always empty on server
const initialState = {
    items: [],
    qty: 0,
    _hydrated: false // Track if wishlist has been hydrated from storage
};

// Save to localStorage (client-side only)
const saveWishlistToStorage = items => {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem("wishlist", JSON.stringify(items));
    } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
    }
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const product = action.payload;

            // Validate input
            if (!product || !product._id) {
                console.warn("Invalid product in addToWishlist action");
                return state;
            }

            const exists = state.items.find(item => item._id === product._id);

            if (!exists) {
                state.items.push(product);
                state.qty = state.items.length;
                saveWishlistToStorage(state.items);
            }
        },

        removeFromWishlist: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => item._id !== productId);
            state.qty = state.items.length;
            saveWishlistToStorage(state.items);
        },

        toggleWishlist: (state, action) => {
            const product = action.payload;

            // Validate input
            if (!product || !product._id) {
                console.warn("Invalid product in toggleWishlist action");
                return state;
            }

            const exists = state.items.find(item => item._id === product._id);

            if (exists) {
                state.items = state.items.filter(
                    item => item._id !== product._id
                );
            } else {
                state.items.push(product);
            }

            state.qty = state.items.length;
            saveWishlistToStorage(state.items);
        },

        clearWishlist: state => {
            state.items = [];
            state.qty = 0;
            saveWishlistToStorage([]);
        },

        setWishlist: (state, action) => {            
            const items = action.payload || [];

            // Validate items
            const validItems = Array.isArray(items)
                ? items.filter(
                      item => item && typeof item === "object" && item._id
                  )
                : [];

            state.items = validItems;
            state.qty = validItems.length;
            saveWishlistToStorage(validItems);
        },

        // Initialize wishlist from storage after hydration (client-side only)
        initWishlistFromStorage: state => {
            // Only hydrate once
            if (state._hydrated) return;

            const { items, qty } = getInitialWishlist();
            state.items = items;
            state.qty = qty;
            state._hydrated = true;
        },

        // Reset hydration state (for testing/development)
        resetWishlistHydration: state => {
            state._hydrated = false;
        }
    }
});

// Selectors
export const selectWishlistItems = state => state.wishlist.items;
export const selectWishlistCount = state => state.wishlist.qty;
export const selectIsWishlisted = productId => state =>
    state.wishlist.items.some(item => item._id === productId);
export const selectIsWishlistHydrated = state => state.wishlist._hydrated;

// Actions
export const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    setWishlist,
    initWishlistFromStorage,
    resetWishlistHydration
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

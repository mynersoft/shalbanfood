import { createSlice } from '@reduxjs/toolkit';

// --------------------------------------------------
// localStorage helpers
// --------------------------------------------------

const CART_STORAGE_KEY = 'shalbanCart';

const getCartFromStorage = () => {
	if (typeof window === 'undefined') return [];

	try {
		const data = localStorage.getItem(CART_STORAGE_KEY);

		if (!data) return [];

		const items = JSON.parse(data);

		if (!Array.isArray(items)) return [];

		return items.filter(
			(item) =>
				item &&
				typeof item === 'object' &&
				item._id &&
				Number(item.quantity) > 0
		);
	} catch (error) {
		console.error('Error loading cart:', error);
		return [];
	}
};

const saveCartToStorage = (items) => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		console.error('Error saving cart:', error);
	}
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const calculateTotalQty = (items) => {
	return items.reduce((total, item) => {
		return total + Number(item.quantity || 0);
	}, 0);
};

// --------------------------------------------------
// Initial State
// --------------------------------------------------

const initialState = {
	items: [],
	qty: 0,
	hydrated: false,
};

// --------------------------------------------------
// Slice
// --------------------------------------------------

const cartSlice = createSlice({
	name: 'cart',

	initialState,

	reducers: {
		// ----------------------------------------------
		// Add product
		// ----------------------------------------------
		addToCart: (state, action) => {
			const { product, quantity = 1 } = action.payload || {};

			if (!product?._id) {
				console.warn('Invalid product passed to addToCart');
				return;
			}

			const qty = Math.max(1, Number(quantity));

			const existingItem = state.items.find(
				(item) => item._id === product._id
			);

			if (existingItem) {
				existingItem.quantity += qty;
			} else {
				state.items.push({
					...product,
					quantity: qty,
				});
			}

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Remove product
		// ----------------------------------------------
		removeFromCart: (state, action) => {
			const productId = action.payload;

			state.items = state.items.filter((item) => item._id !== productId);

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Increase
		// ----------------------------------------------
		incrementQty: (state, action) => {
			const productId = action.payload;

			const item = state.items.find((item) => item._id === productId);

			if (!item) return;

			item.quantity += 1;

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Decrease
		// ----------------------------------------------
		decrementQty: (state, action) => {
			const productId = action.payload;

			const item = state.items.find((item) => item._id === productId);

			if (!item) return;

			if (item.quantity > 1) {
				item.quantity -= 1;
			} else {
				state.items = state.items.filter(
					(item) => item._id !== productId
				);
			}

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Update quantity
		// ----------------------------------------------
		updateQuantity: (state, action) => {
			const { productId, quantity } = action.payload;

			const qty = Number(quantity);

			if (qty < 1) {
				state.items = state.items.filter(
					(item) => item._id !== productId
				);
			} else {
				const item = state.items.find((item) => item._id === productId);

				if (item) {
					item.quantity = qty;
				}
			}

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Clear cart
		// ----------------------------------------------
		clearCart: (state) => {
			state.items = [];
			state.qty = 0;

			saveCartToStorage([]);
		},

		// ----------------------------------------------
		// Set complete cart
		// ----------------------------------------------
		setCart: (state, action) => {
			const items = Array.isArray(action.payload) ? action.payload : [];

			const validItems = items.filter(
				(item) => item && item._id && Number(item.quantity) > 0
			);

			state.items = validItems;
			state.qty = calculateTotalQty(validItems);

			saveCartToStorage(validItems);
		},

		// ----------------------------------------------
		// Hydrate from localStorage
		// ----------------------------------------------
		hydrateCart: (state) => {
			if (state.hydrated) return;

			const items = getCartFromStorage();

			state.items = items;
			state.qty = calculateTotalQty(items);
			state.hydrated = true;
		},

		// ----------------------------------------------
		// Mark hydrated
		// ----------------------------------------------
		setHydrated: (state, action) => {
			state.hydrated = Boolean(action.payload);
		},

		// ----------------------------------------------
		// Reset
		// ----------------------------------------------
		resetCart: (state) => {
			state.items = [];
			state.qty = 0;
			state.hydrated = false;

			saveCartToStorage([]);
		},
	},
});

// --------------------------------------------------
// Selectors
// --------------------------------------------------

export const selectCartItems = (state) => state.cart.items;

export const selectCartTotalItems = (state) => state.cart.qty;

export const selectCartItemQuantity = (productId) => (state) =>
	state.cart.items.find((item) => item._id === productId)?.quantity || 0;

export const selectCartTotal = (state) => {
	return state.cart.items.reduce((total, item) => {
		const price = Number(
			item.salePrice ?? item.price ?? item.regularPrice ?? 0
		);

		const quantity = Number(item.quantity || 0);

		return total + price * quantity;
	}, 0);
};

export const selectIsCartHydrated = (state) => state.cart.hydrated;

// --------------------------------------------------
// Actions
// --------------------------------------------------

export const {
	addToCart,
	removeFromCart,
	incrementQty,
	decrementQty,
	updateQuantity,
	clearCart,
	setCart,
	hydrateCart,
	setHydrated,
	resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;


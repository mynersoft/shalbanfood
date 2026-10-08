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

const normalizeVariantId = (variantId) => {
	if (variantId === undefined || variantId === null || variantId === '') {
		return null;
	}

	return String(variantId);
};

/**
 * Unique identity of a cart item
 *
 * With variant:
 * productId + variantId
 *
 * Without variant:
 * productId + base
 */
export const getCartItemKey = (itemOrProductId, variantId = null) => {
	let productId;

	if (typeof itemOrProductId === 'object' && itemOrProductId !== null) {
		productId = itemOrProductId._id;
		variantId = itemOrProductId.variantId;
	} else {
		productId = itemOrProductId;
	}

	if (!productId) return '';

	const normalizedVariantId = normalizeVariantId(variantId);

	return `${String(productId)}::${normalizedVariantId || 'base'}`;
};

const isSameCartItem = (item, productId, variantId = null) => {
	return getCartItemKey(item) === getCartItemKey(productId, variantId);
};

const calculateTotalQty = (items) => {
	return items.reduce((total, item) => {
		const quantity = Number(item?.quantity || 0);

		return total + (Number.isFinite(quantity) ? quantity : 0);
	}, 0);
};

const normalizeQuantity = (quantity) => {
	const qty = Number(quantity);

	if (!Number.isFinite(qty) || qty < 1) {
		return 1;
	}

	return Math.floor(qty);
};

const normalizePrice = (product) => {
	const price = Number(
		product?.price ??
			product?.sellPrice ??
			product?.salePrice ??
			product?.regularPrice ??
			0
	);

	return Number.isFinite(price) && price >= 0 ? price : 0;
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

			const qty = normalizeQuantity(quantity);

			/*
			 * IMPORTANT:
			 *
			 * variantId থাকলে:
			 * productId + variantId
			 *
			 * variantId না থাকলে:
			 * productId + base
			 */
			const productVariantId = normalizeVariantId(product.variantId);

			const existingItem = state.items.find((item) =>
				isSameCartItem(item, product._id, productVariantId)
			);

			const price = normalizePrice(product);

			if (existingItem) {
				// Same product + same variant
				existingItem.quantity += qty;

				// Keep correct variant price
				existingItem.price = price;

				// Update variant information if available
				if (productVariantId) {
					existingItem.variantId = productVariantId;
				}
			} else {
				/*
				 * Different variant অথবা completely new product
				 * -> NEW cart item
				 */
				state.items.push({
					...product,

					variantId: productVariantId,

					price,

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
			const payload = action.payload;

			let productId;
			let variantId = null;

			/*
			 * Supports both:
			 *
			 * removeFromCart("productId")
			 *
			 * and:
			 *
			 * removeFromCart({
			 *   productId,
			 *   variantId
			 * })
			 */
			if (typeof payload === 'object' && payload !== null) {
				productId = payload.productId;
				variantId = normalizeVariantId(payload.variantId);
			} else {
				productId = payload;
			}

			state.items = state.items.filter(
				(item) => !isSameCartItem(item, productId, variantId)
			);

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Increase
		// ----------------------------------------------
		incrementQty: (state, action) => {
			const payload = action.payload;

			let productId;
			let variantId = null;

			if (typeof payload === 'object' && payload !== null) {
				productId = payload.productId;
				variantId = normalizeVariantId(payload.variantId);
			} else {
				productId = payload;
			}

			const item = state.items.find((item) =>
				isSameCartItem(item, productId, variantId)
			);

			if (!item) return;

			item.quantity = Number(item.quantity || 0) + 1;

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Decrease
		// ----------------------------------------------
		decrementQty: (state, action) => {
			const payload = action.payload;

			let productId;
			let variantId = null;

			if (typeof payload === 'object' && payload !== null) {
				productId = payload.productId;
				variantId = normalizeVariantId(payload.variantId);
			} else {
				productId = payload;
			}

			const item = state.items.find((item) =>
				isSameCartItem(item, productId, variantId)
			);

			if (!item) return;

			if (Number(item.quantity) > 1) {
				item.quantity = Number(item.quantity) - 1;
			} else {
				state.items = state.items.filter(
					(cartItem) =>
						!isSameCartItem(cartItem, productId, variantId)
				);
			}

			state.qty = calculateTotalQty(state.items);

			saveCartToStorage(state.items);
		},

		// ----------------------------------------------
		// Update quantity
		// ----------------------------------------------
		updateQuantity: (state, action) => {
			const {
				productId,
				variantId = null,
				quantity,
			} = action.payload || {};

			const qty = Number(quantity);

			if (!Number.isFinite(qty) || qty < 1) {
				state.items = state.items.filter(
					(item) => !isSameCartItem(item, productId, variantId)
				);
			} else {
				const item = state.items.find((item) =>
					isSameCartItem(item, productId, variantId)
				);

				if (item) {
					item.quantity = Math.floor(qty);
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

			const validItems = items
				.filter((item) => item && item._id && Number(item.quantity) > 0)
				.map((item) => ({
					...item,

					variantId: normalizeVariantId(item.variantId),

					price: normalizePrice(item),

					quantity: normalizeQuantity(item.quantity),
				}));

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

			state.items = items.map((item) => ({
				...item,

				variantId: normalizeVariantId(item.variantId),

				price: normalizePrice(item),

				quantity: normalizeQuantity(item.quantity),
			}));

			state.qty = calculateTotalQty(state.items);

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

/**
 * Get quantity of specific product + variant
 */
export const selectCartItemQuantity =
	(productId, variantId = null) =>
	(state) =>
		state.cart.items.find((item) =>
			isSameCartItem(item, productId, variantId)
		)?.quantity || 0;

/**
 * Cart total
 */
export const selectCartTotal = (state) => {
	return state.cart.items.reduce((total, item) => {
		const price = normalizePrice(item);

		const quantity = Number(item.quantity || 0);

		if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
			return total;
		}

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

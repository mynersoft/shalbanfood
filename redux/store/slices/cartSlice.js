import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'shalbanCart';

/* --------------------------------
   ID Helpers
-------------------------------- */

const normalizeId = (value) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	if (typeof value === 'object') {
		if (value._id) return String(value._id);
		if (value.id) return String(value.id);
		return null;
	}

	return String(value);
};

const getProductId = (item) =>
	normalizeId(item?._id || item?.productId || item?.product || item?.slug);

const getVariantIdentity = (item) =>
	normalizeId(item?.variantId) ?? normalizeId(item?.variantKey) ?? 'base';

/* --------------------------------
   Cart Item Unique Key
-------------------------------- */

export const getCartItemKey = (item) => {
	const productId = getProductId(item);

	if (!productId) return '';

	return `${productId}::${getVariantIdentity(item)}`;
};

/* --------------------------------
   Price Helpers
-------------------------------- */

const normalizePrice = (item) => {
	const price = Number(
		item?.price ?? item?.sellPrice ?? item?.regularPrice ?? 0
	);

	return Number.isFinite(price) && price >= 0 ? price : 0;
};

/* --------------------------------
   Quantity Helpers
-------------------------------- */

const normalizeQuantity = (value) => {
	const quantity = Number(value);

	return Number.isFinite(quantity) && quantity >= 1
		? Math.floor(quantity)
		: 1;
};

const getStock = (value) => {
	const stock = Number(value);

	return Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0;
};

const calculateQty = (items) =>
	items.reduce((total, item) => total + Number(item.quantity || 0), 0);

/* --------------------------------
   Normalize Cart
-------------------------------- */

const normalizeCart = (items) => {
	const map = new Map();

	if (!Array.isArray(items)) return [];

	for (const item of items) {
		if (!item || !getProductId(item)) continue;

		const normalized = {
			...item,

			variantId: normalizeId(item.variantId),

			variantKey: normalizeId(item.variantKey),

			price: normalizePrice(item),

			quantity: normalizeQuantity(item.quantity),
		};

		const key = getCartItemKey(normalized);

		if (!key) continue;

		const existing = map.get(key);

		if (existing) {
			const stock = getStock(existing.stock);

			const newQuantity = existing.quantity + normalized.quantity;

			existing.quantity =
				stock > 0 ? Math.min(newQuantity, stock) : newQuantity;
		} else {
			map.set(key, normalized);
		}
	}

	return Array.from(map.values());
};

/* --------------------------------
   LocalStorage
-------------------------------- */

const readStorage = () => {
	if (typeof window === 'undefined') return [];

	try {
		const saved = localStorage.getItem(CART_STORAGE_KEY);

		return saved ? JSON.parse(saved) : [];
	} catch (error) {
		console.error('Unable to read cart:', error);
		return [];
	}
};

const saveStorage = (items) => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		console.error('Unable to save cart:', error);
	}
};

/* --------------------------------
   Initial State
-------------------------------- */

const initialState = {
	items: [],
	qty: 0,
	hydrated: false,
};

/* --------------------------------
   Cart Slice
-------------------------------- */

const cartSlice = createSlice({
	name: 'cart',

	initialState,

	reducers: {
		/* ==============================
           Add To Cart
        ============================== */

		addToCart: (state, action) => {
			const { product, quantity = 1 } = action.payload || {};

			if (!product || !getProductId(product)) {
				console.warn('addToCart: invalid product');
				return;
			}

			const qty = normalizeQuantity(quantity);

			const key = getCartItemKey(product);

			const price = normalizePrice(product);

			const existing = state.items.find(
				(item) => getCartItemKey(item) === key
			);

			const stock = getStock(product.stock);

			if (stock <= 0) {
				return;
			}

			if (existing) {
				const nextQuantity = existing.quantity + qty;

				existing.quantity = Math.min(nextQuantity, stock);

				existing.price = price;

				existing.regularPrice =
					product.regularPrice ?? existing.regularPrice;

				existing.sellPrice = product.sellPrice ?? price;

				existing.stock = stock;

				existing.size = product.size ?? existing.size;

				existing.variantId = normalizeId(product.variantId);

				existing.variantKey = normalizeId(product.variantKey);

				existing.variantLabel =
					product.variantLabel ?? existing.variantLabel;

				existing.sku = product.sku ?? existing.sku;
			} else {
				state.items.push({
					...product,

					variantId: normalizeId(product.variantId),

					variantKey: normalizeId(product.variantKey),

					price,

					quantity: Math.min(qty, stock),
				});
			}

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Remove From Cart
        ============================== */

		removeFromCart: (state, action) => {
			const payload = action.payload;

			if (typeof payload === 'object' && payload !== null) {
				const key = getCartItemKey({
					_id:
						payload.productId ||
						payload._id ||
						payload.product ||
						payload.slug,

					variantId: payload.variantId,

					variantKey: payload.variantKey,
				});

				state.items = state.items.filter(
					(item) => getCartItemKey(item) !== key
				);
			} else {
				state.items = state.items.filter(
					(item) => getProductId(item) !== String(payload)
				);
			}

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Increment Quantity
        ============================== */

		incrementQty: (state, action) => {
			const payload = action.payload;

			if (!payload || typeof payload !== 'object') {
				return;
			}

			const key = getCartItemKey({
				_id:
					payload.productId ||
					payload._id ||
					payload.product ||
					payload.slug,

				variantId: payload.variantId,

				variantKey: payload.variantKey,
			});

			const item = state.items.find(
				(entry) => getCartItemKey(entry) === key
			);

			if (!item) return;

			const stock = getStock(item.stock);

			if (stock > 0 && item.quantity < stock) {
				item.quantity += 1;
			}

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Decrement Quantity
        ============================== */

		decrementQty: (state, action) => {
			const payload = action.payload;

			if (!payload || typeof payload !== 'object') {
				return;
			}

			const key = getCartItemKey({
				_id:
					payload.productId ||
					payload._id ||
					payload.product ||
					payload.slug,

				variantId: payload.variantId,

				variantKey: payload.variantKey,
			});

			const item = state.items.find(
				(entry) => getCartItemKey(entry) === key
			);

			if (!item) return;

			if (item.quantity > 1) {
				item.quantity -= 1;
			} else {
				state.items = state.items.filter(
					(entry) => getCartItemKey(entry) !== key
				);
			}

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Update Quantity
        ============================== */

		updateQuantity: (state, action) => {
			const {
				productId,
				variantId = null,
				variantKey = null,
				quantity,
			} = action.payload || {};

			const key = getCartItemKey({
				_id: productId,
				variantId,
				variantKey,
			});

			const item = state.items.find(
				(entry) => getCartItemKey(entry) === key
			);

			if (!item) return;

			const qty = Number(quantity);

			if (!Number.isFinite(qty) || qty < 1) {
				state.items = state.items.filter(
					(entry) => getCartItemKey(entry) !== key
				);
			} else {
				const stock = getStock(item.stock);

				item.quantity =
					stock > 0 ? Math.min(Math.floor(qty), stock) : 0;

				if (item.quantity <= 0) {
					state.items = state.items.filter(
						(entry) => getCartItemKey(entry) !== key
					);
				}
			}

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Clear Cart
        ============================== */

		clearCart: (state) => {
			state.items = [];
			state.qty = 0;

			saveStorage([]);
		},

		/* ==============================
           Set Cart
        ============================== */

		setCart: (state, action) => {
			state.items = normalizeCart(action.payload);

			state.qty = calculateQty(state.items);

			saveStorage(state.items);
		},

		/* ==============================
           Hydrate Cart
        ============================== */

		hydrateCart: (state) => {
			if (state.hydrated) return;

			state.items = normalizeCart(readStorage());

			state.qty = calculateQty(state.items);

			state.hydrated = true;

			saveStorage(state.items);
		},

		/* ==============================
           Reset Cart
        ============================== */

		resetCart: (state) => {
			state.items = [];
			state.qty = 0;
			state.hydrated = false;

			saveStorage([]);
		},
	},
});

/* --------------------------------
   Actions
-------------------------------- */

export const {
	addToCart,
	removeFromCart,
	incrementQty,
	decrementQty,
	updateQuantity,
	clearCart,
	setCart,
	hydrateCart,
	resetCart,
} = cartSlice.actions;

/* --------------------------------
   Selectors
-------------------------------- */

export const selectCartItems = (state) => state.cart.items;

export const selectCartTotalItems = (state) => state.cart.qty;

export const selectIsCartHydrated = (state) => state.cart.hydrated;

export const selectCartTotal = (state) =>
	state.cart.items.reduce(
		(total, item) =>
			total + normalizePrice(item) * Number(item.quantity || 0),
		0
	);

export const selectCartItemQuantity =
	(productId, variantId = null, variantKey = null) =>
	(state) => {
		const key = getCartItemKey({
			_id: productId,
			variantId,
			variantKey,
		});

		return (
			state.cart.items.find((item) => getCartItemKey(item) === key)
				?.quantity || 0
		);
	};

/* --------------------------------
   Reducer
-------------------------------- */

export default cartSlice.reducer;

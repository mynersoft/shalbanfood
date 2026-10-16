
import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'shalbanCart';

const normalizeId = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return String(value);
};

const getProductId = (item) =>
    normalizeId(item?._id || item?.productId || item?.slug);

const getVariantIdentity = (item) =>
    normalizeId(item?.variantId) ??
    normalizeId(item?.variantKey) ??
    'base';

export const getCartItemKey = (item) => {
    const productId = getProductId(item);

    if (!productId) return '';

    return `${productId}::${getVariantIdentity(item)}`;
};

const normalizePrice = (item) => {
    const price = Number(
        item?.price ??
        item?.sellPrice ??
        item?.regularPrice ??
        0
    );

    return Number.isFinite(price) && price >= 0 ? price : 0;
};

const normalizeQuantity = (value) => {
    const quantity = Number(value);

    return Number.isFinite(quantity) && quantity >= 1
        ? Math.floor(quantity)
        : 1;
};

const calculateQty = (items) =>
    items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

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
            existing.quantity += normalized.quantity;
        } else {
            map.set(key, normalized);
        }
    }

    return Array.from(map.values());
};

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
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(items)
        );
    } catch (error) {
        console.error('Unable to save cart:', error);
    }
};

const initialState = {
    items: [],
    qty: 0,
    hydrated: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,

    reducers: {
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

            if (existing) {
                existing.quantity += qty;
                existing.price = price;

                existing.regularPrice =
                    product.regularPrice ?? existing.regularPrice;

                existing.sellPrice =
                    product.sellPrice ?? price;

                existing.stock =
                    product.stock ?? existing.stock;

                existing.size =
                    product.size ?? existing.size;

                existing.variantLabel =
                    product.variantLabel ?? existing.variantLabel;
            } else {
                state.items.push({
                    ...product,
                    variantId: normalizeId(product.variantId),
                    variantKey: normalizeId(product.variantKey),
                    price,
                    quantity: qty,
                });
            }

            state.qty = calculateQty(state.items);
            saveStorage(state.items);
        },

        removeFromCart: (state, action) => {
            const payload = action.payload;

            const key =
                typeof payload === 'object' && payload !== null
                    ? getCartItemKey({
                        _id: payload.productId || payload._id || payload.slug,
                        variantId: payload.variantId,
                        variantKey: payload.variantKey,
                    })
                    : '';

            state.items =
                typeof payload === 'object' && payload !== null
                    ? state.items.filter(
                        (item) => getCartItemKey(item) !== key
                    )
                    : state.items.filter(
                        (item) => getProductId(item) !== String(payload)
                    );

            state.qty = calculateQty(state.items);
            saveStorage(state.items);
        },

        incrementQty: (state, action) => {
            const payload = action.payload;

            const key =
                typeof payload === 'object' && payload !== null
                    ? getCartItemKey({
                        _id: payload.productId || payload._id || payload.slug,
                        variantId: payload.variantId,
                        variantKey: payload.variantKey,
                    })
                    : '';

            const item = state.items.find(
                (entry) =>
                    typeof payload === 'object' &&
                    payload !== null &&
                    getCartItemKey(entry) === key
            );

            if (!item) return;

            const stock = Number(item.stock);

            if (
                !Number.isFinite(stock) ||
                stock <= 0 ||
                item.quantity < stock
            ) {
                item.quantity += 1;
            }

            state.qty = calculateQty(state.items);
            saveStorage(state.items);
        },

        decrementQty: (state, action) => {
            const payload = action.payload;

            const key =
                typeof payload === 'object' && payload !== null
                    ? getCartItemKey({
                        _id: payload.productId || payload._id || payload.slug,
                        variantId: payload.variantId,
                        variantKey: payload.variantKey,
                    })
                    : '';

            const item = state.items.find(
                (entry) =>
                    typeof payload === 'object' &&
                    payload !== null &&
                    getCartItemKey(entry) === key
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

            const qty = Number(quantity);

            if (!Number.isFinite(qty) || qty < 1) {
                state.items = state.items.filter(
                    (entry) => getCartItemKey(entry) !== key
                );
            } else if (item) {
                const stock = Number(item.stock);

                item.quantity =
                    Number.isFinite(stock) && stock > 0
                        ? Math.min(Math.floor(qty), stock)
                        : Math.floor(qty);
            }

            state.qty = calculateQty(state.items);
            saveStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            state.qty = 0;
            saveStorage([]);
        },

        setCart: (state, action) => {
            state.items = normalizeCart(action.payload);
            state.qty = calculateQty(state.items);
            saveStorage(state.items);
        },

        hydrateCart: (state) => {
            if (state.hydrated) return;

            state.items = normalizeCart(readStorage());
            state.qty = calculateQty(state.items);
            state.hydrated = true;
            saveStorage(state.items);
        },

        resetCart: (state) => {
            state.items = [];
            state.qty = 0;
            state.hydrated = false;
            saveStorage([]);
        },
    },
});

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
            state.cart.items.find(
                (item) => getCartItemKey(item) === key
            )?.quantity || 0
        );
    };

export default cartSlice.reducer;

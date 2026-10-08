'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import axios from 'axios';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import { setCart, hydrateCart } from '@/redux/store/slices/cartSlice';

// --------------------------------------------------
// Constants
// --------------------------------------------------

const CART_STORAGE_KEY = 'shalbanCart';

// --------------------------------------------------
// Cart identity helper
// --------------------------------------------------

const normalizeVariantId = (variantId) => {
	if (variantId === undefined || variantId === null || variantId === '') {
		return null;
	}

	return String(variantId);
};

const getCartItemKey = (item) => {
	if (!item?._id) return '';

	const productId = String(item._id);

	const variantId = normalizeVariantId(item.variantId);

	return `${productId}::${variantId || 'base'}`;
};

const isSameCartItem = (item, productId, variantId = null) => {
	if (!item?._id || !productId) return false;

	const itemKey = getCartItemKey(item);

	const targetKey = `${String(productId)}::${
		normalizeVariantId(variantId) || 'base'
	}`;

	return itemKey === targetKey;
};

// --------------------------------------------------
// Get backend cart
// --------------------------------------------------

export function useCart(userId) {
	return useQuery({
		queryKey: ['cart', userId],

		queryFn: async () => {
			if (!userId) return [];

			const res = await axios.get(`/api/cart?userId=${userId}`);

			return res.data?.cart || [];
		},

		enabled: Boolean(userId),
	});
}

// --------------------------------------------------
// Add to cart
// --------------------------------------------------

export function useAddToCart() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ user, product, quantity = 1 }) => {
			if (!product?._id) {
				throw new Error('Product is required');
			}

			const qty = Math.max(1, Number(quantity) || 1);

			const variantId = normalizeVariantId(product.variantId);

			// --------------------------------------------
			// Guest
			// --------------------------------------------

			if (!user) {
				const currentCart = getGuestCart();

				const existing = currentCart.find((item) =>
					isSameCartItem(item, product._id, variantId)
				);

				let updatedCart;

				if (existing) {
					// SAME product + SAME variant
					updatedCart = currentCart.map((item) =>
						isSameCartItem(item, product._id, variantId)
							? {
									...item,
									quantity: Number(item.quantity || 0) + qty,

									variantId: variantId,

									price: Number(
										product.price ??
											product.sellPrice ??
											product.regularPrice ??
											0
									),
								}
							: item
					);
				} else {
					// DIFFERENT variant
					// => NEW cart item
					updatedCart = [
						...currentCart,
						{
							...product,

							variantId,

							price: Number(
								product.price ??
									product.sellPrice ??
									product.regularPrice ??
									0
							),

							quantity: qty,
						},
					];
				}

				saveGuestCart(updatedCart);

				return updatedCart;
			}

			// --------------------------------------------
			// Logged in
			// --------------------------------------------

			const res = await axios.post('/api/cart', {
				user,
				productId: product._id,

				// VERY IMPORTANT
				variantId,

				quantity: qty,
			});

			return res.data?.cart || [];
		},

		onMutate: () => {
			toast.loading('Adding to cart...', {
				id: 'add-cart',
			});
		},

		onSuccess: async (cart, variables) => {
			toast.success('Added to cart!', {
				id: 'add-cart',
			});

			if (variables.user) {
				const userId =
					variables.user._id ||
					variables.user.id ||
					variables.user.userId;

				queryClient.setQueryData(['cart', userId], cart);
			}

			await queryClient.invalidateQueries({
				queryKey: ['cart'],
			});
		},

		onError: (error) => {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					'Failed to add cart',
				{
					id: 'add-cart',
				}
			);
		},
	});
}

// --------------------------------------------------
// Remove from cart
// --------------------------------------------------

export function useRemoveFromCart() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ userId, productId, variantId = null }) => {
			const normalizedVariantId = normalizeVariantId(variantId);

			// --------------------------------------------
			// Guest
			// --------------------------------------------

			if (!userId) {
				const cart = getGuestCart();

				const updatedCart = cart.filter(
					(item) =>
						!isSameCartItem(item, productId, normalizedVariantId)
				);

				saveGuestCart(updatedCart);

				return updatedCart;
			}

			// --------------------------------------------
			// Logged in
			// --------------------------------------------

			let url = `/api/cart?userId=${userId}` + `&productId=${productId}`;

			if (normalizedVariantId) {
				url += `&variantId=${normalizedVariantId}`;
			}

			const res = await axios.delete(url);

			return res.data?.cart || [];
		},

		onMutate: () => {
			toast.loading('Removing from cart...', {
				id: 'remove-cart',
			});
		},

		onSuccess: async (cart, variables) => {
			toast.success('Removed from cart', {
				id: 'remove-cart',
			});

			if (variables.userId) {
				queryClient.setQueryData(['cart', variables.userId], cart);
			}

			await queryClient.invalidateQueries({
				queryKey: ['cart'],
			});
		},

		onError: (error) => {
			toast.error(
				error.response?.data?.error ||
					error.message ||
					'Failed to remove item',
				{
					id: 'remove-cart',
				}
			);
		},
	});
}

// --------------------------------------------------
// Guest Cart Helpers
// --------------------------------------------------

function getGuestCart() {
	if (typeof window === 'undefined') {
		return [];
	}

	try {
		const data = localStorage.getItem(CART_STORAGE_KEY);

		if (!data) return [];

		const cart = JSON.parse(data);

		if (!Array.isArray(cart)) {
			return [];
		}

		return cart
			.filter((item) => item && item._id && Number(item.quantity) > 0)
			.map((item) => ({
				...item,

				variantId: normalizeVariantId(item.variantId),

				price: Number(
					item.price ?? item.sellPrice ?? item.regularPrice ?? 0
				),

				quantity: Number(item.quantity),
			}));
	} catch (error) {
		console.error('Guest cart read error:', error);

		return [];
	}
}

function saveGuestCart(cart) {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
	} catch (error) {
		console.error('Guest cart save error:', error);
	}
}

// --------------------------------------------------
// Initialize Cart
// --------------------------------------------------

export function useInitializeCart(user) {
	const dispatch = useDispatch();

	const userId = user?._id || user?.id || user?.userId || null;

	useEffect(() => {
		let cancelled = false;

		const initializeCart = async () => {
			try {
				// --------------------------------------
				// 1. Read guest cart
				// --------------------------------------

				const guestCart = getGuestCart();

				// --------------------------------------
				// 2. Guest user
				// --------------------------------------

				if (!userId) {
					if (!cancelled) {
						dispatch(setCart(guestCart));

						dispatch(hydrateCart());
					}

					return;
				}

				// --------------------------------------
				// 3. Logged-in user
				// --------------------------------------

				const res = await axios.get(`/api/cart?userId=${userId}`);

				const backendCart = res.data?.cart || [];

				// --------------------------------------
				// 4. Merge
				// --------------------------------------

				const mergedCart = mergeCarts(backendCart, guestCart);

				// --------------------------------------
				// 5. Sync guest cart
				// --------------------------------------

				if (guestCart.length > 0) {
					for (const item of guestCart) {
						try {
							await axios.post('/api/cart', {
								user: userId,

								productId: item._id,

								// VERY IMPORTANT
								variantId: normalizeVariantId(item.variantId),

								quantity: item.quantity,
							});
						} catch (error) {
							console.error(
								'Failed to sync cart item:',
								item._id,
								item.variantId,
								error
							);
						}
					}
				}

				// --------------------------------------
				// 6. Fetch final database cart
				// --------------------------------------

				const finalRes = await axios.get(`/api/cart?userId=${userId}`);

				const finalCart = finalRes.data?.cart || mergedCart;

				// --------------------------------------
				// 7. Redux update
				// --------------------------------------

				if (!cancelled) {
					dispatch(setCart(normalizeCart(finalCart)));

					// Login হলে guest cart clear
					localStorage.removeItem(CART_STORAGE_KEY);
				}
			} catch (error) {
				console.error('Cart initialization error:', error);

				// Backend error হলেও local cart হারাবে না
				if (!cancelled) {
					dispatch(setCart(getGuestCart()));
				}
			}
		};

		initializeCart();

		return () => {
			cancelled = true;
		};
	}, [userId, dispatch]);
}

// --------------------------------------------------
// Normalize backend cart
// --------------------------------------------------

function normalizeCart(cart) {
	if (!Array.isArray(cart)) {
		return [];
	}

	return cart
		.map((item) => {
			/*
			 * Backend flat format from
			 * our updated /api/cart:
			 *
			 * {
			 *   _id,
			 *   variantId,
			 *   quantity,
			 *   price,
			 *   ...
			 * }
			 */

			if (item?._id && !item?.product) {
				return {
					...item,

					variantId: normalizeVariantId(item.variantId),

					price: Number(
						item.price ?? item.sellPrice ?? item.regularPrice ?? 0
					),

					quantity: Number(item.quantity || 1),
				};
			}

			/*
			 * Old/backend populated format:
			 *
			 * {
			 *   product: {...},
			 *   variantId,
			 *   quantity,
			 *   price
			 * }
			 */

			if (item?.product?._id) {
				return {
					...item.product,

					variantId: normalizeVariantId(
						item.variantId ?? item.product.variantId
					),

					price: Number(
						item.price ??
							item.product.price ??
							item.product.sellPrice ??
							item.product.regularPrice ??
							0
					),

					quantity: Number(item.quantity || 1),
				};
			}

			return null;
		})
		.filter(Boolean);
}

// --------------------------------------------------
// Merge carts
// --------------------------------------------------

function mergeCarts(backendCart, guestCart) {
	const backend = normalizeCart(backendCart);

	const local = normalizeCart(guestCart);

	const map = new Map();

	// --------------------------------------------
	// Database first
	// --------------------------------------------

	backend.forEach((item) => {
		const key = getCartItemKey(item);

		map.set(key, {
			...item,

			variantId: normalizeVariantId(item.variantId),

			quantity: Number(item.quantity || 0),
		});
	});

	// --------------------------------------------
	// Guest cart
	// --------------------------------------------

	local.forEach((item) => {
		const key = getCartItemKey(item);

		const existing = map.get(key);

		if (existing) {
			/*
			 * SAME product + SAME variant
			 * => quantity merge
			 */

			map.set(key, {
				...existing,

				quantity:
					Number(existing.quantity || 0) + Number(item.quantity || 0),
			});
		} else {
			/*
			 * Different variant
			 * => separate cart item
			 */

			map.set(key, {
				...item,

				variantId: normalizeVariantId(item.variantId),

				quantity: Number(item.quantity || 1),
			});
		}
	});

	return Array.from(map.values());
}

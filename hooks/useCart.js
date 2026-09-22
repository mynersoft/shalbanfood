'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import axios from 'axios';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import { setCart, hydrateCart } from '@/redux/store/slices/cartSlice';

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
			// --------------------------------------------
			// Guest
			// --------------------------------------------

			if (!user) {
				const currentCart = getGuestCart();

				const existing = currentCart.find(
					(item) => item._id === product._id
				);

				let updatedCart;

				if (existing) {
					updatedCart = currentCart.map((item) =>
						item._id === product._id
							? {
									...item,
									quantity:
										Number(item.quantity || 0) +
										Number(quantity),
								}
							: item
					);
				} else {
					updatedCart = [
						...currentCart,
						{
							...product,
							quantity: Math.max(1, Number(quantity)),
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
				quantity,
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

			// Update React Query cache immediately
			if (variables.user) {
				queryClient.setQueryData(
					['cart', variables.user._id || variables.user.id],
					cart
				);
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
		mutationFn: async ({ userId, productId }) => {
			// Guest
			if (!userId) {
				const cart = getGuestCart();

				const updatedCart = cart.filter(
					(item) => item._id !== productId
				);

				saveGuestCart(updatedCart);

				return updatedCart;
			}

			// Logged in
			const res = await axios.delete(
				`/api/cart?userId=${userId}&productId=${productId}`
			);

			return res.data?.cart || [];
		},

		onMutate: () => {
			toast.loading('Removing from cart...', {
				id: 'remove-cart',
			});
		},

		onSuccess: async () => {
			toast.success('Removed from cart', {
				id: 'remove-cart',
			});

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
		const data = localStorage.getItem('shalbanCart');

		if (!data) return [];

		const cart = JSON.parse(data);

		return Array.isArray(cart) ? cart : [];
	} catch (error) {
		console.error('Guest cart read error:', error);

		return [];
	}
}

function saveGuestCart(cart) {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem('shalbanCart', JSON.stringify(cart));
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
				// ------------------------------------------
				// 1. Read guest cart
				// ------------------------------------------

				const guestCart = getGuestCart();

				// ------------------------------------------
				// 2. Guest user
				// ------------------------------------------

				if (!userId) {
					if (!cancelled) {
						dispatch(setCart(guestCart));
						dispatch(hydrateCart());
					}

					return;
				}

				// ------------------------------------------
				// 3. Logged-in user
				// ------------------------------------------

				const res = await axios.get(`/api/cart?userId=${userId}`);

				const backendCart = res.data?.cart || [];

				// ------------------------------------------
				// 4. Merge guest + database cart
				// ------------------------------------------

				const mergedCart = mergeCarts(backendCart, guestCart);

				// ------------------------------------------
				// 5. Save merged cart to database
				// ------------------------------------------

				if (guestCart.length > 0) {
					for (const item of guestCart) {
						try {
							await axios.post('/api/cart', {
								user: userId,
								productId: item._id,
								quantity: item.quantity,
							});
						} catch (error) {
							console.error(
								'Failed to sync cart item:',
								item._id,
								error
							);
						}
					}
				}

				// ------------------------------------------
				// 6. Fetch final database cart
				// ------------------------------------------

				const finalRes = await axios.get(`/api/cart?userId=${userId}`);

				const finalCart = finalRes.data?.cart || mergedCart;

				// ------------------------------------------
				// 7. Redux update
				// ------------------------------------------

				if (!cancelled) {
					dispatch(setCart(normalizeCart(finalCart)));

					// Login হলে guest cart clear
					localStorage.removeItem('shalbanCart');
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
	if (!Array.isArray(cart)) return [];

	return cart
		.map((item) => {
			// Backend format:
			// { product: {...}, quantity: 2 }

			if (item.product?._id) {
				return {
					...item.product,
					quantity: Number(item.quantity || 1),
				};
			}

			// Already flat:
			// { _id, name, price, quantity }

			if (item._id) {
				return {
					...item,
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

	// Database first
	backend.forEach((item) => {
		map.set(item._id, {
			...item,
			quantity: Number(item.quantity || 0),
		});
	});

	// Add guest quantities
	local.forEach((item) => {
		const existing = map.get(item._id);

		if (existing) {
			map.set(item._id, {
				...existing,
				quantity:
					Number(existing.quantity || 0) + Number(item.quantity || 0),
			});
		} else {
			map.set(item._id, {
				...item,
				quantity: Number(item.quantity || 1),
			});
		}
	});

	return Array.from(map.values());
}

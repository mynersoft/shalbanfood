'use client';

import { addToCart } from '@/store/slices/cartSlice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

// Fetch cart for a user
export function useCart(userId) {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axios.get(`/api/cart?userId=${userId}`);
      return res.data.cart;
    },
    enabled: !!userId, // only run if userId exists
  });
}

// Helper to get cart from localStorage for guests
function getGuestCart() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('guestCart') || '[]');
}

function setGuestCart(cart) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('guestCart', JSON.stringify(cart));
}

// Add product to cart
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, product, quantity }) => {
      if (!user) {
        // Guest user: save in localStorage
        let cart = getGuestCart();
        const exists = cart.find((item) => item.product._id === product._id);
        if (exists) {
          exists.quantity += quantity;
        } else {
          cart.push({ product, quantity });
        }

        setGuestCart(cart);
        return cart;
      }

      // Logged-in user: save in backend
      const res = await axios.post('/api/cart', {
        user,
        productId: product._id,
        quantity,
      });
      return res.data.cart;
    },
    onMutate: () => toast.loading('Adding to cart...', { id: 'add-cart' }),
    onSuccess: (cart) => {
      toast.success('Added to cart!', { id: 'add-cart' });
      queryClient.invalidateQueries(['cart']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message, {
        id: 'add-cart',
      });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId }) => {
      if (!userId) {
        // Guest user
        let cart = getGuestCart();
        cart = cart.filter((item) => item.product._id !== productId);
        setGuestCart(cart);
        return cart;
      }

      // Logged-in user
      const res = await axios.delete(
        `/api/cart?userId=${userId}&productId=${productId}`
      );
      return res.data.cart;
    },
    onMutate: () =>
      toast.loading('Removing from cart...', { id: 'remove-cart' }),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
    onError: (err) =>
      toast.error(err.response?.data?.error || err.message, {
        id: 'remove-cart',
      }),
  });
}

// Hook to initialize cart on app load
export const useInitializeCart = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const guestCart = getGuestCart();
        console.log(guestCart);
        let mergedCart = [];

        if (userId) {
          try {
            // Get backend cart
            const res = await axios.get(`/api/cart?userId=${userId}`);
            const backendCart = res.data.cart || [];

            // Merge locally
            mergedCart = mergeLocally(backendCart, guestCart);

            // Clear localStorage
            localStorage.setItem('mergedCart');
          } catch (error) {
            console.warn('Using guest cart due to backend error');
            mergedCart = guestCart;
          }
        } else if (userId) {
        } else {
          // Guest user
          mergedCart = guestCart;
        }

        dispatch(addToCart(mergedCart));
      } catch (error) {
        console.error('Cart init error:', error);
      }
    };

    initializeCart();
  }, [userId, dispatch]);
};

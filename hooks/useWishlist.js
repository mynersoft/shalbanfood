'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {
  setWishlist,
  removeFromWishlist,
  addToWishlist,
} from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export function useWishlists(isLoggedIn) {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['wishlists'],
    enabled: !!isLoggedIn,
    queryFn: async () => {
      const res = await axios.get('/api/wishlists');
      dispatch(setWishlist(res.data));
      return res.data;
    },
    onSuccess: (items) => {},
    onError: () => {
      toast.error('Failed to fetch wishlist');
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddWishlist(isLoggedIn) {
  const qc = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (product) => {
      if (!isLoggedIn) {
        // Guest → local only
        return product;
      }

      const res = await axios.post('/api/wishlists', {
        productId: product._id,
      });

      return res.data;
    },

    onMutate: async (product) => {
      // Optimistic UI
      dispatch(addToWishlist(product));
    },

    onSuccess: () => {
      if (isLoggedIn) {
        qc.invalidateQueries(['wishlists']);
      }
      toast.success('Added to wishlist ❤️');
    },

    onError: (_err, product) => {
      dispatch(removeFromWishlist(product._id));
      toast.error('Failed to add wishlist');
    },
  });
}

export const useDeleteWishlist = (isLoggedIn) => {
  const qc = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (productId) => {
      if (!isLoggedIn) return productId;

      await axios.delete(`/api/wishlists/${productId}`);
      return productId;
    },

    onMutate: (productId) => {
      dispatch(removeFromWishlist(productId));
    },

    onSuccess: () => {
      if (isLoggedIn) {
        qc.invalidateQueries(['wishlists']);
      }
      toast.success('Removed from wishlist');
    },

    onError: () => {
      toast.error('Failed to remove wishlist');
    },
  });
};

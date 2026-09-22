'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {
  setCombos,
  addCombo,
  setSingleCombo,
} from '@/store/slices/comboSlice';
import toast from 'react-hot-toast';

export function useCombos() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['combos'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/combos');     
      dispatch(setCombos(res.data.combos));
      return res.data.combos;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Combos: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Combos fetched successfully');
    },
  });
}

export function useAddCombo() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post('/api/admin/combos', orderData);
      dispatch(addCombo(res.data));
      return res.data.combo;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['combos']);
      toast.success('Combo added successfully!', { id: 'add-combo' });
    },
    onError: (error) => {
      let message = 'Failed to add Combo';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: 'add-combo' });
    },
  });
}

// single combo  by userId
export function useSingleCombo(userId) {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['combo', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Combo ID is required');
      }
      try {
        const res = await axios.get(`/api/combos/userid/${userId}`);

        if (!res.data.success) {
          throw new Error(res.data.error || 'Failed to fetch combo');
        }
        // Dispatch to Redux store
        if (res.data.combo) {
          dispatch(setSingleCombo(res.data.combo));
        }

        return res.data.combo;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              error.response?.data?.message ||
              'Failed to fetch combo'
          );
        }
        throw error;
      }
    },
    enabled: !!userId, // Only run query if orderId exists
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime in v4)
    onError: (error) => {
      toast.error(`Failed to fetch combo: ${error.message}`);
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Combo details loaded successfully');
      }
    },
  });
}

export const useUpdateComboStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`/api/combos/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(['combos']),
  });
};

export function useDeleteCombo() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/combos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos'] });
      // Show success toast
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      // Show error toast
    },
  });
}

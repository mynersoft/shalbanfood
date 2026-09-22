'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addBogo, removeBogo, setBogos } from '@/store/slices/bogoSlice';

import toast from 'react-hot-toast';

export function useBogos() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['bogos'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/bogos');
      dispatch(setBogos(res.data.bogos));
      console.log(res.data.bogos);

      return res.data.bogos;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Bogos: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Bogos fetched successfully');
    },
  });
}

export function useAddBogo() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post('/api/admin/bogos', orderData);
      dispatch(addBogo(res.data.bogo));
      return res.data.bogo;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['bogos']);
      toast.success('Bogo added successfully!', { id: 'add-bogo' });
    },
    onError: (error) => {
      let message = 'Failed to add Bogo';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: 'add-bogo' });
    },
  });
}

// single bogo  by userId
export function useSingleBogo(userId) {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['bogo', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Bogo ID is required');
      }
      try {
        const res = await axios.get(`/api/bogos/userid/${userId}`);

        if (!res.data.success) {
          throw new Error(res.data.error || 'Failed to fetch bogo');
        }
        // Dispatch to Redux store
        if (res.data.bogo) {
          dispatch(setSingleBogo(res.data.bogo));
        }

        return res.data.bogo;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              error.response?.data?.message ||
              'Failed to fetch bogo'
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
      toast.error(`Failed to fetch bogo: ${error.message}`);
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Bogo details loaded successfully');
      }
    },
  });
}

export const useUpdateBogostatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => axios.patch(`/api/bogos/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(['bogos']),
  });
};

export function useDeleteBogo() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/bogos/${id}`);
      dispatch(removeBogo(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bogos'] });
      toast.success('Bogo deleted successfully');
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast.error(error.message);

      // Show error toast
    },
  });
}

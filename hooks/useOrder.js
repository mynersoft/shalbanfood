'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {
  setOrders,
  addOrder,
  removeOrder,
  setSingleOrder,
} from '@/redux/store/slices/orderSlice';
import toast from 'react-hot-toast';
import { clearCart } from '@/redux/store/slices/cartSlice';

export function useOrders() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axios.get('/api/orders');
      dispatch(setOrders(res.data));
      return res.data.orders;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Orders: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Orders fetched successfully');
    },
  });
}

// single order  by userId
export function useSingleOrder(userId) {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['order', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Order ID is required');
      }
      try {
        const res = await axios.get(`/api/orders/userid/${userId}`);

        if (!res.data.success) {
          throw new Error(res.data.error || 'Failed to fetch order');
        }
        // Dispatch to Redux store
        if (res.data.order) {
          dispatch(setSingleOrder(res.data.order));
        }

        return res.data.order;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              error.response?.data?.message ||
              'Failed to fetch order'
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
      toast.error(`Failed to fetch order: ${error.message}`);
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Order details loaded successfully');
      }
    },
  });
}

export function useAddOrder() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post('/api/orders', orderData);
      dispatch(addOrder(res.data));
      return res.data.order;
    },

    onSuccess: (newOrder) => {
      queryClient.invalidateQueries(['orders']);
      dispatch(clearCart());
      toast.success('Order added successfully!', { id: 'add-order' });
    },
    onError: (error) => {
      let message = 'Failed to add Order';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: 'add-order' });
    },
  });
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`/api/orders/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(['orders']),
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/orders/${id}`);
      return res.data;
    },
    onSuccess: (_data, id) => {
      // Invalidate react-query
      qc.invalidateQueries(['orders']);
      // Update redux slice
      dispatch(removeOrder(id));
      toast.success('Order deleted successfully');
    },
    onError: (err) => {
      toast.error(`Failed to delete order: ${err.message}`);
    },
  });
};

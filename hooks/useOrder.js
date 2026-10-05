'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import axios from 'axios';
import toast from 'react-hot-toast';

import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/store/slices/cartSlice';

// ==========================================
// QUERY KEYS
// ==========================================

export const ORDER_KEYS = {
	all: ['orders'],

	admin: ['admin-orders'],

	user: (userId) => ['user-orders', userId],

	single: (orderId) => ['order', orderId],
};

// ==========================================
// ADMIN: FETCH ALL ORDERS
// ==========================================

export function useAdminOrders() {
	return useQuery({
		queryKey: ORDER_KEYS.admin,

		queryFn: async () => {
			const { data } = await axios.get('/api/orders/all');

			if (data.success === false) {
				throw new Error(data.message || 'Failed to fetch orders');
			}

			return Array.isArray(data.orders) ? data.orders : [];
		},

		staleTime: 30 * 1000,

		refetchOnWindowFocus: true,
	});
}

// ==========================================
// GENERAL ORDERS
// ==========================================

export function useOrders() {
	return useQuery({
		queryKey: ORDER_KEYS.all,

		queryFn: async () => {
			const { data } = await axios.get('/api/orders');

			if (data.success === false) {
				throw new Error(data.message || 'Failed to fetch orders');
			}

			return Array.isArray(data.orders) ? data.orders : [];
		},

		staleTime: 30 * 1000,
	});
}

// ==========================================
// USER ORDERS
// ==========================================

export function useUserOrders(userId) {
	return useQuery({
		queryKey: ORDER_KEYS.user(userId),

		queryFn: async () => {
			const { data } = await axios.get(`/api/orders/user/${userId}`);

			if (data.success === false) {
				throw new Error(data.message || 'Failed to fetch user orders');
			}

			return Array.isArray(data.orders) ? data.orders : [];
		},

		enabled: Boolean(userId),

		staleTime: 30 * 1000,
	});
}

// ==========================================
// SINGLE ORDER
// ==========================================

export function useSingleOrder(orderId) {
	return useQuery({
		queryKey: ORDER_KEYS.single(orderId),

		queryFn: async () => {
			if (!orderId) {
				throw new Error('Order ID is required');
			}

			const { data } = await axios.get(`/api/orders/${orderId}`);

			if (data.success === false) {
				throw new Error(data.message || 'Order not found');
			}

			return data.order || data;
		},

		enabled: Boolean(orderId),

		retry: 1,

		staleTime: 60 * 1000,
	});
}

// ==========================================
// CREATE ORDER
// ==========================================

export function useAddOrder() {
	const queryClient = useQueryClient();

	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (orderData) => {
			const { data } = await axios.post('/api/orders', orderData);

			if (data.success === false) {
				throw new Error(data.message || 'Failed to create order');
			}

			return data.order || data;
		},

		onSuccess: async () => {
			// Cart is CLIENT state
			dispatch(clearCart());

			// Orders are SERVER state
			await queryClient.invalidateQueries({
				queryKey: ORDER_KEYS.all,
			});

			await queryClient.invalidateQueries({
				queryKey: ORDER_KEYS.admin,
			});

			toast.success('Order placed successfully!');
		},

		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					error.message ||
					'Failed to create order'
			);
		},
	});
}

// ==========================================
// UPDATE ORDER
//
// payload can contain:
//
// {
//   status,
//   paymentStatus,
//   trackingNumber,
//   adminNote
// }
// ==========================================

export function useUpdateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }) => {
			if (!id) {
				throw new Error('Order ID is required');
			}

			const { data } = await axios.patch(`/api/orders/${id}`, payload);

			if (data.success === false) {
				throw new Error(data.message || 'Order update failed');
			}

			return data.order || data;
		},

		onSuccess: async (updatedOrder) => {
			// Update currently opened single-order cache
			if (updatedOrder?._id) {
				queryClient.setQueryData(
					ORDER_KEYS.single(updatedOrder._id),
					updatedOrder
				);
			}

			// Refresh admin order list
			await queryClient.invalidateQueries({
				queryKey: ORDER_KEYS.admin,
			});

			// Refresh user orders
			await queryClient.invalidateQueries({
				queryKey: ['user-orders'],
			});

			toast.success('Order updated successfully');
		},

		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					error.message ||
					'Failed to update order'
			);
		},
	});
}

// ==========================================
// UPDATE ORDER STATUS ONLY
//
// Optional backward-compatible hook
// ==========================================

export function useUpdateOrderStatus() {
	const updateOrder = useUpdateOrder();

	return {
		...updateOrder,

		mutate: ({ id, status }, options) => {
			return updateOrder.mutate(
				{
					id,
					payload: {
						status,
					},
				},
				options
			);
		},

		mutateAsync: ({ id, status }) => {
			return updateOrder.mutateAsync({
				id,
				payload: {
					status,
				},
			});
		},
	};
}

// ==========================================
// DELETE ORDER
// ==========================================

export function useDeleteOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id) => {
			if (!id) {
				throw new Error('Order ID is required');
			}

			const { data } = await axios.delete(`/api/orders/${id}`);

			if (data.success === false) {
				throw new Error(data.message || 'Delete failed');
			}

			return {
				id,
				data,
			};
		},

		onSuccess: async ({ id }) => {
			// Remove single order cache
			queryClient.removeQueries({
				queryKey: ORDER_KEYS.single(id),
			});

			// Refresh admin list
			await queryClient.invalidateQueries({
				queryKey: ORDER_KEYS.admin,
			});

			// Refresh user order lists
			await queryClient.invalidateQueries({
				queryKey: ['user-orders'],
			});

			toast.success('Order deleted successfully');
		},

		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					error.message ||
					'Failed to delete order'
			);
		},
	});
}

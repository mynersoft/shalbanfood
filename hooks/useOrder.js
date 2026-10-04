'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import {
	setOrders,
	setAdminOrders,
	setSingleOrder,
	addOrder,
	removeOrder,
} from '@/redux/store/slices/orderSlice';
import { clearCart } from '@/redux/store/slices/cartSlice';

// ==========================================
// ADMIN: FETCH ALL ORDERS
// ==========================================
export function useAdminOrders() {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['orders'],
		queryFn: async () => {
			const { data } = await axios.get('/api/orders/all');

			if (data.success === false) {
				throw new Error(data.message || 'Failed to fetch orders');
			}

			const orders = Array.isArray(data.orders) ? data.orders : [];

			dispatch(setAdminOrders(orders));

			return orders;
		},
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
	});
}

// ==========================================
// GENERAL ORDERS
// ==========================================
export function useOrders() {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['orders'],
		queryFn: async () => {
			const { data } = await axios.get('/api/orders');

			if (data.success === false) {
				throw new Error(data.message || 'Failed to fetch orders');
			}

			const orders = Array.isArray(data.orders) ? data.orders : [];

			dispatch(setOrders(orders));

			return orders;
		},
		staleTime: 30 * 1000,
	});
}

// ==========================================
// USER ORDERS
// ==========================================
export function useUserOrders(userId) {
	return useQuery({
		queryKey: ['user-orders', userId],
		queryFn: async () => {
			const { data } = await axios.get(`/api/orders/user/${userId}`);
			return data;
		},
		enabled: Boolean(userId),
	});
}

// ==========================================
// SINGLE ORDER
// ==========================================
export function useSingleOrder(orderId) {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['order', orderId],
		queryFn: async () => {
			if (!orderId) throw new Error('Order ID is required');

			const { data } = await axios.get(`/api/orders/${orderId}`);

			const order = data.order || data;

			if (!order || data.success === false) {
				throw new Error(data.message || 'Order not found');
			}

			dispatch(setSingleOrder(order));

			return order;
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
		onSuccess: (order) => {
			dispatch(addOrder(order));
			dispatch(clearCart());

			queryClient.invalidateQueries({ queryKey: ['orders'] });
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
// ADMIN: UPDATE ORDER
// Payload: status, paymentStatus, trackingNumber, adminNote
// ==========================================
export function useUpdateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }) => {
			if (!id) throw new Error('Order ID is required');

			const { data } = await axios.patch(`/api/orders/${id}`, payload);

			if (data.success === false) {
				throw new Error(data.message || 'Order update failed');
			}

			return data.order || data;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['orders'] }),
				queryClient.invalidateQueries({ queryKey: ['user-orders'] }),
			]);

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

// Backward-compatible status-only hook
export function useUpdateOrderStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, status }) => {
			const { data } = await axios.patch(`/api/orders/${id}`, {
				status,
			});
			if (data.success === false) {
				throw new Error(data.message || 'Status update failed');
			}
			return data.order || data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			toast.success('Order status updated');
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					error.message ||
					'Failed to update status'
			);
		},
	});
}

// ==========================================
// ADMIN: DELETE ORDER
// ==========================================
export function useDeleteOrder() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (id) => {
			const { data } = await axios.delete(`/api/orders/${id}`);

			if (data.success === false) {
				throw new Error(data.message || 'Delete failed');
			}

			return { id, data };
		},
		onSuccess: async ({ id }) => {
			dispatch(removeOrder(id));

			await queryClient.invalidateQueries({ queryKey: ['orders'] });

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

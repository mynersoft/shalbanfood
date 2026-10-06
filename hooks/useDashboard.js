'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const DASHBOARD_KEYS = {
    overview: ['dashboard-overview'],
};

export function useDashboardOverview() {
    return useQuery({
        queryKey: DASHBOARD_KEYS.overview,

        queryFn: async () => {
            const [ordersRes, productsRes, usersRes] =
                await Promise.all([
                    axios.get('/api/orders/all'),
                    axios.get('/api/products?limit=100'),
                    axios.get('/api/users'),
                ]);

            if (ordersRes.data?.success === false) {
                throw new Error(
                    ordersRes.data?.message ||
                        'Failed to fetch orders'
                );
            }

            if (productsRes.data?.success === false) {
                throw new Error(
                    productsRes.data?.message ||
                        'Failed to fetch products'
                );
            }

            const orders = Array.isArray(
                ordersRes.data?.orders
            )
                ? ordersRes.data.orders
                : [];

            const products = Array.isArray(
                productsRes.data?.products
            )
                ? productsRes.data.products
                : [];

            const users = Array.isArray(
                usersRes.data?.users
            )
                ? usersRes.data.users
                : [];

            return {
                orders,
                products,
                users,
            };
        },

        staleTime: 30 * 1000,

        refetchOnWindowFocus: true,
    });
}
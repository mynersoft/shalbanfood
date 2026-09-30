'use client';

import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import axios from 'axios';

import { useDispatch } from 'react-redux';

import {
    setBrands,
    addBrand,
    updateBrand,
    removeBrand,
} from '@/redux/store/slices/brandsSlice';

import toast from 'react-hot-toast';

// ==========================================
// GET BRANDS
// ==========================================
export function useBrands() {
    const dispatch = useDispatch();

    return useQuery({
        queryKey: ['brands'],

        queryFn: async () => {
            const res = await axios.get('/api/brands');

            const brands = res.data?.brands || [];

            dispatch(setBrands(brands));

            return brands;
        },
    });
}

// ==========================================
// ADD BRAND
// ==========================================
export function useAddBrand() {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async (brandData) => {
            const res = await axios.post(
                '/api/brands',
                brandData
            );

            return res.data;
        },

        onSuccess: (data) => {
            if (data?.brand) {
                dispatch(addBrand(data.brand));
            }

            queryClient.invalidateQueries({
                queryKey: ['brands'],
            });

            toast.success(
                data?.message || 'Brand added successfully!',
                {
                    id: 'add-brand',
                }
            );
        },

        onError: (error) => {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to add brand';

            toast.error(message, {
                id: 'add-brand',
            });
        },
    });
}

// ==========================================
// UPDATE BRAND
// ==========================================
export function useUpdateBrand() {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async ({ id, name }) => {
            const res = await axios.put(
                `/api/brands/${id}`,
                { name }
            );

            return res.data;
        },

        onSuccess: (data) => {
            if (data?.brand) {
                dispatch(updateBrand(data.brand));
            }

            queryClient.invalidateQueries({
                queryKey: ['brands'],
            });

            toast.success(
                data?.message || 'Brand updated successfully!',
                {
                    id: 'update-brand',
                }
            );
        },

        onError: (error) => {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to update brand';

            toast.error(message, {
                id: 'update-brand',
            });
        },
    });
}

// ==========================================
// DELETE BRAND
// ==========================================
export function useDeleteBrand() {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async (id) => {
            const res = await axios.delete(
                `/api/brands/${id}`
            );

            return res.data;
        },

        onSuccess: (data, id) => {
            dispatch(removeBrand(id));

            queryClient.invalidateQueries({
                queryKey: ['brands'],
            });

            toast.success(
                data?.message || 'Brand deleted successfully!'
            );
        },

        onError: (error) => {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete brand';

            toast.error(message);
        },
    });
}
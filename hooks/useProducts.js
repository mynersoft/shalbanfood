'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
} from '@/redux/store/slices/productSlice';

const API_URL = '/api/products';

/* ========================================
   GET PRODUCTS
======================================== */

export function useProducts({
  page = 1,
  limit = 10,
} = {}) {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['products', page, limit],

    queryFn: async () => {
      const response = await axios.get(API_URL, {
        params: {
          page,
          limit,
        },
      });

      const data = response.data || {};

      const products = Array.isArray(data.products)
        ? data.products
        : [];

      dispatch(setProducts(products));

      return {
        products,
        totalProducts: Number(data.totalProducts || 0),
        totalAmount: Number(data.totalAmount || 0),
        page: Number(data.page || page),
        limit: Number(data.limit || limit),
        totalPages: Number(data.totalPages || 1),
      };
    },

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,

    placeholderData: (previousData) => previousData,
  });
}

/* ========================================
   ADD PRODUCT
======================================== */

export function useAddProduct() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        API_URL,
        formData
      );

      return response.data;
    },

    onSuccess: (data) => {
      if (data?.product) {
        dispatch(addProduct(data.product));
      }

      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      toast.success(
        data?.message || 'Product added successfully'
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to add product'
      );
    },
  });
}

/* ========================================
   UPDATE PRODUCT
======================================== */

export function useUpdateProduct() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await axios.put(
        API_URL,
        formData
      );

      return response.data;
    },

    onSuccess: (data) => {
      if (data?.product) {
        dispatch(updateProduct(data.product));
      }

      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      toast.success(
        data?.message || 'Product updated successfully'
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to update product'
      );
    },
  });
}

/* ========================================
   DELETE PRODUCT
======================================== */

export function useDeleteProduct() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(API_URL, {
        params: {
          id,
        },
      });

      return {
        ...response.data,
        id,
      };
    },

    onSuccess: (data) => {
      if (data?.id) {
        dispatch(removeProduct(data.id));
      }

      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      toast.success(
        data?.message || 'Product deleted successfully'
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to delete product'
      );
    },
  });
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {
  setBrands,
  addBrand,
  removeBrand,
} from '@/store/slices/brandsSlice';
import toast from 'react-hot-toast';

export function useBrands() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await axios.get('/api/brands');
      dispatch(setBrands(res.data));
      return res.data.brands;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Brands: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Brands fetched successfully');
    },
  });
}

export function useAddBrand() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (brandData) => {
      const res = await axios.post('/api/brands', brandData);
      dispatch(addBrand(res.data));
      return res.data.brand;
    },

    onSuccess: (newBrand) => {
      queryClient.invalidateQueries(['brands']);
      toast.success('Brand added successfully!', { id: 'add-brand' });
    },
    onError: (error) => {
      let message = 'Failed to add Brand';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: 'add-brand' });
    },
  });
}

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/brands/${id}`);
      return res.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries(['brands']);
      dispatch(removeBrand(id));
      toast.success('Brand deleted successfully');
    },
    onError: (err) => {
      toast.error(`Failed to delete brand: ${err.message}`);
    },
  });
};

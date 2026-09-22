'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setShipping } from '@/store/slices/shippingSlice';
import toast from 'react-hot-toast';

export function useShipping() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['shipping'],
    queryFn: async () => {
      const res = await axios.get('/api/shipping');      
      dispatch(setShipping(res.data));
      return res.data;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Shipping: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Shipping fetched successfully');
    },
  });
}

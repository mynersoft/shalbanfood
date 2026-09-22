'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  setVouchers,
  addVoucher,
  removeVoucher,
  applyVoucher,
} from '@/store/slices/voucherSlice';

export function useVoucher() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['voucher'],
    queryFn: async () => {
      const res = await axios.get('/api/voucher');
      dispatch(setVouchers(res.data));

      return res.data.voucher;
    },
    onError: (error) => {
      toast.error(`Failed to fetch Voucher: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Voucher fetched successfully');
    },
  });
}

export function useAddVoucher() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (voucherData) => {
      const res = await axios.post('/api/voucher', voucherData);
      return res.data.voucher;
    },

    onSuccess: (newVoucher) => {
      dispatch(addVoucher(newVoucher));
      queryClient.invalidateQueries({ queryKey: ['voucher'] });
      toast.success('Voucher added successfully!', { id: 'add-voucher' });
    },

    onError: (error) => {
      let message = 'Failed to add voucher';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
      }
      toast.error(message, { id: 'add-voucher' });
    },
  });
}

export function useApplyVoucher() {
	const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (voucherData) => {
      const res = await axios.post('/api/voucher/apply-voucher', voucherData);
      return res.data;
    },

    onSuccess: (newVoucher) => {		
		  dispatch(applyVoucher(newVoucher.voucher));
      toast.success('Voucher added successfully!', { id: 'apply-voucher' });
    },

	  onError: (error) => {
		console.log(error);
		
      let message = 'Failed to apply voucher';
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
      }
      toast.error(message, { id: 'apply-voucher' });
    },
  });
}

export const useUpdateVouchertatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`/api/voucher/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(['voucher']),
  });
};

export const useDeleteVoucher = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/voucher/${id}`);
      return res.data;
    },
    onSuccess: (_data, id) => {
      // Invalidate react-query
      qc.invalidateQueries(['voucher']);
      // Update redux slice
      dispatch(removeVoucher(id));
      toast.success('Voucher deleted successfully');
    },
    onError: (err) => {
      toast.error(`Failed to delete voucher: ${err.message}`);
    },
  });
};

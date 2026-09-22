import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  setVendor,
  setVendorStats,
  setRecentActivities,
  updateVendor,
  setLoading,
  setError,
  addActivity,
} from '@/store/slices/vendorSlice';

const API_BASE = '/api/vendor';

// Fetch vendor profile
export function useVendor() {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['vendor'],
    queryFn: async () => {
      dispatch(setLoading(true));
      try {
        const res = await axios.get(`${API_BASE}/profile`);
        dispatch(setVendor(res.data.vendor));
        dispatch(setVendorStats(res.data.stats));
        dispatch(setRecentActivities(res.data.activities));
        return res.data;
      } catch (error) {
        dispatch(setError(error.message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    onError: (error) => {
      toast.error(`Failed to fetch vendor data: ${error.message}`);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// Update vendor profile
export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (vendorData) => {
      const res = await axios.put(`${API_BASE}/profile`, vendorData);
      return res.data;
    },
    onMutate: () => {
      toast.loading('Updating profile...', { id: 'update-vendor' });
    },
    onSuccess: (data) => {
      dispatch(updateVendor(data.vendor));
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      dispatch(addActivity({
        type: 'profile',
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      }));
      toast.success('Profile updated successfully!', { id: 'update-vendor' });
    },
    onError: (error) => {
      let message = 'Failed to update profile';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || error.response?.data?.message || error.message;
      }
      toast.error(message, { id: 'update-vendor' });
    },
  });
}

// Update vendor avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post(`${API_BASE}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onMutate: () => {
      toast.loading('Uploading avatar...', { id: 'upload-avatar' });
    },
    onSuccess: (data) => {
      dispatch(updateVendor({ avatar: data.avatarUrl }));
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      dispatch(addActivity({
        type: 'profile',
        message: 'Profile picture updated',
        timestamp: new Date().toISOString(),
      }));
      toast.success('Avatar updated successfully!', { id: 'upload-avatar' });
    },
    onError: (error) => {
      let message = 'Failed to upload avatar';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || error.message;
      }
      toast.error(message, { id: 'upload-avatar' });
    },
  });
}
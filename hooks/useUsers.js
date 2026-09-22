'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getAllUsers } from '@/store/slices/userSlice';
import { useDispatch } from 'react-redux';

// Fetch all users
export function useUsers() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('/api/users');
      dispatch(getAllUsers(res.data));
      return res.data;
    },
    onError: (err) => toast.error('Failed to fetch users: ' + err.message),
  });
}

// Delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`/api/users/${id}`);
      return res.data;
    },
    onMutate: () => toast.loading('Deleting user...', { id: 'delete-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully!', { id: 'delete-user' });
    },
    onError: (err) =>
      toast.error('Failed to delete user: ' + err.message, {
        id: 'delete-user',
      }),
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await axios.put(`/api/users/${id}`, { role });
      return res.data;
    },
    onMutate: () => toast.loading('Updating role...', { id: 'update-role' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated!', { id: 'update-role' });
    },
    onError: (err) =>
      toast.error('Failed to update role: ' + err.message, {
        id: 'update-role',
      }),
  });
}

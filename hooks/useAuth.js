'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { setUser, clearUser } from '@/redux/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('/api/users');
      return res.data;
    },
    onError: (err) => toast.error('Failed to fetch users: ' + err.message),
  });
}

export default function useLoginUser() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser(session.user));
    } else {
      dispatch(clearUser());
    }
  }, [session, dispatch]);

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
  };
}

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

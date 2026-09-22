'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setStatcards } from '@/store/slices/statCardSlice';

export const useStatCard = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['statcards'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/statcard');
        dispatch(setStatcards(res.data.statcard));

      return res.data.statcard;
    },
    onSuccess: (data) => {
    
    },
    refetchInterval: 120000, // auto refresh every 2 min
    staleTime: 10000, // optional
  });
};

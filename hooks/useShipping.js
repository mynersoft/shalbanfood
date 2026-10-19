'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useShippingCost = () => {
	return useQuery({
		queryKey: ['shipping-cost'],
		queryFn: async () => {
			const { data } = await axios.get('/api/shipping');
			return data;
		},
		staleTime: 5 * 60 * 1000,
	});
};

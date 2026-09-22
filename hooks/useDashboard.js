'use client';

import { useQuery,  } from '@tanstack/react-query';

import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	setProducts,
} from '@/redux/store/slices/dashboardSlice';

import toast from 'react-hot-toast';

/* =========================================================
   FETCH Dashboard data
========================================================= */

export function useProducts() {
	const dispatch = useDispatch();

	const query = useQuery({
		queryKey: ['dashboard'],

		queryFn: async () => {
			const res = await axios.get('/api/dashboard');

			if (!res.data?.success) {
				throw new Error(
					res.data?.message || 'Failed to fetch products'
				);
			}

			// API returns:
			// {
			//   success: true,
			//   products: [...]
			// }

			return res.data.products || [];
		},

		staleTime: 1000 * 60 * 5,

		refetchOnWindowFocus: false,

		retry: 1,
	});

	/* -----------------------------------------
     Sync React Query → Redux
  ----------------------------------------- */

	useEffect(() => {
		if (query.data) {
			dispatch(setProducts(query.data));
		}
	}, [query.data, dispatch]);

	/* -----------------------------------------
     Error Toast
  ----------------------------------------- */

	useEffect(() => {
		if (query.isError) {
			toast.error(
				`Failed to fetch products: ${
					query.error?.message || 'Something went wrong'
				}`
			);
		}
	}, [query.isError, query.error]);

	return query;
}

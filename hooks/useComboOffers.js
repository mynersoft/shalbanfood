'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/axios';

const ENDPOINT = '/combooffer';

export const comboOfferKeys = {
	all: ['combo-offers'],
	lists: () => [...comboOfferKeys.all, 'list'],
	list: (filters = {}) => [...comboOfferKeys.lists(), filters],
	details: () => [...comboOfferKeys.all, 'detail'],
	detail: (id) => [...comboOfferKeys.details(), id],
};

// GET: Fetch all offers
export function useComboOffers(filters = {}) {
	return useQuery({
		queryKey: comboOfferKeys.list(filters),
		queryFn: async () => {
			const params = {};

			if (filters.featured === true) {
				params.featured = 'true';
			}

			if (filters.admin === true) {
				params.admin = 'true';
			}

			const { data } = await api.get(ENDPOINT, {
				params,
				headers: { 'Cache-Control': 'no-store' },
			});

			return data.offers ?? [];
		},
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: 'always',
	});
}

// GET: Fetch one offer by ID
export function useComboOffer(id) {
	return useQuery({
		queryKey: comboOfferKeys.detail(id),
		queryFn: async () => {
			const { data } = await api.get(
				`${ENDPOINT}/${encodeURIComponent(id)}`
			);

			return data.offer;
		},
		enabled: Boolean(id),
	});
}

// POST: Create offer
export function useCreateComboOffer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload) => {
			const { data } = await api.post(ENDPOINT, payload);
			return data.offer;
		},
		onSuccess: (createdOffer) => {
			queryClient.invalidateQueries({
				queryKey: comboOfferKeys.all,
			});

			if (createdOffer?._id) {
				queryClient.setQueryData(
					comboOfferKeys.detail(createdOffer._id),
					createdOffer
				);
			}
		},
	});
}

// PUT: Update offer
export function useUpdateComboOffer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }) => {
			const { data } = await api.put(
				`${ENDPOINT}/${encodeURIComponent(id)}`,
				payload
			);

			return data.offer;
		},
		onSuccess: (updatedOffer) => {
			queryClient.invalidateQueries({
				queryKey: comboOfferKeys.all,
			});

			if (updatedOffer?._id) {
				queryClient.setQueryData(
					comboOfferKeys.detail(updatedOffer._id),
					updatedOffer
				);
			}
		},
	});
}

// DELETE: Delete offer
export function useDeleteComboOffer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id) => {
			const { data } = await api.delete(
				`${ENDPOINT}/${encodeURIComponent(id)}`
			);

			return { id, data };
		},
		onSuccess: ({ id }) => {
			queryClient.removeQueries({
				queryKey: comboOfferKeys.detail(id),
			});

			queryClient.invalidateQueries({
				queryKey: comboOfferKeys.all,
			});
		},
	});
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export async function fetchDashboardOverview() {
	const res = await fetch('/api/dashboard', {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Accept: 'application/json',
		},
	});

	const contentType = res.headers.get('content-type') || '';

	if (!contentType.includes('application/json')) {
		const responseText = await res.text();

		console.error('Dashboard API returned non-JSON:', {
			status: res.status,
			response: responseText.slice(0, 200),
		});

		throw new Error(
			`Dashboard API returned HTML/non-JSON (HTTP ${res.status}). Check API route and deployment.`
		);
	}

	const data = await res.json();

	if (!res.ok || data.success === false) {
		throw new Error(
			data.message || `Dashboard request failed (HTTP ${res.status})`
		);
	}

	return data;
}

export function useDashboardOverview() {
	return useQuery({
		queryKey: ['dashboard-overview'],
		queryFn: fetchDashboardOverview,
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
	});
}

async function updateVariantStock({ productId, variantId, stock }) {
	const response = await fetch(
		`/api/products/${productId}/variants/${variantId}/stock`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ stock }),
		}
	);

	const contentType = response.headers.get('content-type') || '';

	if (!contentType.includes('application/json')) {
		throw new Error('সার্ভার থেকে সঠিক response পাওয়া যায়নি।');
	}

	const result = await response.json();

	if (!response.ok || result.success === false) {
		throw new Error(result.message || 'স্টক আপডেট ব্যর্থ হয়েছে।');
	}

	return result;
}

export function useUpdateVariantStock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateVariantStock,

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['products'],
				}),
				queryClient.invalidateQueries({
					queryKey: ['dashboard-overview'],
				}),
			]);
		},
	});
}

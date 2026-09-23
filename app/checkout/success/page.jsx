'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Invoice from '@/components/Order/Invoice';
import FancyLoader from '@/components/Loader/FancyLoader';

function InvoiceContent() {
	const searchParams = useSearchParams();

	const orderId = searchParams.get('orderId');

	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!orderId) {
			setError('Order ID not found');
			setLoading(false);
			return;
		}

		const fetchOrder = async () => {
			try {
				setLoading(true);
				setError('');

				const res = await fetch(
					`/api/orders?orderId=${encodeURIComponent(orderId)}`,
					{
						method: 'GET',
						cache: 'no-store',
					}
				);

				const data = await res.json();

				console.log('ORDER API:', data);

				if (!res.ok || !data.success) {
					throw new Error(data.message || 'Failed to fetch order');
				}

				setOrder(data.order);
			} catch (error) {
				console.error('FETCH ORDER ERROR:', error);
				setError(error.message || 'Failed to load order');
			} finally {
				setLoading(false);
			}
		};

		fetchOrder();
	}, [orderId]);

	if (loading) {
		return <FancyLoader />;
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-red-500">
						Order not found
					</h2>

					<p className="mt-2 text-gray-500">{error}</p>

					<p className="mt-2 text-sm text-gray-400">
						Order ID: {orderId || 'N/A'}
					</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return <FancyLoader />;
	}

	return <Invoice order={order} />;
}

export default function InvoicePage() {
	return (
		<Suspense fallback={<FancyLoader />}>
			<InvoiceContent />
		</Suspense>
	);
}

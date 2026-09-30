import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

function CheckoutLoading() {
	return (
		<div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
			<div className="text-center">
				<div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />

				<p className="text-sm text-gray-500 mt-4">
					Loading checkout...
				</p>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	return (
		<Suspense fallback={<CheckoutLoading />}>
			<CheckoutClient />
		</Suspense>
	);
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import OfferForm from '@/components/Combo/OfferForm';

export const metadata = {
	title: 'Create Combo Offer | Shalban Food',
};

export default function CreateOfferPage() {
	return (
		<main className="min-h-screen bg-gray-50 p-4 sm:p-6">
			<div className="mx-auto max-w-5xl">
				<Link
					href="/dashboard/admin/offers"
					className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700">
					<ArrowLeft size={16} />
					Back to Offers
				</Link>

				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
						Create Combo Offer
					</h1>

					<p className="mt-1 text-sm text-gray-500">
						Create a time-limited combo offer for Shalban Food.
					</p>
				</div>

				<OfferForm />
			</div>
		</main>
	);
}

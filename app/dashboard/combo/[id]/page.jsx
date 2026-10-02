import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import {connectDB} from '@/lib/dbConnect';
import ComboOffer from '@/models/ComboOffer';

import OfferForm from '@/components/Combo/OfferForm';

export const dynamic = 'force-dynamic';

async function getOffer(id) {
	await connectDB();

	const offer = await ComboOffer.findById(id).lean();

	if (!offer) return null;

	return JSON.parse(JSON.stringify(offer));
}

export default async function EditOfferPage({ params }) {
	const { id } = await params;

	const offer = await getOffer(id);

	if (!offer) {
		notFound();
	}

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
						Edit Combo Offer
					</h1>

					<p className="mt-1 text-sm text-gray-500">
						Update offer information, pricing, stock and schedule.
					</p>
				</div>

				<OfferForm offer={offer} />
			</div>
		</main>
	);
}

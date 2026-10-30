'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import OfferForm from '@/app/dashboard/components/Combo/OfferForm';

export default function EditComboOfferPage() {
	const params = useParams();
	const router = useRouter();

	const id = params?.id;

	const [offer, setOffer] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchOffer = useCallback(async () => {
		if (!id) return;

		setLoading(true);

		try {
			// প্রথমে সব অফার নিয়ে ID অনুযায়ী খোঁজা হচ্ছে
			const response = await fetch('/api/combooffer?admin=true', {
				cache: 'no-store',
				headers: {
					Accept: 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'অফার লোড করা যায়নি');
			}

			const offers = Array.isArray(data.offers) ? data.offers : [];

			const selectedOffer = offers.find(
				(item) => String(item._id) === String(id)
			);

			if (!selectedOffer) {
				throw new Error('অফারটি খুঁজে পাওয়া যায়নি');
			}

			setOffer(selectedOffer);
		} catch (error) {
			console.error('FETCH OFFER ERROR:', error);
			toast.error(error.message || 'অফার লোড করা যায়নি');
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchOffer();
	}, [fetchOffer]);

	if (loading) {
		return (
			<div className="flex min-h-64 items-center justify-center">
				<p className="text-sm text-gray-500">
					অফারের তথ্য লোড হচ্ছে...
				</p>
			</div>
		);
	}

	if (!offer) {
		return (
			<div className="mx-auto max-w-xl p-6 text-center">
				<h1 className="text-xl font-bold">অফার পাওয়া যায়নি</h1>

				<Link
					href="/dashboard/combo"
					className="mt-4 inline-block rounded-lg bg-[#1f5d3b] px-5 py-3 text-white">
					অফারের তালিকায় ফিরে যান
				</Link>
			</div>
		);
	}

	return (
		<main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
			<div>
				<Link
					href="/dashboard/combo"
					className="text-sm text-[#1f5d3b] hover:underline">
					← অফারের তালিকায় ফিরে যান
				</Link>

				<h1 className="mt-3 text-2xl font-bold text-gray-900">
					কম্বো অফার এডিট করুন
				</h1>

				<p className="mt-1 text-sm text-gray-500">
					{offer.name} — প্রয়োজনীয় তথ্য পরিবর্তন করে আপডেট করুন।
				</p>
			</div>

			<OfferForm offer={offer} />
		</main>
	);
}

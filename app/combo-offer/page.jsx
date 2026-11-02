'use client';
import Link from 'next/link';

import {
	ArrowLeft,
	ArrowRight,
	Gift,
	ShoppingBag,
	Sparkles,
} from 'lucide-react';


import OfferCard from '@/app/dashboard/components/Combo/OfferCard';
import { useComboOffers } from '@/hooks/useComboOffers';




export default function OffersPage() {
	const { data, isLoading, isError } = useComboOffers();
	const offers = data ?? [];
	const hasOffers = offers.length > 0;

	return (
		<main className="min-h-screen bg-[#fafbf9] text-gray-900">
			{/* Header */}
			<section className="border-b border-gray-100 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1f5d3b]">
						<ArrowLeft size={16} />
						Home
					</Link>
				</div>
			</section>

		

			{/* Offer listing */}
			<section
				id="available-offers"
				className="mx-auto max-w-7xl scroll-mt-2 px-4 py-5 sm:px-6 sm:py-14 lg:px-8">
				<div className="mb-7 flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1f5d3b]">
							Special Bundles
						</p>
						<h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
						Shalban food  combo offer
						</h2>
						<p className="mt-2 text-sm leading-6 text-gray-500">
							আপনার প্রয়োজন অনুযায়ী সেরা কম্বোটি বেছে নিন।
						</p>
					</div>

					{hasOffers && (
						<span className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600">
							{offers.length}টি অফার
						</span>
					)}
				</div>

				{isLoading ? (
					<div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center">
						<Gift className="mx-auto animate-pulse text-gray-300" size={42} />
						<h3 className="mt-4 text-lg font-bold">
							অফার লোড করা হচ্ছে...
						</h3>
					</div>
				) : isError ? (
					<div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center">
						<Gift className="mx-auto text-gray-300" size={42} />
						<h3 className="mt-4 text-lg font-bold">
							অফার লোড করা যাচ্ছে না
						</h3>
						<p className="mt-2 text-sm text-gray-500">
							অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
						</p>
					</div>
				) : !hasOffers ? (
					<div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center sm:py-20">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f5d3b]/5 text-[#1f5d3b]">
							<Gift size={32} strokeWidth={1.5} />
						</div>

						<h3 className="mt-5 text-xl font-bold">
							বর্তমানে কোনো সক্রিয় কম্বো অফার নেই
						</h3>

						<p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-500">
							নতুন অফার প্রকাশিত হলে এখানে দেখতে পাবেন। ততক্ষণে
							আমাদের পণ্যগুলো ঘুরে দেখতে পারেন।
						</p>

						<Link
							href="/shop"
							className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f5d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
							<ShoppingBag size={17} />
							সব পণ্য দেখুন
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
						{offers.map((offer) => (
							<OfferCard key={offer._id} offer={offer} />
						))}
					</div>
				)}

				{/* Bottom note */}
				<div className="mt-8 flex flex-col gap-2 rounded-xl border border-[#1f5d3b]/10 bg-white px-4 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">					
					<Link
						href="/shop"
						className="inline-flex items-center gap-1 font-semibold text-[#1f5d3b] hover:underline">
					সব পণ্য দেখুন <ArrowRight size={15} />
					</Link>
				</div>
			</section>
		</main>
	);
}

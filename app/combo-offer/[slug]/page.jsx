import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeft,
	ChevronRight,
	Leaf,
	ShieldCheck,
	Truck,
	BadgePercent,
	SearchX,
} from 'lucide-react';

import { connectDB } from '@/lib/dbConnect';
import ComboOffer from '@/models/ComboOffer';

import OfferDetailsClient from './OfferDetailsClient';

export const dynamic = 'force-dynamic';

async function getOffer(slug) {
	await connectDB();

	const offer = await ComboOffer.findOne({ slug }).lean();

	if (!offer) {
		return null;
	}

	return JSON.parse(JSON.stringify(offer));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;

	const offer = await getOffer(slug);

	if (!offer) {
		return {
			title: 'Offer Not Found | Shalban Food',
		};
	}

	return {
		title: offer.seoTitle || `${offer.name} | Shalban Food`,

		description:
			offer.seoDescription ||
			offer.shortDescription ||
			offer.description ||
			`Buy ${offer.name} from Shalban Food.`,

		keywords:
			offer.keywords?.join(', ') ||
			`${offer.name}, Shalban Food, combo offer`,
	};
}


function NotFoundState() {
	return (
		<main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
					<SearchX size={30} />
				</div>

				<h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
					Offer not found
				</h1>

				<p className="mt-2 text-sm leading-6 text-slate-500">
					This offer may have expired or the link is incorrect. Browse
					our latest combo offers instead.
				</p>

				<Link
					href="/offers"
					className="mt-7 inline-flex items-center justify-center rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
					View All Offers
				</Link>
			</div>
		</main>
	);
}

export default async function OfferDetailsPage({ params }) {
	const { slug } = await params;

	const offer = await getOffer(slug);

	if (!offer) {
		return <NotFoundState />;
	}

	return (
		<main className="min-h-screen bg-slate-50">
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
				{/* Breadcrumb */}
				<nav
					aria-label="Breadcrumb"
					className="flex items-center justify-between gap-4">
					<ol className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
						<li>
							<Link
								href="/"
								className="transition hover:text-green-700">
								Home
							</Link>
						</li>
						<li aria-hidden="true">
							<ChevronRight size={14} />
						</li>
						<li>
							<Link
								href="/offers"
								className="transition hover:text-green-700">
								Offers
							</Link>
						</li>
						<li aria-hidden="true">
							<ChevronRight size={14} />
						</li>
						<li className="truncate font-medium text-slate-900">
							{offer.name}
						</li>
					</ol>

					<Link
						href="/offers"
						className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-green-700 hover:text-green-700 sm:inline-flex">
						<ArrowLeft size={15} />
						All Offers
					</Link>
				</nav>

				<OfferDetailsClient offer={offer} />
				

				{/* Mobile back link */}
				<div className="mt-6 sm:hidden">
					<Link
						href="/offers"
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-green-700 hover:text-green-700">
						<ArrowLeft size={16} />
						Back to all offers
					</Link>
				</div>
			</div>
		</main>
	);
}

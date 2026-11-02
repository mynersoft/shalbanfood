'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
	BadgePercent,
	Check,
	Leaf,
	ShieldCheck,
	ShoppingCart,
	Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import { addToCart } from '@/redux/store/slices/cartSliceok';

const pad = (n) => String(n).padStart(2, '0');

const TRUST_ITEMS = [
	{
		icon: Leaf,
		title: 'Quality Assured',
		text: 'Carefully selected products',
	},
	{
		icon: Truck,
		title: 'Fast Delivery',
		text: 'Delivered to your door',
	},
	{
		icon: ShieldCheck,
		title: 'Secure Ordering',
		text: 'Safe & easy checkout',
	},
];

function getTimeLeft(endDate) {
	if (!endDate) return null;

	const diff = new Date(endDate).getTime() - Date.now();

	if (Number.isNaN(diff)) return null;

	if (diff <= 0) {
		return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
	}

	return {
		expired: false,
		days: Math.floor(diff / 86400000),
		hours: Math.floor((diff / 3600000) % 24),
		minutes: Math.floor((diff / 60000) % 60),
		seconds: Math.floor((diff / 1000) % 60),
	};
}

function Countdown({ timeLeft }) {
	if (!timeLeft) return null;

	if (timeLeft.expired) {
		return (
			<div className="mt-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
				<span className="text-sm font-semibold text-red-600">
					অফার শেষ হয়েছে
				</span>
				<span className="text-xs text-red-400">Offer expired</span>
			</div>
		);
	}

	const units = [
		{ label: 'দিন', value: timeLeft.days },
		{ label: 'ঘণ্টা', value: timeLeft.hours },
		{ label: 'মিনিট', value: timeLeft.minutes },
		{ label: 'সেকেন্ড', value: timeLeft.seconds },
	];

	return (
		<div className="mt-6">
			<p className="text-xs font-medium text-gray-500">
				অফার শেষ হতে বাকি
			</p>

			<div className="mt-2 grid grid-cols-4 gap-2">
				{units.map((u) => (
					<div
						key={u.label}
						className="rounded-xl border border-gray-200 py-2.5 text-center">
						<div className="text-xl font-semibold tabular-nums text-gray-900">
							{pad(u.value)}
						</div>
						<div className="mt-0.5 text-[11px] text-gray-400">
							{u.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function OfferDetailsClient({ offer }) {
	const dispatch = useDispatch();

	// null until mounted, avoids server/client hydration mismatch
	const [timeLeft, setTimeLeft] = useState(null);

	useEffect(() => {
		setTimeLeft(getTimeLeft(offer.endDate));

		const timer = setInterval(() => {
			const next = getTimeLeft(offer.endDate);
			setTimeLeft(next);

			if (!next || next.expired) clearInterval(timer);
		}, 1000);

		return () => clearInterval(timer);
	}, [offer.endDate]);

	const discount =
		offer.regularPrice > 0
			? Math.round(
					((offer.regularPrice - offer.offerPrice) /
						offer.regularPrice) *
						100
				)
			: 0;

	const isExpired = timeLeft?.expired === true;
	const isOutOfStock = offer.stock <= 0;
	const isUnavailable = isExpired || isOutOfStock;

	const handleAddToCart = () => {
		if (!offer.stock || offer.stock <= 0) {
			toast.error('This offer is out of stock');
			return;
		}

		dispatch(
			addToCart({
				product: {
					...offer,
					_id: offer._id,
					type: 'combo',
					name: offer.name,
					slug: offer.slug,
					price: offer.offerPrice,
					regularPrice: offer.regularPrice,
					sellPrice: offer.offerPrice,
					featureImg: offer.featureImg,
					stock: offer.stock,
					comboItems: offer.items,
				},
				quantity: 1,
			})
		);

		toast.success('Combo added to cart');
	};

	const buttonLabel = isExpired
		? 'অফার শেষ'
		: isOutOfStock
			? 'স্টক শেষ'
			: 'কার্টে যোগ করুন';

	return (
		<div className="w-full">
			<div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
				{/* Left: image + trust */}
				<div className="lg:sticky lg:top-6 lg:self-start">
					<div className="relative h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 sm:h-[420px] lg:h-[450px]">
						<Image
							src={offer.featureImg}
							alt={offer.name}
							fill
							priority
							sizes="(max-width: 1024px) 100vw, 50vw"
							className="object-contain"
						/>

						<div className="absolute left-4 top-4 sm:left-6 sm:top-6">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-800 shadow-sm backdrop-blur">
								<BadgePercent size={14} />
								Combo Offer
							</span>
						</div>
					</div>

					<ul className="mt-6 grid gap-4 sm:grid-cols-3">
						{TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
							<li key={title} className="flex items-start gap-3">
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
									<Icon size={20} />
								</span>

								<div className="min-w-0">
									<p className="text-sm font-semibold text-slate-900">
										{title}
									</p>
									<p className="text-xs leading-5 text-slate-500">
										{text}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				{/* Right: details */}
				<div>
					{discount > 0 && (
						<span className="inline-block rounded-full bg-[#1f5d3b] px-2.5 py-1 text-[11px] font-semibold text-white">
							{discount}% OFF
						</span>
					)}

					<h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-gray-900 sm:text-3xl">
						{offer.name}
					</h1>

					{/* Price */}
					<div className="mt-5 flex flex-wrap items-baseline gap-3">
						<span
							className={`text-4xl font-bold tracking-tight ${
								isExpired ? 'text-gray-400' : 'text-[#1f5d3b]'
							}`}>
							৳{offer.offerPrice}
						</span>

						{offer.regularPrice > offer.offerPrice && (
							<span className="text-base text-gray-400 line-through">
								৳{offer.regularPrice}
							</span>
						)}
					</div>

					{discount > 0 && !isExpired && (
						<p className="mt-1.5 text-sm text-gray-500">
							আপনি সাশ্রয় করছেন ৳
							{offer.regularPrice - offer.offerPrice}
						</p>
					)}

					{/* Countdown / expired */}
					<Countdown timeLeft={timeLeft} />

					{/* Items */}
					<div className="mt-8">
						<div className="flex items-center justify-between border-b border-gray-100 pb-3">
							<h2 className="text-sm font-semibold text-gray-900">
								এই কম্বোতে যা থাকছে
							</h2>
							<span className="text-xs text-gray-400">
								{offer.items?.length || 0} টি আইটেম
							</span>
						</div>

						<ul className="divide-y divide-gray-100">
							{offer.items?.map((item, index) => (
								<li
									key={index}
									className="flex items-center justify-between gap-3 py-3">
									<span className="flex min-w-0 items-center gap-2.5 text-sm text-gray-700">
										<Check
											size={15}
											strokeWidth={2.5}
											className="shrink-0 text-[#1f5d3b]"
										/>
										<span className="truncate">
											{item.name}
										</span>
									</span>

									<span className="shrink-0 text-sm font-medium text-gray-500">
										× {item.quantity}
									</span>
								</li>
							))}
						</ul>
					</div>

					{/* Stock */}
					<p className="mt-5 text-sm text-gray-500">
						{isOutOfStock ? (
							<span className="font-medium text-red-500">
								স্টক শেষ
							</span>
						) : (
							<>
								স্টকে আছে{' '}
								<span className="font-medium text-gray-800">
									{offer.stock} টি
								</span>
							</>
						)}
					</p>

					{/* CTA */}
					<button
						type="button"
						onClick={handleAddToCart}
						disabled={isUnavailable}
						className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1f5d3b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#194b30] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d3b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">
						<ShoppingCart size={18} />
						{buttonLabel}
					</button>
				</div>
			</div>

			{/* Description */}
			{offer.description && (
				<div className="mt-10 border-t border-gray-100 pt-6">
					<h2 className="text-sm font-semibold text-gray-900">
						অফার সম্পর্কে বিস্তারিত
					</h2>

					<div
						className="
							prose prose-sm mt-3 max-w-none
							prose-headings:font-semibold prose-headings:text-gray-900
							prose-p:leading-7 prose-p:text-gray-600
							prose-li:text-gray-600
							prose-strong:text-gray-800
							prose-a:text-[#1f5d3b]
						"
						dangerouslySetInnerHTML={{
							__html: offer.description,
						}}
					/>
				</div>
			)}
		</div>
	);
}

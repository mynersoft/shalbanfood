'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
	ArrowRight,
	CheckCircle2,
	ChevronRight,
	ShieldCheck,
	ShoppingBag,
	Truck,
	Leaf,
	LockKeyhole,
	PackageCheck,
} from 'lucide-react';

import CartItems from '@/components/Cart/CartItems';

const toNumber = (value, fallback = 0) => {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}

	const number = Number(value);

	return Number.isFinite(number) ? number : fallback;
};

const getBasePrice = (item) => {
	const price = toNumber(item?.price, NaN);

	if (Number.isFinite(price) && price >= 0) {
		return price;
	}

	const sellPrice = toNumber(item?.sellPrice, NaN);

	if (Number.isFinite(sellPrice) && sellPrice >= 0) {
		return sellPrice;
	}

	return Math.max(toNumber(item?.regularPrice, 0), 0);
};

const getFinalPrice = (item) => {
	const price = getBasePrice(item);

	// Cart price already contains the selected variant's final price.
	if (item?.price !== undefined && item?.price !== null) {
		return price;
	}

	const discount = toNumber(item?.discount?.value, 0);

	if (discount <= 0) return price;

	if (item?.discount?.type === 'percentage') {
		return Math.max(price - (price * discount) / 100, 0);
	}

	if (item?.discount?.type === 'fixed') {
		return Math.max(price - discount, 0);
	}

	return price;
};

const getOriginalPrice = (item) => {
	const regularPrice = toNumber(item?.regularPrice, NaN);

	if (Number.isFinite(regularPrice) && regularPrice >= 0) {
		return regularPrice;
	}

	return getBasePrice(item);
};

const formatPrice = (value) =>
	toNumber(value).toLocaleString('en-BD', {
		maximumFractionDigits: 2,
	});

function EmptyCart() {
	return (
		<div className="rounded-3xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
			<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
				<ShoppingBag size={34} className="text-[#16834b]" />
			</div>

			<h2 className="mt-6 text-2xl font-bold text-gray-900">
				Your cart is empty
			</h2>

			<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
				You have not added any products yet. Explore our natural food
				collection and find something you love.
			</p>

			<Link
				href="/shop"
				className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16834b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#116b3c]">
				Continue Shopping
				<ArrowRight size={17} />
			</Link>
		</div>
	);
}

function TrustFeatures() {
	const features = [
		{
			icon: ShieldCheck,
			title: 'Trusted Quality',
			description: 'Carefully selected products',
		},
		{
			icon: LockKeyhole,
			title: 'Secure Checkout',
			description: 'Your details stay protected',
		},
		{
			icon: PackageCheck,
			title: 'Order Updates',
			description: 'Stay informed about your order',
		},
	];

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{features.map(({ icon: Icon, title, description }) => (
				<div
					key={title}
					className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
						<Icon size={20} className="text-[#16834b]" />
					</div>

					<div className="min-w-0">
						<p className="text-xs font-bold text-gray-900">
							{title}
						</p>

						<p className="mt-1 text-[11px] leading-4 text-gray-500">
							{description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

export default function CartPage() {
	const items = useSelector((state) => state.cart?.items ?? []);

	const { subtotal, totalQty, totalSavings } = useMemo(() => {
		return items.reduce(
			(result, item) => {
				const quantity = Math.max(
					1,
					Math.floor(toNumber(item?.quantity, 1))
				);

				const finalPrice = getFinalPrice(item);
				const originalPrice = getOriginalPrice(item);

				result.subtotal += finalPrice * quantity;
				result.totalQty += quantity;
				result.totalSavings +=
					Math.max(originalPrice - finalPrice, 0) * quantity;

				return result;
			},
			{
				subtotal: 0,
				totalQty: 0,
				totalSavings: 0,
			}
		);
	}, [items]);

	const isEmpty = items.length === 0;

	return (
		<main className="min-h-screen bg-[#f7f9f7] pb-28 lg:pb-12">
			{/* Breadcrumb */}
			<div className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-gray-500 sm:px-6 lg:px-8">
					<Link href="/" className="transition hover:text-[#16834b]">
						Home
					</Link>

					<ChevronRight size={14} />

					<Link
						href="/shop"
						className="transition hover:text-[#16834b]">
						Shop
					</Link>

					<ChevronRight size={14} />

					<span className="font-semibold text-gray-900">
						Shopping Cart
					</span>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
				{/* Page heading */}
				<div className="mb-7 flex flex-wrap items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2">
							<ShoppingBag size={25} className="text-[#16834b]" />

							<h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
								Shopping Cart
							</h1>
						</div>

						<p className="mt-2 text-sm text-gray-500">
							Review your products before proceeding to checkout.
						</p>
					</div>

					{!isEmpty && (
						<Link
							href="/shop"
							className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#16834b] hover:text-[#16834b] sm:inline-flex">
							Continue Shopping
							<ArrowRight size={16} />
						</Link>
					)}
				</div>

				{isEmpty ? (
					<EmptyCart />
				) : (
					<>
						{/* Cart items + order summary */}
						<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
							{/* Left: Cart products */}
							<section className="min-w-0">
								<CartItems />

								<div className="mt-5">
									<TrustFeatures />
								</div>
							</section>

							{/* Right: Order summary */}
							<aside className="min-w-0 lg:sticky lg:top-6">
								<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
									<div className="border-b border-gray-100 px-5 py-5">
										<h2 className="text-lg font-extrabold text-gray-900">
											Order Summary
										</h2>

										<p className="mt-1 text-xs text-gray-500">
											{totalQty} product unit
											{totalQty !== 1 ? 's' : ''} in your
											cart
										</p>
									</div>

									<div className="space-y-4 px-5 py-5">
										<div className="flex items-center justify-between gap-3 text-sm">
											<span className="text-gray-500">
												Subtotal
											</span>

											<span className="font-semibold text-gray-900">
												৳{formatPrice(subtotal)}
											</span>
										</div>

									

										<div className="flex items-start justify-between gap-3 text-sm">
											<span className="flex items-center gap-2 text-gray-500">
												<Truck
													size={16}
													className="shrink-0"
												/>
												Delivery
											</span>

											<span className="text-right text-xs font-medium text-gray-500">
												Calculated at checkout
											</span>
										</div>

										<div className="border-t border-dashed border-gray-200 pt-4">
											<div className="flex items-center justify-between gap-3">
												<span className="text-sm font-bold text-gray-900">
													Product Total
												</span>

												<span className="text-2xl font-extrabold text-[#16834b]">
													৳{formatPrice(subtotal)}
												</span>
											</div>

										
										</div>

										<Link
											href="/checkout"
											className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16834b] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#116b3c] focus:outline-none focus:ring-2 focus:ring-[#16834b] focus:ring-offset-2">
											Proceed to Checkout
											<ArrowRight size={18} />
										</Link>

										<div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
											<ShieldCheck
												size={15}
												className="text-[#16834b]"
											/>
											Review your order before confirming
										</div>
									</div>

									<div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
										<div className="flex items-start gap-3">
											<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
												<Leaf
													size={18}
													className="text-[#16834b]"
												/>
											</div>

											<div>
												<p className="text-xs font-bold text-gray-900">
													Shalban Food
												</p>

												<p className="mt-1 text-[11px] leading-5 text-gray-500">
													স্বাদের সাথে আস্থার বন্ধন
												</p>
											</div>
										</div>
									</div>
								</div>

								<Link
									href="/shop"
									className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-gray-600 transition hover:text-[#16834b]">
									<ArrowRight
										size={16}
										className="rotate-180"
									/>
									Continue Shopping
								</Link>
							</aside>
						</div>

						{/* Mobile fixed checkout bar */}
						<div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-6px_25px_rgba(0,0,0,0.07)] backdrop-blur-md lg:hidden">
							<div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
								<div className="min-w-0">
									<p className="text-[11px] font-medium text-gray-500">
										Product Total
									</p>

									<p className="mt-0.5 text-xl font-extrabold text-gray-900">
										৳{formatPrice(subtotal)}
									</p>

									<p className="text-[10px] text-gray-500">
										Delivery not included
									</p>
								</div>

								<Link
									href="/checkout"
									className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#16834b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#116b3c] sm:flex-none sm:min-w-52">
									Checkout
									<ArrowRight size={17} />
								</Link>
							</div>
						</div>
					</>
				)}
			</div>
		</main>
	);
}

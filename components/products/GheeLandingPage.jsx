'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	Check,
	ChevronDown,
	ShoppingCart,
	Minus,
	Plus,
	ShieldCheck,
	Truck,
	RotateCcw,
	Star,
	Sparkles,
	PackageCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

/* =========================================================
   SITE CONFIG
========================================================= */

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || 'https://shalbanfood.vercel.app';

const PRODUCT_IMAGE =
	'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/shalbanfood/ghee-250g.jpg';

/* =========================================================
   PRODUCT
========================================================= */

const PRODUCT = {
	_id: 'shalban-ghee',

	name: 'শালবন ফুড গাওয়া ঘি',

	slug: 'gawa-ghee',

	category: 'Ghee',

	image: PRODUCT_IMAGE,

	description:
		'শালবন ফুডের গাওয়া ঘি দৈনন্দিন রান্না ও বিভিন্ন খাবারে ব্যবহারের জন্য উপযোগী।',

	variants: [
		{
			id: 'ghee-250g',
			weight: 250,
			unit: 'gram',
			label: '২৫০ গ্রাম',
			price: 350,
			stock: 50,
		},

		{
			id: 'ghee-500g',
			weight: 500,
			unit: 'gram',
			label: '৫০০ গ্রাম',
			price: 650,
			stock: 50,
		},

		{
			id: 'ghee-1kg',
			weight: 1000,
			unit: 'gram',
			label: '১ কেজি',
			price: 1300,
			stock: 50,
		},
	],
};

/* =========================================================
   PRODUCT SCHEMA
========================================================= */

const productSchema = {
	'@context': 'https://schema.org',

	'@type': 'Product',

	name: 'শালবন ফুড গাওয়া ঘি',

	description:
		'শালবন ফুডের গাওয়া ঘি। ২৫০ গ্রাম, ৫০০ গ্রাম ও ১ কেজি প্যাকে পাওয়া যায়। রান্না, খিচুড়ি, পোলাও, রুটি, পরোটা ও বিভিন্ন খাবারে ব্যবহার করা যায়।',

	image: [PRODUCT_IMAGE],

	brand: {
		'@type': 'Brand',
		name: 'Shalban Food',
	},

	manufacturer: {
		'@type': 'Organization',
		name: 'Shalban Food',
		url: SITE_URL,
	},

	category: 'Ghee',

	sku: 'SHALBAN-GHEE',

	url: `${SITE_URL}/product/gawa-ghee`,

	offers: {
		'@type': 'AggregateOffer',

		priceCurrency: 'BDT',

		lowPrice: '350',

		highPrice: '1300',

		offerCount: '3',

		availability: 'https://schema.org/InStock',

		url: `${SITE_URL}/product/gawa-ghee`,
	},
};

/* =========================================================
   FAQ SCHEMA
========================================================= */

const faqSchema = {
	'@context': 'https://schema.org',

	'@type': 'FAQPage',

	mainEntity: [
		{
			'@type': 'Question',

			name: 'শালবন ফুডের গাওয়া ঘি কত গ্রাম প্যাকে পাওয়া যায়?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: 'শালবন ফুডের গাওয়া ঘি বর্তমানে ২৫০ গ্রাম, ৫০০ গ্রাম এবং ১ কেজি প্যাকে পাওয়া যায়।',
			},
		},

		{
			'@type': 'Question',

			name: '২৫০ গ্রাম গাওয়া ঘির দাম কত?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: '২৫০ গ্রাম শালবন ফুড গাওয়া ঘির মূল্য ৩৫০ টাকা।',
			},
		},

		{
			'@type': 'Question',

			name: '৫০০ গ্রাম গাওয়া ঘির দাম কত?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: '৫০০ গ্রাম শালবন ফুড গাওয়া ঘির মূল্য ৬৫০ টাকা।',
			},
		},

		{
			'@type': 'Question',

			name: '১ কেজি গাওয়া ঘির দাম কত?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: '১ কেজি শালবন ফুড গাওয়া ঘির মূল্য ১,৩০০ টাকা।',
			},
		},

		{
			'@type': 'Question',

			name: 'গাওয়া ঘি কী কী খাবারে ব্যবহার করা যায়?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: 'গাওয়া ঘি খিচুড়ি, পোলাও, রুটি, পরোটা, ভর্তা, হালুয়া এবং বিভিন্ন রান্নায় প্রয়োজন অনুযায়ী ব্যবহার করা যায়।',
			},
		},

		{
			'@type': 'Question',

			name: 'শালবন ফুড থেকে কীভাবে গাওয়া ঘি অর্ডার করব?',

			acceptedAnswer: {
				'@type': 'Answer',

				text: 'পছন্দের ওজন নির্বাচন করে Add to Cart করুন। এরপর Cart থেকে Checkout পেজে গিয়ে প্রয়োজনীয় তথ্য দিয়ে অর্ডার সম্পন্ন করুন।',
			},
		},
	],
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function GheeLandingPage() {
	const dispatch = useDispatch();

	const [selectedVariantId, setSelectedVariantId] = useState(
		PRODUCT.variants[0].id
	);

	const [quantity, setQuantity] = useState(1);

	/* =====================================================
       SELECTED VARIANT
    ===================================================== */

	const selectedVariant =
		PRODUCT.variants.find((variant) => variant.id === selectedVariantId) ||
		PRODUCT.variants[0];

	/* =====================================================
       TOTAL
    ===================================================== */

	const totalPrice = selectedVariant.price * quantity;

	/* =====================================================
       VARIANT CHANGE
    ===================================================== */

	const handleVariantChange = (variant) => {
		setSelectedVariantId(variant.id);

		setQuantity(1);
	};

	/* =====================================================
       QUANTITY
    ===================================================== */

	const handleQuantity = (type) => {
		setQuantity((current) => {
			if (type === 'increase') {
				return Math.min(current + 1, selectedVariant.stock);
			}

			return Math.max(current - 1, 1);
		});
	};

	/* =====================================================
       ADD TO CART
    ===================================================== */

	const handleAddToCart = () => {
		if (selectedVariant.stock <= 0) {
			toast.error('এই ওজনের ঘি বর্তমানে স্টকে নেই');

			return;
		}

		/*
		 * Variant-specific _id prevents
		 * 250g / 500g / 1kg from merging
		 * into one cart item.
		 */

		const cartProduct = {
			_id: `${PRODUCT._id}-${selectedVariant.id}`,

			productId: PRODUCT._id,

			name: PRODUCT.name,

			slug: PRODUCT.slug,

			category: PRODUCT.category,

			image: PRODUCT.image,

			featureImg: PRODUCT.image,

			variantId: selectedVariant.id,

			variantLabel: selectedVariant.label,

			weight: selectedVariant.weight,

			unit: selectedVariant.unit,

			price: selectedVariant.price,

			sellPrice: selectedVariant.price,

			regularPrice: selectedVariant.price,

			stock: selectedVariant.stock,
		};

		dispatch(
			addToCart({
				product: cartProduct,

				quantity,
			})
		);

		toast.success(
			`${selectedVariant.label} ${quantity} টি গাওয়া ঘি কার্টে যোগ হয়েছে`
		);
	};

	return (
		<main className="min-h-screen bg-[#fffdf8] text-gray-900">
			{/* =================================================
                STRUCTURED DATA
            ================================================= */}

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(productSchema),
				}}
			/>

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(faqSchema),
				}}
			/>

			{/* =================================================
                TOP BAR
            ================================================= */}

			<div className="bg-gray-950 px-4 py-2 text-center text-xs font-medium text-white">
				🚚 সারা বাংলাদেশে ডেলিভারি সুবিধা
			</div>

			{/* =================================================
                BREADCRUMB
            ================================================= */}

			<div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
				<nav aria-label="Breadcrumb" className="text-xs text-gray-500">
					<Link href="/" className="transition hover:text-amber-700">
						Home
					</Link>

					<span className="mx-2">/</span>

					<Link
						href="/products"
						className="transition hover:text-amber-700">
						Products
					</Link>

					<span className="mx-2">/</span>

					<span className="font-medium text-gray-700">Gawa Ghee</span>
				</nav>
			</div>

			{/* =================================================
                HERO
            ================================================= */}

			<section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
				<div className="grid overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-sm lg:grid-cols-2">
					{/* =================================================
                        IMAGE
                    ================================================= */}

					<div className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-[#fffaf0] to-white p-6 sm:min-h-[550px] lg:p-12">
						<div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/30 blur-3xl" />

						<div className="absolute left-5 top-5 z-10 rounded-full bg-amber-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg">
							SHALBAN FOOD
						</div>

						<div className="relative aspect-square w-full max-w-[480px]">
							<Image
								src={PRODUCT.image}
								alt="শালবন ফুড গাওয়া ঘি"
								fill
								priority
								sizes="(max-width: 768px) 90vw, 50vw"
								className="object-contain drop-shadow-2xl"
							/>
						</div>

						<div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-amber-100 bg-white/90 px-4 py-2 text-xs font-bold text-gray-700 shadow-lg backdrop-blur">
							<PackageCheck
								size={15}
								className="text-amber-600"
							/>

							{selectedVariant.label}
						</div>
					</div>

					{/* =================================================
                        PRODUCT INFO
                    ================================================= */}

					<div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
						<div className="flex items-center gap-2 text-sm font-bold text-amber-700">
							<Sparkles size={16} />
							SHALBAN FOOD
						</div>

						<h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
							শালবন ফুড
							<span className="block text-amber-700">
								গাওয়া ঘি
							</span>
						</h1>

						<p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
							রান্না ও বিভিন্ন খাবারে ব্যবহারের জন্য শালবন ফুডের
							গাওয়া ঘি। প্রয়োজন অনুযায়ী ২৫০ গ্রাম, ৫০০ গ্রাম অথবা
							১ কেজি প্যাক বেছে নিন।
						</p>

						{/* =================================================
                            RATING
                        ================================================= */}

						<div className="mt-4 flex items-center gap-2">
							<div className="flex gap-0.5">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										size={16}
										className="fill-amber-400 text-amber-400"
									/>
								))}
							</div>

							<span className="text-xs text-gray-500">
								Shalban Food
							</span>
						</div>

						{/* =================================================
                            PRICE
                        ================================================= */}

						<div className="mt-6 flex flex-wrap items-end gap-3">
							<span className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
								৳{selectedVariant.price.toLocaleString('en-BD')}
							</span>

							<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
								{selectedVariant.label}
							</span>
						</div>

						{/* =================================================
                            VARIANTS
                        ================================================= */}

						<div className="mt-7">
							<div className="mb-3 flex items-center justify-between">
								<p className="text-sm font-bold text-gray-800">
									পরিমাণ নির্বাচন করুন
								</p>

								<span className="text-xs text-gray-500">
									{selectedVariant.label}
								</span>
							</div>

							<div className="grid grid-cols-3 gap-3">
								{PRODUCT.variants.map((variant) => {
									const active =
										variant.id === selectedVariantId;

									return (
										<button
											key={variant.id}
											type="button"
											onClick={() =>
												handleVariantChange(variant)
											}
											disabled={variant.stock <= 0}
											className={`rounded-xl border-2 px-3 py-3 text-center transition ${
												active
													? 'border-amber-600 bg-amber-50 text-amber-800'
													: 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
											} ${
												variant.stock <= 0
													? 'cursor-not-allowed opacity-40'
													: ''
											}`}>
											<div className="text-sm font-bold">
												{variant.label}
											</div>

											<div
												className={`mt-1 text-sm font-extrabold ${
													active
														? 'text-amber-700'
														: 'text-gray-900'
												}`}>
												৳
												{variant.price.toLocaleString(
													'en-BD'
												)}
											</div>
										</button>
									);
								})}
							</div>
						</div>

						{/* =================================================
                            FEATURES
                        ================================================= */}

						<div className="my-6 border-t border-gray-100" />

						<div className="grid grid-cols-2 gap-x-4 gap-y-4">
							{[
								`${selectedVariant.label} প্যাক`,

								'পরিপাটি প্যাকেজিং',

								'বিভিন্ন রান্নায় ব্যবহারযোগ্য',

								'সারা বাংলাদেশে ডেলিভারি',
							].map((item) => (
								<div
									key={item}
									className="flex items-center gap-2">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
										<Check size={13} strokeWidth={3} />
									</span>

									<span className="text-xs font-medium text-gray-700 sm:text-sm">
										{item}
									</span>
								</div>
							))}
						</div>

						{/* =================================================
                            QUANTITY
                        ================================================= */}

						<div className="mt-7">
							<p className="mb-2 text-sm font-semibold text-gray-800">
								কতটি চান?
							</p>

							<div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-300 bg-white">
								<button
									type="button"
									onClick={() => handleQuantity('decrease')}
									disabled={quantity <= 1}
									className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
									aria-label="Decrease quantity">
									<Minus size={17} />
								</button>

								<span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-3 text-sm font-bold">
									{quantity}
								</span>

								<button
									type="button"
									onClick={() => handleQuantity('increase')}
									disabled={quantity >= selectedVariant.stock}
									className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
									aria-label="Increase quantity">
									<Plus size={17} />
								</button>
							</div>
						</div>

						{/* =================================================
                            ADD TO CART
                        ================================================= */}

						<button
							type="button"
							onClick={handleAddToCart}
							disabled={selectedVariant.stock <= 0}
							className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-950 px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300">
							<ShoppingCart size={20} />

							{selectedVariant.stock > 0
								? 'Add to Cart'
								: 'Out of Stock'}

							<span className="ml-1 opacity-70">
								• ৳{totalPrice.toLocaleString('en-BD')}
							</span>
						</button>

						{/* =================================================
                            STOCK
                        ================================================= */}

						<div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
							<span className="h-2 w-2 rounded-full bg-green-500" />

							{selectedVariant.stock > 0
								? `স্টকে আছে — ${selectedVariant.label}`
								: 'স্টকে নেই'}
						</div>
					</div>
				</div>
			</section>

			{/* =================================================
                TRUST CARDS
            ================================================= */}

			<section className="border-y border-gray-100 bg-white">
				<div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
					<TrustCard
						icon={<ShieldCheck size={22} />}
						title="যত্নে প্যাক করা"
						text="পরিপাটি প্যাকেজিং"
					/>

					<TrustCard
						icon={<Truck size={22} />}
						title="ডেলিভারি"
						text="সারা বাংলাদেশে"
					/>

					<TrustCard
						icon={<PackageCheck size={22} />}
						title="৩টি সাইজ"
						text="250g • 500g • 1kg"
					/>

					<TrustCard
						icon={<RotateCcw size={22} />}
						title="সহজ অর্ডার"
						text="Cart → Checkout"
					/>
				</div>
			</section>

			{/* =================================================
                UNIQUE SEO CONTENT
            ================================================= */}

			<section className="px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<div className="max-w-3xl">
						<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
							SHALBAN FOOD GAWA GHEE
						</p>

						<h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
							প্রতিদিনের খাবারে ঘির
							<span className="text-amber-700">
								{' '}
								স্বাদ ও সুবাস
							</span>
						</h2>

						<p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
							একটি ভালো ঘি রান্নার স্বাদ ও ঘ্রাণে আলাদা অনুভূতি
							যোগ করতে পারে। শালবন ফুডের গাওয়া ঘি দৈনন্দিন
							রান্নাঘরের বিভিন্ন ব্যবহারের কথা মাথায় রেখে প্যাক
							করা হয়েছে।
						</p>

						<p className="mt-4 text-sm leading-8 text-gray-600 sm:text-base">
							খিচুড়ি, পোলাও, রুটি, পরোটা, ভর্তা, হালুয়া কিংবা
							অন্যান্য খাবারে প্রয়োজন অনুযায়ী ব্যবহার করতে পারেন।
							পরিবারের প্রয়োজন অনুযায়ী বেছে নেওয়ার জন্য রয়েছে ২৫০
							গ্রাম, ৫০০ গ্রাম এবং ১ কেজি প্যাক।
						</p>
					</div>

					<div className="mt-10 grid gap-5 md:grid-cols-3">
						<FeatureCard
							number="01"
							title="২৫০ গ্রাম"
							text="ছোট পরিবারের জন্য সুবিধাজনক প্যাক। মূল্য ৳৩৫০।"
						/>

						<FeatureCard
							number="02"
							title="৫০০ গ্রাম"
							text="নিয়মিত রান্নাঘরের ব্যবহারের জন্য মাঝারি প্যাক। মূল্য ৳৬৫০।"
						/>

						<FeatureCard
							number="03"
							title="১ কেজি"
							text="বেশি পরিমাণে ব্যবহারের জন্য বড় প্যাক। মূল্য ৳১,৩০০।"
						/>
					</div>
				</div>
			</section>

			{/* =================================================
                USE CASES
            ================================================= */}

			<section className="bg-amber-50 px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
							Everyday Uses
						</p>

						<h2 className="mt-3 text-3xl font-extrabold text-gray-950 sm:text-4xl">
							কোন কোন খাবারে গাওয়া ঘি ব্যবহার করবেন?
						</h2>

						<p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
							রান্নার ধরন অনুযায়ী প্রয়োজনমতো গাওয়া ঘি ব্যবহার করা
							যায়। বিশেষ করে ঘ্রাণ ও স্বাদের জন্য বিভিন্ন পরিচিত
							খাবারে এটি ব্যবহার করা হয়।
						</p>
					</div>

					<div className="mt-10 grid gap-5 md:grid-cols-3">
						<FeatureCard
							number="01"
							title="খিচুড়ি"
							text="খিচুড়িতে প্রয়োজন অনুযায়ী ঘি ব্যবহার করলে খাবারে আলাদা ঘ্রাণ ও স্বাদের অনুভূতি পাওয়া যায়।"
						/>

						<FeatureCard
							number="02"
							title="পোলাও"
							text="পোলাও ও বিভিন্ন ভাতের রান্নায় রান্নার প্রয়োজন অনুযায়ী ঘি ব্যবহার করা যায়।"
						/>

						<FeatureCard
							number="03"
							title="রুটি ও পরোটা"
							text="রুটি, পরোটা ও নাশতার বিভিন্ন খাবারের সঙ্গে ঘি ব্যবহার করা যায়।"
						/>

						<FeatureCard
							number="04"
							title="ভর্তা"
							text="বিভিন্ন ধরনের ভর্তায় অল্প পরিমাণ ঘি ব্যবহার করে স্বাদের ভিন্নতা আনা যায়।"
						/>

						<FeatureCard
							number="05"
							title="হালুয়া"
							text="সুজি, গাজরসহ বিভিন্ন ধরনের হালুয়া তৈরিতে প্রয়োজন অনুযায়ী ব্যবহার করা যায়।"
						/>

						<FeatureCard
							number="06"
							title="দৈনন্দিন রান্না"
							text="আপনার পছন্দ ও রান্নার ধরন অনুযায়ী বিভিন্ন খাবারে ব্যবহার করতে পারেন।"
						/>
					</div>
				</div>
			</section>

			{/* =================================================
                WHY SHALBAN
            ================================================= */}

			<section className="px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<div className="grid gap-10 lg:grid-cols-2 lg:items-center">
						<div>
							<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
								SHALBAN FOOD
							</p>

							<h2 className="mt-3 text-3xl font-extrabold text-gray-950 sm:text-4xl">
								প্রয়োজন অনুযায়ী প্যাক বেছে নিন
							</h2>

							<p className="mt-5 text-sm leading-8 text-gray-600 sm:text-base">
								পরিবারের আকার, ব্যবহারের পরিমাণ এবং কেনাকাটার
								প্রয়োজন অনুযায়ী আপনি ২৫০ গ্রাম, ৫০০ গ্রাম অথবা ১
								কেজি প্যাক বেছে নিতে পারবেন।
							</p>

							<p className="mt-4 text-sm leading-8 text-gray-600 sm:text-base">
								পছন্দের ওজন নির্বাচন করে সরাসরি Cart-এ যোগ করুন।
								এরপর Checkout থেকে অর্ডার সম্পন্ন করুন।
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							{PRODUCT.variants.map((variant) => (
								<div
									key={variant.id}
									className="rounded-2xl border border-amber-100 bg-white p-5 text-center shadow-sm">
									<PackageCheck
										className="mx-auto text-amber-600"
										size={28}
									/>

									<h3 className="mt-4 text-lg font-extrabold">
										{variant.label}
									</h3>

									<p className="mt-2 text-xl font-black text-amber-700">
										৳{variant.price.toLocaleString('en-BD')}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* =================================================
                HOW TO ORDER
            ================================================= */}

			<section className="bg-gray-950 px-4 py-16 text-white sm:px-6 lg:px-8">
				<div className="mx-auto max-w-5xl">
					<div className="text-center">
						<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
							Easy Shopping
						</p>

						<h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
							অর্ডার করা খুবই সহজ
						</h2>

						<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400">
							কয়েকটি সহজ ধাপে আপনার পছন্দের গাওয়া ঘি Cart থেকে
							Checkout করে অর্ডার করতে পারবেন।
						</p>
					</div>

					<div className="mt-10 grid gap-6 sm:grid-cols-3">
						<Step
							number="01"
							title="Weight Select"
							text="২৫০g, ৫০০g অথবা ১kg থেকে আপনার পছন্দের প্যাক নির্বাচন করুন।"
						/>

						<Step
							number="02"
							title="Add to Cart"
							text="প্রয়োজনীয় quantity নির্বাচন করে Add to Cart চাপুন।"
						/>

						<Step
							number="03"
							title="Checkout"
							text="Cart থেকে Checkout পেজে গিয়ে আপনার তথ্য দিয়ে অর্ডার সম্পন্ন করুন।"
						/>
					</div>
				</div>
			</section>

			{/* =================================================
                FAQ
            ================================================= */}

			<section className="px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl">
					<div className="text-center">
						<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
							GAWA GHEE FAQ
						</p>

						<h2 className="mt-3 text-3xl font-extrabold text-gray-950 sm:text-4xl">
							গাওয়া ঘি সম্পর্কে সাধারণ প্রশ্ন
						</h2>

						<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600">
							প্যাকের ওজন, মূল্য, ব্যবহার ও অনলাইন অর্ডার সম্পর্কে
							সাধারণ প্রশ্নগুলোর উত্তর এখানে দেওয়া হলো।
						</p>
					</div>

					<div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
						{[
							{
								q: 'শালবন ফুডের গাওয়া ঘি কত গ্রাম পাওয়া যায়?',
								a: 'বর্তমানে ২৫০ গ্রাম, ৫০০ গ্রাম এবং ১ কেজি প্যাক পাওয়া যাচ্ছে।',
							},

							{
								q: '২৫০ গ্রাম গাওয়া ঘির দাম কত?',
								a: '২৫০ গ্রাম শালবন ফুড গাওয়া ঘির মূল্য ৩৫০ টাকা।',
							},

							{
								q: '৫০০ গ্রাম গাওয়া ঘির দাম কত?',
								a: '৫০০ গ্রাম শালবন ফুড গাওয়া ঘির মূল্য ৬৫০ টাকা।',
							},

							{
								q: '১ কেজি গাওয়া ঘির দাম কত?',
								a: '১ কেজি শালবন ফুড গাওয়া ঘির মূল্য ১,৩০০ টাকা।',
							},

							{
								q: 'গাওয়া ঘি কী কী খাবারে ব্যবহার করা যায়?',
								a: 'খিচুড়ি, পোলাও, রুটি, পরোটা, ভর্তা, হালুয়া এবং বিভিন্ন রান্নায় প্রয়োজন অনুযায়ী গাওয়া ঘি ব্যবহার করা যায়।',
							},

							{
								q: 'অনলাইনে গাওয়া ঘি কীভাবে অর্ডার করব?',
								a: 'প্রথমে পছন্দের ওজন নির্বাচন করুন। এরপর Add to Cart চাপুন। Cart থেকে Checkout পেজে গিয়ে আপনার তথ্য দিয়ে অর্ডার সম্পন্ন করুন।',
							},

							{
								q: 'সারা বাংলাদেশে কি গাওয়া ঘি ডেলিভারি করা হয়?',
								a: 'শালবন ফুডের checkout shipping system অনুযায়ী দেশের বিভিন্ন এলাকায় ডেলিভারি সুবিধা পাওয়া যাবে।',
							},
						].map((item) => (
							<details
								key={item.q}
								className="group border-b border-gray-100 p-5 last:border-0">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-gray-800">
									{item.q}

									<ChevronDown
										size={18}
										className="shrink-0 transition-transform group-open:rotate-180"
									/>
								</summary>

								<p className="mt-3 pr-6 text-sm leading-7 text-gray-600">
									{item.a}
								</p>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* =================================================
                FINAL CTA
            ================================================= */}

			<section className="bg-amber-600 px-4 py-14 text-center text-white">
				<p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-100">
					Shalban Food
				</p>

				<h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
					পছন্দের গাওয়া ঘি কার্টে যোগ করুন
				</h2>

				<p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-amber-50">
					২৫০ গ্রাম, ৫০০ গ্রাম অথবা ১ কেজি— আপনার প্রয়োজন অনুযায়ী
					প্যাক নির্বাচন করে এখনই Add to Cart করুন।
				</p>

				<button
					type="button"
					onClick={handleAddToCart}
					className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-amber-700 shadow-xl transition hover:bg-gray-50 active:scale-95">
					<ShoppingCart size={19} />
					Add to Cart — ৳
					{selectedVariant.price.toLocaleString('en-BD')}
				</button>
			</section>

			{/* =================================================
                MOBILE STICKY CART
            ================================================= */}

			<div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden">
				<div className="flex items-center gap-2">
					<div className="flex-1 pl-2">
						<p className="text-[10px] text-gray-500">
							{selectedVariant.label}
						</p>

						<p className="text-lg font-extrabold text-gray-900">
							৳{totalPrice.toLocaleString('en-BD')}
						</p>
					</div>

					<button
						type="button"
						onClick={handleAddToCart}
						disabled={selectedVariant.stock <= 0}
						className="flex flex-[1.5] items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-bold text-white disabled:bg-gray-300">
						<ShoppingCart size={18} />
						Add to Cart
					</button>
				</div>
			</div>

			<div className="h-20 md:hidden" />
		</main>
	);
}

/* =========================================================
   TRUST CARD
========================================================= */

function TrustCard({ icon, title, text }) {
	return (
		<div className="flex items-center justify-center gap-3 border-b border-r border-gray-100 px-4 py-5">
			<div className="text-amber-600">{icon}</div>

			<div>
				<p className="text-xs font-bold text-gray-800">{title}</p>

				<p className="mt-0.5 text-[10px] text-gray-500">{text}</p>
			</div>
		</div>
	);
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({ number, title, text }) {
	return (
		<div className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
			<span className="text-xs font-black text-amber-600">{number}</span>

			<h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>

			<p className="mt-2 text-sm leading-7 text-gray-600">{text}</p>
		</div>
	);
}

/* =========================================================
   STEP
========================================================= */

function Step({ number, title, text }) {
	return (
		<div className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
			<span className="text-sm font-black text-amber-400">{number}</span>

			<h3 className="mt-4 text-lg font-bold">{title}</h3>

			<p className="mt-2 text-sm leading-7 text-gray-400">{text}</p>
		</div>
	);
}

import { cache } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChevronRight, Truck, ShieldCheck, BadgeCheck } from 'lucide-react';

import { connectDB } from '@/lib/dbConnect';
import Product from '@/models/Product';

import ProductPurchase from './ProductPurchase';

/* =========================================================
   CACHING (ISR): page is rebuilt at most every 5 minutes.
   Call revalidatePath('/product/' + slug) in your product
   API after create/update/delete for instant updates.
========================================================= */

export const revalidate = 300;

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL || 'https://shalbanfood.vercel.app'
).replace(/\/+$/, '');

const SITE_NAME = 'Shalban Food';

const UNIT_LABELS = {
	gram: 'গ্রাম',
	kg: 'কেজি',
	milliliter: 'মিলিলিটার',
	litre: 'লিটার',
	piece: 'পিস',
};

const formatSize = (variant) =>
	`${variant.value} ${UNIT_LABELS[variant.unit] || variant.unit}`;

const formatCategory = (category = '') => category.replace(/-/g, ' ');

const safeDecode = (value = '') => {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

const absoluteUrl = (url = '') => {
	if (!url) return '';

	return url.startsWith('http') ? url : `${SITE_URL}${url}`;
};

const truncate = (text = '', max = 160) => {
	const clean = text.replace(/\s+/g, ' ').trim();

	return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
};

const productPath = (slug) => `/product/${encodeURIComponent(slug)}`;

/* Escape "<" so product text can never close the <script> tag */

const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/* =========================================================
   DATA
   cache() makes generateMetadata and the page share one query
========================================================= */

const getProduct = cache(async (rawSlug) => {
	await connectDB();

	const product = await Product.findOne({
		slug: safeDecode(rawSlug).toLowerCase(),
		isActive: true,
	})
		.select('-__v')
		.lean();

	if (!product) return null;

	return JSON.parse(JSON.stringify(product));
});

const getRelatedProducts = cache(async (category, excludeId) => {
	await connectDB();

	const related = await Product.find({
		category,
		isActive: true,
		_id: { $ne: excludeId },
	})
		.select('name slug image variants.sellPrice')
		.sort({ isFeatured: -1, createdAt: -1 })
		.limit(4)
		.lean();

	return JSON.parse(JSON.stringify(related));
});

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({ params }) {
	const { slug } = await params;

	const product = await getProduct(slug);

	if (!product) {
		return {
			title: { absolute: `Product Not Found | ${SITE_NAME}` },
			robots: { index: false, follow: false },
		};
	}

	const title = product.seoTitle?.trim() || `${product.name} | ${SITE_NAME}`;

	const description = truncate(
		product.seoDescription?.trim() ||
			product.shortDescription?.trim() ||
			product.description?.trim() ||
			`${product.name} কিনুন ${SITE_NAME} থেকে।`
	);

	const canonical =
		product.canonicalUrl?.trim() ||
		`${SITE_URL}${productPath(product.slug)}`;

	const image = absoluteUrl(product.image) || `${SITE_URL}/og-image.png`;

	return {
		metadataBase: new URL(SITE_URL),

		title: { absolute: title },

		description,

		keywords: Array.isArray(product.keywords) ? product.keywords : [],

		alternates: { canonical },

		openGraph: {
			title,
			description,
			url: canonical,
			siteName: SITE_NAME,
			type: 'website',
			locale: 'bn_BD',
			images: [{ url: image, alt: product.name }],
		},

		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
		},

		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-image-preview': 'large',
				'max-snippet': -1,
				'max-video-preview': -1,
			},
		},
	};
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProductPage({ params }) {
	const { slug } = await params;

	const product = await getProduct(slug);

	/* Real 404 status so Google drops dead URLs */

	if (!product) {
		notFound();
	}

	const relatedProducts = await getRelatedProducts(
		product.category,
		product._id
	);

	/* -------------------------------------------------------
	   VARIANTS
	------------------------------------------------------- */

	const variants = (
		Array.isArray(product.variants) ? product.variants : []
	).map((variant) => ({
		_id: String(variant._id),
		label: formatSize(variant),
		value: variant.value,
		unit: variant.unit,
		regularPrice: Number(variant.regularPrice) || 0,
		sellPrice: Number(variant.sellPrice) || 0,
		stock: Number(variant.stock) || 0,
		sku: variant.sku || '',
		soldCount: Number(variant.soldCount) || 0,
	}));

	const prices = variants.map((variant) => variant.sellPrice);

	const minPrice = prices.length ? Math.min(...prices) : 0;

	const maxPrice = prices.length ? Math.max(...prices) : 0;

	const inStock = variants.some((variant) => variant.stock > 0);

	const totalSold = variants.reduce(
		(sum, variant) => sum + variant.soldCount,
		0
	);

	/* -------------------------------------------------------
	   URLS
	------------------------------------------------------- */

	const productUrl = `${SITE_URL}${productPath(product.slug)}`;

	const categoryUrl = `${SITE_URL}/category/${encodeURIComponent(
		product.category
	)}`;

	const imageUrl = absoluteUrl(product.image);

	/* -------------------------------------------------------
	   JSON-LD: PRODUCT
	   (No fake aggregateRating: add it only when you have
	   real reviews, otherwise Google may penalise the site.)
	------------------------------------------------------- */

	const priceValidUntil = new Date(new Date().getFullYear() + 1, 11, 31)
		.toISOString()
		.split('T')[0];

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		'@id': `${productUrl}#product`,
		name: product.name,
		description: truncate(
			product.description ||
				product.shortDescription ||
				product.seoDescription ||
				product.name,
			5000
		),
		image: imageUrl ? [imageUrl] : undefined,
		sku: product.sku || undefined,
		category: formatCategory(product.category),
		url: productUrl,
		brand: {
			'@type': 'Brand',
			name: product.brand || SITE_NAME,
		},
		offers: {
			'@type': 'AggregateOffer',
			priceCurrency: 'BDT',
			lowPrice: minPrice.toFixed(2),
			highPrice: maxPrice.toFixed(2),
			offerCount: variants.length,
			availability: inStock
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			offers: variants.map((variant) => ({
				'@type': 'Offer',
				name: `${product.name} - ${variant.label}`,
				url: productUrl,
				sku: variant.sku || undefined,
				priceCurrency: 'BDT',
				price: variant.sellPrice.toFixed(2),
				priceValidUntil,
				availability:
					variant.stock > 0
						? 'https://schema.org/InStock'
						: 'https://schema.org/OutOfStock',
				itemCondition: 'https://schema.org/NewCondition',
				seller: {
					'@type': 'Organization',
					name: SITE_NAME,
					url: SITE_URL,
				},
			})),
		},
	};

	/* -------------------------------------------------------
	   JSON-LD: BREADCRUMB
	------------------------------------------------------- */

	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Shop',
				item: `${SITE_URL}/shop`,
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: formatCategory(product.category),
				item: categoryUrl,
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: product.name,
				item: productUrl,
			},
		],
	};

	return (
		<main className="min-h-screen bg-white">
			{/* STRUCTURED DATA */}

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: toJsonLd(productJsonLd) }}
			/>

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
			/>

			{/* BREADCRUMB */}

			<nav aria-label="Breadcrumb" className="border-b border-gray-100">
				<ol className="mx-auto flex max-w-7xl items-center gap-1 overflow-hidden px-4 py-3 text-xs text-gray-500">
					<li>
						<Link href="/" className="hover:text-green-600">
							Home
						</Link>
					</li>

					<li aria-hidden="true">
						<ChevronRight size={14} />
					</li>

					<li>
						<Link href="/shop" className="hover:text-green-600">
							Shop
						</Link>
					</li>

					<li aria-hidden="true">
						<ChevronRight size={14} />
					</li>

					<li>
						<Link
							href={`/category/${encodeURIComponent(product.category)}`}
							className="capitalize hover:text-green-600">
							{formatCategory(product.category)}
						</Link>
					</li>

					<li aria-hidden="true">
						<ChevronRight size={14} />
					</li>

					<li className="truncate text-gray-700" aria-current="page">
						{product.name}
					</li>
				</ol>
			</nav>

			{/* PRODUCT */}

			<article className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* IMAGE */}

					<div>
						<div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
							{product.image ? (
								<Image
									src={product.image}
									alt={`${product.name} - ${SITE_NAME}`}
									fill
									priority
									sizes="(max-width: 1024px) 100vw, 50vw"
									className="object-contain p-5"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-gray-400">
									No Image
								</div>
							)}
						</div>
					</div>

					{/* INFORMATION */}

					<div>
						<Link
							href={`/category/${encodeURIComponent(product.category)}`}
							className="text-sm font-medium capitalize text-green-600 hover:underline">
							{formatCategory(product.category)}
						</Link>

						<h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
							{product.name}
						</h1>

						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
							{product.brand && (
								<span>Brand: {product.brand}</span>
							)}

							{product.sku && <span>SKU: {product.sku}</span>}

							{totalSold > 0 && <span>{totalSold}+ sold</span>}
						</div>

						{product.shortDescription && (
							<p className="mt-5 leading-7 text-gray-600">
								{product.shortDescription}
							</p>
						)}

						{/* Interactive: price, size, quantity, cart */}

						<ProductPurchase
							productId={String(product._id)}
							name={product.name}
							slug={product.slug}
							image={product.image || ''}
							variants={variants}
						/>

						{/* TRUST */}

						<ul className="mt-7 grid gap-3 sm:grid-cols-3">
							<li className="rounded-xl bg-gray-50 p-3">
								<Truck size={20} className="text-green-600" />

								<p className="mt-2 text-xs text-gray-600">
									বাংলাদেশজুড়ে ডেলিভারি
								</p>
							</li>

							<li className="rounded-xl bg-gray-50 p-3">
								<ShieldCheck
									size={20}
									className="text-green-600"
								/>

								<p className="mt-2 text-xs text-gray-600">
									Quality Checked
								</p>
							</li>

							<li className="rounded-xl bg-gray-50 p-3">
								<BadgeCheck
									size={20}
									className="text-green-600"
								/>

								<p className="mt-2 text-xs text-gray-600">
									{product.warranty || 'খাঁটি ও প্রাকৃতিক'}
								</p>
							</li>
						</ul>
					</div>
				</div>

				{/* DESCRIPTION */}

				{product.description && (
					<section className="mt-12 border-t border-gray-100 pt-10">
						<h2 className="text-2xl font-bold text-gray-900">
							Product Details
						</h2>

						<div className="mt-5 max-w-4xl whitespace-pre-line leading-8 text-gray-600">
							{product.description}
						</div>
					</section>
				)}

				{/* RELATED PRODUCTS (internal links help SEO) */}

				{relatedProducts.length > 0 && (
					<section className="mt-12 border-t border-gray-100 pt-10">
						<h2 className="text-2xl font-bold text-gray-900">
							আরও দেখুন
						</h2>

						<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
							{relatedProducts.map((item) => {
								const itemPrices = (item.variants || []).map(
									(v) => Number(v.sellPrice)
								);

								const itemMin = itemPrices.length
									? Math.min(...itemPrices)
									: 0;

								return (
									<Link
										key={item._id}
										href={productPath(item.slug)}
										className="group block rounded-xl border border-gray-100 p-3 transition hover:border-green-300 hover:shadow-sm">
										<div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
											{item.image && (
												<Image
													src={item.image}
													alt={item.name}
													fill
													sizes="(max-width: 768px) 50vw, 25vw"
													className="object-contain p-2"
												/>
											)}
										</div>

										<h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-green-600">
											{item.name}
										</h3>

										<p className="mt-1 text-sm font-bold text-green-600">
											৳{itemMin}
											{itemPrices.length > 1 ? '+' : ''}
										</p>
									</Link>
								);
							})}
						</div>
					</section>
				)}
			</article>
		</main>
	);
}

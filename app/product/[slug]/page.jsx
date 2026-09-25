import { notFound } from 'next/navigation';
import ProductSinglePage from './ProductSinglePage';
import { getSingleProduct } from '@/fetch/getSingeProduct';

export const dynamic = 'force-dynamic';

/* ---------------- SEO Metadata ---------------- */
export async function generateMetadata({ params }) {
	const { slug } = await params;
	const product = await getSingleProduct(slug);

	if (!product) {
		return {
			title: 'Product Not Found | Tomartbd',
		};
	}

	return {
		title: `${product.metaTitle || product.name} | Tomartbd`,
		description: product.metaDescription,
		keywords: product.keywords,

		openGraph: {
			title: product.metaTitle || product.name,
			description: product.metaDescription,
			url: `${process.env.API_URL}/product/${product.slug}`,
			images: [
				{
					url: product.galleryImages?.[0] || product.featureImg,
					width: 800,
					height: 800,
					alt: product.name,
				},
			],
			type: 'website',
		},

		twitter: {
			card: 'summary_large_image',
			title: product.metaTitle || product.name,
			description: product.metaDescription,
			images: [product.featureImg],
		},
	};
}

/* ---------------- Product Page ---------------- */
export default async function ProductPage({ params }) {
	const { slug } = await params;
  const product = await getSingleProduct(slug);
  
  console.log(product);
  

	if (!product) {
		notFound();
	}

	return (
		<main className="container mx-auto p-4">
			{/* Pass server-fetched product to client component */}
			<ProductSinglePage initialProduct={product} />

			{/* -------- JSON-LD Structured Data -------- */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Product',
						name: product.name,
						image: product.featureImg,
						description: product.metaDescription,
						sku: product.sku || product.slug,
						brand: {
							'@type': 'Brand',
							name:
								typeof product.brand === 'object'
									? product.brand?.name
									: product.brand || 'TomartBD',
						},
						offers: {
							'@type': 'Offer',
							url: `${process.env.API_URL}/product/${product.slug}`,
							priceCurrency: 'BDT',
							price: product.salePrice || product.regularPrice,
							availability:
								product.stock > 0
									? 'https://schema.org/InStock'
									: 'https://schema.org/OutOfStock',
						},
					}),
				}}
			/>
		</main>
	);
}

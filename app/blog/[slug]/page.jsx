import { notFound } from 'next/navigation';
import { connectDB } from '../../../lib/mongodb';
import Blog from '../../../models/Blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shalbanfood.com';

async function getBlog(slug) {
	await connectDB();

	const blog = await Blog.findOne({
		slug,
		status: 'published',
	}).lean();

	if (!blog) {
		return null;
	}

	return JSON.parse(JSON.stringify(blog));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;

	const blog = await getBlog(slug);

	if (!blog) {
		return {
			title: 'Blog Not Found | Shalban Food',
		};
	}

	const title = blog.seoTitle || blog.title || 'Shalban Food Blog';

	const description = blog.seoDescription || blog.excerpt || '';

	const url = `${SITE_URL}/blog/${blog.slug}`;

	return {
		title,

		description,

		keywords: blog.keywords?.length ? blog.keywords : blog.tags,

		alternates: {
			canonical: blog.canonicalUrl || url,
		},

		openGraph: {
			title,
			description,
			url,
			siteName: 'Shalban Food',
			type: 'article',

			...(blog.featuredImage && {
				images: [
					{
						url: blog.featuredImage,
						width: 1200,
						height: 630,
						alt: blog.title,
					},
				],
			}),

			publishedTime: blog.publishedAt
				? new Date(blog.publishedAt).toISOString()
				: undefined,

			modifiedTime: blog.updatedAt
				? new Date(blog.updatedAt).toISOString()
				: undefined,

			authors: [blog.author || 'Shalban Food'],
		},

		twitter: {
			card: 'summary_large_image',
			title,
			description,

			...(blog.featuredImage && {
				images: [blog.featuredImage],
			}),
		},

		robots: {
			index: true,
			follow: true,
		},
	};
}

export default async function BlogDetailsPage({ params }) {
	const { slug } = await params;

	const blog = await getBlog(slug);

	if (!blog) {
		notFound();
	}

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',

		headline: blog.title,

		description: blog.seoDescription || blog.excerpt,

		image: blog.featuredImage ? [blog.featuredImage] : undefined,

		datePublished: blog.publishedAt
			? new Date(blog.publishedAt).toISOString()
			: undefined,

		dateModified: blog.updatedAt
			? new Date(blog.updatedAt).toISOString()
			: undefined,

		author: {
			'@type': 'Organization',
			name: blog.author || 'Shalban Food',
		},

		publisher: {
			'@type': 'Organization',
			name: 'Shalban Food',
			url: SITE_URL,
		},

		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `${SITE_URL}/blog/${blog.slug}`,
		},
	};

	return (
		<main className="min-h-screen bg-white">
			<article className="mx-auto max-w-4xl px-4 py-10">
				<header className="mb-8">
					<div className="mb-3 text-sm text-green-700">
						{blog.category}
					</div>

					<h1 className="text-3xl font-bold leading-tight md:text-5xl">
						{blog.title}
					</h1>

					{blog.excerpt && (
						<p className="mt-5 text-lg leading-8 text-gray-600">
							{blog.excerpt}
						</p>
					)}

					<div className="mt-5 text-sm text-gray-500">
						By {blog.author || 'Shalban Food'}
						{blog.publishedAt && (
							<>
								{' '}
								·{' '}
								{new Date(blog.publishedAt).toLocaleDateString(
									'bn-BD'
								)}
							</>
						)}
					</div>
				</header>

				{blog.featuredImage && (
					<div className="mb-10 overflow-hidden rounded-2xl">
						<img
							src={blog.featuredImage}
							alt={blog.title}
							className="h-auto w-full object-cover"
						/>
					</div>
				)}

				<div
					className="prose prose-lg max-w-none"
					dangerouslySetInnerHTML={{
						__html: blog.content,
					}}
				/>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(articleSchema),
					}}
				/>
			</article>
		</main>
	);
}

import Link from 'next/link';
import { connectDB } from '@/lib/dbConnect';
import Blog from '@/models/Blog';

const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shalbanfood.shop'
).replace(/\/+$/, '');

const SITE_NAME = 'Shalban Food';
const BLOG_URL = `${SITE_URL}/blog`;

export const revalidate = 300;

export const metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		absolute: 'মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ | শালবন ফুড',
	},
	description:
		'মধু, সুন্দরবনের মধু, কালোজিরা ফুলের মধু, গাওয়া ঘি ও প্রাকৃতিক খাবার সম্পর্কে জানুন। খাদ্য নির্বাচন, সংরক্ষণ ও ব্যবহার নিয়ে পড়ুন শালবন ফুডের বাংলা ব্লগে।',
	keywords: [
		'মধু',
		'খাঁটি মধু',
		'সুন্দরবনের মধু',
		'কালোজিরা ফুলের মধু',
		'লিচু ফুলের মধু',
		'গাওয়া ঘি',
		'খাঁটি ঘি',
		'প্রাকৃতিক খাবার',
		'মধুর উপকারিতা',
		'মধু সংরক্ষণ',
		'Shalban Food',
		'শালবন ফুড',
	],
	alternates: {
		canonical: BLOG_URL,
	},
	openGraph: {
		type: 'website',
		locale: 'bn_BD',
		url: BLOG_URL,
		siteName: SITE_NAME,
		title: 'মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ | শালবন ফুড',
		description:
			'মধু ও গাওয়া ঘি সম্পর্কে প্রয়োজনীয় তথ্য, ব্যবহারবিধি এবং প্রাকৃতিক খাবার নিয়ে বাংলা আর্টিকেল পড়ুন।',
		images: [
			{
				url: `${SITE_URL}/og-image.png`,
				width: 1200,
				height: 630,
				alt: 'Shalban Food — স্বাদের সাথে আস্থার বন্ধন',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'মধু ও গাওয়া ঘির বাংলা ব্লগ | Shalban Food',
		description:
			'প্রাকৃতিক খাবার, মধু ও গাওয়া ঘি সম্পর্কে জানুন সহজ বাংলায়।',
		images: [`${SITE_URL}/og-image.png`],
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

async function getBlogs() {
	try {
		await connectDB();

		const blogs = await Blog.find({ status: 'published' })
			.select(
				'title slug excerpt featuredImage featuredImageAlt category author publishedAt createdAt'
			)
			.sort({ publishedAt: -1, createdAt: -1, _id: -1 })
			.lean()
			.exec();

		return blogs.map((blog) => ({
			_id: String(blog._id),
			title: blog.title || '',
			slug: String(blog.slug || ''),
			excerpt: blog.excerpt || '',
			featuredImage: blog.featuredImage || '',
			featuredImageAlt:
				blog.featuredImageAlt || blog.title || 'Shalban Food article',
			category: blog.category || 'প্রাকৃতিক খাবার',
			author: blog.author || SITE_NAME,
			publishedAt: blog.publishedAt
				? new Date(blog.publishedAt).toISOString()
				: null,
			createdAt: blog.createdAt
				? new Date(blog.createdAt).toISOString()
				: null,
		}));
	} catch (error) {
		console.error('Blog fetch error:', error);
		return [];
	}
}

function formatDate(date) {
	if (!date) return null;

	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return null;

	return new Intl.DateTimeFormat('bn-BD', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Asia/Dhaka',
	}).format(parsed);
}

function BlogImage({ blog, featured = false }) {
	if (!blog.featuredImage) {
		return (
			<div className="flex h-full min-h-52 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-green-100">
				<div className="text-center">
					<span className="text-6xl" aria-hidden="true">
						🍯
					</span>
					<p className="mt-3 font-semibold text-green-900">
						Shalban Food
					</p>
				</div>
			</div>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={blog.featuredImage}
			alt={blog.featuredImageAlt}
			loading={featured ? 'eager' : 'lazy'}
			fetchPriority={featured ? 'high' : 'auto'}
			decoding="async"
			className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
		/>
	);
}

function BlogCard({ blog, featured = false }) {
	const href = `/blog/${encodeURIComponent(blog.slug)}`;
	const date = formatDate(blog.publishedAt || blog.createdAt);

	if (featured) {
		return (
			<article className="group overflow-hidden rounded-[32px] border border-stone-200/80 bg-white shadow-[0_24px_80px_rgba(24,39,29,0.08)] transition duration-300 hover:-translate-y-1">
				<div className="grid md:grid-cols-[1.35fr_0.95fr]">
					<Link
						href={href}
						aria-label={`${blog.title} পড়ুন`}
						className="relative block overflow-hidden bg-stone-100 md:min-h-[420px]">
						<BlogImage blog={blog} featured />
						<div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
							<span className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-green-900 backdrop-blur-sm">
								{blog.category}
							</span>
							<span className="rounded-full bg-[#0d2a1c]/90 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
								Featured
							</span>
						</div>
					</Link>

					<div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8">
						<div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
							{date && (
								<time
									dateTime={
										blog.publishedAt || blog.createdAt
									}>
									{date}
								</time>
							)}
							<span aria-hidden="true">•</span>
							<span>{blog.author}</span>
						</div>

						<h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-[2.2rem]">
							<Link
								href={href}
								className="transition-colors hover:text-green-800">
								{blog.title}
							</Link>
						</h2>

						{blog.excerpt && (
							<p className="mt-4 line-clamp-4 text-base leading-8 text-stone-600">
								{blog.excerpt}
							</p>
						)}

						<div className="mt-7 flex items-center justify-between rounded-2xl bg-[#f4f6f0] p-3 sm:p-4">
							<div className="text-left">
								<p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-green-800">
									Read story
								</p>
								<p className="mt-1 text-sm font-semibold text-stone-700">
									সম্পূর্ণ পড়ুন
								</p>
							</div>
							<Link
								href={href}
								className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-900 text-xl text-white transition-transform hover:translate-x-1"
								aria-label={`${blog.title} পড়ুন`}>
								→
							</Link>
						</div>
					</div>
				</div>
			</article>
		);
	}

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-[0_16px_45px_rgba(24,39,29,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(24,39,29,0.10)]">
			<Link
				href={href}
				aria-label={`${blog.title} পড়ুন`}
				className="relative block overflow-hidden bg-stone-100">
				<div className="aspect-[4/3] overflow-hidden">
					<BlogImage blog={blog} />
				</div>
				<span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-900 shadow-sm backdrop-blur-sm">
					{blog.category}
				</span>
			</Link>

			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-center gap-3 text-[11px] font-medium text-stone-500">
					{date && (
						<time dateTime={blog.publishedAt || blog.createdAt}>
							{date}
						</time>
					)}
					<span aria-hidden="true">•</span>
					<span>{blog.author}</span>
				</div>

				<h3 className="mt-4 text-xl font-black leading-snug tracking-tight text-stone-900 transition-colors group-hover:text-green-800">
					<Link href={href}>{blog.title}</Link>
				</h3>

				{blog.excerpt && (
					<p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-600">
						{blog.excerpt}
					</p>
				)}

				<div className="mt-auto pt-6">
					<Link
						href={href}
						className="inline-flex items-center gap-2 text-sm font-bold text-green-800 transition-all hover:gap-3">
						পড়ুন
						<span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</article>
	);
}

function BlogSidebarCard({ blog }) {
	const href = `/blog/${encodeURIComponent(blog.slug)}`;
	const date = formatDate(blog.publishedAt || blog.createdAt);

	return (
		<article className="group flex gap-3 rounded-2xl border border-stone-200/80 bg-[#faf9f6] p-2.5 transition hover:border-green-200 hover:bg-white">
			<Link
				href={href}
				className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
				<BlogImage blog={blog} />
			</Link>

			<div className="min-w-0 flex-1 py-1">
				<p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-green-800">
					{blog.category}
				</p>
				<h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-6 text-stone-900 transition-colors group-hover:text-green-800">
					<Link href={href}>{blog.title}</Link>
				</h3>
				{date && (
					<time
						className="mt-2 block text-[11px] text-stone-500"
						dateTime={blog.publishedAt || blog.createdAt}>
						{date}
					</time>
				)}
			</div>
		</article>
	);
}

function getStructuredData(blogs) {
	const data = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ',
		description:
			'মধু, গাওয়া ঘি এবং প্রাকৃতিক খাবার সম্পর্কে বাংলায় তথ্যবহুল আর্টিকেল।',
		url: BLOG_URL,
		inLanguage: 'bn-BD',
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: SITE_URL,
		},
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: blogs.length,
			itemListElement: blogs.map((blog, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				url: `${BLOG_URL}/${encodeURIComponent(blog.slug)}`,
				name: blog.title,
			})),
		},
	};

	return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default async function BlogPage() {
	const blogs = await getBlogs();
	const [featuredBlog, ...otherBlogs] = blogs;
	const sidebarBlogs = otherBlogs.slice(0, 3);
	const latestBlogs = otherBlogs.slice(3);

	return (
		<main className="min-h-screen bg-[#f4efe8] text-stone-900">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: getStructuredData(blogs),
				}}
			/>

			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
				<header className="rounded-full border border-stone-200/80 bg-white/70 px-5 py-3 shadow-[0_8px_25px_rgba(24,39,29,0.04)] backdrop-blur-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Link href="/" className="flex items-center gap-3">
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-emerald-500 text-lg text-white shadow-md">
								S
							</span>
							<div>
								<p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-green-800">
									Shalban Food
								</p>
								<p className="text-xs text-stone-500">
									Journal
								</p>
							</div>
						</Link>

						<nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-stone-600">
							<Link
								href="/"
								className="rounded-full px-3 py-1.5 transition hover:bg-stone-100 hover:text-stone-900">
								Home
							</Link>
							<Link
								href="/shop"
								className="rounded-full px-3 py-1.5 transition hover:bg-stone-100 hover:text-stone-900">
								Shop
							</Link>
							<Link
								href="/honey"
								className="rounded-full px-3 py-1.5 transition hover:bg-stone-100 hover:text-stone-900">
								Honey
							</Link>
							<Link
								href="/ghee"
								className="rounded-full px-3 py-1.5 transition hover:bg-stone-100 hover:text-stone-900">
								Ghee
							</Link>
						</nav>
					</div>
				</header>
			</div>

			<section className="relative isolate overflow-hidden border-b border-green-100 bg-gradient-to-br from-[#f4f9f0] via-[#fffdf9] to-[#fdf1d8]">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-green-200/60 blur-3xl"
				/>

				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
					<div className="mb-7 flex flex-wrap gap-3">
						{[
							'মধু',
							'গাওয়া ঘি',
							'স্বাস্থ্যকর খাবার',
							'প্রাকৃতিক পণ্য',
							'উপকারী তথ্য',
						].map((tag) => (
							<span
								key={tag}
								className="rounded-full border border-green-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-green-900 shadow-sm">
								{tag}
							</span>
						))}
					</div>

					<div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
						<div>
							{featuredBlog ? (
								<BlogCard blog={featuredBlog} featured />
							) : (
								<div className="rounded-[32px] border border-dashed border-stone-300 bg-white/80 p-10 text-center">
									<h2 className="text-2xl font-black">
										নতুন আর্টিকেল আসছে
									</h2>
									<p className="mt-3 text-stone-600">
										সদ্য প্রকাশিত ব্লগ পোস্ট দ্রুত এখানে যোগ
										হবে।
									</p>
								</div>
							)}
						</div>

						<aside className="rounded-[32px] border border-stone-200/80 bg-white/80 p-5 shadow-[0_16px_45px_rgba(24,39,29,0.06)] backdrop-blur-sm sm:p-6">
							<div className="mb-5 flex items-center justify-between gap-3">
								<div>
									<p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-800">
										Trending
									</p>
									<h2 className="mt-2 text-xl font-black">
										Top reads
									</h2>
								</div>
								<span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">
									{blogs.length.toLocaleString('bn-BD')}
								</span>
							</div>

							<div className="space-y-4">
								{sidebarBlogs.length > 0 ? (
									sidebarBlogs.map((blog) => (
										<BlogSidebarCard
											key={blog._id}
											blog={blog}
										/>
									))
								) : (
									<div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500">
										এই মুহূর্তে কোনো ট্রেন্ডিং গল্প নেই।
									</div>
								)}
							</div>
						</aside>
					</div>
				</div>
			</section>

			<section
				aria-labelledby="blog-list-heading"
				className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-green-800">
							Latest stories
						</p>
						<h2
							id="blog-list-heading"
							className="mt-3 text-3xl font-black tracking-tight text-stone-900">
							সর্বশেষ আর্টিকেল
						</h2>
					</div>

					<div className="flex items-center gap-3">
						{blogs.length > 0 && (
							<span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600">
								{blogs.length.toLocaleString('bn-BD')} টি
								আর্টিকেল
							</span>
						)}
						<Link
							href="/shop"
							className="rounded-full bg-green-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800">
							পণ্য দেখুন
						</Link>
					</div>
				</div>

				{blogs.length === 0 ? (
					<div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-[0_14px_35px_rgba(24,39,29,0.03)] sm:py-20">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
							📚
						</div>
						<h2 className="mt-5 text-xl font-extrabold">
							নতুন আর্টিকেল আসছে
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone-600">
							আমাদের প্রকাশিত আর্টিকেল এখানে দেখতে পাবেন। বিভিন্ন
							স্বাস্থ্যকর খাবার ও প্রাকৃতিক পণ্যের তথ্য নিয়ে
							লেখাগুলো পড়ুন।
						</p>
						<Link
							href="/shop"
							className="mt-7 inline-flex rounded-full bg-green-800 px-6 py-3 font-bold text-white transition hover:bg-green-900">
							পণ্য দেখুন
						</Link>
					</div>
				) : (
					<>
						{latestBlogs.length > 0 && (
							<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
								{latestBlogs.map((blog) => (
									<BlogCard key={blog._id} blog={blog} />
								))}
							</div>
						)}
					</>
				)}
			</section>
		</main>
	);
}

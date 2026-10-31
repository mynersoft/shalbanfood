
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductSkeleton from '../Skeleton/ProductSkeleton';


const DEFAULT_IMAGE =
	'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80';

const formatDate = (value) => {
	if (!value) return '';

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return '';

	return new Intl.DateTimeFormat('bn-BD', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'Asia/Dhaka',
	}).format(date);
};

export default function ShowBlogPost({
	heading = 'খাদ্য ও পুষ্টিবিষয়ক ব্লগ',
	description = 'খাঁটি মধু, গাওয়া ঘি ও প্রাকৃতিক খাবার সম্পর্কে জানুন।',
	limit = 3,
}) {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [retry, setRetry] = useState(0);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchPosts() {
			try {
				setLoading(true);
				setError(false);

				const response = await fetch(
					`/api/blogs?page=1&limit=${encodeURIComponent(limit)}`,
					{ signal: controller.signal }
				);

				if (!response.ok) {
					throw new Error('Failed to load blog posts');
				}

				const data = await response.json();

				if (!data.success) {
					throw new Error('Invalid API response');
				}

				setPosts(
					(Array.isArray(data.posts) ? data.posts : [])
						.filter((post) => post?.slug)
						.slice(0, Math.max(0, limit))
				);
			} catch (err) {
				if (err.name !== 'AbortError') {
					setError(true);
					setPosts([]);
				}
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		}

		fetchPosts();

		return () => controller.abort();
	}, [limit, retry]);

	return (
		<section className="bg-white py-10 sm:py-14 lg:py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section heading */}
				<div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-xl">
							{heading}
						</h2>

						<p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
							{description}
						</p>
					</div>

					<Link
						href="/blog"
						className="hidden shrink-0 items-center gap-2 rounded-lg border border-[#1f5d3b]/20 px-4 py-2.5 text-sm font-semibold text-[#1f5d3b] transition hover:border-[#1f5d3b] hover:bg-[#1f5d3b] hover:text-white sm:inline-flex">
						সব ব্লগ
						<span aria-hidden="true">→</span>
					</Link>
				</div>

				{/* Loading skeleton */}
				{loading && <ProductSkeleton count={4} />}

				{/* Error state */}
				{!loading && error && (
					<div
						role="alert"
						className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center">
						<p className="text-sm text-red-700">
							ব্লগ লোড করা যায়নি। আবার চেষ্টা করুন।
						</p>

						<button
							type="button"
							onClick={() => setRetry((value) => value + 1)}
							className="mt-4 rounded-lg bg-[#1f5d3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17472d]">
							আবার চেষ্টা করুন
						</button>
					</div>
				)}

				{/* Empty state */}
				{!loading && !error && posts.length === 0 && (
					<div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-12 text-center">
						<p className="text-sm text-gray-500">
							নতুন ব্লগ খুব শিগগিরই প্রকাশিত হবে।
						</p>
					</div>
				)}

				{/* Blog cards */}
				{!loading && !error && posts.length > 0 && (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
						{posts.map((post) => (
							<article
								key={post._id || post.slug}
								className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#1f5d3b]/30 hover:shadow-lg hover:shadow-gray-200/60">
								<Link
									href={`/blog/${encodeURIComponent(post.slug)}`}
									aria-label={`${post.title} পড়ুন`}
									className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5d3b]">
									{/* Image */}
									<div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
										<img
											src={
												post.featuredImage ||
												DEFAULT_IMAGE
											}
											alt={
												post.featuredImageAlt ||
												post.title ||
												'Shalban Food blog'
											}
											loading="lazy"
											decoding="async"
											className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
											onError={(event) => {
												const image =
													event.currentTarget;

												image.onerror = null;
												image.src = DEFAULT_IMAGE;
											}}
										/>

										<span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1f5d3b] shadow-sm">
											{post.category || 'খাদ্য ও পুষ্টি'}
										</span>
									</div>

									{/* Content */}
									<div className="flex flex-1 flex-col p-5">
										<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
											<span>
												{formatDate(
													post.publishedAt ||
														post.createdAt
												) || 'Shalban Food'}
											</span>

											<span
												aria-hidden="true"
												className="h-1 w-1 rounded-full bg-gray-300"
											/>

											<span className="truncate">
												{post.author || 'Shalban Food'}
											</span>
										</div>

										<h3 className="line-clamp-2 text-lg font-bold leading-7 text-gray-900 transition-colors group-hover:text-[#1f5d3b]">
											{post.title}
										</h3>

										<p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-500">
											{post.excerpt ||
												'বিস্তারিত জানতে সম্পূর্ণ লেখাটি পড়ুন।'}
										</p>

										{/* Footer */}
										<div className="mt-auto mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
											<span className="truncate text-xs font-medium text-gray-500">
												{post.tags?.[0] ||
													'Shalban Food'}
											</span>

											<span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#1f5d3b]">
												পড়ুন
												<span
													aria-hidden="true"
													className="transition-transform group-hover:translate-x-1">
													→
												</span>
											</span>
										</div>
									</div>
								</Link>
							</article>
						))}
					</div>
				)}

				{/* Mobile view all */}
				<div className="mt-7 text-center sm:hidden">
					<Link
						href="/blog"
						className="inline-flex items-center gap-2 rounded-lg border border-[#1f5d3b]/20 px-5 py-3 text-sm font-semibold text-[#1f5d3b] transition hover:bg-[#1f5d3b] hover:text-white">
						সব ব্লগ দেখুন
						<span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</section>
	);
}

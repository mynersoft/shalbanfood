
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ShoppingBag,
	Search,
	ArrowRight,
	RefreshCw,
	X,
} from 'lucide-react';

import ShopList from '@/components/shop/ShopLists';
import { useProducts } from '@/hooks/useProducts';

export default function ShopPage() {
	const { data, isLoading, isFetching } = useProducts();

	const products = data?.products || [];

	const [search, setSearch] = useState('');
	
	const [filtered, setFiltered] = useState([]);

	// Initialize products
	useEffect(() => {
		setFiltered(products);
	}, [products]);

	// Search + Sort
	useEffect(() => {
		let result = [...products];

		// Search
		if (search.trim()) {
			const keyword = search.toLowerCase().trim();

			result = result.filter((product) =>
				product.name?.toLowerCase().includes(keyword)
			);
		}

	

		setFiltered(result);
	}, [products, search]);

	const clearSearch = () => {
		setSearch('');
	};

	return (
		<main className="min-h-screen bg-[#fafbf9]">
			{/* =========================================
				HEADER
			========================================= */}
			<section className="border-b border-gray-100 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
						<div>
							{/* Breadcrumb */}
							<div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
								<Link
									href="/"
									className="transition hover:text-[#1f5d3b]"
								>
									Home
								</Link>

								<span>/</span>

								<span className="font-medium text-gray-600">
									Shop
								</span>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef6f0]">
									<ShoppingBag className="h-5 w-5 text-[#1f5d3b]" />
								</div>

								<div>
									<h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
										Shop
									</h1>

									<p className="mt-0.5 text-sm text-gray-500">
										প্রাকৃতিক ও মানসম্মত খাবার খুঁজে নিন
									</p>
								</div>
							</div>
						</div>

						{!isLoading && (
							<div className="text-sm text-gray-500">
								<span className="font-semibold text-gray-900">
									{filtered.length}
								</span>{' '}
								products
							</div>
						)}
					</div>
				</div>
			</section>

			{/* =========================================
				SHOP CONTENT
			========================================= */}
			<section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				{/* Search + Sort */}
				<div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Search */}
					<div className="relative w-full sm:max-w-md">
						<Search
							className="
								pointer-events-none
								absolute
								left-4
								top-1/2
								h-4
								w-4
								-translate-y-1/2
								text-gray-400
							"
						/>

						<input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search products..."
							className="
								h-11
								w-full
								rounded-xl
								border
								border-gray-300
								bg-white
								pl-11
								pr-10
								text-sm
								text-gray-900
								outline-none
								transition
								placeholder:text-gray-400
								focus:border-[#1f5d3b]
								focus:ring-2
								focus:ring-[#1f5d3b]/10
							"
						/>

						{search && (
							<button
								type="button"
								onClick={clearSearch}
								className="
									absolute
									right-3
									top-1/2
									flex
									-translate-y-1/2
									items-center
									justify-center
									rounded-full
									p-1
									text-gray-400
									transition
									hover:bg-gray-100
									hover:text-gray-700
								"
								aria-label="Clear search"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					
				</div>

				{/* Result Info */}
				<div className="mb-5 flex items-center justify-between">
					<div>
						<h2 className="text-lg font-bold text-gray-900">
							All Products
						</h2>

						{!isLoading && (
							<p className="mt-0.5 text-xs text-gray-500">
								Showing {filtered.length} products
							</p>
						)}
					</div>

					{isFetching && !isLoading && (
						<div className="flex items-center gap-2 text-xs text-gray-400">
							<RefreshCw className="h-3.5 w-3.5 animate-spin" />
							Updating...
						</div>
					)}
				</div>

				{/* =========================================
					LOADING SKELETON
				========================================= */}
				{isLoading ? (
					<div
						className="
							grid
							grid-cols-2
							gap-3
							sm:grid-cols-3
							sm:gap-4
							lg:grid-cols-4
						"
					>
						{Array.from({ length: 8 }).map((_, index) => (
							<div
								key={index}
								className="
									overflow-hidden
									rounded-2xl
									border
									border-gray-100
									bg-white
									shadow-sm
								"
							>
								{/* Image Skeleton */}
								<div className="aspect-square animate-pulse bg-gray-200" />

								{/* Content Skeleton */}
								<div className="space-y-3 p-3 sm:p-4">
									<div className="h-3 w-20 animate-pulse rounded bg-gray-200" />

									<div className="h-4 w-full animate-pulse rounded bg-gray-200" />

									<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

									<div className="flex items-center justify-between gap-2 pt-1">
										<div className="h-5 w-16 animate-pulse rounded bg-gray-200" />

										<div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
									</div>

									<div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
								</div>
							</div>
						))}
					</div>
				) : filtered.length > 0 ? (
					/* =========================================
						PRODUCTS
					========================================= */
					<ShopList products={filtered} />
				) : (
					/* =========================================
						EMPTY SEARCH
					========================================= */
					<div
						className="
							flex
							min-h-[380px]
							items-center
							justify-center
							rounded-3xl
							border
							border-dashed
							border-gray-200
							bg-white
							px-6
							py-16
						"
					>
						<div className="max-w-md text-center">
							<div
								className="
									mx-auto
									flex
									h-16
									w-16
									items-center
									justify-center
									rounded-full
									bg-[#eef6f0]
								"
							>
								<Search className="h-7 w-7 text-[#1f5d3b]" />
							</div>

							<h3 className="mt-5 text-xl font-bold text-gray-900">
								No products found
							</h3>

							<p className="mt-2 text-sm leading-6 text-gray-500">
								We couldn't find any product matching{' '}
								<span className="font-medium text-gray-700">
									"{search}"
								</span>
								.
							</p>

							<button
								type="button"
								onClick={clearSearch}
								className="
									mt-6
									inline-flex
									items-center
									gap-2
									rounded-xl
									bg-[#1f5d3b]
									px-5
									py-3
									text-sm
									font-semibold
									text-white
									transition
									hover:bg-[#174a2f]
								"
							>
								Clear Search
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</section>
		</main>
	);
}


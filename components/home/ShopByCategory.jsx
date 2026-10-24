'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
	{
		name: 'Honey',
		slug: 'honey',
		image: '/images/categories/honey.png',
	},
	{
		name: 'Ghee',
		slug: 'ghee',
		image: '/images/categories/ghee.png',
	},
	{
		name: 'Dry fruits',
		slug: 'dry-fruits',
		image: '/images/categories/dry-fruits.png',
	},
	{
		name: 'Nuts & seeds',
		slug: 'nuts-seeds',
		image: '/images/categories/nuts-seeds.png',
	},
	{
		name: 'Dates',
		slug: 'dates',
		image: '/images/categories/dates.png',
	},
	{
		name: 'Natural food',
		slug: 'natural-food',
		image: '/images/categories/natural-food.png',
	},
];

export default function ShopByCategory() {
	return (
		<section className="bg-white py-8 sm:py-10">
			<div className="mx-auto max-w-7xl px-3 sm:px-4">
				<div className="mb-5 sm:mb-6">
					<h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
						Shop by Category
					</h2>

					<p className="mt-1 text-xs text-gray-500 sm:text-sm">
						আপনার পছন্দের ক্যাটাগরি বেছে নিন
					</p>
				</div>

				<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/category/${category.slug}`}
							className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
							<div className="relative flex h-[130px] items-center justify-center overflow-hidden bg-gray-50 sm:h-[150px] lg:h-[170px]">
								<Image
									src={category.image}
									alt={`${category.name} - Shalban Food`}
									fill
									sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
									className="object-contain p-3 transition duration-500 group-hover:scale-110 sm:p-5"
								/>
							</div>

							<div className="border-t border-gray-100 bg-white px-2 py-2 text-center sm:px-3">
								<span className="block text-xs font-semibold text-gray-700 sm:text-sm">
									{category.name}
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}

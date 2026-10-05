'use client';

import { useSelector } from 'react-redux';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import ShopByCategory from '@/components/home/ShopByCategory';
import Hero from '@/components/home/Hero';
import Link from 'next/link';
import LatestProducts from '@/components/home/LatestProducts';

export default function HomePage() {
	

	return (
		<main className="min-h-screen bg-white">
			<Hero />

			<section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10 md:px-6 lg:px-8">
				<ShopByCategory />
			</section>

			<section
				className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-10
                    sm:py-12
                    md:px-6
                    lg:px-8
                ">
				{/* SECTION HEADER */}

			<LatestProducts/>

				{/* =================================================
                    LOADING
                ================================================= */}

			
			</section>
		</main>
	);
}

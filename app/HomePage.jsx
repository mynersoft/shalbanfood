'use client';
import ShopByCategory from '@/components/home/ShopByCategory';
import Hero from '@/components/home/Hero';
import LatestProducts from '@/components/home/LatestProducts';
import ShowBlogPost from '@/components/home/ShowBlogPost';

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
                    py-4
                    sm:py-12
                    md:px-6
                    lg:px-8
                ">
				<LatestProducts />
			</section>

			<section
				className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-4
                    sm:py-12
                    md:px-6
                    lg:px-8
                ">
				<ShowBlogPost
					heading="ব্লগ পোস্ট পড়ুন"
					description="খাঁটি মধু, গাওয়া ঘি ও প্রাকৃতিক খাবার সম্পর্কে জানুন।"
					limit={3}
				/>
			</section>
		</main>
	);
}

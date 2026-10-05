import { useProducts } from '@/hooks/useProducts';
import Link from 'next/link';
import ProductCard from '../products/ProductCard';


const LatestProducts = () => {
	const { data, isLoading, isFetching } = useProducts();
	return (
		<>
			<div
				className="
                        mb-6
                        flex
                        items-end
                        justify-between
                        gap-4
                    ">
				<div>
					<p
						className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-[#1f5d3b]
                            ">
						Fresh Picks
					</p>

					<h2
						className="
                                mt-1
                                text-2xl
                                font-bold
                                tracking-tight
                                text-gray-900
                                sm:text-3xl
                            ">
						Latest Products
					</h2>

					<p className="mt-1 text-sm text-gray-500">
						আমাদের নতুন ও জনপ্রিয় পণ্যগুলো দেখুন।
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-3">
					{isFetching && !isLoading && (
						<span
							className="
                                    hidden
                                    text-xs
                                    text-gray-400
                                    sm:block
                                ">
							Updating...
						</span>
					)}

					<Link
						href="/shop"
						className="
                                text-xs
                                font-semibold
                                text-[#1f5d3b]
                                transition
                                hover:underline
                                sm:text-sm
                            ">
						View All →
					</Link>
				</div>
			</div>
			{isLoading ? (
				<div
					className="
                            grid
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-3
                            lg:grid-cols-4
                        ">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<div
							key={item}
							className="
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-gray-100
                                        bg-white
                                    ">
							<div className="aspect-square animate-pulse bg-gray-100" />

							<div className="space-y-3 p-3">
								<div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
								<div className="h-4 w-2/5 animate-pulse rounded bg-gray-100" />
								<div className="h-9 w-full animate-pulse rounded-xl bg-gray-100" />
							</div>
						</div>
					))}
				</div>
			) : data.length === 0 ? (
				<div
					className="
                            rounded-2xl
                            border
                            border-dashed
                            border-gray-200
                            bg-gray-50
                            px-5
                            py-16
                            text-center
                        ">
					<div
						className="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-2xl
                                shadow-sm
                            ">
						🛍️
					</div>

					<h3
						className="
                                mt-4
                                font-semibold
                                text-gray-900
                            ">
						No products available
					</h3>

					<p
						className="
                                mx-auto
                                mt-1
                                max-w-sm
                                text-sm
                                text-gray-500
                            ">
						নতুন পণ্য শীঘ্রই যুক্ত করা হবে।
					</p>

					<Link
						href="/shop"
						className="
                                mt-5
                                inline-flex
                                rounded-xl
                                bg-[#1f5d3b]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#174a2f]
                            ">
						Browse Shop
					</Link>
				</div>
			) : (
				/* =================================================
                        PRODUCTS
                    ================================================= */

				<div
					className="
                            grid
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-3
                            lg:grid-cols-4
                        ">
					{data.length >= 0 &&
						data.map((product) => (
							<ProductCard key={product._id} product={product} />
						))}
				</div>
			)}
		</>
	);
};

export default LatestProducts;

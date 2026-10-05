import Link from "next/link";

const Hero = () => {
	return (
			<section className="border-b border-gray-100 bg-[#f7faf8]">
						<div
							className="
								mx-auto
								flex
								max-w-7xl
								flex-col
								px-4
								py-10
								sm:py-14
								md:flex-row
								md:items-center
								md:justify-between
								md:gap-10
								md:px-6
								lg:px-8
							"
						>
							<div className="max-w-2xl">
		
								<span
									className="
										inline-flex
										rounded-full
										bg-[#e8f4ed]
										px-3
										py-1.5
										text-xs
										font-semibold
										text-[#1f5d3b]
									"
								>
									🌿 Natural & Quality Food
								</span>
		
								<h1
									className="
										mt-4
										text-3xl
										font-bold
										leading-tight
										tracking-tight
										text-gray-900
										sm:text-4xl
										md:text-5xl
									"
								>
									প্রাকৃতিক স্বাদ,
									<br />
									<span className="text-[#1f5d3b]">
										আস্থার সাথে
									</span>
								</h1>
		
								<p
									className="
										mt-4
										max-w-xl
										text-sm
										leading-6
										text-gray-600
										sm:text-base
									"
								>
									শালবন ফুডে পাবেন মানসম্মত মধু, ঘি
									এবং বাছাই করা প্রাকৃতিক খাবার।
								</p>
		
								<div className="mt-6 flex flex-wrap gap-3">
		
									<Link
										href="/shop"
										className="
											inline-flex
											items-center
											justify-center
											rounded-xl
											bg-[#1f5d3b]
											px-6
											py-3
											text-sm
											font-semibold
											text-white
											shadow-sm
											transition
											hover:bg-[#174a2f]
										"
									>
										Shop Now
									</Link>
		
									<Link
										href="/combo-offer"
										className="
											inline-flex
											items-center
											justify-center
											rounded-xl
											border
											border-gray-200
											bg-white
											px-6
											py-3
											text-sm
											font-semibold
											text-gray-700
											transition
											hover:border-[#1f5d3b]
											hover:text-[#1f5d3b]
										"
									>
										View Offers
									</Link>
		
								</div>
							</div>
		
							{/* TRUST POINTS */}
		
							<div
								className="
									mt-8
									grid
									grid-cols-3
									gap-3
									md:mt-0
									md:min-w-[360px]
								"
							>
								<div
									className="
										rounded-2xl
										border
										border-gray-100
										bg-white
										p-4
										text-center
										shadow-sm
									"
								>
									<div className="text-xl">🌿</div>
									<p className="mt-2 text-xs font-semibold text-gray-800">
										Natural
									</p>
									<p className="mt-1 text-[10px] text-gray-500">
										Quality Food
									</p>
								</div>
		
								<div
									className="
										rounded-2xl
										border
										border-gray-100
										bg-white
										p-4
										text-center
										shadow-sm
									"
								>
									<div className="text-xl">✓</div>
									<p className="mt-2 text-xs font-semibold text-gray-800">
										Trusted
									</p>
									<p className="mt-1 text-[10px] text-gray-500">
										Product Quality
									</p>
								</div>
		
								<div
									className="
										rounded-2xl
										border
										border-gray-100
										bg-white
										p-4
										text-center
										shadow-sm
									"
								>
									<div className="text-xl">📦</div>
									<p className="mt-2 text-xs font-semibold text-gray-800">
										Delivery
									</p>
									<p className="mt-1 text-[10px] text-gray-500">
										Across Bangladesh
									</p>
								</div>
							</div>
						</div>
					</section>
	);
}

export default Hero;
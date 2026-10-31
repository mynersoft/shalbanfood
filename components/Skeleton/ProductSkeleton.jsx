const ProductSkeleton = ({ count = 4 }) => {
	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
					{/* Image Skeleton */}
					<div className="relative aspect-square overflow-hidden bg-gray-100">
						<div className="absolute inset-0 skeleton-shimmer" />
					</div>

					
					{/* Content Skeleton */}
					<div className="space-y-3 p-3 sm:p-4">
						<div className="relative h-3 w-4/5 overflow-hidden rounded bg-gray-100">
							<div className="absolute inset-0 skeleton-shimmer" />
						</div>

						<div className="relative h-3 w-2/3 overflow-hidden rounded bg-gray-100">
							<div className="absolute inset-0 skeleton-shimmer" />
						</div>

						<div className="relative h-5 w-2/5 overflow-hidden rounded bg-gray-100">
							<div className="absolute inset-0 skeleton-shimmer" />
						</div>

						<div className="relative h-9 w-full overflow-hidden rounded-xl bg-gray-100">
							<div className="absolute inset-0 skeleton-shimmer" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ProductSkeleton;

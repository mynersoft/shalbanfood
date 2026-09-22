'use client';

import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { addToCart } from '@/redux/store/slices/cartSlice';
import { toggleWishlist } from '@/redux/store/slices/wishlistSlice';
import ProductQuickView from './ProductQuickView';
import Link from 'next/link';

export default function ProductCard({ product }) {
	const dispatch = useDispatch();
	const wishlist = useSelector((state) => state.wishlist.items);
	const isWishlisted = wishlist.some((item) => item._id === product._id);
	const [open, setOpen] = useState(false);

	// ✅ Discount price
	const calculateDiscountPrice = () => {
		if (product.discount && product.discount > 0) {
			return (product.price * (100 - product.discount)) / 100;
		}
		return product.price;
	};

	const formatPrice = (price) => Number(price).toFixed(2);

	const discountPrice = calculateDiscountPrice();
	const hasDiscount = product.discount && product.discount > 0;

	const handleToggle = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dispatch(toggleWishlist(product));
		toast.success(
			isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
		);
	};

	const handleAddToCart = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		dispatch(addToCart({ product }));
		toast.success('Added to cart!');
	};

	// Get product slug/ID for URL
	const productSlug = product.slug || product._id;
	const productUrl = `/products/${productSlug}`;

	return (
		<>
			{/* Quick View Modal */}
			{open && (
				<ProductQuickView
					product={product}
					onClose={() => setOpen(false)}
					onAddToCart={() => {
						handleAddToCart();
						setOpen(false);
					}}
				/>
			)}

			<div className="bg-white shadow rounded overflow-hidden flex flex-col hover:shadow-lg transition">
				{/* Image Section - Clickable */}
				<div className="h-48 bg-gray-100 relative flex items-center justify-center group">
					<Link
						href={productUrl}
						className="h-full w-full flex items-center justify-center"
						aria-label={`View ${product.name} details`}>
						{product.images?.length > 0 ? (
							<img
								src={product.images[0]}
								alt={product.name}
								className="h-full w-full object-contain p-2 group-hover:scale-105 transition duration-300"
							/>
						) : (
							<span className="text-gray-400">No Image</span>
						)}
					</Link>

					{/* Discount Badge */}
					{hasDiscount && (
						<span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
							-{product.discount}%
						</span>
					)}

					{/* Wishlist Button */}
					<button
						onClick={handleToggle}
						className={`absolute top-2 right-2 p-2 rounded-full shadow z-10 ${
							isWishlisted
								? 'bg-red-500 text-white'
								: 'bg-white hover:bg-red-100'
						}`}
						aria-label={
							isWishlisted
								? 'Remove from wishlist'
								: 'Add to wishlist'
						}>
						{isWishlisted ? '❤️' : '🤍'}
					</button>

					{/* Quick View Overlay on Image Hover */}
					<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
						<span className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
							Click to View Details
						</span>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-4 flex flex-col flex-1">
					{/* Product Name - Clickable */}
					<Link
						href={productUrl}
						className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition-colors mb-2"
						aria-label={`View ${product.name} details`}>
						{product.name}
					</Link>

					{/* Brand */}
					{product.brand && (
						<p className="text-sm text-gray-500 mb-2">
							{product.brand}
						</p>
					)}

					{/* Price */}
					<div className="mb-3">
						{hasDiscount ? (
							<div className="flex items-center gap-2">
								<span className="text-red-600 font-bold text-xl">
									{formatPrice(discountPrice)} ৳
								</span>
								<span className="line-through text-gray-400 text-sm">
									{formatPrice(product.price)} ৳
								</span>
							</div>
						) : (
							<span className="text-blue-600 font-bold text-xl">
								{formatPrice(product.price)} ৳
							</span>
						)}
					</div>

					{/* Rating */}
					{product.rating && (
						<div className="text-yellow-400 text-sm mb-3">
							{'★'.repeat(Math.floor(product.rating))}
							{'☆'.repeat(5 - Math.floor(product.rating))}
							<span className="text-gray-500 text-xs ml-2">
								({product.ratingCount || 0})
							</span>
						</div>
					)}

					{/* Actions */}
					<div className="mt-auto flex gap-2">
						<button
							onClick={() => setOpen(true)}
							className="flex-1 bg-gray-100 border px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-medium">
							Quick View
						</button>
						<button
							onClick={handleAddToCart}
							className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
							Add to Cart
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

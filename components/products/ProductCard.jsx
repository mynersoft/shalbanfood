'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
	const dispatch = useDispatch();
	const finalPrice =
		product.salePrice > 0 ? product.salePrice : product.regularPrice;

	const hasDiscount =
		product.salePrice > 0 && product.salePrice < product.regularPrice;

	const handleAddToCart = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		dispatch(addToCart({ product }));
		toast.success('Added to cart!');
	};

	return (
		<div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
			{/* Image */}
			<Link href={`/product/${product.slug}`}>
				<div className="relative aspect-square overflow-hidden bg-gray-100">
					{product.featureImg ? (
						<Image
							src={product.featureImg}
							alt={product.name}
							fill
							sizes="(max-width: 768px) 50vw, 25vw"
							className="object-cover transition duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-gray-400">
							No Image
						</div>
					)}

					{hasDiscount && (
						<span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
							Sale
						</span>
					)}
				</div>
			</Link>

			{/* Content */}
			<div className="p-3">
				<Link href={`/product/${product.slug}`}>
					<h2 className="line-clamp-2 min-h-[40px] text-sm font-medium text-gray-800">
						{product.name}
					</h2>
				</Link>

				{/* Price */}
				<div className="mt-2 flex items-center gap-2">
					<span className="text-lg font-bold text-gray-900">
						৳{finalPrice}
					</span>

					{hasDiscount && (
						<span className="text-sm text-gray-400 line-through">
							৳{product.regularPrice}
						</span>
					)}
				</div>

				{/* Stock */}
				<div className="mt-1">
					{product.stock > 0 ? (
						<span className="text-xs text-green-600">In Stock</span>
					) : (
						<span className="text-xs text-red-500">
							Out of Stock
						</span>
					)}
				</div>

				{/* Add to cart */}
				<button
					type="button"
					disabled={product.stock <= 0}
					onClick={handleAddToCart}
					className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300">
					<ShoppingCart size={16} />

					{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
				</button>
			</div>
		</div>
	);
}

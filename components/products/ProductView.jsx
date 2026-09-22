'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { useDispatch } from 'react-redux';
// import { addToCart } from '@/redux/slices/cartSlice';

export default function ProductView({ product }) {
	const dispatch = useDispatch();

	// Prevent runtime error
	if (!product) {
		return (
			<div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
				<p className="text-gray-500">
					Product information is not available.
				</p>
			</div>
		);
	}

	const images = [
		product.featureImg,
		...(product.galleryImages || []),
	].filter(Boolean);

	const [activeImage, setActiveImage] = useState(
		images[0] || '/placeholder.png'
	);

	const [quantity, setQuantity] = useState(1);

	const price = product.salePrice || product.regularPrice || 0;

	const discount =
		product.regularPrice > price
			? Math.round(
					((product.regularPrice - price) / product.regularPrice) *
						100
				)
			: 0;

	const increase = () => {
		if (quantity < product.stock) {
			setQuantity((q) => q + 1);
		}
	};

	const decrease = () => {
		setQuantity((q) => Math.max(1, q - 1));
	};

	const handleAddToCart = () => {
		// dispatch(
		//   addToCart({
		//     ...product,
		//     quantity,
		//     price,
		//   })
		// );
	};

	return (
		<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-6 text-sm text-gray-500">
				Home / {product.category?.name || 'Products'} /{' '}
				<span className="text-gray-900">{product.name}</span>
			</div>

			<section className="grid gap-10 lg:grid-cols-2">
				{/* Images */}
				<div>
					<div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
						<Image
							src={activeImage}
							alt={product.name}
							fill
							priority
							className="object-contain p-8"
							sizes="(max-width: 1024px) 100vw, 50vw"
						/>

						{discount > 0 && (
							<span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
								-{discount}%
							</span>
						)}
					</div>

					{images.length > 1 && (
						<div className="mt-4 flex gap-3 overflow-x-auto">
							{images.map((image, index) => (
								<button
									key={`${image}-${index}`}
									onClick={() => setActiveImage(image)}
									className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border ${
										activeImage === image
											? 'border-black'
											: 'border-gray-200'
									}`}>
									<Image
										src={image}
										alt={`${product.name} ${index + 1}`}
										fill
										className="object-contain p-2"
										sizes="80px"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Information */}
				<div className="flex flex-col">
					<div className="mb-2 flex items-center gap-2 text-sm">
						<span className="rounded-full bg-gray-100 px-3 py-1">
							{product.type}
						</span>

						{product.sku && (
							<span className="text-gray-400">
								SKU: {product.sku}
							</span>
						)}
					</div>

					<h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
						{product.name}
					</h1>

					<div className="mt-4 flex items-center gap-3">
						<span className="text-sm font-medium">
							★ {product.rating || 0}
						</span>

						<span className="text-sm text-gray-400">
							{product.sold || 0} sold
						</span>
					</div>

					<div className="mt-6 flex items-center gap-3">
						<span className="text-3xl font-bold">
							৳{price.toLocaleString()}
						</span>

						{product.regularPrice > price && (
							<span className="text-lg text-gray-400 line-through">
								৳{product.regularPrice.toLocaleString()}
							</span>
						)}
					</div>

					<div className="mt-6 border-t border-gray-100 pt-6">
						<p className="leading-7 text-gray-600">
							{product.description}
						</p>
					</div>

					<div className="mt-6">
						{product.stock > 0 ? (
							<span className="text-sm font-medium text-green-600">
								✓ In Stock ({product.stock})
							</span>
						) : (
							<span className="text-sm font-medium text-red-500">
								Out of Stock
							</span>
						)}
					</div>

					<div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
						<Truck size={20} />

						<div>
							<p className="text-sm font-medium">
								{product.freeDelivery
									? 'Free Delivery'
									: 'Fast Delivery'}
							</p>

							<p className="text-xs text-gray-500">
								Delivery available across Bangladesh
							</p>
						</div>
					</div>

					{product.stock > 0 && (
						<div className="mt-6 flex gap-3">
							<div className="flex h-12 items-center rounded-xl border border-gray-200">
								<button onClick={decrease} className="px-4">
									<Minus size={16} />
								</button>

								<span className="w-8 text-center font-medium">
									{quantity}
								</span>

								<button onClick={increase} className="px-4">
									<Plus size={16} />
								</button>
							</div>

							<button
								onClick={handleAddToCart}
								className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 font-medium text-white transition hover:opacity-90">
								<ShoppingBag size={18} />
								Add to Cart
							</button>

							<button className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200">
								<Heart size={19} />
							</button>
						</div>
					)}

					{product.stock > 0 && (
						<button className="mt-3 h-12 rounded-xl border border-black font-medium transition hover:bg-black hover:text-white">
							Buy Now
						</button>
					)}
				</div>
			</section>

			<section className="mt-16 border-t border-gray-100 pt-10">
				<div className="grid gap-10 md:grid-cols-3">
					<div>
						<h2 className="font-semibold">Product Details</h2>

						<p className="mt-3 text-sm leading-6 text-gray-600">
							{product.description}
						</p>
					</div>

					<div>
						<h2 className="font-semibold">Reviews</h2>

						<p className="mt-3 text-sm text-gray-500">
							{product.reviews?.length || 0} customer reviews
						</p>
					</div>

					<div>
						<h2 className="font-semibold">Questions</h2>

						<p className="mt-3 text-sm text-gray-500">
							{product.questions?.length || 0} questions
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}

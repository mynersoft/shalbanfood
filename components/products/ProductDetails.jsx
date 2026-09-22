'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	ShoppingCart,
	Minus,
	Plus,
	Truck,
	CheckCircle,
	ChevronLeft,
} from 'lucide-react';

import { useEffect, useState } from 'react';

export default function ProductDetails({ slug }) {
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [selectedImage, setSelectedImage] = useState('');
	const [quantity, setQuantity] = useState(1);

	useEffect(() => {
		async function fetchProduct() {
			try {
				setLoading(true);
				setError('');

				const res = await fetch(`/api/products/slug/${slug}`);

				const data = await res.json();

				if (!res.ok || !data.success) {
					throw new Error(data.message || 'Product not found');
				}

				setProduct(data.product);

				if (data.product.featureImg) {
					setSelectedImage(data.product.featureImg);
				} else if (data.product.galleryImages?.length) {
					setSelectedImage(data.product.galleryImages[0]);
				}
			} catch (err) {
				console.error(err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchProduct();
	}, [slug]);

	/* -----------------------------------------
     Loading
  ----------------------------------------- */

	if (loading) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-10">
				<div className="grid animate-pulse gap-8 md:grid-cols-2">
					<div className="aspect-square rounded-2xl bg-gray-200" />

					<div className="space-y-5">
						<div className="h-8 w-3/4 rounded bg-gray-200" />
						<div className="h-6 w-1/3 rounded bg-gray-200" />
						<div className="h-24 rounded bg-gray-200" />
						<div className="h-12 rounded bg-gray-200" />
					</div>
				</div>
			</main>
		);
	}

	/* -----------------------------------------
     Error
  ----------------------------------------- */

	if (error || !product) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-20 text-center">
				<h1 className="text-2xl font-bold">Product Not Found</h1>

				<p className="mt-2 text-gray-500">
					{error || 'This product does not exist.'}
				</p>

				<Link
					href="/"
					className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">
					<ChevronLeft size={18} />
					Back to Home
				</Link>
			</main>
		);
	}

	/* -----------------------------------------
     Price
  ----------------------------------------- */

	const hasSale =
		product.salePrice > 0 && product.salePrice < product.regularPrice;

	const price = hasSale ? product.salePrice : product.regularPrice;

	/* -----------------------------------------
     Images
  ----------------------------------------- */

	const images = [
		...(product.featureImg ? [product.featureImg] : []),

		...(product.galleryImages || []),
	].filter(Boolean);

	/* -----------------------------------------
     Quantity
  ----------------------------------------- */

	const increaseQuantity = () => {
		if (quantity < product.stock) {
			setQuantity((prev) => prev + 1);
		}
	};

	const decreaseQuantity = () => {
		if (quantity > 1) {
			setQuantity((prev) => prev - 1);
		}
	};

	/* -----------------------------------------
     Add To Cart
  ----------------------------------------- */

	const handleAddToCart = () => {
		console.log('Add to cart:', {
			product,
			quantity,
		});

		// এখানে আপনার existing Redux cart action
		// পরে connect করতে পারবেন।
	};

	return (
		<main className="min-h-screen bg-gray-50">
			{/* Breadcrumb */}
			<div className="mx-auto max-w-7xl px-4 pt-5">
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<Link href="/" className="hover:text-black">
						Home
					</Link>

					<span>/</span>

					<span className="line-clamp-1">{product.name}</span>
				</div>
			</div>

			{/* Product */}
			<section className="mx-auto max-w-7xl px-4 py-6 md:py-10">
				<div className="grid gap-8 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 md:p-6">
					{/* ======================================
              LEFT - IMAGES
          ====================================== */}

					<div>
						{/* Main Image */}
						<div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
							{selectedImage ? (
								<Image
									src={selectedImage}
									alt={product.name}
									fill
									priority
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-gray-400">
									No Image
								</div>
							)}

							{hasSale && (
								<span className="absolute left-4 top-4 rounded-lg bg-red-500 px-3 py-1 text-sm font-semibold text-white">
									SALE
								</span>
							)}
						</div>

						{/* Thumbnails */}
						{images.length > 1 && (
							<div className="mt-4 flex gap-3 overflow-x-auto">
								{images.map((image, index) => (
									<button
										key={`${image}-${index}`}
										type="button"
										onClick={() => setSelectedImage(image)}
										className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
											selectedImage === image
												? 'border-black'
												: 'border-gray-200'
										}`}>
										<Image
											src={image}
											alt={`${product.name} ${index + 1}`}
											fill
											sizes="80px"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* ======================================
              RIGHT - DETAILS
          ====================================== */}

					<div className="flex flex-col">
						{/* Category */}
						{product.category?.name && (
							<Link
								href={`/category/${product.category.slug}`}
								className="mb-2 text-sm font-medium text-blue-600">
								{product.category.name}
							</Link>
						)}

						{/* Name */}
						<h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
							{product.name}
						</h1>

						{/* Price */}
						<div className="mt-5 flex items-center gap-3">
							<span className="text-3xl font-bold text-gray-900">
								৳{price}
							</span>

							{hasSale && (
								<>
									<span className="text-lg text-gray-400 line-through">
										৳{product.regularPrice}
									</span>

									<span className="rounded-md bg-red-100 px-2 py-1 text-sm font-semibold text-red-600">
										{Math.round(
											((product.regularPrice -
												product.salePrice) /
												product.regularPrice) *
												100
										)}
										% OFF
									</span>
								</>
							)}
						</div>

						{/* Stock */}
						<div className="mt-4">
							{product.stock > 0 ? (
								<div className="flex items-center gap-2 text-sm text-green-600">
									<CheckCircle size={18} />
									In Stock
								</div>
							) : (
								<div className="text-sm font-medium text-red-500">
									Out of Stock
								</div>
							)}
						</div>

						{/* Description */}
						{product.description && (
							<div className="mt-6 border-t pt-5">
								<h2 className="mb-2 font-semibold">
									Description
								</h2>

								<div className="whitespace-pre-line text-sm leading-7 text-gray-600">
									{product.description}
								</div>
							</div>
						)}

						{/* Free Delivery */}
						{product.freeDelivery && (
							<div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4">
								<Truck size={22} className="text-green-600" />

								<div>
									<p className="font-semibold text-green-700">
										Free Delivery
									</p>

									<p className="text-sm text-green-600">
										This product includes free delivery.
									</p>
								</div>
							</div>
						)}

						{/* Quantity */}
						{product.stock > 0 && (
							<div className="mt-6">
								<p className="mb-2 text-sm font-medium">
									Quantity
								</p>

								<div className="flex w-fit items-center overflow-hidden rounded-lg border">
									<button
										type="button"
										onClick={decreaseQuantity}
										disabled={quantity <= 1}
										className="flex h-11 w-11 items-center justify-center hover:bg-gray-100 disabled:opacity-40">
										<Minus size={18} />
									</button>

									<span className="flex h-11 w-14 items-center justify-center border-x text-sm font-semibold">
										{quantity}
									</span>

									<button
										type="button"
										onClick={increaseQuantity}
										disabled={quantity >= product.stock}
										className="flex h-11 w-11 items-center justify-center hover:bg-gray-100 disabled:opacity-40">
										<Plus size={18} />
									</button>
								</div>
							</div>
						)}

						{/* Add To Cart */}
						<button
							type="button"
							disabled={product.stock <= 0}
							onClick={handleAddToCart}
							className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300">
							<ShoppingCart size={20} />

							{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

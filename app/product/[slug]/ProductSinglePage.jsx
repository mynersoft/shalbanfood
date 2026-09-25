'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/redux/store/slices/cartSlice';
import { toggleWishlist } from '@/redux/store/slices/wishlistSlice';
import { toast } from 'react-hot-toast';
import {
	Star,
	Truck,
	Shield,
	RefreshCw,
	Check,
	Share2,
	Heart,
	ShoppingCart,
	ChevronRight,
	Package,
	ChevronLeft,
	Minus,
	Plus,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TabContent from './TabContent';

export default function ProductSinglePage({ initialProduct }) {
	const [product] = useState(initialProduct);
	const dispatch = useDispatch();
	const router = useRouter();

	const wishlist = useSelector((state) => state.wishlist?.items || []);
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);

	if (!product) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
				<div className="text-center space-y-6 max-w-md">
					<div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
						<Package className="w-20 h-20 text-gray-400" />
					</div>
					<h2 className="text-3xl font-bold text-gray-800">
						Product Not Found
					</h2>
					<p className="text-gray-600 text-lg">
						The product you are looking for does not exist or has
						been moved.
					</p>
					<button
						onClick={() => router.push('/')}
						className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	const getProductImages = () => {
		const images = [];

		if (product.featureImg) {
			images.push(product.featureImg);
		}

		if (product.galleryImages && product.galleryImages.length > 0) {
			images.push(...product.galleryImages);
		}

		return images.length > 0 ? images : ['/placeholder.png'];
	};

	const getProductDiscount = () => {
		if (product.discount && product.discount.type === 'percentage') {
			return Math.round(product.discount.value);
		}

		if (
			product.regularPrice &&
			product.salePrice &&
			product.regularPrice > product.salePrice
		) {
			const discountPercent =
				((product.regularPrice - product.salePrice) /
					product.regularPrice) *
				100;
			return Math.round(discountPercent);
		}

		return 0;
	};

	const isWishlisted = wishlist.some((item) => item._id === product._id);

	const handleAddToCart = () => {
		if (product.stock < 1) {
			toast.error('Product is out of stock');
			return;
		}

		dispatch(
			addToCart({
				product: product,
				quantity,
			})
		);
		toast.success('🎉 Added to cart!');
	};

	const handleBuyNow = () => {
		if (product.stock < 1) {
			toast.error('Product is out of stock');
			return;
		}

		handleAddToCart();
		router.push('/cart');
	};

	const handleWishlistToggle = () => {
		dispatch(toggleWishlist(product));
		toast.success(
			isWishlisted ? '❤️ Removed from wishlist' : '💝 Added to wishlist'
		);
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: product.name,
					text: `Check out ${product.name} on our store!`,
					url: window.location.href,
				});
			} catch (error) {
				console.log('Share cancelled');
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('🔗 Link copied to clipboard!');
		}
	};

	const increaseQuantity = () => {
		if (quantity < product.stock) {
			setQuantity((prev) => prev + 1);
		} else {
			toast.error('Maximum stock reached');
		}
	};

	const decreaseQuantity = () =>
		setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

	const images = getProductImages();
	const discountPercent = getProductDiscount();
	const mainImage = images[selectedImage] || '/placeholder.png';
	const regularPrice = product.regularPrice || 0;
	const salePrice = product.salePrice || product.regularPrice || 0;
	const hasDiscount = regularPrice > salePrice;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
			<div className="bg-white shadow-xs">
				<div className="container mx-auto px-4 py-4">
					<nav className="flex items-center space-x-2 text-sm">
						<Link
							href="/"
							className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
							Home
						</Link>
						<ChevronRight className="w-4 h-4 text-gray-400" />
						{product.category && (
							<>
								<Link
									href={`/categories/${typeof product.category === 'object' ? product.category.name?.toLowerCase() : product.category?.toLowerCase()}`}
									className="text-gray-600 hover:text-blue-600 transition-colors">
									{typeof product.category === 'object'
										? product.category.name
										: product.category}
								</Link>
								<ChevronRight className="w-4 h-4 text-gray-400" />
							</>
						)}
						<span className="text-gray-800 font-semibold truncate max-w-xs">
							{product.name}
						</span>
					</nav>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
						<div className="space-y-6">
							<div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
								<div className="aspect-square flex items-center justify-center p-8">
									<Image
										src={mainImage}
										alt={product.name}
										width={500}
										height={500}
										className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
										priority
									/>

									<div className="absolute top-4 left-4 flex flex-col gap-2">
										{discountPercent > 0 && (
											<span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
												-{discountPercent}%
											</span>
										)}
										{product.type &&
											product.type !== 'regular' && (
												<span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg capitalize">
													{product.type}
												</span>
											)}
										{product.freeDelivery && (
											<span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
												Free Delivery
											</span>
										)}
									</div>

									{images.length > 1 && (
										<>
											<button
												onClick={() =>
													setSelectedImage((prev) =>
														prev > 0
															? prev - 1
															: images.length - 1
													)
												}
												className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all">
												<ChevronLeft className="w-5 h-5 text-gray-700" />
											</button>
											<button
												onClick={() =>
													setSelectedImage((prev) =>
														prev < images.length - 1
															? prev + 1
															: 0
													)
												}
												className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all">
												<ChevronRight className="w-5 h-5 text-gray-700" />
											</button>
										</>
									)}
								</div>
							</div>

							{images.length > 1 && (
								<div className="grid grid-cols-4 gap-3">
									{images.map((img, index) => (
										<button
											key={index}
											onClick={() =>
												setSelectedImage(index)
											}
											className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
												selectedImage === index
													? 'border-blue-500 ring-4 ring-blue-100 scale-105'
													: 'border-gray-200 hover:border-gray-300'
											}`}>
											<div className="aspect-square bg-gray-50 flex items-center justify-center">
												<Image
													src={img}
													alt={`${product.name} - Thumbnail ${index + 1}`}
													width={200}
													height={200}
													className="w-full h-full object-contain p-2"
												/>
											</div>
											{selectedImage === index && (
												<div className="absolute inset-0 bg-blue-500/10"></div>
											)}
										</button>
									))}
								</div>
							)}
						</div>

						<div className="space-y-8">
							<div>
								<div className="flex items-start justify-between mb-4">
									<div>
										<h1 className="text-base font-medium md:text-2xl md:font-bold text-gray-900 mb-3 leading-tight pr-3">
											{product.name}
										</h1>
										<div className="flex items-center gap-3 mb-3 flex-wrap">
											{product.brand && (
												<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[12px] font-semibold">
													{typeof product.brand ===
													'object'
														? product.brand.name
														: product.brand}
												</span>
											)}
											{product.sku && (
												<span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[12px] font-medium">
													SKU: {product.sku}
												</span>
											)}
											<span
												className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
													product.stock > 0
														? 'bg-green-100 text-green-700'
														: 'bg-red-100 text-red-700'
												}`}>
												{product.stock > 0
													? `In Stock (${product.stock})`
													: 'Out of Stock'}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={handleWishlistToggle}
											className={`p-2 md:p-3 rounded-full transition-all ${
												isWishlisted
													? 'bg-red-50 text-red-500 hover:bg-red-100'
													: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
											}`}>
											<Heart
												className={`w-4 md:w-5 h-5 md:h-5 ${
													isWishlisted
														? 'fill-current'
														: ''
												}`}
											/>
										</button>
										<button
											onClick={handleShare}
											className="p-2 md:p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
											<Share2 className="w-4 md:w-5 h-5 md:h-5" />
										</button>
									</div>
								</div>

								<div className="flex items-center flex-wrap gap-6 mb-6">
									<div className="flex items-center gap-2">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`w-5 h-5 ${
														i <
														Math.floor(
															product.rating || 0
														)
															? 'fill-yellow-400 text-yellow-400'
															: 'fill-gray-200 text-gray-200'
													}`}
												/>
											))}
										</div>
										<span className="text-lg font-bold text-gray-800">
											{(product.rating || 0).toFixed(1)}
										</span>
										<span className="text-gray-500">
											({product.reviews?.length || 0}{' '}
											reviews)
										</span>
									</div>
									{product.sold > 0 && (
										<div className="flex items-center gap-2">
											<span className="text-gray-600">
												<span className="font-bold text-gray-900">
													{product.sold}
												</span>{' '}
												sold
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
								<div className="space-y-4">
									<div className="flex items-baseline gap-4 flex-wrap">
										<span className="text-4xl font-bold text-gray-900">
											৳ {salePrice.toLocaleString()}
										</span>

										{hasDiscount && (
											<div className="flex items-center gap-3">
												<span className="text-2xl text-gray-400 line-through">
													৳{' '}
													{regularPrice.toLocaleString()}
												</span>
												{discountPercent > 0 && (
													<span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full font-bold text-sm">
														Save {discountPercent}%
													</span>
												)}
											</div>
										)}
									</div>

									{hasDiscount && (
										<div className="flex items-center gap-2 text-green-600 font-semibold">
											<Check className="w-5 h-5" />
											<span>
												You save ৳{' '}
												{(
													regularPrice - salePrice
												).toLocaleString()}
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="space-y-6">
								<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
									<span className="font-semibold text-gray-700">
										Quantity:
									</span>
									<div className="flex items-center gap-4">
										<button
											onClick={decreaseQuantity}
											disabled={quantity <= 1}
											className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
											<Minus className="w-4 h-4" />
										</button>
										<span className="text-2xl font-bold w-12 text-center">
											{quantity}
										</span>
										<button
											onClick={increaseQuantity}
											disabled={quantity >= product.stock}
											className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<button
										onClick={handleAddToCart}
										disabled={product.stock < 1}
										className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
										<ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
										<span>
											{product.stock < 1
												? 'Out of Stock'
												: 'Add to Cart'}
										</span>
									</button>
									<button
										onClick={handleBuyNow}
										disabled={product.stock < 1}
										className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
										Buy Now
									</button>
								</div>
							</div>

							<div className="space-y-4">
								<h3 className="text-lg font-bold text-gray-900">
									Delivery & Services:
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-green-100 rounded-lg">
												<Truck className="w-6 h-6 text-green-600" />
											</div>
											<div>
												<p className="font-bold text-gray-900">
													{product.freeDelivery
														? 'Free Delivery'
														: 'Fast Delivery'}
												</p>
												<p className="text-sm text-gray-600">
													Within 2-3 days
												</p>
											</div>
										</div>
									</div>
									<div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-blue-100 rounded-lg">
												<Shield className="w-6 h-6 text-blue-600" />
											</div>
											<div>
												<p className="font-bold text-gray-900">
													Warranty
												</p>
												<p className="text-sm text-gray-600">
													Genuine product
												</p>
											</div>
										</div>
									</div>
									<div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-purple-100 rounded-lg">
												<RefreshCw className="w-6 h-6 text-purple-600" />
											</div>
											<div>
												<p className="font-bold text-gray-900">
													Easy Return
												</p>
												<p className="text-sm text-gray-600">
													7-Day return
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<TabContent product={product} />
				</div>
			</div>
		</div>
	);
}

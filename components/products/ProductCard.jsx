'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

const UNIT_LABELS = {
	gram: 'গ্রাম',
	kg: 'কেজি',
	milliliter: 'মিলিলিটার',
	litre: 'লিটার',
	piece: 'পিস',
};

const formatSize = (variant) => {
	if (!variant) return '';

	return `${variant.value} ${
		UNIT_LABELS[variant.unit] || variant.unit || ''
	}`;
};

const getVariantKey = (variant, index) => {
	// MongoDB subdocument ID থাকলে সেটি ব্যবহার হবে।
	// ID না থাকলে index fallback হিসেবে ব্যবহার হবে।
	return variant?._id != null ? String(variant._id) : `variant-${index}`;
};

const getPrice = (value) => {
	const price = Number(value);
	return Number.isFinite(price) && price >= 0 ? price : 0;
};

const getStock = (value) => {
	const stock = Number(value);
	return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

export default function ProductCard({ product }) {
	const dispatch = useDispatch();

	const variants = Array.isArray(product?.variants) ? product.variants : [];

	const productId = String(product?._id || product?.slug || '');

	const [selectedId, setSelectedId] = useState(() => {
		const availableIndex = variants.findIndex(
			(variant) => getStock(variant.stock) > 0
		);

		const initialIndex =
			availableIndex >= 0 ? availableIndex : variants.length > 0 ? 0 : -1;

		return initialIndex >= 0
			? getVariantKey(variants[initialIndex], initialIndex)
			: '';
	});

	// Product পরিবর্তন হলে নতুন product-এর variant নির্বাচন।
	useEffect(() => {
		const availableIndex = variants.findIndex(
			(variant) => getStock(variant.stock) > 0
		);

		const initialIndex =
			availableIndex >= 0 ? availableIndex : variants.length > 0 ? 0 : -1;

		setSelectedId(
			initialIndex >= 0
				? getVariantKey(variants[initialIndex], initialIndex)
				: ''
		);
	}, [productId]);

	// Selected variant শুধু একটি হবে।
	const selectedIndex = variants.findIndex(
		(variant, index) => getVariantKey(variant, index) === selectedId
	);

	const activeIndex =
		selectedIndex >= 0
			? selectedIndex
			: variants.findIndex((variant) => getStock(variant.stock) > 0) >= 0
				? variants.findIndex((variant) => getStock(variant.stock) > 0)
				: variants.length > 0
					? 0
					: -1;

	const selected = activeIndex >= 0 ? variants[activeIndex] : null;

	const regularPrice = getPrice(selected?.regularPrice);
	const sellPrice = getPrice(selected?.sellPrice);

	const finalPrice = sellPrice > 0 ? sellPrice : regularPrice;

	const hasDiscount =
		regularPrice > 0 && sellPrice > 0 && sellPrice < regularPrice;

	const discountPercent = hasDiscount
		? Math.round(((regularPrice - sellPrice) / regularPrice) * 100)
		: 0;

	const selectedStock = getStock(selected?.stock);

	const selectedOutOfStock = !selected || selectedStock <= 0;

	const allOutOfStock =
		variants.length === 0 ||
		variants.every((variant) => getStock(variant.stock) <= 0);

	const productHref = `/product/${encodeURIComponent(product?.slug || '')}`;

	const categoryLabel = String(product?.category || '').replace(/-/g, ' ');

	const handleSelectVariant = (variant, index) => {
		// একটি variant-এর ID-ই শুধু state-এ রাখা হবে।
		setSelectedId(getVariantKey(variant, index));
	};

	const handleAddToCart = () => {
		if (!selected || selectedStock <= 0) {
			toast.error('এই ওজনের পণ্যটি বর্তমানে স্টকে নেই।');
			return;
		}

		const variantKey =
			selected?._id != null
				? String(selected._id)
				: `variant-${activeIndex}`;

		const variantId = selected?._id != null ? String(selected._id) : null;

		dispatch(
			addToCart({
				product: {
					...product,
					variantId,
					variantKey,
					price: finalPrice,
					regularPrice,
					sellPrice: finalPrice,
					stock: selectedStock,
					sku: selected.sku || product?.sku || '',
					size: {
						value: selected.value,
						unit: selected.unit,
					},
					variantLabel: formatSize(selected),
				},
				quantity: 1,
			})
		);

		toast.success(
			`${product.name} (${formatSize(selected)}) কার্টে যোগ হয়েছে`
		);
	};

	return (
		<article
			className="group relative overflow-hidden rounded-2xl
                border border-gray-200 bg-white shadow-sm
                transition-all duration-300 hover:-translate-y-1
                hover:shadow-xl">
			{/* Product Image */}
			<Link href={productHref} className="block">
				<div className="relative h-50 w-full overflow-hidden bg-gray-50">
					{product?.image ? (
						<div className="absolute inset-0">
							<Image
								src={product.image}
								alt={product?.name || 'Product'}
								fill
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						</div>
					) : (
						<div
							className="flex h-full flex-col items-center
                            justify-center gap-2 text-gray-400">
							<Package size={32} strokeWidth={1.5} />
							<span className="text-xs">No Image</span>
						</div>
					)}

					{/* Selected variant-এর discount */}
					{hasDiscount && (
						<span
							className="absolute left-2 top-2 rounded-full
                            bg-red-500 px-2.5 py-1 text-[11px]
                            font-bold text-white shadow-sm">
							-{discountPercent}%
						</span>
					)}

					{allOutOfStock && (
						<div
							className="absolute inset-0 flex
                            items-center justify-center bg-black/40">
							<span
								className="rounded-full bg-white
                                px-3 py-1.5 text-xs font-semibold
                                text-gray-800 shadow">
								Out of Stock
							</span>
						</div>
					)}

					<div
						className="absolute bottom-3 right-3
                        translate-y-2 opacity-0 transition-all
                        duration-300 group-hover:translate-y-0
                        group-hover:opacity-100">
						<span
							className="flex h-9 w-9 items-center
                            justify-center rounded-full bg-white
                            text-gray-800 shadow-lg">
							<Eye size={17} />
						</span>
					</div>
				</div>
			</Link>

			{/* Product Details */}
			<div className="p-3 sm:p-4">
				{categoryLabel && (
					<p
						className="mb-1 text-[11px] font-medium
                        uppercase tracking-wide text-gray-400">
						{categoryLabel}
					</p>
				)}

				<Link href={productHref}>
					<h2
						className="line-clamp-2 min-h-[40px]
                        text-sm font-semibold leading-5 text-gray-800
                        transition-colors hover:text-green-600 sm:text-[15px]">
						{product?.name}
					</h2>
				</Link>

				{/* Independent variant selection */}
				{variants.length > 1 && (
					<div>
						<div className="flex flex-wrap gap-1.5">
							{variants.map((variant, index) => {
								const variantKey = getVariantKey(
									variant,
									index
								);

								const isSelected =
									variantKey ===
									getVariantKey(selected, activeIndex);

								const soldOut = getStock(variant.stock) <= 0;

								return (
									<button
										key={variantKey}
										type="button"
										aria-pressed={isSelected}
										onClick={() =>
											handleSelectVariant(variant, index)
										}
										className={`rounded-md border px-2
                                            py-1.5 text-[11px] font-medium
                                            transition ${
												isSelected
													? 'border-green-600 bg-green-50 text-green-700 ring-1 ring-green-600'
													: 'border-gray-200 text-gray-600 hover:border-green-400'
											} ${
												soldOut
													? 'line-through opacity-50'
													: ''
											}`}>
										{formatSize(variant)}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Single variant */}
				{variants.length === 1 && selected && (
					<p className="mt-2 text-xs text-gray-500">
						{formatSize(selected)}
					</p>
				)}

				{/* Price: selected variant only */}
				<div className="mt-3 flex flex-wrap items-baseline gap-2">
					<span className="text-lg font-bold text-gray-900 sm:text-xl">
						৳{finalPrice.toLocaleString('en-BD')}
					</span>

					{hasDiscount && (
						<span
							className="text-xs text-gray-400
                            line-through sm:text-sm">
							৳{regularPrice.toLocaleString('en-BD')}
						</span>
					)}
				</div>

				{/* Add to Cart */}
				<button
					type="button"
					disabled={selectedOutOfStock}
					onClick={handleAddToCart}
					className="mt-3 flex w-full items-center
                        justify-center gap-2 rounded-xl bg-gray-900
                        px-3 py-2.5 text-sm font-semibold text-white
                        transition-all hover:bg-green-600
                        active:scale-[0.98] disabled:cursor-not-allowed
                        disabled:bg-gray-200 disabled:text-gray-400">
					<ShoppingCart size={17} strokeWidth={2} />
					{selectedOutOfStock ? 'Out of Stock' : 'Add to Cart'}
				</button>
			</div>
		</article>
	);
}

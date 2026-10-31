'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { addToCart } from '@/redux/store/slices/cartSlice';

const UNIT_LABELS = {
	gram: 'গ্রাম',
	kg: 'কেজি',
	milliliter: 'মিলিলিটার',
	litre: 'লিটার',
	piece: 'পিস',
};

const getPrice = (value) => {
	const price = Number(value);
	return Number.isFinite(price) && price >= 0 ? price : 0;
};

const getStock = (value) => {
	const stock = Number(value);
	return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

const getVariantKey = (variant, index) => {
	return variant?._id != null ? String(variant._id) : `variant-${index}`;
};

const formatSize = (variant) => {
	if (!variant) return '';

	const value = variant.value ?? '';
	const unit = UNIT_LABELS[variant.unit] || variant.unit || '';

	return `${value} ${unit}`.trim();
};

const formatMoney = (value) => getPrice(value).toLocaleString('en-BD');

export default function ProductPurchase({
	productId,
	name,
	slug,
	image,
	variants = [],
}) {
	const dispatch = useDispatch();
	const router = useRouter();

	const safeVariants = useMemo(
		() => (Array.isArray(variants) ? variants : []),
		[variants]
	);

	const firstAvailableIndex = useMemo(
		() => safeVariants.findIndex((variant) => getStock(variant.stock) > 0),
		[safeVariants]
	);

	const initialIndex =
		firstAvailableIndex >= 0
			? firstAvailableIndex
			: safeVariants.length > 0
				? 0
				: -1;

	const [selectedId, setSelectedId] = useState(() =>
		initialIndex >= 0
			? getVariantKey(safeVariants[initialIndex], initialIndex)
			: ''
	);

	const [quantity, setQuantity] = useState(1);

	// Product বা variants পরিবর্তন হলে selection reset হবে।
	useEffect(() => {
		const availableIndex = safeVariants.findIndex(
			(variant) => getStock(variant.stock) > 0
		);

		const index =
			availableIndex >= 0
				? availableIndex
				: safeVariants.length > 0
					? 0
					: -1;

		setSelectedId(
			index >= 0 ? getVariantKey(safeVariants[index], index) : ''
		);

		setQuantity(1);
	}, [productId, safeVariants]);

	const selectedIndex = safeVariants.findIndex(
		(variant, index) => getVariantKey(variant, index) === selectedId
	);

	const activeIndex =
		selectedIndex >= 0
			? selectedIndex
			: firstAvailableIndex >= 0
				? firstAvailableIndex
				: safeVariants.length > 0
					? 0
					: -1;

	const selected = activeIndex >= 0 ? safeVariants[activeIndex] : null;

	const regularPrice = getPrice(selected?.regularPrice);
	const sellPrice = getPrice(selected?.sellPrice);

	// ProductCard-এর মতো sellPrice না থাকলে regularPrice fallback।
	const finalPrice = sellPrice > 0 ? sellPrice : regularPrice;

	const hasDiscount =
		regularPrice > 0 && finalPrice > 0 && finalPrice < regularPrice;

	const discountPercent = hasDiscount
		? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
		: 0;

	const selectedStock = getStock(selected?.stock);
	const inStock = Boolean(selected) && selectedStock > 0;

	// UI-তে quantity সর্বোচ্চ ২০ এবং available stock-এর মধ্যে থাকবে।
	const maxQuantity = Math.min(selectedStock, 20);

	const outOfStock = !inStock;

	const allOutOfStock =
		safeVariants.length === 0 ||
		safeVariants.every((variant) => getStock(variant.stock) <= 0);

	const handleSelectVariant = (variant, index) => {
		// Stock নেই এমন variant-ও দেখা যাবে, তবে cart-এ যোগ হবে না।
		setSelectedId(getVariantKey(variant, index));
		setQuantity(1);
	};

	const handleAddToCart = () => {
		if (!selected || selectedStock <= 0) {
			toast.error('এই ওজনের পণ্যটি বর্তমানে স্টকে নেই।');
			return;
		}

		if (finalPrice <= 0) {
			toast.error('এই পণ্যের মূল্য সঠিকভাবে সেট করা নেই।');
			return;
		}

		const safeQuantity = Math.max(
			1,
			Math.min(Math.floor(Number(quantity) || 1), maxQuantity)
		);

		const variantId = selected._id != null ? String(selected._id) : null;

		const variantKey = getVariantKey(selected, activeIndex);

		// ProductCard-এর payload structure অনুসরণ করা হয়েছে।
		dispatch(
			addToCart({
				product: {
					_id: String(productId),
					name,
					slug,
					image: image || '',
					variantId,
					variantKey,
					price: finalPrice,
					regularPrice,
					sellPrice: finalPrice,
					stock: selectedStock,
					sku: selected.sku || '',
					size: {
						value: selected.value,
						unit: selected.unit,
					},
					variantLabel: formatSize(selected),
				},
				quantity: safeQuantity,
			})
		);

		toast.success(`${name} (${formatSize(selected)}) কার্টে যোগ হয়েছে`);
	};

	const handleBuyNow = () => {
		handleAddToCart();

		if (selected && selectedStock > 0 && finalPrice > 0) {
			router.push('/checkout');
		}
	};

	if (safeVariants.length === 0) {
		return (
			<div className="mt-6 rounded-xl border border-gray-200 p-4">
				<div className="flex items-center gap-2 text-gray-500">
					<Package size={20} />
					<span className="text-sm">
						এই পণ্যের কোনো variant বা মূল্য পাওয়া যায়নি।
					</span>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* PRICE */}
			<div className="mt-5 flex flex-wrap items-baseline gap-3">
				<span className="text-3xl font-bold text-green-600">
					৳{formatMoney(finalPrice)}
				</span>

				{hasDiscount && (
					<>
						<span className="text-lg text-gray-400 line-through">
							৳{formatMoney(regularPrice)}
						</span>

						<span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
							{discountPercent}% ছাড়
						</span>
					</>
				)}
			</div>

			{/* VARIANT SELECTION */}
			<div className="mt-6">
				<h2 className="mb-3 text-sm font-semibold text-gray-900">
					ওজন নির্বাচন করুন
				</h2>

				<div className="flex flex-wrap gap-2" role="group">
					{safeVariants.map((variant, index) => {
						const variantKey = getVariantKey(variant, index);
						const isSelected =
							variantKey ===
							(selected
								? getVariantKey(selected, activeIndex)
								: '');

						const stock = getStock(variant.stock);
						const soldOut = stock <= 0;

						const variantRegularPrice = getPrice(
							variant.regularPrice
						);

						const variantSellPrice = getPrice(variant.sellPrice);

						const variantPrice =
							variantSellPrice > 0
								? variantSellPrice
								: variantRegularPrice;

						return (
							<button
								key={variantKey}
								type="button"
								aria-pressed={isSelected}
								onClick={() =>
									handleSelectVariant(variant, index)
								}
								className={`rounded-lg border px-4 py-3 text-left transition ${
									isSelected
										? 'border-green-600 bg-green-50 ring-1 ring-green-600'
										: 'border-gray-200 hover:border-green-400'
								} ${soldOut ? 'opacity-60' : ''}`}>
								<span className="block font-semibold text-gray-900">
									{formatSize(variant)}
								</span>

								<span className="mt-1 block text-sm font-medium text-green-600">
									৳{formatMoney(variantPrice)}
								</span>

								<span
									className={`mt-1 block text-xs ${
										soldOut
											? 'text-red-500'
											: 'text-gray-500'
									}`}>
									{soldOut ? 'স্টক শেষ' : 'স্টকে আছে'}
								</span>
							</button>
						);
					})}
				</div>

				{inStock && selectedStock <= 5 && (
					<p className="mt-3 text-sm font-medium text-orange-600">
						মাত্র {selectedStock}টি স্টকে আছে
					</p>
				)}
			</div>

			{/* QUANTITY */}
			{inStock && (
				<div className="mt-1 flex items-center gap-4">
					<span className="text-sm font-semibold text-gray-900">
						পরিমাণ
					</span>

					<div className="flex items-center rounded-lg border border-gray-200">
						<button
							type="button"
							aria-label="পরিমাণ কমান"
							onClick={() =>
								setQuantity((q) => Math.max(1, q - 1))
							}
							disabled={quantity <= 1}
							className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
							<Minus size={16} />
						</button>

						<span className="min-w-10 text-center text-sm font-semibold">
							{quantity}
						</span>

						<button
							type="button"
							aria-label="পরিমাণ বাড়ান"
							onClick={() =>
								setQuantity((q) => Math.min(maxQuantity, q + 1))
							}
							disabled={quantity >= maxQuantity}
							className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
							<Plus size={16} />
						</button>
					</div>
				</div>
			)}

			{/* TOTAL PRICE */}
			{inStock && quantity > 1 && (
				<p className="mt-2 text-sm text-gray-600">
					মোট মূল্য:{' '}
					<strong className="text-gray-900">
						৳{formatMoney(finalPrice * quantity)}
					</strong>
				</p>
			)}

			{/* ADD TO CART */}
			<div className="mt-2 flex gap-1">
				<button
					type="button"
					onClick={handleAddToCart}
					disabled={outOfStock}
					className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-green-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
					<ShoppingCart size={20} strokeWidth={2} />

					{outOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
				</button>
				<button
					type="button"
					onClick={handleBuyNow}
					disabled={outOfStock}
					className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-green-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
					<ShoppingCart size={20} strokeWidth={2} />
					Buy Now
				</button>
			</div>
		</div>
	);
}

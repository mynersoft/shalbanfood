'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Minus, Plus, Trash2, Package } from 'lucide-react';

import { removeFromCart, updateQuantity } from '@/redux/store/slices/cartSlice';

/* --------------------------------
   Helpers
-------------------------------- */

const getProductId = (item) => {
	const product = item?.product;

	return String(
		item?._id ||
			item?.productId ||
			(typeof product === 'object' ? product?._id : product) ||
			item?.slug ||
			''
	);
};

const getVariantIdentity = (item) => ({
	productId: getProductId(item),
	variantId: item?.variantId ?? null,
	variantKey: item?.variantKey ?? null,
});

const getProductImage = (item) => {
	const image =
		item?.image ||
		item?.featureImg ||
		(Array.isArray(item?.galleryImages) ? item.galleryImages[0] : null);

	return typeof image === 'string' && image.trim()
		? image
		: '/images/placeholder.png';
};

const toNumber = (value, fallback = 0) => {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}

	const number = Number(value);

	return Number.isFinite(number) ? number : fallback;
};

const getBasePrice = (item) => {
	const price = toNumber(item?.price, NaN);

	if (Number.isFinite(price) && price >= 0) {
		return price;
	}

	const sellPrice = toNumber(item?.sellPrice, NaN);

	if (Number.isFinite(sellPrice) && sellPrice >= 0) {
		return sellPrice;
	}

	return Math.max(toNumber(item?.regularPrice, 0), 0);
};

const getOriginalPrice = (item) => {
	const regularPrice = toNumber(item?.regularPrice, NaN);

	if (Number.isFinite(regularPrice) && regularPrice >= 0) {
		return regularPrice;
	}

	return getBasePrice(item);
};

const calculateFinalPrice = (item) => {
	const price = getBasePrice(item);

	// Cart price is already the selected variant price.
	if (item?.price !== undefined && item?.price !== null) {
		return price;
	}

	const discountValue = toNumber(item?.discount?.value, 0);

	if (discountValue <= 0) {
		return price;
	}

	if (item?.discount?.type === 'percentage') {
		return Math.max(price - (price * discountValue) / 100, 0);
	}

	if (item?.discount?.type === 'fixed') {
		return Math.max(price - discountValue, 0);
	}

	return price;
};

const getDiscountText = (item) => {
	const value = toNumber(item?.discount?.value, 0);

	if (value <= 0) return null;

	if (item?.discount?.type === 'percentage') {
		return `${value}% OFF`;
	}

	if (item?.discount?.type === 'fixed') {
		return `৳${value.toLocaleString('en-BD')} OFF`;
	}

	return null;
};

const formatPrice = (value) =>
	toNumber(value).toLocaleString('en-BD', {
		maximumFractionDigits: 2,
	});

const formatStock = (value) => Math.floor(toNumber(value, 0));

/* --------------------------------
   Cart Items Component
-------------------------------- */

const CartItems = () => {
	const dispatch = useDispatch();

	const items = useSelector((state) => state.cart?.items ?? []);

	const hydrated = useSelector((state) => state.cart?.hydrated ?? false);

	/* ==============================
       Remove Item
    ============================== */

	const handleRemove = (item) => {
		dispatch(removeFromCart(getVariantIdentity(item)));

		toast.success('Product removed from cart');
	};

	/* ==============================
       Update Quantity
    ============================== */

	const handleQuantityChange = (item, newQty) => {
		const quantity = Number(newQty);

		if (!Number.isInteger(quantity) || quantity < 1) {
			return;
		}

		const stockValue = item?.stock;

		const hasStock =
			stockValue !== null &&
			stockValue !== undefined &&
			stockValue !== '';

		const stock = formatStock(stockValue);

		if (hasStock && stock <= 0) {
			toast.error('This product is currently out of stock');
			return;
		}

		if (hasStock && quantity > stock) {
			toast.error(`Only ${stock} items available`);
			return;
		}

		dispatch(
			updateQuantity({
				...getVariantIdentity(item),
				quantity,
			})
		);
	};

	/* ==============================
       Loading State
    ============================== */

	if (!hydrated) {
		return (
			<div className="flex min-h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1f5d3b]" />

					<p className="mt-3 text-sm text-gray-500">
						Loading cart...
					</p>
				</div>
			</div>
		);
	}

	/* ==============================
       Empty Cart
    ============================== */

	if (items.length === 0) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#1f5d3b]">
					<Package size={30} />
				</div>

				<h2 className="mt-4 text-lg font-bold text-gray-900">
					Your Cart is Empty
				</h2>

				<p className="mt-2 text-sm text-gray-500">
					You haven't added any products yet.
				</p>

				<Link
					href="/shop"
					className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
					Continue Shopping
				</Link>
			</div>
		);
	}

	/* ==============================
       Main UI
    ============================== */

	return (
		<div className="min-w-0 space-y-4">
			{/* Cart Header */}

			<div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-5">
				<div>
					<h2 className="text-base font-bold text-gray-900">
						Cart Items
					</h2>

					<p className="mt-1 text-xs text-gray-500">
						Review your selected products
					</p>
				</div>

				<div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-[#1f5d3b]">
					<Package size={18} />

					<span>{items.length} items</span>
				</div>
			</div>

			{/* Cart Products */}

			{items.map((item, index) => {
				const productId = getProductId(item);

				const originalPrice = getOriginalPrice(item);

				const finalPrice = calculateFinalPrice(item);

				const quantity = Math.max(
					1,
					Math.floor(toNumber(item?.quantity, 1))
				);

				const itemTotal = finalPrice * quantity;

				const originalItemTotal = originalPrice * quantity;

				const savedAmount = Math.max(originalItemTotal - itemTotal, 0);

				const discountText = getDiscountText(item);

				const productImage = getProductImage(item);

				const hasDiscount = finalPrice < originalPrice;

				const productHref = item?.slug
					? `/product/${encodeURIComponent(item.slug)}`
					: productId
						? `/product/${encodeURIComponent(productId)}`
						: '/shop';

				/* Stock */

				const stockValue = item?.stock;

				const hasStock =
					stockValue !== null &&
					stockValue !== undefined &&
					stockValue !== '';

				const stock = formatStock(stockValue);

				const isOutOfStock = hasStock && stock <= 0;

				const isMaxStock = hasStock && stock > 0 && quantity >= stock;

				/* Variant */

				const variantLabel =
					item?.variantLabel ||
					(item?.size?.value !== undefined &&
					item?.size?.value !== null
						? `${item.size.value} ${item.size.unit || ''}`
						: '');

				const itemKey = [
					productId,
					item?.variantId || '',
					item?.variantKey || '',
				].join('-');

				return (
					<article
						key={itemKey || index}
						className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md">
						{/* Product | Quantity | Total */}

						<div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_180px_125px] lg:items-center lg:gap-5">
							{/* Product Information */}

							<div className="flex min-w-0 items-start gap-3 sm:gap-4">
								<Link
									href={productHref}
									className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#fafafa] sm:h-[108px] sm:w-[108px]">
									<Image
										src={productImage}
										alt={item?.name || 'Product'}
										fill
										sizes="(max-width: 640px) 88px, 108px"
										className="object-contain p-2 transition duration-300 group-hover:scale-105"
									/>

									{discountText && hasDiscount && (
										<span className="absolute left-1 top-1 rounded-md bg-red-500 px-1.5 py-1 text-[9px] font-bold text-white">
											{discountText}
										</span>
									)}
								</Link>

								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<Link
											href={productHref}
											className="min-w-0">
											<h3 className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition hover:text-[#1f5d3b] sm:text-base">
												{item?.name || 'Product'}
											</h3>
										</Link>

										<button
											type="button"
											onClick={() => handleRemove(item)}
											className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:flex lg:hidden"
											aria-label="Remove product">
											<Trash2 size={16} />
										</button>
									</div>

									{/* Variant Label */}

									{variantLabel && (
										<p className="mt-1 text-xs font-medium text-gray-600">
											Variant: {variantLabel}
										</p>
									)}

									{/* SKU */}

									{item?.sku && (
										<p className="mt-1 text-[10px] text-gray-400">
											SKU: {item.sku}
										</p>
									)}

									{/* Price */}

									<div className="mt-2 flex flex-wrap items-center gap-2">
										<span className="text-base font-bold text-[#1f5d3b]">
											৳{formatPrice(finalPrice)}
										</span>

										{hasDiscount && (
											<span className="text-xs text-gray-400 line-through">
												৳{formatPrice(originalPrice)}
											</span>
										)}
									</div>

									{/* Savings */}

									{savedAmount > 0 && (
										<p className="mt-1 text-[11px] font-semibold text-[#1f5d3b]">
											You save ৳{formatPrice(savedAmount)}
										</p>
									)}

									{/* Available Stock */}

									{hasStock && !isOutOfStock && (
										<p className="mt-1 text-[10px] text-gray-400">
											Available: {stock}
										</p>
									)}
								</div>
							</div>

							{/* Quantity Controls */}

							<div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:justify-start sm:gap-4 lg:flex-col lg:items-center lg:justify-center lg:border-t-0 lg:pt-0">
								<span className="text-xs font-medium text-gray-500 lg:text-sm">
									Quantity
								</span>

								<div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
									<button
										type="button"
										onClick={() =>
											handleQuantityChange(
												item,
												quantity - 1
											)
										}
										disabled={quantity <= 1 || isOutOfStock}
										className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-green-50 hover:text-[#1f5d3b] disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="Decrease quantity">
										<Minus size={15} />
									</button>

									<span className="flex h-9 min-w-10 items-center justify-center border-x border-gray-200 px-2 text-sm font-bold text-gray-900">
										{quantity}
									</span>

									<button
										type="button"
										onClick={() =>
											handleQuantityChange(
												item,
												quantity + 1
											)
										}
										disabled={isOutOfStock || isMaxStock}
										className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-green-50 hover:text-[#1f5d3b] disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="Increase quantity">
										<Plus size={15} />
									</button>
								</div>
							</div>

							{/* Item Total */}

							<div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:pt-0">
								<div className="lg:text-right">
									<p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
										Item Total
									</p>

									<p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
										৳{formatPrice(itemTotal)}
									</p>
								</div>

								<button
									type="button"
									onClick={() => handleRemove(item)}
									className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 sm:hidden lg:flex"
									aria-label="Remove product">
									<Trash2 size={14} />

									<span className="lg:hidden">Remove</span>
								</button>
							</div>
						</div>

						{/* Stock Warnings */}

						{isOutOfStock && (
							<div className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-700">
								This variant is currently out of stock.
							</div>
						)}

						{!isOutOfStock && isMaxStock && (
							<div className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-700">
								Maximum available stock reached.
							</div>
						)}
					</article>
				);
			})}
		</div>
	);
};

export default CartItems;

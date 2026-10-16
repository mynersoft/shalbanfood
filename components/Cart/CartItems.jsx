
'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
    Minus,
    Plus,
    Trash2,
    Package,
} from 'lucide-react';

import {
    removeFromCart,
    updateQuantity,
} from '@/redux/store/slices/cartSlice';

const CartItems = () => {
    const dispatch = useDispatch();

    const items = useSelector(
        (state) => state.cart?.items ?? []
    );

    // --------------------------------------------------
    // Product ID
    // --------------------------------------------------
    const getProductId = (item) =>
        String(item?._id ?? item?.productId ?? item?.slug ?? '');

    // --------------------------------------------------
    // Variant identity
    // --------------------------------------------------
    const getVariantIdentity = (item) => ({
        productId: getProductId(item),
        variantId: item?.variantId ?? null,
        variantKey: item?.variantKey ?? null,
    });

    // --------------------------------------------------
    // Product image
    // --------------------------------------------------
    const getProductImage = (item) => {
        const image =
            item?.image ||
            item?.featureImg ||
            (Array.isArray(item?.galleryImages)
                ? item.galleryImages[0]
                : null);

        return typeof image === 'string' && image.trim()
            ? image
            : '/placeholder.png';
    };

    // --------------------------------------------------
    // Safe numeric values
    // --------------------------------------------------
    const toNumber = (value, fallback = 0) => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : fallback;
    };

    // --------------------------------------------------
    // Original price
    // --------------------------------------------------
    const getOriginalPrice = (item) => {
        const regularPrice = toNumber(item?.regularPrice, NaN);

        if (Number.isFinite(regularPrice) && regularPrice >= 0) {
            return regularPrice;
        }

        return getBasePrice(item);
    };

    // --------------------------------------------------
    // Base selling price
    // Prefer variant price already saved in the cart.
    // --------------------------------------------------
    const getBasePrice = (item) => {
        const price = toNumber(item?.price, NaN);

        if (Number.isFinite(price) && price >= 0) {
            return price;
        }

        const sellPrice = toNumber(item?.sellPrice, NaN);

        if (Number.isFinite(sellPrice) && sellPrice >= 0) {
            return sellPrice;
        }

        const regularPrice = toNumber(item?.regularPrice, 0);

        return Math.max(regularPrice, 0);
    };

    // --------------------------------------------------
    // Final price
    // If cart item already has a final variant price,
    // do not apply the product discount a second time.
    // --------------------------------------------------
    const calculateFinalPrice = (item) => {
        const price = getBasePrice(item);

        // Cart price is expected to be the final selected
        // variant price when ProductCard saves it.
        if (item?.price !== undefined && item?.price !== null) {
            return price;
        }

        const discountValue = toNumber(
            item?.discount?.value,
            0
        );

        if (discountValue <= 0) {
            return price;
        }

        if (item?.discount?.type === 'percentage') {
            return Math.max(
                price - (price * discountValue) / 100,
                0
            );
        }

        if (item?.discount?.type === 'fixed') {
            return Math.max(price - discountValue, 0);
        }

        return price;
    };

    // --------------------------------------------------
    // Discount label
    // --------------------------------------------------
    const getDiscountText = (item) => {
        const value = toNumber(item?.discount?.value, 0);

        if (value <= 0) {
            return null;
        }

        if (item?.discount?.type === 'percentage') {
            return `${value}% OFF`;
        }

        if (item?.discount?.type === 'fixed') {
            return `৳${value.toLocaleString('en-BD')} OFF`;
        }

        return null;
    };

    // --------------------------------------------------
    // Currency formatter
    // --------------------------------------------------
    const formatPrice = (value) =>
        toNumber(value).toLocaleString('en-BD', {
            maximumFractionDigits: 2,
        });

    // --------------------------------------------------
    // Remove one specific variant
    // --------------------------------------------------
    const handleRemove = (item) => {
        dispatch(
            removeFromCart(getVariantIdentity(item))
        );

        toast.success('Product removed from cart');
    };

    // --------------------------------------------------
    // Update quantity for one specific variant
    // --------------------------------------------------
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

        const stock = toNumber(stockValue, 0);

        if (hasStock && stock <= 0) {
            toast.error('This product is out of stock');
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

    // --------------------------------------------------
    // Empty cart
    // --------------------------------------------------
    if (items.length === 0) {
        return null;
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">
                        Cart Items
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Review your selected products
                    </p>
                </div>

                <Package
                    size={21}
                    className="text-[#16834b]"
                />
            </div>

            {/* Items */}
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

                const savedAmount = Math.max(
                    originalItemTotal - itemTotal,
                    0
                );

                const discountText = getDiscountText(item);
                const productImage = getProductImage(item);

                const hasDiscount = finalPrice < originalPrice;

                const productHref = `/product/${
                    item?.slug || productId
                }`;

                const stockValue = item?.stock;
                const hasStock =
                    stockValue !== null &&
                    stockValue !== undefined &&
                    stockValue !== '';

                const stock = toNumber(stockValue, 0);

                const isMaxStock =
                    hasStock &&
                    stock > 0 &&
                    quantity >= stock;

                const isOutOfStock =
                    hasStock && stock <= 0;

                // Include variant identity in the React key.
                const itemKey = [
                    productId,
                    item?.variantId ?? '',
                    item?.variantKey ?? '',
                    index,
                ].join('-');

                return (
                    <article
                        key={itemKey}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md"
                    >
                        <div className="p-4 sm:p-5">
                            <div className="flex gap-4">
                                {/* Image */}
                                <Link
                                    href={productHref}
                                    className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#fafafa] sm:h-[120px] sm:w-[120px]"
                                >
                                    <Image
                                        src={productImage}
                                        alt={item?.name || 'Product'}
                                        fill
                                        sizes="(max-width: 640px) 96px, 120px"
                                        className="object-contain p-2 transition duration-300 group-hover:scale-105"
                                    />

                                    {discountText && hasDiscount && (
                                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[#e5484d] px-2 py-1 text-[9px] font-bold text-white shadow-sm">
                                            {discountText}
                                        </span>
                                    )}
                                </Link>

                                {/* Product details */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <Link
                                            href={productHref}
                                            className="min-w-0"
                                        >
                                            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition hover:text-[#16834b] sm:text-base">
                                                {item?.name || 'Product'}
                                            </h3>
                                        </Link>

                                        {/* Desktop remove */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item)}
                                            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:flex"
                                            aria-label={`Remove ${
                                                item?.name || 'product'
                                            }`}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>

                                    {/* Variant label */}
                                    {item?.variantLabel && (
                                        <p className="mt-1 text-xs font-medium text-gray-600">
                                            {item.variantLabel}
                                        </p>
                                    )}

                                    {/* Size */}
                                    {!item?.variantLabel &&
                                        item?.size?.value !== undefined &&
                                        item?.size?.value !== null && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                {item.size.value}{' '}
                                                {item?.size?.unit || ''}
                                            </p>
                                        )}

                                    {/* Price */}
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-bold text-[#16834b]">
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
                                        <p className="mt-1 text-[11px] font-semibold text-[#16834b]">
                                            You save ৳{formatPrice(savedAmount)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quantity and item total */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="hidden text-xs font-medium text-gray-500 sm:block">
                                        Quantity
                                    </span>

                                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item,
                                                    quantity - 1
                                                )
                                            }
                                            disabled={
                                                quantity <= 1 ||
                                                isOutOfStock
                                            }
                                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#16834b] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={15} />
                                        </button>

                                        <span className="flex h-9 min-w-9 items-center justify-center border-x border-gray-200 px-2 text-sm font-bold text-gray-900">
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
                                            disabled={
                                                isOutOfStock ||
                                                isMaxStock
                                            }
                                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#16834b] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Item total */}
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                        Item Total
                                    </p>

                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:text-lg">
                                        ৳{formatPrice(itemTotal)}
                                    </p>
                                </div>
                            </div>

                            {/* Stock warnings */}
                            {isOutOfStock && (
                                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[11px] font-medium text-red-700">
                                    This product is currently out of stock
                                </div>
                            )}

                            {!isOutOfStock && isMaxStock && (
                                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] font-medium text-amber-700">
                                    Maximum available stock reached
                                </div>
                            )}

                            {/* Mobile remove */}
                            <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 sm:hidden"
                            >
                                <Trash2 size={14} />
                                Remove Item
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default CartItems;

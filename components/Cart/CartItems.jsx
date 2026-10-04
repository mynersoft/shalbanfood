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
    ChevronRight,
} from 'lucide-react';

import {
    removeFromCart,
    updateQuantity,
} from '@/redux/store/slices/cartSlice';

const CartItems = () => {
    const dispatch = useDispatch();

    const { items = [] } = useSelector(
        (state) => state.cart
    );

    /*
    |--------------------------------------------------------------------------
    | Product image
    |--------------------------------------------------------------------------
    */
    const getProductImage = (item) => {
        if (item.image) return item.image;

        if (item.featureImg) {
            return item.featureImg;
        }

        if (
            Array.isArray(item.galleryImages) &&
            item.galleryImages.length > 0
        ) {
            return item.galleryImages[0];
        }

        return '/placeholder.png';
    };

    /*
    |--------------------------------------------------------------------------
    | Original price
    |--------------------------------------------------------------------------
    */
    const getOriginalPrice = (item) => {
        const regularPrice = Number(
            item.regularPrice
        );

        return Number.isFinite(regularPrice) &&
            regularPrice >= 0
            ? regularPrice
            : 0;
    };

    /*
    |--------------------------------------------------------------------------
    | Base selling price
    |--------------------------------------------------------------------------
    */
    const getBasePrice = (item) => {
        const sellPrice = Number(
            item.sellPrice
        );

        if (
            Number.isFinite(sellPrice) &&
            sellPrice >= 0
        ) {
            return sellPrice;
        }

        const regularPrice = Number(
            item.regularPrice
        );

        return Number.isFinite(regularPrice) &&
            regularPrice >= 0
            ? regularPrice
            : 0;
    };

    /*
    |--------------------------------------------------------------------------
    | Final price
    |--------------------------------------------------------------------------
    */
    const calculateFinalPrice = (item) => {
        const basePrice =
            getBasePrice(item);

        if (
            !item.discount ||
            !item.discount.value
        ) {
            return basePrice;
        }

        const discountValue = Number(
            item.discount.value
        );

        if (
            !Number.isFinite(discountValue) ||
            discountValue < 0
        ) {
            return basePrice;
        }

        if (
            item.discount.type === 'percentage'
        ) {
            return Math.max(
                basePrice -
                    (basePrice *
                        discountValue) /
                        100,
                0
            );
        }

        if (
            item.discount.type === 'fixed'
        ) {
            return Math.max(
                basePrice - discountValue,
                0
            );
        }

        return basePrice;
    };

    /*
    |--------------------------------------------------------------------------
    | Discount label
    |--------------------------------------------------------------------------
    */
    const getDiscountText = (item) => {
        if (
            !item.discount ||
            !item.discount.value
        ) {
            return null;
        }

        const value = Number(
            item.discount.value
        );

        if (!Number.isFinite(value)) {
            return null;
        }

        if (
            item.discount.type ===
            'percentage'
        ) {
            return `${value}% OFF`;
        }

        if (
            item.discount.type === 'fixed'
        ) {
            return `৳${value.toLocaleString(
                'en-BD'
            )} OFF`;
        }

        return null;
    };

    /*
    |--------------------------------------------------------------------------
    | Remove
    |--------------------------------------------------------------------------
    */
    const handleRemove = (productId) => {
        dispatch(
            removeFromCart(productId)
        );

        toast.success(
            'Product removed from cart'
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Quantity
    |--------------------------------------------------------------------------
    */
    const handleQuantityChange = (
        productId,
        newQty
    ) => {
        if (newQty < 1) return;

        dispatch(
            updateQuantity({
                productId,
                quantity: newQty,
            })
        );
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* =====================================================
                CART HEADER
            ====================================================== */}
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

            {/* =====================================================
                ITEMS
            ====================================================== */}
            {items.map((item, index) => {
                const originalPrice =
                    getOriginalPrice(item);

                const finalPrice =
                    calculateFinalPrice(item);

                const quantity =
                    Number(item.quantity) || 0;

                const itemTotal =
                    finalPrice * quantity;

                const originalItemTotal =
                    originalPrice * quantity;

                const savedAmount = Math.max(
                    originalItemTotal -
                        itemTotal,
                    0
                );

                const discountText =
                    getDiscountText(item);

                const productImage =
                    getProductImage(item);

                const hasDiscount =
                    finalPrice <
                    originalPrice;

                const productHref =
                    `/product/${
                        item.slug ||
                        item._id
                    }`;

                return (
                    <article
                        key={`${item._id}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md"
                    >
                        <div className="p-4 sm:p-5">
                            <div className="flex gap-4">
                                {/* =================================
                                    IMAGE
                                ================================== */}
                                <Link
                                    href={productHref}
                                    className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#fafafa] sm:h-[120px] sm:w-[120px]"
                                >
                                    <Image
                                        src={
                                            productImage
                                        }
                                        alt={
                                            item.name ||
                                            'Product'
                                        }
                                        fill
                                        sizes="120px"
                                        className="object-contain p-2 transition duration-300 group-hover:scale-105"
                                    />

                                    {discountText && (
                                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[#e5484d] px-2 py-1 text-[9px] font-bold text-white shadow-sm">
                                            {
                                                discountText
                                            }
                                        </span>
                                    )}
                                </Link>

                                {/* =================================
                                    CONTENT
                                ================================== */}
                                <div className="min-w-0 flex-1">
                                    {/* Name */}
                                    <div className="flex items-start justify-between gap-3">
                                        <Link
                                            href={
                                                productHref
                                            }
                                            className="min-w-0"
                                        >
                                            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition hover:text-[#16834b] sm:text-base">
                                                {
                                                    item.name
                                                }
                                            </h3>
                                        </Link>

                                        {/* Desktop remove */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(
                                                    item._id
                                                )
                                            }
                                            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:flex"
                                            aria-label={`Remove ${
                                                item.name ||
                                                'product'
                                            }`}
                                        >
                                            <Trash2
                                                size={
                                                    17
                                                }
                                            />
                                        </button>
                                    </div>

                                    {/* Size */}
                                    {item
                                        .size
                                        ?.value && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {
                                                item
                                                    .size
                                                    .value
                                            }{' '}
                                            {
                                                item
                                                    .size
                                                    .unit
                                            }
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-bold text-[#16834b]">
                                            ৳
                                            {finalPrice.toLocaleString(
                                                'en-BD'
                                            )}
                                        </span>

                                        {hasDiscount && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ৳
                                                {originalPrice.toLocaleString(
                                                    'en-BD'
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Saved */}
                                    {savedAmount >
                                        0 && (
                                        <p className="mt-1 text-[11px] font-semibold text-[#16834b]">
                                            You save ৳
                                            {savedAmount.toLocaleString(
                                                'en-BD'
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* =====================================
                                BOTTOM ROW
                            ====================================== */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                {/* Quantity */}
                                <div className="flex items-center gap-2">
                                    <span className="hidden text-xs font-medium text-gray-500 sm:block">
                                        Quantity
                                    </span>

                                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item._id,
                                                    quantity -
                                                        1
                                                )
                                            }
                                            disabled={
                                                quantity <=
                                                1
                                            }
                                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#16834b] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus
                                                size={
                                                    15
                                                }
                                            />
                                        </button>

                                        <span className="flex h-9 min-w-9 items-center justify-center border-x border-gray-200 px-2 text-sm font-bold text-gray-900">
                                            {
                                                quantity
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item._id,
                                                    quantity +
                                                        1
                                                )
                                            }
                                            disabled={
                                                item.stock >
                                                    0 &&
                                                quantity >=
                                                    item.stock
                                            }
                                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#16834b] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus
                                                size={
                                                    15
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Item total */}
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                        Item Total
                                    </p>

                                    <p className="mt-0.5 text-base font-bold text-gray-900 sm:text-lg">
                                        ৳
                                        {itemTotal.toLocaleString(
                                            'en-BD'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Stock warning */}
                            {item.stock >
                                0 &&
                                quantity >=
                                    item.stock && (
                                    <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] font-medium text-amber-700">
                                        Maximum available stock reached
                                    </div>
                                )}

                            {/* Mobile remove */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemove(
                                        item._id
                                    )
                                }
                                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 sm:hidden"
                            >
                                <Trash2
                                    size={14}
                                />
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
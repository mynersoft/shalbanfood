
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShoppingCart,
    Eye,
    Package,
} from 'lucide-react';

import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

const EMPTY_VARIANTS = [];

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
    return variant?._id != null
        ? String(variant._id)
        : `variant-${index}`;
};

const getPrice = (value) => {
    const price = Number(value);

    return Number.isFinite(price) && price >= 0
        ? price
        : 0;
};

const getStock = (value) => {
    const stock = Number(value);

    return Number.isFinite(stock) && stock > 0
        ? stock
        : 0;
};

export default function ProductCard({ product }) {
    const dispatch = useDispatch();

    const variants = Array.isArray(product?.variants)
        ? product.variants
        : EMPTY_VARIANTS;

    const productId = String(
        product?._id || product?.slug || ''
    );

    // Find initial available variant
    const getInitialVariant = () => {
        const availableIndex = variants.findIndex(
            (variant) => getStock(variant.stock) > 0
        );

        const index =
            availableIndex >= 0
                ? availableIndex
                : variants.length > 0
                    ? 0
                    : -1;

        return index >= 0
            ? getVariantKey(variants[index], index)
            : '';
    };

    const [selectedId, setSelectedId] = useState(
        getInitialVariant
    );

    // Reset variant when product changes
    useEffect(() => {
        setSelectedId(getInitialVariant());
    }, [productId, variants]);

    // Selected variant
    const selectedIndex = variants.findIndex(
        (variant, index) =>
            getVariantKey(variant, index) === selectedId
    );

    const availableIndex = variants.findIndex(
        (variant) => getStock(variant.stock) > 0
    );

    const activeIndex =
        selectedIndex >= 0
            ? selectedIndex
            : availableIndex >= 0
                ? availableIndex
                : variants.length > 0
                    ? 0
                    : -1;

    const selected =
        activeIndex >= 0
            ? variants[activeIndex]
            : null;

    // Price calculation
    const regularPrice = getPrice(
        selected?.regularPrice
    );

    const sellPrice = getPrice(
        selected?.sellPrice
    );

    const finalPrice =
        sellPrice > 0
            ? sellPrice
            : regularPrice;

    const hasDiscount =
        regularPrice > 0 &&
        sellPrice > 0 &&
        sellPrice < regularPrice;

    const discountPercent = hasDiscount
        ? Math.round(
            ((regularPrice - sellPrice) / regularPrice) * 100
        )
        : 0;

    // Stock checking
    const selectedStock = getStock(selected?.stock);

    const selectedOutOfStock =
        !selected || selectedStock <= 0;

    const allOutOfStock =
        variants.length === 0 ||
        variants.every(
            (variant) => getStock(variant.stock) <= 0
        );

    const productHref = product?.slug
        ? `/product/${encodeURIComponent(product.slug)}`
        : '#';

    // Select variant
    const handleSelectVariant = (variant, index) => {
        setSelectedId(
            getVariantKey(variant, index)
        );
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!selected || selectedStock <= 0) {
            toast.error(
                'এই পণ্যটি বর্তমানে স্টকে নেই।'
            );
            return;
        }

        const variantKey = getVariantKey(
            selected,
            activeIndex
        );

        const variantId =
            selected?._id != null
                ? String(selected._id)
                : null;

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

                    sku:
                        selected.sku ||
                        product?.sku ||
                        '',

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
            className="
                group relative flex h-full flex-col
                overflow-hidden rounded-lg
                border border-gray-300
                bg-white
                transition-all duration-200
                hover:border-orange-300
                hover:shadow-md
            "
        >
            {/* Product Image */}
            <Link
                href={productHref}
                className="block"
            >
                <div
                    className="
                        relative aspect-square
                        w-full overflow-hidden
                        bg-white
                    "
                >
                    {product?.image ? (
                        <Image
                            src={product.image}
                            alt={product?.name || 'Shalban Food Product'}
                            fill
                            sizes="
                                (max-width: 640px) 50vw,
                                (max-width: 1024px) 33vw,
                                25vw
                            "
                            className="
                                object-contain
                                p-3 sm:p-4
                                transition-transform
                                duration-500
                                group-hover:scale-105
                            "
                        />
                    ) : (
                        <div
                            className="
                                flex h-full flex-col
                                items-center justify-center
                                gap-2 text-gray-400
                            "
                        >
                            <Package size={36} />
                            <span className="text-xs">
                                No Image
                            </span>
                        </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <span
                            className="
                                absolute right-2 top-2
                                rounded bg-green-600
                                px-2 py-1
                                text-[10px] font-bold
                                text-white
                            "
                        >
                            Save {discountPercent}%
                        </span>
                    )}

                    {/* Out Of Stock Overlay */}
                    {allOutOfStock && (
                        <div
                            className="
                                absolute inset-0
                                flex items-center
                                justify-center
                                bg-black/30
                            "
                        >
                            <span
                                className="
                                    rounded-full bg-white
                                    px-3 py-1.5
                                    text-xs font-semibold
                                    text-gray-800
                                "
                            >
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick View */}
                    <div
                        className="
                            absolute bottom-3 right-3
                            flex h-9 w-9
                            translate-y-2
                            items-center justify-center
                            rounded-full bg-white
                            text-gray-700 shadow-md
                            opacity-0 transition-all
                            group-hover:translate-y-0
                            group-hover:opacity-100
                        "
                    >
                        <Eye size={17} />
                    </div>
                </div>
            </Link>

            {/* Product Details */}
            <div
                className="
                    flex flex-1 flex-col
                    p-3 sm:p-4
                "
            >
                {/* Product Name */}
                <Link href={productHref}>
                    <h2
                        className="
                            line-clamp-2
                            min-h-[44px]
                            text-[15px]
                            font-medium
                            leading-5
                            text-gray-800
                            transition-colors
                            hover:text-orange-500
                            sm:text-base
                        "
                    >
                        {product?.name}
                    </h2>
                </Link>

                {/* Variant Selection */}
                {variants.length > 1 && (
                    <div className="mt-2">
                        <div className="flex flex-wrap gap-1.5">
                            {variants.map(
                                (variant, index) => {
                                    const key =
                                        getVariantKey(
                                            variant,
                                            index
                                        );

                                    const isSelected =
                                        key ===
                                        getVariantKey(
                                            selected,
                                            activeIndex
                                        );

                                    const soldOut =
                                        getStock(
                                            variant.stock
                                        ) <= 0;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() =>
                                                handleSelectVariant(
                                                    variant,
                                                    index
                                                )
                                            }
                                            className={`
                                                rounded border
                                                px-2 py-1
                                                text-[10px]
                                                font-medium
                                                transition
                                                ${
                                                    isSelected
                                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                        : 'border-gray-300 text-gray-600 hover:border-orange-400'
                                                }
                                                ${
                                                    soldOut
                                                        ? 'line-through opacity-50'
                                                        : ''
                                                }
                                            `}
                                        >
                                            {formatSize(variant)}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                )}

                {/* Single Variant */}
                {variants.length === 1 && selected && (
                    <p className="mt-2 text-xs text-gray-500">
                        {formatSize(selected)}
                    </p>
                )}

                {/* Price */}
                <div
                    className="
                        mt-auto pt-3
                        flex flex-wrap
                        items-baseline gap-2
                    "
                >
                    <span
                        className="
                            text-lg font-bold
                            text-[#F28C18]
                            sm:text-xl
                        "
                    >
                        ৳{finalPrice.toLocaleString('en-BD')}
                    </span>

                    {hasDiscount && (
                        <span
                            className="
                                text-xs text-gray-400
                                line-through
                                sm:text-sm
                            "
                        >
                            ৳{regularPrice.toLocaleString('en-BD')}
                        </span>
                    )}
                </div>

                {/* Add To Cart Button */}
                <button
                    type="button"
                    disabled={selectedOutOfStock}
                    onClick={handleAddToCart}
                    className="
                        mt-3 flex w-full
                        items-center justify-center
                        gap-2 rounded-lg
                        border-2 border-[#F28C18]
                        bg-white
                        px-2 py-2.5
                        text-sm font-semibold
                        text-[#F28C18]
                        transition-all duration-200
                        hover:bg-[#F28C18]
                        hover:text-white
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:border-gray-300
                        disabled:bg-gray-100
                        disabled:text-gray-400
                        sm:py-3
                    "
                >
                    <ShoppingCart
                        size={19}
                        strokeWidth={2}
                    />

                    {selectedOutOfStock
                        ? 'Out of Stock'
                        : 'Add To Cart'}
                </button>
            </div>
        </article>
    );
}

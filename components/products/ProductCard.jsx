'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
    const dispatch = useDispatch();

    const regularPrice = Number(product.regularPrice || 0);
    const sellPrice = Number(product.sellPrice || 0);

    // Sell price থাকলে সেটাই current price
    const finalPrice = sellPrice > 0 ? sellPrice : regularPrice;

    const hasDiscount =
        regularPrice > 0 &&
        sellPrice > 0 &&
        sellPrice < regularPrice;

    const discountPercent = hasDiscount
        ? Math.round(((regularPrice - sellPrice) / regularPrice) * 100)
        : 0;

    const isOutOfStock = Number(product.stock || 0) <= 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        dispatch(
            addToCart({
                product,
                quantity: 1,
            })
        );

        toast.success('Product added to cart');
    };

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* Product Image */}
            <Link
                href={`/${product.slug || ''}`}
                className="block"
            >
                <div className="relative aspect-square overflow-hidden bg-gray-50">

                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name || 'Product'}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                            <Package size={32} strokeWidth={1.5} />
                            <span className="text-xs">No Image</span>
                        </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Out of Stock */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* View Button */}
                    <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg">
                            <Eye size={17} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Product Content */}
            <div className="p-3 sm:p-4">

                {/* Category */}
                {product.category && (
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {product.category}
                    </p>
                )}

                {/* Product Name */}
                <Link href={`/${product.slug || ''}`}>
                    <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-gray-800 transition-colors hover:text-green-600 sm:text-[15px]">
                        {product.name}
                    </h2>
                </Link>

                {/* Size */}
                {product.size?.value && product.size?.unit && (
                    <p className="mt-1 text-xs text-gray-500">
                        {product.size.value} {product.size.unit}
                    </p>
                )}

                {/* Price */}
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 sm:text-xl">
                        ৳{finalPrice.toLocaleString('en-BD')}
                    </span>

                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through sm:text-sm">
                            ৳{regularPrice.toLocaleString('en-BD')}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                <div className="mt-1.5">
                    {product.stock > 0 ? (
                        <span className="text-xs font-medium text-green-600">
                            ✓ In Stock
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-red-500">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Add To Cart */}
                <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                    <ShoppingCart size={17} strokeWidth={2} />

                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </article>
    );
}
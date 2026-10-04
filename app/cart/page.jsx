'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Truck,
} from 'lucide-react';

import { calculateShippingFee } from '@/lib/calculateShippingFee';

import CheckEmptyCart from '@/components/Cart/CheckEmptyCart';
import CartItems from '@/components/Cart/CartItems';

const FREE_SHIPPING_LIMIT = 1000;

export default function CartPage() {
    const { items = [] } = useSelector(
        (state) => state.cart
    );

    /*
    |--------------------------------------------------------------------------
    | Calculate final product price
    |--------------------------------------------------------------------------
    */
    const calculateFinalPrice = (item) => {
        const sellPrice = Number(item.sellPrice);
        const regularPrice = Number(item.regularPrice);

        let basePrice = 0;

        if (
            Number.isFinite(sellPrice) &&
            sellPrice >= 0
        ) {
            basePrice = sellPrice;
        } else if (
            Number.isFinite(regularPrice) &&
            regularPrice >= 0
        ) {
            basePrice = regularPrice;
        }

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
                    (basePrice * discountValue) /
                        100,
                0
            );
        }

        if (item.discount.type === 'fixed') {
            return Math.max(
                basePrice - discountValue,
                0
            );
        }

        return basePrice;
    };

    /*
    |--------------------------------------------------------------------------
    | Cart calculations
    |--------------------------------------------------------------------------
    */
    const {
        subtotal,
        totalQty,
        shippingFee,
        grandTotal,
        remainingForFreeShipping,
        shippingProgress,
    } = useMemo(() => {
        const subtotalValue = items.reduce(
            (total, item) => {
                const price =
                    calculateFinalPrice(item);

                const quantity =
                    Number(item.quantity) || 0;

                return (
                    total +
                    price * quantity
                );
            },
            0
        );

        const quantityValue = items.reduce(
            (total, item) =>
                total +
                (Number(item.quantity) || 0),
            0
        );

        const shipping = Number(
            calculateShippingFee({
                subtotal: subtotalValue,
                location: 'Dhaka',
            }) || 0
        );

        const remaining = Math.max(
            FREE_SHIPPING_LIMIT -
                subtotalValue,
            0
        );

        const progress = Math.min(
            (subtotalValue /
                FREE_SHIPPING_LIMIT) *
                100,
            100
        );

        return {
            subtotal: subtotalValue,
            totalQty: quantityValue,
            shippingFee: shipping,
            grandTotal:
                subtotalValue + shipping,
            remainingForFreeShipping:
                remaining,
            shippingProgress: progress,
        };
    }, [items]);

    /*
    |--------------------------------------------------------------------------
    | Empty Cart
    |--------------------------------------------------------------------------
    */
    if (items.length === 0) {
        return <CheckEmptyCart />;
    }

    return (
        <>
            <main className="min-h-screen bg-[#f8faf9] pb-28 lg:pb-10">
                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}
                <section className="border-b border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {/* Breadcrumb */}
                        <div className="mb-4 flex items-center gap-1 text-xs text-gray-400">
                            <Link
                                href="/"
                                className="transition hover:text-[#16834b]"
                            >
                                Home
                            </Link>

                            <ChevronRight size={14} />

                            <span className="font-medium text-gray-700">
                                Cart
                            </span>
                        </div>

                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#16834b]">
                                    Shalban Food
                                </p>

                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    Your Shopping Cart
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Review your items before checkout.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ShoppingBag
                                    size={18}
                                    className="text-[#16834b]"
                                />

                                <span>
                                    {totalQty} item
                                    {totalQty !== 1
                                        ? 's'
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    CART CONTENT
                ====================================================== */}
                <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                        {/* =================================================
                            LEFT
                        ================================================== */}
                        <div className="min-w-0">
                            <CartItems />

                            {/* Continue Shopping */}
                            <div className="mt-5 hidden rounded-2xl border border-gray-200 bg-white p-5 sm:block">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Looking for something else?
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Explore more natural products from Shalban Food.
                                        </p>
                                    </div>

                                    <Link
                                        href="/shop"
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#16834b] hover:bg-[#f0faf5] hover:text-[#16834b]"
                                    >
                                        Continue Shopping
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            RIGHT - ORDER SUMMARY
                        ================================================== */}
                        <aside className="lg:sticky lg:top-24">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                {/* Header */}
                                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Order Summary
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {totalQty} item
                                        {totalQty !== 1
                                            ? 's'
                                            : ''}{' '}
                                        in your cart
                                    </p>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {/* Free Shipping */}
                                    {subtotal <
                                    FREE_SHIPPING_LIMIT ? (
                                        <div className="mb-6 rounded-xl border border-[#d7f0e2] bg-[#f1fbf5] p-4">
                                            <div className="flex gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d9f4e5] text-[#16834b]">
                                                    <Truck
                                                        size={18}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-[#146c40]">
                                                        আরও ৳
                                                        {remainingForFreeShipping.toLocaleString(
                                                            'en-BD'
                                                        )}{' '}
                                                        কিনলে Free Shipping
                                                    </p>

                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d9f0e2]">
                                                        <div
                                                            className="h-full rounded-full bg-[#16834b] transition-all duration-500"
                                                            style={{
                                                                width: `${shippingProgress}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <p className="mt-2 text-[11px] text-[#518166]">
                                                        Free shipping on orders over ৳
                                                        {FREE_SHIPPING_LIMIT.toLocaleString(
                                                            'en-BD'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#d7f0e2] bg-[#f1fbf5] p-4">
                                            <CheckCircle2
                                                size={20}
                                                className="shrink-0 text-[#16834b]"
                                            />

                                            <p className="text-sm font-semibold text-[#146c40]">
                                                🎉 You qualify for free shipping!
                                            </p>
                                        </div>
                                    )}

                                    {/* Price Breakdown */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                Subtotal
                                            </span>

                                            <span className="font-semibold text-gray-900">
                                                ৳
                                                {subtotal.toLocaleString(
                                                    'en-BD'
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                Shipping
                                            </span>

                                            <span
                                                className={
                                                    shippingFee ===
                                                    0
                                                        ? 'font-semibold text-[#16834b]'
                                                        : 'font-semibold text-gray-900'
                                                }
                                            >
                                                {shippingFee ===
                                                0
                                                    ? 'Free'
                                                    : `৳${shippingFee.toLocaleString(
                                                          'en-BD'
                                                      )}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="my-5 border-t border-dashed border-gray-200" />

                                    {/* Total */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                Total Amount
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Including shipping
                                            </p>
                                        </div>

                                        <span className="text-2xl font-bold text-[#16834b]">
                                            ৳
                                            {grandTotal.toLocaleString(
                                                'en-BD'
                                            )}
                                        </span>
                                    </div>

                                    {/* Checkout */}
                                    <Link
                                        href="/checkout"
                                        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16834b] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#116b3d] hover:shadow-lg active:scale-[0.98]"
                                    >
                                        Proceed to Checkout

                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </Link>

                                    {/* Trust */}
                                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                            <ShieldCheck
                                                size={16}
                                                className="text-[#16834b]"
                                            />

                                            Secure Checkout
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                            <CheckCircle2
                                                size={16}
                                                className="text-[#16834b]"
                                            />

                                            Quality Products
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>

            {/* =========================================================
                MOBILE FIXED CHECKOUT BAR
            ========================================================== */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <Link
                        href="/shop"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                        aria-label="Continue shopping"
                    >
                        <ShoppingBag size={20} />
                    </Link>

                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-500">
                            Total Amount
                        </p>

                        <p className="truncate text-lg font-bold text-[#16834b]">
                            ৳
                            {grandTotal.toLocaleString(
                                'en-BD'
                            )}
                        </p>
                    </div>

                    <Link
                        href="/checkout"
                        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#16834b] px-5 text-sm font-bold text-white shadow-sm transition active:scale-[0.97]"
                    >
                        Checkout
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </div>
        </>
    );
}
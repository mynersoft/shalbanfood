'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, X, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectCartTotalItems,
    removeFromCart,
} from '@/redux/store/slices/cartSlice';

const formatSize = (item) => {
    if (item.variantLabel) return item.variantLabel;

    const unitLabels = {
        gram: 'গ্রাম',
        kg: 'কেজি',
        milliliter: 'মিলিলিটার',
        litre: 'লিটার',
        piece: 'পিস',
    };

    if (item.size?.value != null) {
        return `${item.size.value} ${
            unitLabels[item.size.unit] || item.size.unit || ''
        }`;
    }

    return '';
};

const getCartKey = (item) =>
    `${item._id || item.slug}:${item.variantId || item.variantKey || 'default'}`;

export default function CartDrawer({ open, onClose }) {
    const dispatch = useDispatch();

    const { items = [] } = useSelector(
        (state) => state.cart || {}
    );

    const cartQty = useSelector(selectCartTotalItems);

    const subtotal = items.reduce((total, item) => {
        const price = Number(
            item.price ?? item.sellPrice ?? item.regularPrice ?? 0
        );
        const quantity = Number(item.quantity) || 0;

        return total +
            (Number.isFinite(price) ? price : 0) * quantity;
    }, 0);

    const handleRemove = (item) => {
        dispatch(
            removeFromCart({
                productId: String(item._id || item.slug || ''),
                variantId: item.variantId
                    ? String(item.variantId)
                    : null,
                variantKey: item.variantKey || 'default',
            })
        );
    };

    return (
        <>
            {open && (
                <button
                    type="button"
                    aria-label="Close cart overlay"
                    onClick={onClose}
                    className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px]"
                />
            )}

            <aside
                aria-label="Shopping cart"
                aria-hidden={!open}
                className={`fixed right-0 top-0 z-[80] flex h-dvh
                    w-[400px] max-w-[94vw] flex-col bg-white shadow-2xl
                    transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex h-[72px] shrink-0 items-center
                    justify-between border-b px-5">
                    <div>
                        <h2 className="font-bold text-gray-900">
                            Your Cart
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            {cartQty} item{cartQty !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close cart"
                        className="flex h-10 w-10 items-center
                            justify-center rounded-full hover:bg-gray-100"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col
                            items-center justify-center text-center">
                            <ShoppingCart
                                size={42}
                                className="text-gray-300"
                            />

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Your cart is empty
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add some products to your cart.
                            </p>

                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="mt-5 inline-flex items-center
                                    gap-2 rounded-xl bg-[#1f5d3b]
                                    px-5 py-3 text-sm font-semibold text-white"
                            >
                                Start Shopping
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const key = getCartKey(item);

                                const price = Number(
                                    item.price ??
                                    item.sellPrice ??
                                    item.regularPrice ??
                                    0
                                );

                                const safePrice =
                                    Number.isFinite(price) ? price : 0;

                                const imageSrc =
                                    item.image || item.featureImg || '';

                                return (
                                    <div
                                        key={key}
                                        className="flex gap-3 border-b
                                            border-gray-100 pb-4"
                                    >
                                        {/* Image */}
                                        <Link
                                            href={`/product/${encodeURIComponent(item.slug || '')}`}
                                            onClick={onClose}
                                            className="flex h-[76px] w-[76px]
                                                shrink-0 items-center
                                                justify-center overflow-hidden
                                                rounded-xl bg-gray-50"
                                        >
                                            {imageSrc ? (
                                                <Image
                                                    src={imageSrc}
                                                    alt={item.name || 'Product'}
                                                    width={76}
                                                    height={76}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingCart
                                                    size={24}
                                                    className="text-gray-300"
                                                />
                                            )}
                                        </Link>

                                        {/* Product details */}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/product/${encodeURIComponent(item.slug || '')}`}
                                                onClick={onClose}
                                                className="line-clamp-2 text-sm
                                                    font-medium text-gray-900
                                                    hover:text-[#1f5d3b]"
                                            >
                                                {item.name}
                                            </Link>

                                            {formatSize(item) && (
                                                <p className="mt-1 text-xs
                                                    font-medium text-gray-500">
                                                    ওজন: {formatSize(item)}
                                                </p>
                                            )}

                                            <p className="mt-1 text-sm
                                                font-bold text-[#1f5d3b]">
                                                ৳{safePrice.toLocaleString('en-BD')}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                মোট: ৳{(
                                                    safePrice *
                                                    (Number(item.quantity) || 0)
                                                ).toLocaleString('en-BD')}
                                            </p>
                                        </div>

                                        {/* Remove only this variant */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item)}
                                            aria-label={`${item.name} ${formatSize(item)} remove করুন`}
                                            className="self-start rounded-lg
                                                p-2 text-gray-400
                                                hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="shrink-0 border-t bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Subtotal
                            </span>

                            <span className="text-lg font-bold text-gray-900">
                                ৳{subtotal.toLocaleString('en-BD')}
                            </span>
                        </div>

                        <Link
                            href="/cart"
                            onClick={onClose}
                            className="mb-3 flex w-full items-center
                                justify-center rounded-xl border
                                border-gray-200 px-5 py-3 text-sm font-semibold
                                hover:bg-gray-50"
                        >
                            View Cart
                        </Link>

                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex w-full items-center justify-center
                                rounded-xl bg-[#1f5d3b] px-5 py-3
                                text-sm font-semibold text-white
                                hover:bg-[#174a2f]"
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
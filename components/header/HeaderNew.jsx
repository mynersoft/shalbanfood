'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Menu,
    X,
    ShoppingCart,
    ChevronRight,
    Trash2,
    Search,
    User,
    Heart,
    ArrowRight,
} from 'lucide-react';

import {
    selectCartTotalItems,
    removeFromCart,
} from '@/redux/store/slices/cartSlice';

export default function Header() {
    const dispatch = useDispatch();

    const { items: cartItems } = useSelector((state) => state.cart);

    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const cartQty = useSelector(selectCartTotalItems);

    const closeMenu = () => setMenuOpen(false);
    const closeCart = () => setCartOpen(false);

    const openCart = () => {
        setMenuOpen(false);
        setCartOpen(true);
    };

    return (
        <>
            {/* =====================================================
                TOP ANNOUNCEMENT BAR
            ====================================================== */}
            <div className="bg-[#1f5d3b] px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">
                প্রাকৃতিক ও মানসম্মত খাবার • Shalban Food
                <span className="mx-2 hidden sm:inline">|</span>
                <span className="hidden sm:inline">
                    অর্ডার করুন অনলাইনে
                </span>
            </div>

            {/* =====================================================
                MAIN HEADER
            ====================================================== */}
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-[68px] items-center justify-between gap-4">

                        {/* MOBILE MENU */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100 md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={22} strokeWidth={1.8} />
                        </button>

                        {/* LOGO */}
                        <Link
                            href="/"
                            className="flex min-w-fit items-center"
                        >
                            <div>
                                <div className="text-[21px] font-bold leading-none tracking-tight text-[#1f5d3b]">
                                    Shalban Food
                                </div>

                                <div className="mt-1 text-[9px] tracking-[2px] text-gray-500">
                                    SHALBAN FOOD
                                </div>
                            </div>
                        </Link>

                        {/* DESKTOP NAVIGATION */}
                        <nav className="hidden items-center gap-6 lg:flex">
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Home
                            </Link>

                            <Link
                                href="/shop"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Shop
                            </Link>

                            <Link
                                href="/honey"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Honey
                            </Link>

                            <Link
                                href="/ghee"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Ghee
                            </Link>

                            <Link
                                href="/blog"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Blog
                            </Link>

                            <Link
                                href="/about"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                About
                            </Link>

                            <Link
                                href="/contact"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Contact
                            </Link>
                        </nav>

                        {/* RIGHT ACTIONS */}
                        <div className="flex items-center gap-1">

                            {/* SEARCH */}
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
                                aria-label="Search"
                            >
                                <Search size={20} strokeWidth={1.8} />
                            </button>

                            {/* USER */}
                            <Link
                                href="/user"
                                className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100 sm:flex"
                                aria-label="Account"
                            >
                                <User size={20} strokeWidth={1.8} />
                            </Link>

                            {/* CART */}
                            <button
                                type="button"
                                onClick={openCart}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
                                aria-label="Open cart"
                            >
                                <ShoppingCart
                                    size={21}
                                    strokeWidth={1.8}
                                />

                                {cartQty > 0 && (
                                    <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1f5d3b] px-1 text-[9px] font-bold text-white">
                                        {cartQty > 99 ? '99+' : cartQty}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* MOBILE CATEGORY/NAV BAR */}
                    <div className="flex items-center gap-5 overflow-x-auto border-t border-gray-50 py-3 scrollbar-hide md:hidden">
                        <Link
                            href="/shop"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            Shop
                        </Link>

                        <Link
                            href="/honey"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            মধু
                        </Link>

                        <Link
                            href="/ghee"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            ঘি
                        </Link>

                        <Link
                            href="/combo"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            Combo
                        </Link>

                        <Link
                            href="/blog"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            Blog
                        </Link>
                    </div>
                </div>
            </header>

            {/* =====================================================
                SEARCH OVERLAY
            ====================================================== */}
            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/40">
                    <div className="bg-white shadow-xl">
                        <div className="mx-auto max-w-3xl px-4 py-5">

                            <div className="flex items-center gap-3">
                                <Search
                                    size={21}
                                    className="shrink-0 text-gray-400"
                                />

                                <input
                                    autoFocus
                                    type="search"
                                    placeholder="Search products..."
                                    className="h-12 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />

                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-5 border-t pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Popular
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Link
                                        href="/honey"
                                        onClick={() => setSearchOpen(false)}
                                        className="rounded-full border px-4 py-2 text-xs hover:bg-gray-50"
                                    >
                                        মধু
                                    </Link>

                                    <Link
                                        href="/ghee"
                                        onClick={() => setSearchOpen(false)}
                                        className="rounded-full border px-4 py-2 text-xs hover:bg-gray-50"
                                    >
                                        গাওয়া ঘি
                                    </Link>

                                    <Link
                                        href="/shop"
                                        onClick={() => setSearchOpen(false)}
                                        className="rounded-full border px-4 py-2 text-xs hover:bg-gray-50"
                                    >
                                        সব পণ্য
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                OVERLAY
            ====================================================== */}
            {(menuOpen || cartOpen) && (
                <div
                    onClick={() => {
                        closeMenu();
                        closeCart();
                    }}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
                />
            )}

            {/* =====================================================
                MOBILE MENU
            ====================================================== */}
            <aside
                className={`fixed left-0 top-0 z-[60] h-full w-[300px] max-w-[86vw] bg-white shadow-2xl transition-transform duration-300 ${
                    menuOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >
                {/* Menu Header */}
                <div className="flex h-[72px] items-center justify-between border-b px-5">
                    <div>
                        <p className="font-bold text-[#1f5d3b]">
                            Shalban Food
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Natural Food Store
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeMenu}
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-4">

                    {[
                        ['Home', '/'],
                        ['Shop', '/shop'],
                        ['Honey', '/honey'],
                        ['Ghee', '/ghee'],
                        ['Combo', '/combo'],
                        ['Blog', '/blog'],
                        ['About', '/about'],
                        ['Contact', '/contact'],
                    ].map(([label, href]) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={closeMenu}
                            className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium text-gray-800 transition hover:text-[#1f5d3b]"
                        >
                            {label}

                            <ChevronRight
                                size={17}
                                className="text-gray-400"
                            />
                        </Link>
                    ))}

                    {/* Account */}
                    <Link
                        href="/user"
                        onClick={closeMenu}
                        className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium"
                    >
                        <User size={18} />

                        My Account
                    </Link>
                </nav>
            </aside>

            {/* =====================================================
                CART DRAWER
            ====================================================== */}
            <aside
                className={`fixed right-0 top-0 z-[60] flex h-full w-[400px] max-w-[94vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${
                    cartOpen
                        ? 'translate-x-0'
                        : 'translate-x-full'
                }`}
            >
                {/* Cart Header */}
                <div className="flex h-[72px] shrink-0 items-center justify-between border-b px-5">
                    <div>
                        <h2 className="font-bold text-gray-900">
                            Your Cart
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {cartQty} item
                            {cartQty !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5">
                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                                <ShoppingCart
                                    size={28}
                                    className="text-gray-300"
                                />
                            </div>

                            <h3 className="mt-5 font-semibold text-gray-900">
                                Your cart is empty
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add some products to your cart.
                            </p>

                            <Link
                                href="/shop"
                                onClick={closeCart}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174a2f]"
                            >
                                Start Shopping
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {cartItems.map((item) => {
                                const price = Number(
                                    item.price ??
                                        item.salePrice ??
                                        item.regularPrice ??
                                        0
                                );

                                const safePrice =
                                    Number.isFinite(price)
                                        ? price
                                        : 0;

                                return (
                                    <div
                                        key={item._id}
                                        className="flex gap-3 border-b border-gray-100 pb-4"
                                    >
                                        {/* Product Image */}
                                        <Link
                                            href={`/product/${item.slug}`}
                                            onClick={closeCart}
                                            className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-gray-100"
                                        >
                                            {item.featureImg ? (
                                                <Image
                                                    src={item.featureImg}
                                                    alt={
                                                        item.name ||
                                                        'Product'
                                                    }
                                                    width={76}
                                                    height={76}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <ShoppingCart
                                                        size={20}
                                                        className="text-gray-300"
                                                    />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/product/${item.slug}`}
                                                onClick={closeCart}
                                                className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 hover:text-[#1f5d3b]"
                                            >
                                                {item.name}
                                            </Link>

                                            <p className="mt-1 text-sm font-bold text-[#1f5d3b]">
                                                ৳
                                                {safePrice.toLocaleString(
                                                    'en-BD'
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                dispatch(
                                                    removeFromCart(
                                                        item._id
                                                    )
                                                )
                                            }
                                            className="self-start rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                {cartItems.length > 0 && (
                    <div className="shrink-0 border-t bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Items
                            </span>

                            <span className="text-sm font-semibold text-gray-900">
                                {cartQty}
                            </span>
                        </div>

                        <Link
                            href="/cart"
                            onClick={closeCart}
                            className="mb-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
                        >
                            View Cart
                        </Link>

                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="flex w-full items-center justify-center rounded-xl bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#174a2f]"
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Menu,
    X,
    ShoppingCart,
    ChevronRight,
    Trash2,
    Search,
    User,
    ArrowRight,
    Minus,
    Plus,
} from 'lucide-react';

import {
    selectCartTotalItems,
    removeFromCart,
    updateQuantity,
} from '@/redux/store/slices/cartSlice';

const BRAND = '#1f5d3b';

export default function Header() {
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --------------------------------------------------
    // CART STATE
    // --------------------------------------------------

    const cartItems = useSelector(
        (state) => state?.cart?.items || []
    );

    const cartQty = useSelector((state) => {
        try {
            return selectCartTotalItems(state) || 0;
        } catch {
            return 0;
        }
    });

    const cartCount = Number.isFinite(Number(cartQty))
        ? Number(cartQty)
        : 0;

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const popularSearches = [
        {
            label: 'মধু',
            href: '/category/honey',
        },
        {
            label: 'গাওয়া ঘি',
            href: '/category/ghee',
        },
        {
            label: 'নাটস & সিডস',
            href: '/category/nuts-seeds',
        },
        {
            label: 'সব পণ্য',
            href: '/shop',
        },
    ];

    const closeAll = () => {
        setMenuOpen(false);
        setCartOpen(false);
        setSearchOpen(false);
    };

    const openCart = () => {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(true);
    };

    const openSearch = () => {
        setMenuOpen(false);
        setCartOpen(false);
        setSearchOpen(true);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const query = searchQuery.trim();

        if (!query) return;

        window.location.href = `/shop?search=${encodeURIComponent(
            query
        )}`;
    };

    // --------------------------------------------------
    // CART TOTAL
    // --------------------------------------------------

    const cartSubtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(
                item?.price ??
                    item?.salePrice ??
                    item?.regularPrice ??
                    0
            );

            const quantity = Number(item?.quantity || 1);

            if (
                !Number.isFinite(price) ||
                !Number.isFinite(quantity)
            ) {
                return total;
            }

            return total + price * quantity;
        }, 0);
    }, [cartItems]);

    // --------------------------------------------------
    // QUANTITY
    // --------------------------------------------------

    const changeQuantity = (item, quantity) => {
        const newQuantity = Math.max(1, Number(quantity));

        if (!item?._id) return;

        // If your slice uses updateQuantity
        if (typeof updateQuantity === 'function') {
            dispatch(
                updateQuantity({
                    id: item._id,
                    quantity: newQuantity,
                })
            );
        }
    };

    return (
        <>
            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">

                <div className="mx-auto max-w-7xl px-3 sm:px-4">

                    {/* TOP HEADER */}
                    <div className="flex h-[64px] items-center justify-between gap-2 sm:h-[72px]">

                        {/* MOBILE MENU */}
                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(true);
                                setCartOpen(false);
                                setSearchOpen(false);
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu
                                size={24}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* LOGO */}
                        <Link
                            href="/"
                            onClick={closeAll}
                            className="min-w-0 flex-1 md:flex-none"
                        >
                            <div className="flex items-center">

                                {/* Optional logo */}
                                <div className="mr-2 hidden h-9 w-9 items-center justify-center overflow-hidden rounded-full sm:flex">
                                    <Image
                                        src="/logo.png"
                                        alt="Shalban Food"
                                        width={36}
                                        height={36}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div>
                                    <div
                                        className="text-[19px] font-bold leading-none tracking-tight sm:text-[22px]"
                                        style={{
                                            color: BRAND,
                                        }}
                                    >
                                        Shalban Food
                                    </div>

                                    <div className="mt-1 text-[9px] tracking-[1px] text-gray-500 sm:text-[11px]">
                                        স্বাদের সাথে আস্থার বন্ধন
                                    </div>
                                </div>

                            </div>
                        </Link>

                        {/* DESKTOP NAV */}
                        <nav className="hidden items-center gap-5 lg:flex">

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
                                href="/category/honey"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Honey
                            </Link>

                            <Link
                                href="/category/ghee"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Ghee
                            </Link>

                            <Link
                                href="/combo"
                                className="text-sm font-medium text-gray-700 transition hover:text-[#1f5d3b]"
                            >
                                Combo
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
                        <div className="flex shrink-0 items-center gap-0.5">

                            {/* SEARCH */}
                            <button
                                type="button"
                                onClick={openSearch}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
                                aria-label="Search"
                            >
                                <Search
                                    size={21}
                                    strokeWidth={1.8}
                                />
                            </button>

                            {/* USER */}
                            <Link
                                href="/user"
                                className="hidden h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 sm:flex"
                                aria-label="Account"
                            >
                                <User
                                    size={21}
                                    strokeWidth={1.8}
                                />
                            </Link>

                            {/* CART */}
                            <button
                                type="button"
                                onClick={openCart}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
                                aria-label="Open cart"
                            >
                                <ShoppingCart
                                    size={21}
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <span
                                        className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                                        style={{
                                            backgroundColor: BRAND,
                                        }}
                                    >
                                        {cartCount > 99
                                            ? '99+'
                                            : cartCount}
                                    </span>
                                )}
                            </button>

                        </div>
                    </div>

                    {/* MOBILE QUICK NAV */}
                    <div className="flex items-center gap-6 overflow-x-auto border-t border-gray-50 py-2.5 scrollbar-hide md:hidden">

                        <Link
                            href="/shop"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            Shop
                        </Link>

                        <Link
                            href="/category/honey"
                            className="whitespace-nowrap text-xs font-medium text-gray-700"
                        >
                            মধু
                        </Link>

                        <Link
                            href="/category/ghee"
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
                SEARCH PANEL
            ====================================================== */}

            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/40">

                    <div className="border-b bg-white shadow-xl">

                        <div className="mx-auto max-w-3xl px-4 py-5">

                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex items-center gap-3"
                            >

                                <Search
                                    size={21}
                                    className="shrink-0 text-gray-400"
                                />

                                <input
                                    autoFocus
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(
                                            e.target.value
                                        )
                                    }
                                    placeholder="পণ্য খুঁজুন..."
                                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchOpen(false);
                                    }}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
                                    aria-label="Close search"
                                >
                                    <X size={20} />
                                </button>

                            </form>

                            {/* POPULAR */}
                            <div className="mt-5 border-t pt-4">

                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    জনপ্রিয়
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">

                                    {popularSearches.map(
                                        (item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() =>
                                                    setSearchOpen(
                                                        false
                                                    )
                                                }
                                                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:border-[#1f5d3b] hover:text-[#1f5d3b]"
                                            >
                                                {item.label}
                                            </Link>
                                        )
                                    )}

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
                <button
                    type="button"
                    aria-label="Close"
                    onClick={closeAll}
                    className="fixed inset-0 z-50 cursor-default bg-black/40 backdrop-blur-[1px]"
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

                {/* Header */}
                <div className="flex h-[72px] items-center justify-between border-b px-5">

                    <div>
                        <p
                            className="font-bold"
                            style={{
                                color: BRAND,
                            }}
                        >
                            Shalban Food
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Natural Food Store
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeAll}
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Links */}
                <nav className="p-4">

                    {[
                        ['Home', '/'],
                        ['Shop', '/shop'],
                        ['Honey', '/category/honey'],
                        ['Ghee', '/category/ghee'],
                        ['Combo', '/combo'],
                        ['Blog', '/blog'],
                        ['About', '/about'],
                        ['Contact', '/contact'],
                    ].map(([label, href]) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={closeAll}
                            className="flex items-center justify-between border-b border-gray-100 py-4 text-sm font-medium text-gray-800 transition hover:text-[#1f5d3b]"
                        >
                            <span>{label}</span>

                            <ChevronRight
                                size={17}
                                className="text-gray-400"
                            />
                        </Link>
                    ))}

                    <Link
                        href="/user"
                        onClick={closeAll}
                        className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800"
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
                            {cartCount} item
                            {cartCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeAll}
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                        aria-label="Close cart"
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
                                onClick={closeAll}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                style={{
                                    backgroundColor: BRAND,
                                }}
                            >
                                Start Shopping
                                <ArrowRight size={16} />
                            </Link>

                        </div>
                    ) : (
                        <div className="space-y-4">

                            {cartItems.map((item) => {

                                const price = Number(
                                    item?.price ??
                                        item?.salePrice ??
                                        item?.regularPrice ??
                                        0
                                );

                                const safePrice =
                                    Number.isFinite(price)
                                        ? price
                                        : 0;

                                const quantity = Math.max(
                                    1,
                                    Number(item?.quantity || 1)
                                );

                                return (
                                    <div
                                        key={
                                            item?._id ||
                                            item?.id ||
                                            Math.random()
                                        }
                                        className="flex gap-3 border-b border-gray-100 pb-4"
                                    >

                                        {/* IMAGE */}
                                        <Link
                                            href={`/product/${
                                                item?.slug || ''
                                            }`}
                                            onClick={closeAll}
                                            className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-gray-100"
                                        >
                                            {item?.featureImg ? (
                                                <Image
                                                    src={
                                                        item.featureImg
                                                    }
                                                    alt={
                                                        item?.name ||
                                                        'Product'
                                                    }
                                                    fill
                                                    sizes="76px"
                                                    className="object-cover"
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

                                        {/* INFO */}
                                        <div className="min-w-0 flex-1">

                                            <Link
                                                href={`/product/${
                                                    item?.slug ||
                                                    ''
                                                }`}
                                                onClick={closeAll}
                                                className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 hover:text-[#1f5d3b]"
                                            >
                                                {item?.name ||
                                                    'Product'}
                                            </Link>

                                            <p
                                                className="mt-1 text-sm font-bold"
                                                style={{
                                                    color: BRAND,
                                                }}
                                            >
                                                ৳
                                                {safePrice.toLocaleString(
                                                    'en-BD'
                                                )}
                                            </p>

                                            {/* Quantity */}
                                            <div className="mt-2 flex items-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            item,
                                                            quantity - 1
                                                        )
                                                    }
                                                    disabled={
                                                        quantity <=
                                                        1
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 disabled:opacity-40"
                                                >
                                                    <Minus
                                                        size={13}
                                                    />
                                                </button>

                                                <span className="w-6 text-center text-xs font-semibold">
                                                    {quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            item,
                                                            quantity + 1
                                                        )
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200"
                                                >
                                                    <Plus
                                                        size={13}
                                                    />
                                                </button>

                                            </div>
                                        </div>

                                        {/* REMOVE */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                dispatch(
                                                    removeFromCart(
                                                        item?._id ||
                                                            item?.id
                                                    )
                                                )
                                            }
                                            className="self-start rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                            aria-label={`Remove ${
                                                item?.name ||
                                                'product'
                                            }`}
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>

                {/* CART FOOTER */}
                {cartItems.length > 0 && (
                    <div className="shrink-0 border-t bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <span className="text-sm text-gray-500">
                                Subtotal
                            </span>

                            <span className="text-lg font-bold text-gray-900">
                                ৳
                                {cartSubtotal.toLocaleString(
                                    'en-BD'
                                )}
                            </span>

                        </div>

                        <Link
                            href="/cart"
                            onClick={closeAll}
                            className="mb-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
                        >
                            View Cart
                        </Link>

                        <Link
                            href="/checkout"
                            onClick={closeAll}
                            className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{
                                backgroundColor: BRAND,
                            }}
                        >
                            Checkout
                        </Link>

                    </div>
                )}

            </aside>
        </>
    );
}
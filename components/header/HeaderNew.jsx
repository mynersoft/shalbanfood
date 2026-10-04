'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';

import {
    Menu,
    X,
    ShoppingCart,
    ChevronRight,
    Trash2,
    Search,
    User,
    Home,
    Grid2X2,
    BadgePercent,
    ArrowRight,
    ChevronLeft,
} from 'lucide-react';

import {
    selectCartTotalItems,
    removeFromCart,
} from '@/redux/store/slices/cartSlice';

export default function Header() {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const { items: cartItems } = useSelector(
        (state) => state.cart
    );

    const cartQty = useSelector(selectCartTotalItems);

    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    /*
    =========================================================
    PRODUCT DETAIL PAGE
    /product/[slug]

    Fixed mobile bottom navigation will NOT show here.
    =========================================================
    */

    const isProductPage =
        pathname?.startsWith('/product/') &&
        pathname.split('/').filter(Boolean).length >= 2;

    /*
    =========================================================
    CLOSE FUNCTIONS
    =========================================================
    */

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const closeCart = () => {
        setCartOpen(false);
    };

    const openCart = () => {
        setMenuOpen(false);
        setCartOpen(true);
    };

    /*
    =========================================================
    SEARCH
    =========================================================
    */

    const handleSearch = (e) => {
        e.preventDefault();

        const query = searchValue.trim();

        if (!query) {
            router.push('/shop');
            return;
        }

        router.push(
            `/shop?search=${encodeURIComponent(query)}`
        );
    };

    /*
    =========================================================
    MENU ITEMS
    =========================================================
    */

    const menuItems = [
        {
            label: 'Home',
            href: '/',
        },
        {
            label: 'Shop',
            href: '/shop',
        },
        {
            label: 'Honey',
            href: '/honey',
        },
        {
            label: 'Ghee',
            href: '/ghee',
        },
        {
            label: 'Combo Offers',
            href: '/combo',
        },
        {
            label: 'Blog',
            href: '/blog',
        },
        {
            label: 'About Us',
            href: '/about',
        },
        {
            label: 'Contact',
            href: '/contact',
        },
    ];

    return (
        <>
            {/* =================================================
                MAIN HEADER
            ================================================== */}

            <header
                className="
                    relative
                    z-40
                    border-b
                    border-gray-100
                    bg-white
                "
            >
                <div className="mx-auto max-w-7xl px-4">
                    {/* =========================================
                        TOP HEADER
                    ========================================== */}

                    <div
                        className="
                            flex
                            h-[68px]
                            items-center
                            justify-between
                            gap-3
                            md:h-[76px]
                        "
                    >
                        {/* MOBILE MENU BUTTON */}

                        <button
                            type="button"
                            onClick={() =>
                                setMenuOpen(true)
                            }
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                text-gray-700
                                transition
                                hover:bg-gray-100
                                md:hidden
                            "
                            aria-label="Open menu"
                        >
                            <Menu
                                size={24}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* =====================================
                            LOGO
                        ====================================== */}

                        <Link
                            href="/"
                            className="
                                flex
                                min-w-fit
                                items-center
                            "
                        >
                            <div>
                                <div
                                    className="
                                        text-[20px]
                                        font-bold
                                        leading-none
                                        tracking-tight
                                        text-[#1f5d3b]
                                        sm:text-[22px]
                                    "
                                >
                                    Shalban Food
                                </div>

                                <div
                                    className="
                                        mt-1
                                        text-[9px]
                                        tracking-[1px]
                                        text-gray-500
                                        sm:text-[10px]
                                    "
                                >
                                    স্বাদের সাথে আস্থার বন্ধন
                                </div>
                            </div>
                        </Link>

                        {/* =====================================
                            DESKTOP NAV
                        ====================================== */}

                        <nav
                            className="
                                hidden
                                items-center
                                gap-6
                                lg:flex
                            "
                        >
                            {menuItems.slice(0, 7).map(
                                (item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="
                                            whitespace-nowrap
                                            text-sm
                                            font-medium
                                            text-gray-700
                                            transition
                                            hover:text-[#1f5d3b]
                                        "
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </nav>

                        {/* =====================================
                            DESKTOP / MOBILE ACTIONS
                        ====================================== */}

                        <div
                            className="
                                flex
                                items-center
                                gap-1
                            "
                        >
                            {/* DESKTOP SEARCH */}

                            <Link
                                href="/shop"
                                className="
                                    hidden
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    transition
                                    hover:bg-gray-100
                                    md:flex
                                "
                                aria-label="Search"
                            >
                                <Search
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </Link>

                            {/* ACCOUNT */}

                            <Link
                                href="/user"
                                className="
                                    hidden
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    transition
                                    hover:bg-gray-100
                                    sm:flex
                                "
                                aria-label="Account"
                            >
                                <User
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </Link>

                            {/* CART */}

                            <button
                                type="button"
                                onClick={openCart}
                                className="
                                    relative
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    transition
                                    hover:bg-gray-100
                                "
                                aria-label="Open cart"
                            >
                                <ShoppingCart
                                    size={21}
                                    strokeWidth={1.8}
                                />

                                {cartQty > 0 && (
                                    <span
                                        className="
                                            absolute
                                            right-0
                                            top-0
                                            flex
                                            h-[18px]
                                            min-w-[18px]
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#1f5d3b]
                                            px-1
                                            text-[9px]
                                            font-bold
                                            text-white
                                        "
                                    >
                                        {cartQty > 99
                                            ? '99+'
                                            : cartQty}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* =========================================
                        MOBILE SEARCH BAR
                    ========================================== */}

                    <div
                        className="
                            pb-3
                            md:hidden
                        "
                    >
                        <form
                            onSubmit={handleSearch}
                            className="
                                relative
                            "
                        >
                            <Search
                                size={21}
                                strokeWidth={1.8}
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="search"
                                value={searchValue}
                                onChange={(e) =>
                                    setSearchValue(
                                        e.target.value
                                    )
                                }
                                placeholder="Search products..."
                                className="
                                    h-[48px]
                                    w-full
                                    rounded-full
                                    border
                                    border-[#1f5d3b]
                                    bg-white
                                    pl-12
                                    pr-12
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:ring-2
                                    focus:ring-[#1f5d3b]/20
                                "
                            />

                            <button
                                type="submit"
                                className="
                                    absolute
                                    right-1
                                    top-1/2
                                    flex
                                    h-10
                                    w-10
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gray-50
                                    text-gray-500
                                    transition
                                    hover:bg-[#1f5d3b]
                                    hover:text-white
                                "
                                aria-label="Search products"
                            >
                                <Search
                                    size={19}
                                    strokeWidth={2}
                                />
                            </button>
                        </form>
                    </div>

                    {/* =========================================
                        MOBILE QUICK NAV
                    ========================================== */}

                    <div
                        className="
                            flex
                            items-center
                            gap-6
                            overflow-x-auto
                            border-t
                            border-gray-50
                            py-3
                            scrollbar-hide
                            md:hidden
                        "
                    >
                        <Link
                            href="/shop"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            Shop
                        </Link>

                        <Link
                            href="/honey"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            মধু
                        </Link>

                        <Link
                            href="/ghee"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            ঘি
                        </Link>

                        <Link
                            href="/combo"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            Combo
                        </Link>

                        <Link
                            href="/blog"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            Blog
                        </Link>

                        <Link
                            href="/about"
                            className="
                                whitespace-nowrap
                                text-xs
                                font-medium
                                text-gray-700
                            "
                        >
                            About
                        </Link>
                    </div>
                </div>
            </header>

            {/* =================================================
                OVERLAY
            ================================================== */}

            {(menuOpen || cartOpen) && (
                <div
                    onClick={() => {
                        closeMenu();
                        closeCart();
                    }}
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/40
                        backdrop-blur-[1px]
                    "
                />
            )}

            {/* =================================================
                MOBILE SIDE MENU
            ================================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-[60]
                    h-full
                    w-[300px]
                    max-w-[86vw]
                    bg-white
                    shadow-2xl
                    transition-transform
                    duration-300
                    ${
                        menuOpen
                            ? 'translate-x-0'
                            : '-translate-x-full'
                    }
                `}
            >
                {/* MENU HEADER */}

                <div
                    className="
                        flex
                        h-[72px]
                        items-center
                        justify-between
                        border-b
                        px-5
                    "
                >
                    <div>
                        <p
                            className="
                                font-bold
                                text-[#1f5d3b]
                            "
                        >
                            Shalban Food
                        </p>

                        <p
                            className="
                                mt-0.5
                                text-[10px]
                                text-gray-400
                            "
                        >
                            Natural Food Store
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeMenu}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            hover:bg-gray-100
                        "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* MENU */}

                <nav className="p-4">
                    {menuItems.map(
                        ([label, href]) => null
                    )}

                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-100
                                py-4
                                text-sm
                                font-medium
                                text-gray-800
                                transition
                                hover:text-[#1f5d3b]
                            "
                        >
                            {item.label}

                            <ChevronRight
                                size={17}
                                className="text-gray-400"
                            />
                        </Link>
                    ))}

                    {/* ACCOUNT */}

                    <Link
                        href="/user"
                        onClick={closeMenu}
                        className="
                            mt-4
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            bg-gray-50
                            px-4
                            py-3
                            text-sm
                            font-medium
                        "
                    >
                        <User size={18} />
                        My Account
                    </Link>
                </nav>
            </aside>

            {/* =================================================
                CART DRAWER
            ================================================== */}

            <aside
                className={`
                    fixed
                    right-0
                    top-0
                    z-[60]
                    flex
                    h-full
                    w-[400px]
                    max-w-[94vw]
                    flex-col
                    bg-white
                    shadow-2xl
                    transition-transform
                    duration-300
                    ${
                        cartOpen
                            ? 'translate-x-0'
                            : 'translate-x-full'
                    }
                `}
            >
                {/* CART HEADER */}

                <div
                    className="
                        flex
                        h-[72px]
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        px-5
                    "
                >
                    <div>
                        <h2
                            className="
                                font-bold
                                text-gray-900
                            "
                        >
                            Your Cart
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-500
                            "
                        >
                            {cartQty} item
                            {cartQty !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            hover:bg-gray-100
                        "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CART ITEMS */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        p-5
                    "
                >
                    {cartItems.length === 0 ? (
                        <div
                            className="
                                flex
                                h-full
                                flex-col
                                items-center
                                justify-center
                                text-center
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gray-50
                                "
                            >
                                <ShoppingCart
                                    size={28}
                                    className="text-gray-300"
                                />
                            </div>

                            <h3
                                className="
                                    mt-5
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Your cart is empty
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Add some products to
                                your cart.
                            </p>

                            <Link
                                href="/shop"
                                onClick={closeCart}
                                className="
                                    mt-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[#1f5d3b]
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#174a2f]
                                "
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
                                        className="
                                            flex
                                            gap-3
                                            border-b
                                            border-gray-100
                                            pb-4
                                        "
                                    >
                                        {/* IMAGE */}

                                        <Link
                                            href={`/product/${item.slug}`}
                                            onClick={
                                                closeCart
                                            }
                                            className="
                                                h-[76px]
                                                w-[76px]
                                                shrink-0
                                                overflow-hidden
                                                rounded-xl
                                                bg-gray-100
                                            "
                                        >
                                            {item.featureImg ? (
                                                <Image
                                                    src={
                                                        item.featureImg
                                                    }
                                                    alt={
                                                        item.name ||
                                                        'Product'
                                                    }
                                                    width={76}
                                                    height={76}
                                                    className="
                                                        h-full
                                                        w-full
                                                        object-cover
                                                    "
                                                />
                                            ) : (
                                                <div
                                                    className="
                                                        flex
                                                        h-full
                                                        items-center
                                                        justify-center
                                                    "
                                                >
                                                    <ShoppingCart
                                                        size={20}
                                                        className="text-gray-300"
                                                    />
                                                </div>
                                            )}
                                        </Link>

                                        {/* INFO */}

                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >
                                            <Link
                                                href={`/product/${item.slug}`}
                                                onClick={
                                                    closeCart
                                                }
                                                className="
                                                    line-clamp-2
                                                    text-sm
                                                    font-medium
                                                    leading-5
                                                    text-gray-900
                                                    hover:text-[#1f5d3b]
                                                "
                                            >
                                                {item.name}
                                            </Link>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-bold
                                                    text-[#1f5d3b]
                                                "
                                            >
                                                ৳
                                                {safePrice.toLocaleString(
                                                    'en-BD'
                                                )}
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                Quantity:{' '}
                                                {
                                                    item.quantity
                                                }
                                            </p>
                                        </div>

                                        {/* REMOVE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                dispatch(
                                                    removeFromCart(
                                                        item._id
                                                    )
                                                )
                                            }
                                            className="
                                                self-start
                                                rounded-lg
                                                p-1.5
                                                text-gray-400
                                                transition
                                                hover:bg-red-50
                                                hover:text-red-500
                                            "
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <Trash2
                                                size={17}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* CART FOOTER */}

                {cartItems.length > 0 && (
                    <div
                        className="
                            shrink-0
                            border-t
                            bg-white
                            p-5
                        "
                    >
                        <div
                            className="
                                mb-4
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Items
                            </span>

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {cartQty}
                            </span>
                        </div>

                        <Link
                            href="/cart"
                            onClick={closeCart}
                            className="
                                mb-3
                                flex
                                w-full
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-gray-200
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                transition
                                hover:bg-gray-50
                            "
                        >
                            View Cart
                        </Link>

                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="
                                flex
                                w-full
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#1f5d3b]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#174a2f]
                            "
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </aside>

            {/* =================================================
                MOBILE FIXED BOTTOM NAVIGATION

                IMPORTANT:
                Product detail page এ এটি দেখাবে না.
            ================================================== */}

            {!isProductPage && (
                <>
                    {/* Bottom safe spacing */}

                    <div
                        className="
                            h-[76px]
                            md:hidden
                        "
                    />

                    <nav
                        className="
                            fixed
                            bottom-0
                            left-0
                            right-0
                            z-[45]
                            border-t
                            border-gray-200
                            bg-white/95
                            shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
                            backdrop-blur-md
                            md:hidden
                        "
                    >
                        <div
                            className="
                                mx-auto
                                grid
                                h-[72px]
                                max-w-md
                                grid-cols-5
                                items-center
                                px-2
                            "
                        >
                            {/* HOME */}

                            <Link
                                href="/"
                                className={`
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-1
                                    text-[11px]
                                    font-medium
                                    ${
                                        pathname === '/'
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }
                                `}
                            >
                                <Home
                                    size={24}
                                    strokeWidth={
                                        pathname === '/'
                                            ? 2.4
                                            : 1.8
                                    }
                                />

                                <span>Home</span>
                            </Link>

                            {/* CATEGORIES */}

                            <Link
                                href="/shop"
                                className={`
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-1
                                    text-[11px]
                                    font-medium
                                    ${
                                        pathname?.startsWith(
                                            '/shop'
                                        )
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }
                                `}
                            >
                                <Grid2X2
                                    size={24}
                                    strokeWidth={1.8}
                                />

                                <span>Categories</span>
                            </Link>

                            {/* OFFERS */}

                            <Link
                                href="/combo"
                                className={`
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-1
                                    text-[11px]
                                    font-medium
                                    ${
                                        pathname?.startsWith(
                                            '/combo'
                                        )
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }
                                `}
                            >
                                <BadgePercent
                                    size={25}
                                    strokeWidth={1.8}
                                />

                                <span>Offers</span>
                            </Link>

                            {/* CART */}

                            <button
                                type="button"
                                onClick={openCart}
                                className="
                                    relative
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-1
                                    text-[11px]
                                    font-medium
                                    text-gray-400
                                "
                            >
                                <div className="relative">
                                    <ShoppingCart
                                        size={25}
                                        strokeWidth={1.8}
                                    />

                                    {cartQty > 0 && (
                                        <span
                                            className="
                                                absolute
                                                -right-3
                                                -top-2
                                                flex
                                                h-[20px]
                                                min-w-[20px]
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-red-500
                                                px-1
                                                text-[10px]
                                                font-bold
                                                text-white
                                            "
                                        >
                                            {cartQty >
                                            99
                                                ? '99+'
                                                : cartQty}
                                        </span>
                                    )}
                                </div>

                                <span>Cart</span>
                            </button>

                            {/* SIGN IN */}

                            <Link
                                href="/user"
                                className={`
                                    flex
                                    h-full
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-1
                                    text-[11px]
                                    font-medium
                                    ${
                                        pathname?.startsWith(
                                            '/user'
                                        )
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }
                                `}
                            >
                                <User
                                    size={25}
                                    strokeWidth={1.8}
                                />

                                <span>Sign In</span>
                            </Link>
                        </div>
                    </nav>
                </>
            )}
        </>
    );
}
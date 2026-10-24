
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    Menu,
    X,
    ShoppingCart,
    Search,
    User,
    Home,
    Grid2X2,
    BadgePercent,
} from 'lucide-react';

import { selectCartTotalItems } from '@/redux/store/slices/cartSlice';
import CartDrawer from './CartDrawer';

const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Honey', href: '/honey' },
    { label: 'Ghee', href: '/ghee' },
    { label: 'Combo Offers', href: '/combo-offer' },
    { label: 'Blog', href: '/blog' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const cartQty = useSelector(selectCartTotalItems);

    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const isProductPage =
        pathname?.startsWith('/product/') &&
        pathname.split('/').filter(Boolean).length >= 2;

    const closeMenu = () => setMenuOpen(false);

    const openCart = () => {
        setMenuOpen(false);
        setCartOpen(true);
    };

    const closeCart = () => setCartOpen(false);

    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchValue.trim();

        router.push(
            query
                ? `/shop?search=${encodeURIComponent(query)}`
                : '/shop'
        );

        closeMenu();
    };

    return (
        <>
            <header className="relative z-40 border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Main header */}
                    <div className="flex h-[68px] items-center
                        justify-between gap-3 md:h-[76px]">

                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                            className="flex h-10 w-10 shrink-0
                                items-center justify-center rounded-full
                                hover:bg-gray-100 md:hidden"
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="min-w-fit">
                            <div className="text-xl font-bold leading-none
                                tracking-tight text-[#1f5d3b] sm:text-2xl">
                                Shalban Food
                            </div>
                            <div className="mt-1 text-[9px] tracking-wide
                                text-gray-500 sm:text-[10px]">
                                স্বাদের সাথে আস্থার বন্ধন
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-5 lg:flex">
                            {menuItems.slice(0, 7).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="whitespace-nowrap text-sm
                                        font-medium text-gray-700
                                        hover:text-[#1f5d3b]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1">
                            <Link
                                href="/shop"
                                aria-label="Search products"
                                className="hidden h-10 w-10 items-center
                                    justify-center rounded-full hover:bg-gray-100 md:flex"
                            >
                                <Search size={20} />
                            </Link>

                            <Link
                                href="/user"
                                aria-label="My account"
                                className="hidden h-10 w-10 items-center
                                    justify-center rounded-full hover:bg-gray-100 sm:flex"
                            >
                                <User size={20} />
                            </Link>

                            <button
                                type="button"
                                onClick={openCart}
                                aria-label="Open cart"
                                className="relative flex h-10 w-10
                                    items-center justify-center rounded-full
                                    hover:bg-gray-100"
                            >
                                <ShoppingCart size={21} />

                                {cartQty > 0 && (
                                    <span className="absolute right-0 top-0
                                        flex h-[18px] min-w-[18px]
                                        items-center justify-center rounded-full
                                        bg-[#1f5d3b] px-1 text-[9px]
                                        font-bold text-white">
                                        {cartQty > 99 ? '99+' : cartQty}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <form
                        onSubmit={handleSearch}
                        className="relative pb-3 md:hidden"
                    >
                        <Search size={20} className="pointer-events-none
                            absolute left-4 top-[23px] -translate-y-1/2
                            text-gray-400" />

                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(event.target.value)
                            }
                            placeholder="Search products..."
                            className="h-[46px] w-full rounded-full border
                                border-[#1f5d3b] pl-11 pr-12 text-sm
                                outline-none focus:ring-2
                                focus:ring-[#1f5d3b]/20"
                        />

                        <button
                            type="submit"
                            aria-label="Search"
                            className="absolute right-1 top-[3px]
                                flex h-10 w-10 items-center justify-center
                                rounded-full hover:bg-gray-100"
                        >
                            <Search size={19} />
                        </button>
                    </form>

                    {/* Mobile quick links */}
                    <div className="flex gap-6 overflow-x-auto border-t
                        border-gray-50 py-3 md:hidden">
                        {[
                            ['Shop', '/shop'],
                            ['মধু', '/honey'],
                            ['ঘি', '/ghee'],
                            ['Combo', '/combo'],
                            ['Blog', '/blog'],
                            ['About', '/about'],
                        ].map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className="whitespace-nowrap text-xs
                                    font-medium text-gray-700"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay */}
            {menuOpen && (
                <button
                    type="button"
                    aria-label="Close menu overlay"
                    onClick={closeMenu}
                    className="fixed inset-0 z-[50] bg-black/40"
                />
            )}

            {/* Mobile menu */}
            <aside className={`fixed left-0 top-0 z-[60] h-dvh
                w-[300px] max-w-[86vw] overflow-y-auto bg-white
                shadow-2xl transition-transform duration-300
                ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-[72px] items-center
                    justify-between border-b px-5">
                    <div>
                        <p className="font-bold text-[#1f5d3b]">
                            Shalban Food
                        </p>
                        <p className="mt-1 text-[10px] text-gray-400">
                            Natural Food Store
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeMenu}
                        aria-label="Close menu"
                        className="flex h-9 w-9 items-center
                            justify-center rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="flex items-center justify-between
                                border-b border-gray-100 py-4 text-sm
                                font-medium text-gray-800
                                hover:text-[#1f5d3b]"
                        >
                            {item.label}
                            <span className="text-gray-400">›</span>
                        </Link>
                    ))}

                    <Link
                        href="/user"
                        onClick={closeMenu}
                        className="mt-4 flex items-center gap-3
                            rounded-xl bg-gray-50 px-4 py-3 text-sm"
                    >
                        <User size={18} />
                        My Account
                    </Link>
                </nav>
            </aside>

            {/* Separate cart drawer */}
            <CartDrawer open={cartOpen} onClose={closeCart} />

            {/* Mobile bottom navigation */}
            {!isProductPage && (
                <>
                    <div className="h-[76px] md:hidden" />

                    <nav className="fixed bottom-0 left-0 right-0 z-[45]
                        border-t border-gray-200 bg-white/95
                        shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
                        backdrop-blur-md md:hidden">
                        <div className="mx-auto grid h-[72px] max-w-md
                            grid-cols-5 items-center px-2">

                            <Link
                                href="/"
                                className={`flex h-full flex-col
                                    items-center justify-center gap-1
                                    text-[11px] ${
                                        pathname === '/'
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }`}
                            >
                                <Home size={23} />
                                <span>Home</span>
                            </Link>

                            <Link
                                href="/shop"
                                className={`flex h-full flex-col
                                    items-center justify-center gap-1
                                    text-[11px] ${
                                        pathname?.startsWith('/shop')
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }`}
                            >
                                <Grid2X2 size={23} />
                                <span>Categories</span>
                            </Link>

                            <Link
                                href="/combo"
                                className={`flex h-full flex-col
                                    items-center justify-center gap-1
                                    text-[11px] ${
                                        pathname?.startsWith('/combo')
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }`}
                            >
                                <BadgePercent size={24} />
                                <span>Offers</span>
                            </Link>

                            <button
                                type="button"
                                onClick={openCart}
                                className="relative flex h-full flex-col
                                    items-center justify-center gap-1
                                    text-[11px] text-gray-400"
                            >
                                <span className="relative">
                                    <ShoppingCart size={24} />
                                    {cartQty > 0 && (
                                        <span className="absolute -right-3
                                            -top-2 flex h-5 min-w-5
                                            items-center justify-center
                                            rounded-full bg-red-500 px-1
                                            text-[10px] font-bold text-white">
                                            {cartQty > 99 ? '99+' : cartQty}
                                        </span>
                                    )}
                                </span>
                                <span>Cart</span>
                            </button>

                            <Link
                                href="/user"
                                className={`flex h-full flex-col
                                    items-center justify-center gap-1
                                    text-[11px] ${
                                        pathname?.startsWith('/user')
                                            ? 'text-[#1f9d68]'
                                            : 'text-gray-400'
                                    }`}
                            >
                                <User size={24} />
                                <span>Sign In</span>
                            </Link>
                        </div>
                    </nav>
                </>
            )}
        </>
    );
}

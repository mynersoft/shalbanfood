"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    initCartFromStorage,
    selectCartTotalItems
} from "@/store/slices/cartSlice";

import {
    HiHome,
    HiShoppingBag,
    HiHeart,
    HiChatBubbleLeftRight,
    HiUser
} from "react-icons/hi2";
import { FaShoppingCart } from "react-icons/fa";
import {
    FiHome,
    FiShoppingBag,
    FiHeart,
    FiMessageCircle,
    FiUser
} from "react-icons/fi";

const BottomNavigation = ({ activeTab, setActiveTab }) => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const dispatch = useDispatch();

    const cartQty = useSelector(selectCartTotalItems);
    const isCartHydrated = useSelector(state => state.cart._hydrated);
    const wishlistQty = useSelector(state => state.wishlist.qty);

    const [isClient, setIsClient] = useState(false);

    /* ---------- Init ---------- */
    useEffect(() => {
        setIsClient(true);
        dispatch(initCartFromStorage());
    }, [dispatch]);

    /* ---------- Active Check ---------- */
    const isActive = useCallback(
        item =>
            pathname === item.href ||
            activeTab === item.name ||
            (item.href !== "/" && pathname.startsWith(item.href)),
        [pathname, activeTab]
    );

    /* ---------- Badge Formatter ---------- */
    const renderBadge = useCallback(
        (count, color = "pink") => {
            if (!isClient || !count || count <= 0) return null;

            const bg = color === "red" ? "bg-red-500" : "bg-pink-500";

            return (
                <span
                    className={`absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center px-1 text-xs font-bold rounded-full text-white ${bg}`}
                >
                    {count > 9 ? "9+" : count}
                </span>
            );
        },
        [isClient]
    );

    /* ---------- Nav Items ---------- */
    const navItems = useMemo(
        () => [
            {
                name: "Home",
                href: "/",
                icon: FiHome,
                activeIcon: HiHome
            },
            {
                name: "Shop",
                href: "/shop",
                icon: FiShoppingBag,
                activeIcon: HiShoppingBag
            },
            {
                name: "Wishlist",
                href: "/wishlist",
                icon: FiHeart,
                activeIcon: HiHeart,
                badge: wishlistQty
            },
            {
                name: "Cart",
                href: "/cart",
                icon: FaShoppingCart,
                activeIcon: FaShoppingCart,
                badge: isCartHydrated ? cartQty : 0,
                badgeColor: "red"
            },
            {
                name: "Chat",
                href: "/messages",
                icon: FiMessageCircle,
                activeIcon: HiChatBubbleLeftRight,
                badge: 5
            },
            {
                name: session ? "Account" : "Login",
                href: session ? "/dashboard/user" : "/auth/login",
                icon: FiUser,
                activeIcon: HiUser
            }
        ],
        [wishlistQty, cartQty, isCartHydrated, session]
    );

    /* ---------- Shared Nav Renderer ---------- */
    const renderNav = (containerClass, itemClass, iconSize = "w-6 h-6") => (
        <nav className={containerClass}>
            <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl">
                <div className="flex">
                    {navItems.map(item => {
                        const active = isActive(item);
                        const Icon = active ? item.activeIcon : item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveTab(item.name)}
                                className={`${itemClass} ${
                                    active
                                        ? "text-pink-600 dark:text-pink-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-pink-500"
                                }`}
                            >
                                <div className="relative">
                                    <Icon
                                        className={`${iconSize} ${
                                            active ? "scale-110" : ""
                                        }`}
                                    />
                                    {item.badge &&
                                        renderBadge(
                                            item.badge,
                                            item.badgeColor
                                        )}
                                </div>
                                <span className="text-[10px] font-semibold mt-1">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );

    return (
        <>
            {/* Mobile Bottom */}
            {renderNav(
                "fixed bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto  ",
                "flex-1 flex flex-col items-center p-2 rounded-xl transition"
            )}

            {/* Desktop Side */}
            {renderNav(
                "hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40",
                "flex flex-col items-center p-3 rounded-xl transition",
                "w-6 h-6"
            )}

            {/* Tablet Bottom */}
            {renderNav(
                "hidden md:flex lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-2 py-2",
                "flex items-center p-3 rounded-xl transition mx-1",
                "w-5 h-5"
            )}
        </>
    );
};

export default BottomNavigation;

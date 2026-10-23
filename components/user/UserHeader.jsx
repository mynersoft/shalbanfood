'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';

import { toggleSidebar } from '@/redux/store/slices/uiSlice';

const PAGE_TITLES = {
	'/dashboard': 'Dashboard',
	'/dashboard/orders': 'My Orders',
	'/dashboard/profile': 'My Profile',
	'/dashboard/settings': 'Settings',
};

export default function UserHeader() {
	const dispatch = useDispatch();
	const pathname = usePathname();
	const { sidebarOpen } = useSelector((state) => state.ui);

	const pageTitle = useMemo(() => {
		if (PAGE_TITLES[pathname]) {
			return PAGE_TITLES[pathname];
		}

		const matchedRoute = Object.keys(PAGE_TITLES)
			.filter((route) => route !== '/dashboard')
			.sort((a, b) => b.length - a.length)
			.find((route) => pathname.startsWith(`${route}/`));

		if (matchedRoute) return PAGE_TITLES[matchedRoute];

		return 'My Account';
	}, [pathname]);

	return (
		<header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
			<div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				{/* Left */}
				<div className="flex min-w-0 items-center gap-3">
					<div className="min-w-0">
						<h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
							{pageTitle}
						</h1>

						<p className="hidden text-xs text-slate-500 sm:block">
							Welcome to your Shalban Food account
						</p>
					</div>
				</div>

				{/* Right */}
				<div className="flex shrink-0 items-center gap-2 sm:gap-4">
					<Link
						href="/shop"
						aria-label="Search and shop products"
						className="
                            hidden h-10 items-center gap-2 rounded-xl
                            border border-slate-200 px-3 text-sm
                            text-slate-500 transition hover:bg-slate-50
                            sm:flex
                        ">
						<Search size={17} />
						<span>Explore shop</span>
					</Link>

					<button
						type="button"
						aria-label="Notifications"
						className="
                            relative flex h-10 w-10 items-center
                            justify-center rounded-xl text-slate-500
                            transition hover:bg-slate-100
                        ">
						<Bell size={20} />
						<span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
					</button>

					<div className="h-8 w-px bg-slate-200" />

					<Link
						href="/user/profile"
						className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-50">
						<div
							className="
                            flex h-9 w-9 items-center justify-center
                            rounded-full bg-emerald-100 text-sm
                            font-bold text-emerald-800
                        ">
							SF
						</div>

						<span className="hidden text-left sm:block">
							<span className="block text-sm font-semibold text-slate-800">
								My Account
							</span>
							<span className="block text-xs text-slate-500">
								Profile & settings
							</span>
						</span>

						<ChevronDown
							size={15}
							className="hidden text-slate-400 sm:block"
						/>
					</Link>
				</div>
			</div>
		</header>
	);
}

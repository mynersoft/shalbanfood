'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	LayoutDashboard,
	Package,
	Tags,
	ShoppingCart,
	Users,
	BarChart3,
	Settings,
	Menu,
	X,
	Store,
	Truck,
	Boxes,
	BookOpen,
	Wallet,
	BadgePercent,
} from 'lucide-react';
import { useState } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';

const menuItems = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		name: 'Products',
		href: '/dashboard/products',
		icon: Package,
	},
	{
		name: 'Combo Offer',
		href: '/dashboard/combo',
		icon: BadgePercent,
	},
	{
		name: 'Brands',
		href: '/dashboard/brands',
		icon: Store,
	},
	{
		name: 'Categories',
		href: '/dashboard/categories',
		icon: Tags,
	},
	{
		name: 'Orders',
		href: '/dashboard/orders',
		icon: ShoppingCart,
	},
	{
		name: 'Due',
		href: '/dashboard/due',
		icon: Wallet,
	},
	{
		name: 'Blog',
		href: '/dashboard/blog',
		icon: BookOpen,
	},
	{
		name: 'Shipping Cost',
		href: '/dashboard/shipping-cost',
		icon: Truck,
	},
	{
		name: 'Inventory',
		href: '/dashboard/inventory',
		icon: Boxes,
	},
	{
		name: 'Customers',
		href: '/dashboard/customers',
		icon: Users,
	},
	{
		name: 'Analytics',
		href: '/dashboard/analytics',
		icon: BarChart3,
	},
	{
		name: 'Settings',
		href: '/dashboard/settings',
		icon: Settings,
	},
];

export default function Sidebar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Mobile Header */}
			<div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#13151c] px-4 md:hidden">
				<Link href="/dashboard" className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
						<Store size={20} />
					</div>

					<span className="font-bold text-white">Admin Panel</span>
				</Link>

				<button
					type="button"
					onClick={() => setOpen(!open)}
					aria-label={open ? 'Close menu' : 'Open menu'}
					className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white">
					{open ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Mobile Overlay */}
			{open && (
				<div
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-40 bg-black/60 md:hidden"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-[#13151c] transition-transform duration-300 ${
					open ? 'translate-x-0' : '-translate-x-full'
				} md:translate-x-0`}>
				{/* Logo */}
				<div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
						<Store size={22} />
					</div>

					<div>
						<h1 className="font-bold text-white">Admin Panel</h1>

						<p className="text-xs text-gray-500">
							Management System
						</p>
					</div>
				</div>

				{/* Scrollable Navigation */}
				<nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4 [scrollbar-width:thin] [scrollbar-color:#374151_transparent]">
					<p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
						Main Menu
					</p>

					{menuItems.map((item) => {
						const Icon = item.icon;

						const isActive =
							item.href === '/dashboard'
								? pathname === '/dashboard'
								: pathname.startsWith(item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setOpen(false)}
								className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
									isActive
										? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
										: 'text-gray-400 hover:bg-white/5 hover:text-white'
								}`}>
								<Icon size={19} className="shrink-0" />

								<span>{item.name}</span>
							</Link>
						);
					})}
				</nav>

				{/* Fixed Bottom Logout */}
				<div className="shrink-0 border-t border-white/10 p-3">
					<LogoutButton />
				</div>
			</aside>

			{/* Mobile Header Spacing */}
			<div className="h-16 md:hidden" />
		</>
	);
}


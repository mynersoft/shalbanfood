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
	LogOut,
	Store,
} from 'lucide-react';
import { useState } from 'react';

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
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
						<Store size={20} />
					</div>

					<span className="font-bold">Admin Panel</span>
				</Link>

				<button
					onClick={() => setOpen(!open)}
					className="rounded-lg p-2 hover:bg-white/10">
					{open ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Overlay */}
			{open && (
				<div
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-40 bg-black/60 md:hidden"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-[#13151c] transition-transform duration-300 ${
					open ? 'translate-x-0' : '-translate-x-full'
				} md:translate-x-0`}>
				{/* Logo */}
				<div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
						<Store size={22} />
					</div>

					<div>
						<h1 className="font-bold">Admin Panel</h1>
						<p className="text-xs text-gray-500">
							Management System
						</p>
					</div>
				</div>

				{/* Navigation */}
				<nav className="space-y-1 p-4">
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
								<Icon size={19} />
								<span>{item.name}</span>
							</Link>
						);
					})}
				</nav>

				{/* Bottom */}
				<div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
					<Link
						href="/"
						className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white">
						<Store size={19} />
						View Store
					</Link>

					<button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10">
						<LogOut size={19} />
						Logout
					</button>
				</div>
			</aside>

			{/* Mobile spacing */}
			<div className="h-16 md:hidden" />
		</>
	);
}

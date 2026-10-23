'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
	ChevronLeft,
	LayoutDashboard,
	Menu,
	ShoppingCart,
	X,
} from 'lucide-react';

import { setSidebar, toggleSidebar } from '@/redux/store/slices/uiSlice';

import { userSidebarMenu } from '@/constants/menu';
import LogoutButton from '@/components/auth/LogoutButton';

export default function UserSidebar() {
	const dispatch = useDispatch();
	const pathname = usePathname();
	const { sidebarOpen } = useSelector((state) => state.ui);

	const closeMobileSidebar = () => {
		if (window.innerWidth < 768) {
			dispatch(setSidebar(false));
		}
	};

	const isActive = (link) => {
		if (!link) return false;

		if (pathname === link) return true;

		return link !== '/dashboard' && pathname.startsWith(`${link}/`);
	};

	return (
		<aside
			className={`
                flex h-dvh flex-col overflow-hidden
                border-r border-slate-200 bg-white text-slate-700
                transition-[width] duration-300
                ${sidebarOpen ? 'w-64' : 'w-20'}
            `}>
			{/* Brand */}
			<div
				className={`
                    flex h-[72px] shrink-0 items-center
                    border-b border-slate-100
                    ${
						sidebarOpen
							? 'justify-between px-5'
							: 'justify-center px-2'
					}
                `}>
				<Link
					href="/"
					onClick={closeMobileSidebar}
					aria-label="Shalban Food home"
					className="flex min-w-0 items-center gap-2">
					<span
						className="
                        flex h-10 w-10 shrink-0 items-center
                        justify-center rounded-xl bg-emerald-800
                        text-white
                    ">
						<ShoppingCart size={21} />
					</span>

					{sidebarOpen && (
						<span className="whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">
							Shalban
							<span className="text-emerald-700"> Food</span>
						</span>
					)}
				</Link>

				{sidebarOpen && (
					<button
						type="button"
						onClick={() => dispatch(setSidebar(false))}
						aria-label="Close sidebar"
						className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden">
						<X size={19} />
					</button>
				)}
			</div>

			{/* Collapse control on desktop */}
			<div
				className={`hidden md:flex ${
					sidebarOpen
						? 'justify-end px-3 pt-3'
						: 'justify-center pt-3'
				}`}>
				<button
					type="button"
					onClick={() => dispatch(toggleSidebar())}
					aria-label={
						sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'
					}
					title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
					className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700">
					{sidebarOpen ? (
						<ChevronLeft size={19} />
					) : (
						<Menu size={19} />
					)}
				</button>
			</div>

			{/* Navigation */}
			<nav
				aria-label="User navigation"
				className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
				

				{userSidebarMenu.map((menu) => {
					const active = isActive(menu.link);

					return (
						<Link
							key={menu.link}
							href={menu.link}
							onClick={closeMobileSidebar}
							title={!sidebarOpen ? menu.label : undefined}
							aria-current={active ? 'page' : undefined}
							className={`
                                group relative flex min-h-11
                                items-center gap-3 rounded-xl
                                px-3 py-3 text-sm font-medium
                                transition-colors duration-200
                                ${sidebarOpen ? '' : 'justify-center px-0'}
                                ${
									active
										? 'bg-emerald-50 text-emerald-800'
										: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
								}
                            `}>
							{active && (
								<span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-emerald-700" />
							)}

							<span
								className={`
                                    flex h-6 w-6 shrink-0 items-center
                                    justify-center
                                    ${
										active
											? 'text-emerald-700'
											: 'text-slate-400 group-hover:text-slate-700'
									}
                                `}>
								{menu.icon || <LayoutDashboard size={19} />}
							</span>

							{sidebarOpen && (
								<span className="truncate">{menu.label}</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Account / logout */}
			<div className="shrink-0 border-t border-slate-100 p-3">
				<div className={sidebarOpen ? '' : 'flex justify-center'}>
					<LogoutButton />
				</div>
			</div>
		</aside>
	);
}

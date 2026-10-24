'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
	Bell,
	ChevronDown,
	ArrowUpRight,
	CheckCheck,
	Package,
	Tag,
	Megaphone,
	ShieldCheck,
	X,
	ShoppingBag,
} from 'lucide-react';

import { toggleSidebar } from '@/redux/store/slices/uiSlice';

const PAGE_TITLES = {
	'/dashboard': 'Dashboard',
	'/dashboard/orders': 'My Orders',
	'/dashboard/profile': 'My Profile',
	'/dashboard/settings': 'Settings',
	'/user/notifications': 'Notifications',
};

const ICONS = {
	order: Package,
	offer: Tag,
	announcement: Megaphone,
	account: ShieldCheck,
	payment: ShoppingBag,
};

function formatTime(date) {
	if (!date) return '';

	const value = new Date(date);

	if (Number.isNaN(value.getTime())) return '';

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	}).format(value);
}

export default function UserHeader() {
	const dispatch = useDispatch();
	const pathname = usePathname();
	const router = useRouter();

	const { sidebarOpen } = useSelector((state) => state.ui);

	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const popupRef = useRef(null);

	const pageTitle = useMemo(() => {
		if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

		const matchedRoute = Object.keys(PAGE_TITLES)
			.filter((route) => route !== '/dashboard')
			.sort((a, b) => b.length - a.length)
			.find((route) => pathname.startsWith(`${route}/`));

		return matchedRoute ? PAGE_TITLES[matchedRoute] : 'My Account';
	}, [pathname]);

	const unreadCount = notifications.filter((item) => !item.isRead).length;

	useEffect(() => {
		function handleOutsideClick(event) {
			if (popupRef.current && !popupRef.current.contains(event.target)) {
				setOpen(false);
			}
		}

		function handleEscape(event) {
			if (event.key === 'Escape') setOpen(false);
		}

		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, []);

	async function loadNotifications() {
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/notifications', {
				credentials: 'same-origin',
				cache: 'no-store',
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Notifications load failed');
			}

			const list = Array.isArray(result.notifications)
				? result.notifications
				: Array.isArray(result.data)
					? result.data
					: [];

			setNotifications(list);
		} catch (err) {
			console.error('Load notifications:', err);
			setError('নোটিফিকেশন লোড করা যায়নি। আবার চেষ্টা করুন।');
		} finally {
			setLoading(false);
		}
	}

	function togglePopup() {
		const nextOpen = !open;
		setOpen(nextOpen);

		if (nextOpen) {
			loadNotifications();
		}
	}

	async function markAllRead() {
		const unread = notifications.filter((item) => !item.isRead);
		if (!unread.length) return;

		// UI update immediately
		setNotifications((current) =>
			current.map((item) => ({ ...item, isRead: true }))
		);

		try {
			const response = await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ markAllRead: true }),
			});

			if (!response.ok) {
				await loadNotifications();
			}
		} catch {
			await loadNotifications();
		}
	}

	async function openNotification(item) {
		if (!item.isRead) {
			setNotifications((current) =>
				current.map((notification) =>
					notification._id === item._id
						? { ...notification, isRead: true }
						: notification
				)
			);

			try {
				await fetch('/api/notifications', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify({ id: item._id, isRead: true }),
				});
			} catch (err) {
				console.error('Mark notification read:', err);
			}
		}

		setOpen(false);

		if (item.link) {
			router.push(item.link);
		} else {
			router.push('/user/notifications');
		}
	}

	return (
		<header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
			<div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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

				<div className="flex shrink-0 items-center gap-2 sm:gap-4">
					<Link
						href="/shop"
						aria-label="Explore shop"
						className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 sm:flex">
						<span>Explore shop</span>
						<ArrowUpRight size={15} />
					</Link>

					{/* Notification popup */}
					<div className="relative" ref={popupRef}>
						<button
							type="button"
							onClick={togglePopup}
							aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
							aria-expanded={open}
							aria-haspopup="dialog"
							className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
								open
									? 'border-emerald-200 bg-emerald-50 text-emerald-800'
									: 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
							}`}>
							<Bell size={20} />

							{unreadCount > 0 && (
								<span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
						</button>

						{open && (
							<div
								role="dialog"
								aria-label="Notifications"
								className="fixed inset-x-3 top-[80px] z-50 mx-auto flex max-h-[min(560px,calc(100dvh-100px))] w-auto flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:mx-0 sm:w-[390px]">
								{/* Header */}
								<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
									<div>
										<h2 className="text-base font-bold text-slate-900">
											Notifications
										</h2>
										<p className="mt-0.5 text-xs text-slate-500">
											{unreadCount > 0
												? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
												: 'You are all caught up'}
										</p>
									</div>

									<div className="flex items-center gap-1">
										{unreadCount > 0 && (
											<button
												type="button"
												onClick={markAllRead}
												title="Mark all as read"
												aria-label="Mark all as read"
												className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-50">
												<CheckCheck size={19} />
											</button>
										)}

										<button
											type="button"
											onClick={() => setOpen(false)}
											aria-label="Close notifications"
											className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
											<X size={18} />
										</button>
									</div>
								</div>

								{/* Notification list */}
								<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
									{loading ? (
										<div className="space-y-4 p-5">
											{[1, 2, 3].map((item) => (
												<div
													key={item}
													className="flex gap-3 animate-pulse">
													<div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
													<div className="flex-1 space-y-2 py-1">
														<div className="h-3 w-2/3 rounded bg-slate-100" />
														<div className="h-3 w-full rounded bg-slate-100" />
														<div className="h-2.5 w-1/3 rounded bg-slate-100" />
													</div>
												</div>
											))}
										</div>
									) : error ? (
										<div className="px-5 py-10 text-center">
											<p className="text-sm text-slate-600">
												{error}
											</p>
											<button
												type="button"
												onClick={loadNotifications}
												className="mt-3 text-sm font-semibold text-emerald-700 hover:underline">
												Try again
											</button>
										</div>
									) : notifications.length === 0 ? (
										<div className="px-6 py-10 text-center">
											<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
												<Bell size={24} />
											</div>
											<h3 className="mt-4 text-sm font-semibold text-slate-900">
												No notifications yet
											</h3>
											<p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
												Order updates and important
												announcements will appear here.
											</p>
										</div>
									) : (
										notifications.map((item) => {
											const Icon =
												ICONS[item.type] || Bell;

											return (
												<button
													type="button"
													key={item._id}
													// onClick={() =>
													// 	openNotification(item)
													// }
													className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
														!item.isRead
															? 'bg-emerald-50/40'
															: 'bg-white'
													}`}>
													<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
														<Icon size={19} />
														{!item.isRead && (
															<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600" />
														)}
													</div>

													<div className="min-w-0 flex-1">
														<div className="flex items-start justify-between gap-2">
															<h3
																className={`text-sm leading-5 ${
																	!item.isRead
																		? 'font-bold text-slate-900'
																		: 'font-medium text-slate-700'
																}`}>
																{item.title}
															</h3>
															{!item.isRead && (
																<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
															)}
														</div>

														<p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
															{item.message}
														</p>

														<p className="mt-2 text-[11px] text-slate-400">
															{formatTime(
																item.createdAt
															)}
														</p>
													</div>
												</button>
											);
										})
									)}
								</div>

								{/* Footer */}
								<div className="border-t border-slate-100 bg-white p-3">
									<Link
										href="/user/notifications"
										onClick={() => setOpen(false)}
										className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800">
										View all notifications
										<ArrowUpRight size={15} />
									</Link>
								</div>
							</div>
						)}
					</div>

					<div className="h-8 w-px bg-slate-200" />

					<Link
						href="/user/profile"
						className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-50">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
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

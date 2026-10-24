'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Package, Tag, Info } from 'lucide-react';

const iconMap = {
	order: Package,
	offer: Tag,
	announcement: Info,
	payment: CheckCheck,
	account: Bell,
};

export default function NotificationList() {
	const router = useRouter();

	const [items, setItems] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadNotifications = useCallback(async () => {
		try {
			setError('');

			const response = await fetch('/api/notifications', {
				cache: 'no-store',
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'লোড করা যায়নি।');
			}

			setItems(result.notifications || []);
			setUnreadCount(result.unreadCount || 0);
		} catch (err) {
			setError(err.message || 'নোটিফিকেশন লোড করা যায়নি।');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadNotifications();
	}, [loadNotifications]);

	async function markRead(id) {
		const response = await fetch('/api/notifications', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ notificationId: id }),
		});

		if (!response.ok) return;

		setItems((prev) =>
			prev.map((item) =>
				item._id === id ? { ...item, isRead: true } : item
			)
		);

		setUnreadCount((count) => Math.max(0, count - 1));
	}

	async function markAllRead() {
		const response = await fetch('/api/notifications', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ markAll: true }),
		});

		if (!response.ok) return;

		setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));

		setUnreadCount(0);
	}

	async function openNotification(item) {
		if (!item.isRead) await markRead(item._id);

		const link =
			typeof item.link === 'string' &&
			item.link.startsWith('/') &&
			!item.link.startsWith('//') &&
			!item.link.includes('\\')
				? item.link
				: '/user/orders';

		router.push(link);
	}

	if (loading) {
		return <p className="p-5 text-sm text-gray-500">লোড হচ্ছে...</p>;
	}

	return (
		<section className="mx-auto w-full max-w-3xl space-y-4">
			<header className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-bold text-gray-900">
						নোটিফিকেশন
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						{unreadCount}টি অপঠিত নোটিফিকেশন
					</p>
				</div>

				{unreadCount > 0 && (
					<button
						type="button"
						onClick={markAllRead}
						className="text-sm font-medium text-[#1f5d3b]">
						সব পড়া হয়েছে
					</button>
				)}
			</header>

			{error && (
				<p
					role="alert"
					className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
					{error}
				</p>
			)}

			{items.length === 0 ? (
				<div className="rounded-xl border border-gray-200 p-8 text-center">
					<Bell className="mx-auto mb-3 text-gray-400" size={28} />
					<p className="font-medium">এখনো কোনো নোটিফিকেশন নেই</p>
					<p className="mt-1 text-sm text-gray-500">
						অর্ডার ও গুরুত্বপূর্ণ আপডেট এখানে দেখতে পাবেন।
					</p>
				</div>
			) : (
				<div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
					{items.map((item) => {
						const Icon = iconMap[item.type] || Bell;

						return (
							<button
								key={item._id}
								type="button"
								// onClick={() => openNotification(item)}
								className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 ${
									!item.isRead ? 'bg-green-50/50' : 'bg-white'
								}`}>
								<span className="rounded-full bg-gray-100 p-3">
									<Icon
										size={20}
										className="text-[#1f5d3b]"
									/>
								</span>

								<span className="min-w-0 flex-1">
									<span className="block font-semibold text-gray-900">
										{item.title}
									</span>

									<span className="mt-1 block text-sm text-gray-600">
										{item.message}
									</span>

									<span className="mt-2 block text-xs text-gray-400">
										{new Date(
											item.createdAt
										).toLocaleString('bn-BD')}
									</span>
								</span>

								{!item.isRead && (
									<span
										aria-label="অপঠিত"
										className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1f5d3b]"
									/>
								)}
							</button>
						);
					})}
				</div>
			)}
		</section>
	);
}

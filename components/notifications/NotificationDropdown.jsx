'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import {
	Bell,
	Check,
	CheckCheck,
	Loader2,
	X,
	ExternalLink,
	BellRing,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function NotificationDropdown() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const popupRef = useRef(null);

	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [markingAll, setMarkingAll] = useState(false);

	const isAdmin = session?.user?.role === 'admin';
	const isUser = session?.user?.role === 'user';

	const userType = isAdmin ? 'admin' : 'user';
	const notiApi = `/api/notifications?${userType}`;


	console.log(isAdmin);
	

	const unreadCount = notifications.filter(
		(notification) => !notification.isRead
	).length;

	// Fetch notifications
	const fetchNotifications = useCallback(async () => {
		if (status !== 'authenticated' || (!isAdmin && !isUser)) return;

		try {
			setLoading(true);

			const response = await fetch(notiApi, {
				method: 'GET',
				cache: 'no-store',
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || 'Failed to load notifications'
				);
			}

			setNotifications(
				Array.isArray(result.notifications) ? result.notifications : []
			);
		} catch (error) {
			console.error('Notification fetch error:', error);
			toast.error(error.message || 'Notification load failed');
		} finally {
			setLoading(false);
		}
	}, [status, isAdmin, isUser, notiApi]);

	useEffect(() => {
		if (status === 'authenticated' && (isAdmin || isUser)) {
			fetchNotifications();
		}
	}, [status, isAdmin, isUser, fetchNotifications]);

	// Close popup when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (popupRef.current && !popupRef.current.contains(event.target)) {
				setOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Mark one notification as read
	const handleMarkAsRead = async (notificationId) => {
		try {
			const response = await fetch(notiApi, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					notificationId,
					action: 'read',
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || 'Could not update notification'
				);
			}

			setNotifications((previous) =>
				previous.map((notification) =>
					notification._id === notificationId
						? { ...notification, isRead: true }
						: notification
				)
			);
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Something went wrong');
		}
	};

	// Mark all notifications as read
	const handleMarkAllAsRead = async () => {
		if (!unreadCount) return;
		try {
			setMarkingAll(true);
			const response = await fetch(notiApi, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: 'read-all',
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || 'Could not update notifications'
				);
			}

			setNotifications((previous) =>
				previous.map((notification) => ({
					...notification,
					isRead: true,
				}))
			);

			toast.success('সব নোটিফিকেশন পড়া হয়েছে');
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Something went wrong');
		} finally {
			setMarkingAll(false);
		}
	};

	// Notification click
	const handleNotificationClick = async (notification) => {
		if (!notification.isRead) {
			await handleMarkAsRead(notification._id);
		}

		setOpen(false);

		if (notification.link) {
			router.push(notification.link);
		}
	};

	// Conditional returns must be after all hooks
	if (status === 'loading') return null;

	if (status !== 'authenticated' || (!isAdmin && !isUser)) {
		return null;
	}

	return (
		<div className="relative" ref={popupRef}>
			{/* Notification button */}
			<button
				type="button"
				onClick={() => setOpen((previous) => !previous)}
				className="relative group flex h-10 w-10 items-center justify-center rounded-full
          text-gray-700 transition hover:text-green-700 cursor-pointer
          "
				aria-label="Notifications">
				<Bell size={21} />

				{unreadCount > 0 && (
					<span
						className="absolute right-0.5 top-1 flex h-4 min-w-4
              items-center justify-center rounded-full bg-green-900 px-1
              text-[9px] font-bold text-white  hover:bg-green-700">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>


			{/* Notification popup */}
			{open && (
				<div
					className="absolute -right-10  top-12 z-[100] w-[300px] sm:w-[300px] max-w-[calc(100vw-24px)]
            overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl
            dark:border-gray-700 dark:bg-gray-900 ">
					{/* Header */}
					<div
						className="flex items-center justify-between border-b
            border-gray-200 px-4 py-3 dark:border-gray-700">
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Notifications
							</h3>

							<p className="text-xs text-gray-500">
								{unreadCount} unread notifications
							</p>
						</div>

						<div className="flex items-center gap-2">
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={handleMarkAllAsRead}
									disabled={markingAll}
									title="Mark all as read"
									className="rounded-lg p-2 text-green-700 hover:bg-green-50
                    disabled:opacity-50 dark:text-green-400
                    dark:hover:bg-gray-800">
									{markingAll ? (
										<Loader2
											size={17}
											className="animate-spin"
										/>
									) : (
										<CheckCheck size={17} />
									)}
								</button>
							)}

							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded-lg p-2 text-gray-500 hover:bg-gray-100
                  dark:hover:bg-gray-800">
								<X size={17} />
							</button>
						</div>
					</div>

					{/* Notification list */}
					<div className="max-h-[420px] overflow-y-auto">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2
									className="animate-spin text-green-700"
									size={25}
								/>
							</div>
						) : notifications.length === 0 ? (
							<div
								className="flex flex-col items-center justify-center
                px-4 py-12 text-center">
								<BellRing
									size={35}
									className="mb-3 text-gray-300"
								/>

								<p className="font-medium text-gray-700 dark:text-gray-200">
									No notifications
								</p>

								<p className="mt-1 text-sm text-gray-500">
									You are all caught up!
								</p>
							</div>
						) : (
							notifications.map((notification) => (
								<div
									key={notification._id}
									onClick={() =>
										handleNotificationClick(notification)
									}
									className={`group flex cursor-pointer gap-3 border-b
                    border-gray-100 px-4 py-3 transition
                    hover:bg-gray-50 dark:border-gray-800
                    dark:hover:bg-gray-800 ${
						!notification.isRead
							? 'bg-green-50/60 dark:bg-green-950/20'
							: ''
					}`}>
									{/* Icon */}
									<div
										className="flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-full bg-green-100
                    text-green-700 dark:bg-green-900/40 dark:text-green-400">
										<Bell size={18} />
									</div>

									{/* Content */}
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<p
												className="text-sm font-semibold text-gray-800
                        dark:text-gray-100">
												{notification.title}
											</p>

											{!notification.isRead && (
												<span
													className="mt-1 h-2 w-2 shrink-0
                          rounded-full bg-green-600"
												/>
											)}
										</div>

										<p
											className="mt-1 line-clamp-2 text-sm text-gray-600
                      dark:text-gray-400">
											{notification.message}
										</p>

										<div className="mt-2 flex items-center justify-between">
											<span className="text-xs text-gray-400">
												{notification.createdAt
													? formatDate(notification.createdAt)
													: ''}
											</span>

											{notification.link && (
												<ExternalLink
													size={13}
													className="text-gray-400"
												/>
											)}
										</div>
									</div>

									{/* Mark as read */}
									{!notification.isRead && (
										<button
											type="button"
											title="Mark as read"
											onClick={(event) => {
												event.stopPropagation();
												handleMarkAsRead(
													notification._id
												);
											}}
											className="self-center rounded-md p-1.5 text-gray-400
                        opacity-0 transition hover:bg-green-100
                        hover:text-green-700 group-hover:opacity-100
                        dark:hover:bg-green-900/40">
											<Check size={16} />
										</button>
									)}
								</div>
							))
						)}
					</div>

					{/* Footer */}
					<div
						className="border-t border-gray-200 px-4 py-3
            text-center dark:border-gray-700">
						<button
							type="button"
							onClick={() => {
								setOpen(false);
								router.push(
									userType
										? '/dashboard/notifications'
										: '/notifications'
								);
							}}
							className="text-sm font-semibold text-green-700
                hover:underline dark:text-green-400">
							View all notifications
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

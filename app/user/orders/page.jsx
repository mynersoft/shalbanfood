'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import {
	Package,
	ShoppingBag,
	Eye,
	RefreshCw,
	CalendarDays,
	CreditCard,
	ChevronDown,
	ChevronUp,
	Truck,
	Clock,
	CheckCircle2,
	XCircle,
	AlertCircle,
} from 'lucide-react';

const STATUS = {
	pending: {
		label: 'অপেক্ষমাণ',
		icon: Clock,
		color: 'bg-amber-50 text-amber-700 border-amber-200',
	},
	processing: {
		label: 'প্রসেসিং',
		icon: Package,
		color: 'bg-blue-50 text-blue-700 border-blue-200',
	},
	shipped: {
		label: 'শিপড',
		icon: Truck,
		color: 'bg-violet-50 text-violet-700 border-violet-200',
	},
	delivered: {
		label: 'ডেলিভারি সম্পন্ন',
		icon: CheckCircle2,
		color: 'bg-green-50 text-green-700 border-green-200',
	},
	cancelled: {
		label: 'বাতিল',
		icon: XCircle,
		color: 'bg-red-50 text-red-700 border-red-200',
	},
};

const PAYMENT_STATUS = {
	paid: 'পরিশোধিত',
	unpaid: 'অপরিশোধিত',
	refunded: 'ফেরত দেওয়া হয়েছে',
	failed: 'ব্যর্থ',
};

const formatMoney = (amount) =>
	`৳${Number(amount || 0).toLocaleString('en-BD')}`;

const formatDate = (date) => {
	if (!date) return 'তারিখ নেই';

	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) return 'তারিখ নেই';

	return parsed.toLocaleDateString('bn-BD', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

export default function UserOrdersPage() {
	// আপনার Redux auth slice-এ user-এর অবস্থান ভিন্ন হলে
	// নিচের selector-টি সেই অনুযায়ী পরিবর্তন করুন।
	const user = useSelector((state) => state.auth?.user);
	const userId = user?._id || user?.id;

	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [filter, setFilter] = useState('all');
	const [expandedOrder, setExpandedOrder] = useState(null);

	const fetchOrders = useCallback(async () => {
		if (!userId) {
			setLoading(false);
			setError(
				'আপনার অ্যাকাউন্টের তথ্য পাওয়া যাচ্ছে না। আবার লগইন করুন।'
			);
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await fetch(
				`/api/orders/user/${encodeURIComponent(userId)}`,
				{
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
					headers: {
						Accept: 'application/json',
					},
				}
			);

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					data?.message || data?.error || 'অর্ডার লোড করা যায়নি।'
				);
			}

			const list = Array.isArray(data)
				? data
				: Array.isArray(data?.orders)
					? data.orders
					: Array.isArray(data?.data)
						? data.data
						: [];

			setOrders(list);
		} catch (err) {
			setError(err.message || 'সার্ভারের সঙ্গে সংযোগ করা যায়নি।');
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const filteredOrders =
		filter === 'all'
			? orders
			: orders.filter((order) => order.status?.toLowerCase() === filter);

	const counts = {
		all: orders.length,
		pending: orders.filter((o) => o.status?.toLowerCase() === 'pending')
			.length,
		delivered: orders.filter((o) => o.status?.toLowerCase() === 'delivered')
			.length,
		cancelled: orders.filter((o) => o.status?.toLowerCase() === 'cancelled')
			.length,
	};

	return (
		<main className="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
					<div>
						<div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
							<Link
								href="/dashboard"
								className="hover:text-green-700">
								ড্যাশবোর্ড
							</Link>
							<span>/</span>
							<span className="text-green-700">আমার অর্ডার</span>
						</div>

						<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
							আমার অর্ডার
						</h1>
						<p className="mt-2 text-sm text-gray-500">
							আপনার সব অর্ডার ও ডেলিভারির অবস্থা এখানে দেখুন।
						</p>
					</div>

					<button
						type="button"
						onClick={fetchOrders}
						disabled={loading}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50">
						<RefreshCw
							size={16}
							className={loading ? 'animate-spin' : ''}
						/>
						রিফ্রেশ
					</button>
				</div>

				{/* Summary */}
				<div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
					{[
						{
							key: 'all',
							label: 'মোট অর্ডার',
							count: counts.all,
							icon: ShoppingBag,
							style: 'bg-green-100 text-green-700',
						},
						{
							key: 'pending',
							label: 'অপেক্ষমাণ',
							count: counts.pending,
							icon: Clock,
							style: 'bg-amber-100 text-amber-700',
						},
						{
							key: 'delivered',
							label: 'ডেলিভারি সম্পন্ন',
							count: counts.delivered,
							icon: CheckCircle2,
							style: 'bg-blue-100 text-blue-700',
						},
						{
							key: 'cancelled',
							label: 'বাতিল',
							count: counts.cancelled,
							icon: XCircle,
							style: 'bg-red-100 text-red-700',
						},
					].map((item) => {
						const Icon = item.icon;

						return (
							<button
								key={item.key}
								type="button"
								onClick={() => setFilter(item.key)}
								className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
									filter === item.key
										? 'border-green-500 ring-1 ring-green-500'
										: 'border-gray-100'
								}`}>
								<div className="flex items-center justify-between gap-2">
									<span className="text-sm text-gray-500">
										{item.label}
									</span>
									<span
										className={`rounded-xl p-2 ${item.style}`}>
										<Icon size={18} />
									</span>
								</div>
								<p className="mt-3 text-2xl font-bold text-gray-900">
									{item.count}
								</p>
							</button>
						);
					})}
				</div>

				{/* Error */}
				{error && (
					<div
						role="alert"
						className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
						<AlertCircle size={20} className="mt-0.5 shrink-0" />
						<div className="flex-1">{error}</div>
						<button
							type="button"
							onClick={fetchOrders}
							className="font-semibold underline">
							আবার চেষ্টা করুন
						</button>
					</div>
				)}

				{/* Loading */}
				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
								<div className="mb-4 h-5 w-40 rounded bg-gray-200" />
								<div className="h-4 w-64 max-w-full rounded bg-gray-100" />
								<div className="mt-5 h-10 rounded bg-gray-100" />
							</div>
						))}
					</div>
				) : !error && filteredOrders.length === 0 ? (
					/* Empty State */
					<div className="rounded-2xl border border-gray-100 bg-white px-5 py-14 text-center shadow-sm">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
							<ShoppingBag size={30} />
						</div>

						<h2 className="text-lg font-bold text-gray-900">
							{orders.length === 0
								? 'এখনও কোনো অর্ডার নেই'
								: 'এই ক্যাটাগরিতে অর্ডার নেই'}
						</h2>

						<p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
							{orders.length === 0
								? 'শালবন ফুড থেকে আপনার পছন্দের পণ্য অর্ডার করুন।'
								: 'অন্য ক্যাটাগরি নির্বাচন করে দেখুন।'}
						</p>

						{orders.length === 0 && (
							<Link
								href="/shop"
								className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800">
								<ShoppingBag size={17} />
								শপিং শুরু করুন
							</Link>
						)}
					</div>
				) : (
					/* Order List */
					<div className="space-y-4">
						{filteredOrders.map((order) => {
							const status = STATUS[
								order.status?.toLowerCase()
							] || {
								label: order.status || 'অজানা',
								icon: AlertCircle,
								color: 'bg-gray-100 text-gray-700 border-gray-200',
							};

							const StatusIcon = status.icon;
							const isExpanded = expandedOrder === order._id;
							const items = Array.isArray(order.orderItems)
								? order.orderItems
								: [];

							return (
								<article
									key={order._id}
									className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
									<div className="p-4 sm:p-6">
										<div className="flex flex-wrap items-start justify-between gap-4">
											<div className="min-w-0">
												<p className="text-xs font-medium text-gray-500">
													ইনভয়েস নম্বর
												</p>
												<h2 className="mt-1 break-all text-base font-bold text-gray-900">
													{order.invoiceNo ||
														order._id}
												</h2>

												<p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
													<CalendarDays size={15} />
													{formatDate(
														order.createdAt
													)}
												</p>
											</div>

											<span
												className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.color}`}>
												<StatusIcon size={14} />
												{status.label}
											</span>
										</div>

										<div className="my-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
											<div>
												<p className="text-xs text-gray-500">
													অর্ডারের মোট
												</p>
												<p className="mt-1 text-lg font-bold text-green-800">
													{formatMoney(order.total)}
												</p>
											</div>

											<div>
												<p className="text-xs text-gray-500">
													পেমেন্ট পদ্ধতি
												</p>
												<p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
													<CreditCard size={15} />
													{order.payment?.method ===
													'COD'
														? 'ক্যাশ অন ডেলিভারি'
														: order.payment
																?.method ||
															'উল্লেখ নেই'}
												</p>
											</div>

											<div className="col-span-2 sm:col-span-1">
												<p className="text-xs text-gray-500">
													পেমেন্ট স্ট্যাটাস
												</p>
												<p className="mt-1 text-sm font-semibold text-gray-800">
													{PAYMENT_STATUS[
														order.payment?.status?.toLowerCase()
													] ||
														order.payment?.status ||
														'উল্লেখ নেই'}
												</p>
											</div>
										</div>

										<div className="flex flex-wrap items-center justify-between gap-3">
											<p className="text-sm text-gray-500">
												{items.length}টি পণ্যের লাইন
											</p>

											<button
												type="button"
												onClick={() =>
													setExpandedOrder(
														isExpanded
															? null
															: order._id
													)
												}
												aria-expanded={isExpanded}
												className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800">
												<Eye size={16} />
												বিস্তারিত
												{isExpanded ? (
													<ChevronUp size={16} />
												) : (
													<ChevronDown size={16} />
												)}
											</button>
										</div>

										{isExpanded && (
											<div className="mt-5 border-t border-gray-100 pt-5">
												<h3 className="mb-3 font-bold text-gray-900">
													অর্ডারের পণ্য
												</h3>

												{items.length > 0 ? (
													<div className="space-y-3">
														{items.map(
															(item, index) => {
																const product =
																	item.productId &&
																	typeof item.productId ===
																		'object'
																		? item.productId
																		: {};

																const name =
																	item.name ||
																	item.productName ||
																	product.name ||
																	'পণ্যের নাম';

																const quantity =
																	Number(
																		item.quantity ??
																			1
																	);

																const price =
																	Number(
																		item.price ??
																			item.sellPrice ??
																			product.sellPrice ??
																			0
																	);

																return (
																	<div
																		key={
																			item._id ||
																			`${order._id}-${index}`
																		}
																		className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
																		<div className="min-w-0">
																			<p className="break-words text-sm font-semibold text-gray-800">
																				{
																					name
																				}
																			</p>
																			<p className="mt-1 text-xs text-gray-500">
																				পরিমাণ:{' '}
																				{
																					quantity
																				}
																			</p>
																		</div>
																		<p className="shrink-0 text-sm font-bold text-gray-900">
																			{formatMoney(
																				price *
																					quantity
																			)}
																		</p>
																	</div>
																);
															}
														)}
													</div>
												) : (
													<p className="text-sm text-gray-500">
														পণ্যের বিস্তারিত পাওয়া
														যায়নি।
													</p>
												)}

												<div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
													<div className="flex justify-between gap-3">
														<span className="text-gray-500">
															সাবটোটাল
														</span>
														<span>
															{formatMoney(
																order.subtotal
															)}
														</span>
													</div>
													<div className="flex justify-between gap-3">
														<span className="text-gray-500">
															ডেলিভারি চার্জ
														</span>
														<span>
															{formatMoney(
																order.shippingFee
															)}
														</span>
													</div>
													{Number(order.discount) >
														0 && (
														<div className="flex justify-between gap-3">
															<span className="text-gray-500">
																ডিসকাউন্ট
															</span>
															<span className="text-green-700">
																−
																{formatMoney(
																	order.discount
																)}
															</span>
														</div>
													)}
													<div className="flex justify-between gap-3 border-t border-gray-100 pt-3 font-bold">
														<span>সর্বমোট</span>
														<span className="text-green-800">
															{formatMoney(
																order.total
															)}
														</span>
													</div>
												</div>

												{order.shippingAddress && (
													<div className="mt-5 rounded-xl bg-gray-50 p-4">
														<h3 className="mb-2 text-sm font-bold text-gray-800">
															ডেলিভারি ঠিকানা
														</h3>
														<p className="text-sm text-gray-600">
															{[
																order
																	.shippingAddress
																	.area,
																order
																	.shippingAddress
																	.thana,
																order
																	.shippingAddress
																	.city,
															]
																.filter(Boolean)
																.join(', ') ||
																'ঠিকানা পাওয়া যায়নি'}
														</p>
													</div>
												)}
											</div>
										)}
									</div>
								</article>
							);
						})}
					</div>
				)}
			</div>
		</main>
	);
}

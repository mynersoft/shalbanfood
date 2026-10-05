'use client';

import { useMemo, useState } from 'react';

import {
	Search,
	Package,
	CheckCircle,
	Clock,
	XCircle,
	Truck,
	Eye,
	ShoppingBag,
	Wallet,
	RefreshCw,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Download,
	LoaderCircle,
	MessageCircle,
	Filter,
	ArrowUpDown,
} from 'lucide-react';

import { toast } from 'react-hot-toast';

import {
	useAdminOrders,
	useUpdateOrder,
	useDeleteOrder,
} from '@/hooks/useOrder';





import { getOrderWhatsAppUrl } from '@/lib/whatsapp';
import AdminOrderDetailsModal, { getOrderId, ORDER_STATUSES } from '../components/order/AdminOrderDetailsModal';

// ============================================================
// CONSTANTS
// ============================================================

const PAGE_SIZE = 10;

// ============================================================
// STATUS CONFIG
// ============================================================

const BADGE = {
	pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',

	processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',

	shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',

	delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',

	cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICON = {
	pending: Clock,
	processing: Package,
	shipped: Truck,
	delivered: CheckCircle,
	cancelled: XCircle,
};

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
	const normalized = String(status || 'pending').toLowerCase();

	const Icon = STATUS_ICON[normalized] || Clock;

	const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
				BADGE[normalized] ||
				'border-gray-500/20 bg-gray-500/10 text-gray-400'
			}`}>
			<Icon size={13} />

			{label}
		</span>
	);
}

// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(value) {
	const number = Number(value || 0);

	return new Intl.NumberFormat('en-BD', {
		style: 'currency',
		currency: 'BDT',
		maximumFractionDigits: 0,
	}).format(number);
}

// ============================================================
// DATE
// ============================================================

function formatDate(value) {
	if (!value) return '—';

	try {
		return new Intl.DateTimeFormat('en-BD', {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(new Date(value));
	} catch {
		return '—';
	}
}

// ============================================================
// STATS CARD
// ============================================================

function StatsCard({ title, value, icon: Icon, description }) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#131318]">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{title}
					</p>

					<p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
						{value}
					</p>

					{description && (
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
							{description}
						</p>
					)}
				</div>

				<div className="rounded-xl bg-gray-100 p-2.5 dark:bg-white/5">
					<Icon
						size={20}
						className="text-gray-700 dark:text-gray-300"
					/>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminOrders() {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useAdminOrders();

	const updateOrder = useUpdateOrder();

	const deleteOrder = useDeleteOrder();

	const orders = Array.isArray(data) ? data : [];

	// ========================================================
	// LOCAL STATE
	// ========================================================

	const [search, setSearch] = useState('');

	const [statusFilter, setStatusFilter] = useState('all');

	const [sortBy, setSortBy] = useState('newest');

	const [page, setPage] = useState(1);

	const [selectedId, setSelectedId] = useState(null);

	const [busyId, setBusyId] = useState(null);

	// ========================================================
	// SELECTED ORDER
	// ========================================================

	const selectedOrder = useMemo(() => {
		if (!selectedId) return null;

		return (
			orders.find((order) => String(order._id) === String(selectedId)) ||
			null
		);
	}, [orders, selectedId]);

	// ========================================================
	// STATS
	// ========================================================

	const stats = useMemo(() => {
		const total = orders.length;

		const pending = orders.filter(
			(order) => String(order.status).toLowerCase() === 'pending'
		).length;

		const processing = orders.filter(
			(order) => String(order.status).toLowerCase() === 'processing'
		).length;

		const delivered = orders.filter(
			(order) => String(order.status).toLowerCase() === 'delivered'
		).length;

		const revenue = orders
			.filter(
				(order) => String(order.status).toLowerCase() !== 'cancelled'
			)
			.reduce(
				(sum, order) =>
					sum +
					Number(
						order.totalAmount ??
							order.total ??
							order.grandTotal ??
							0
					),
				0
			);

		return {
			total,
			pending,
			processing,
			delivered,
			revenue,
		};
	}, [orders]);

	// ========================================================
	// FILTER + SEARCH + SORT
	// ========================================================

	const filteredOrders = useMemo(() => {
		let result = [...orders];

		// ----------------------------------------------------
		// STATUS FILTER
		// ----------------------------------------------------

		if (statusFilter !== 'all') {
			result = result.filter(
				(order) =>
					String(order.status || 'pending').toLowerCase() ===
					statusFilter
			);
		}

		// ----------------------------------------------------
		// SEARCH
		// ----------------------------------------------------

		const query = search.trim().toLowerCase();

		if (query) {
			result = result.filter((order) => {
				const customer =
					order.customer || order.user || order.shippingAddress || {};

				const name =
					customer.name ||
					customer.fullName ||
					order.name ||
					order.customerName ||
					'';

				const phone =
					customer.phone || order.phone || order.customerPhone || '';

				const email =
					customer.email || order.email || order.customerEmail || '';

				const tracking = order.trackingNumber || '';

				const itemNames = Array.isArray(order.items)
					? order.items
							.map((item) => item.name || item.productName || '')
							.join(' ')
					: '';

				const searchable = [
					getOrderId(order),
					order._id,
					name,
					phone,
					email,
					tracking,
					itemNames,
				]
					.join(' ')
					.toLowerCase();

				return searchable.includes(query);
			});
		}

		// ----------------------------------------------------
		// SORT
		// ----------------------------------------------------

		result.sort((a, b) => {
			switch (sortBy) {
				case 'oldest':
					return (
						new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
					);

				case 'highest':
					return (
						Number(b.totalAmount ?? b.total ?? b.grandTotal ?? 0) -
						Number(a.totalAmount ?? a.total ?? a.grandTotal ?? 0)
					);

				case 'lowest':
					return (
						Number(a.totalAmount ?? a.total ?? a.grandTotal ?? 0) -
						Number(b.totalAmount ?? b.total ?? b.grandTotal ?? 0)
					);

				case 'newest':
				default:
					return (
						new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
					);
			}
		});

		return result;
	}, [orders, search, statusFilter, sortBy]);

	// ========================================================
	// PAGINATION
	// ========================================================

	const totalPages = Math.max(
		1,
		Math.ceil(filteredOrders.length / PAGE_SIZE)
	);

	const safePage = Math.min(page, totalPages);

	const paginatedOrders = useMemo(() => {
		const start = (safePage - 1) * PAGE_SIZE;

		return filteredOrders.slice(start, start + PAGE_SIZE);
	}, [filteredOrders, safePage]);

	// ========================================================
	// RESET PAGE WHEN FILTER CHANGES
	// ========================================================

	const handleSearchChange = (value) => {
		setSearch(value);
		setPage(1);
	};

	const handleStatusFilterChange = (value) => {
		setStatusFilter(value);
		setPage(1);
	};

	const handleSortChange = (value) => {
		setSortBy(value);
		setPage(1);
	};

	// ========================================================
	// UPDATE ORDER
	// ========================================================

	const handleUpdate = async (id, payload) => {
		if (!id) return;

		try {
			setBusyId(id);

			await updateOrder.mutateAsync({
				id,
				payload,
			});
		} catch (err) {
			console.error('Update order error:', err);
		} finally {
			setBusyId(null);
		}
	};

	// ========================================================
	// QUICK STATUS CHANGE
	// ========================================================

	const handleQuickStatus = async (order, newStatus) => {
		if (!order?._id) return;

		const current = String(order.status || 'pending').toLowerCase();

		if (newStatus === current || busyId === order._id) {
			return;
		}

		if (newStatus === 'cancelled') {
			const confirmed = window.confirm(
				`Cancel order #${getOrderId(order)}?`
			);

			if (!confirmed) {
				return;
			}
		}

		await handleUpdate(order._id, {
			status: newStatus,
		});
	};

	// ========================================================
	// DELETE ORDER
	// ========================================================

	const handleDelete = async (order) => {
		if (!order?._id) return;

		const confirmed = window.confirm(
			`Delete order #${getOrderId(order)} permanently?`
		);

		if (!confirmed) {
			return;
		}

		try {
			setBusyId(order._id);

			await deleteOrder.mutateAsync(order._id);

			if (String(selectedId) === String(order._id)) {
				setSelectedId(null);
			}
		} catch (err) {
			console.error('Delete order error:', err);
		} finally {
			setBusyId(null);
		}
	};

	// ========================================================
	// WHATSAPP
	// ========================================================

	const handleWhatsApp = (order) => {
		try {
			const url = getOrderWhatsAppUrl(order);

			if (!url) {
				toast.error('Customer phone number not found');

				return;
			}

			window.open(url, '_blank', 'noopener,noreferrer');
		} catch (error) {
			console.error(error);

			toast.error('Unable to open WhatsApp');
		}
	};

	// ========================================================
	// CSV EXPORT
	// ========================================================

	const exportCSV = () => {
		if (!filteredOrders.length) {
			toast.error('No orders to export');

			return;
		}

		const headers = [
			'Order ID',
			'Customer',
			'Phone',
			'Email',
			'Total',
			'Payment Status',
			'Order Status',
			'Tracking Number',
			'Created At',
		];

		const rows = filteredOrders.map((order) => {
			const customer =
				order.customer || order.user || order.shippingAddress || {};

			const name =
				customer.name || customer.fullName || order.customerName || '';

			const phone =
				customer.phone || order.phone || order.customerPhone || '';

			const email =
				customer.email || order.email || order.customerEmail || '';

			return [
				getOrderId(order),
				name,
				phone,
				email,
				Number(
					order.totalAmount ?? order.total ?? order.grandTotal ?? 0
				),
				order.paymentStatus || 'pending',
				order.status || 'pending',
				order.trackingNumber || '',
				order.createdAt || '',
			];
		});

		const escapeCSV = (value) => {
			const text = String(value ?? '');

			return `"${text.replace(/"/g, '""')}"`;
		};

		const csv = [
			headers.map(escapeCSV),
			...rows.map((row) => row.map(escapeCSV)),
		]
			.map((row) => row.join(','))
			.join('\n');

		const blob = new Blob(['\uFEFF' + csv], {
			type: 'text/csv;charset=utf-8;',
		});

		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');

		link.href = url;

		link.download = `shalban-food-orders-${new Date()
			.toISOString()
			.slice(0, 10)}.csv`;

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);

		URL.revokeObjectURL(url);

		toast.success('Orders exported successfully');
	};

	// ========================================================
	// LOADING
	// ========================================================

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
					<LoaderCircle className="animate-spin" size={22} />

					<span>Loading orders...</span>
				</div>
			</div>
		);
	}

	// ========================================================
	// ERROR
	// ========================================================

	if (isError) {
		return (
			<div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
				<XCircle size={40} className="mx-auto text-red-400" />

				<h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
					Failed to load orders
				</h3>

				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{error?.message || 'Something went wrong.'}
				</p>

				<button
					type="button"
					onClick={() => refetch()}
					className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
					<RefreshCw size={16} />
					Try Again
				</button>
			</div>
		);
	}

	// ========================================================
	// RENDER
	// ========================================================

	return (
		<div className="space-y-6">
			{/* ==================================================
			    HEADER
			================================================== */}

			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Orders
					</h1>

					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Manage customer orders, status and deliveries.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => refetch()}
						disabled={isFetching}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#131318] dark:text-gray-200 dark:hover:bg-white/5">
						<RefreshCw
							size={16}
							className={isFetching ? 'animate-spin' : ''}
						/>
						Refresh
					</button>

					<button
						type="button"
						onClick={exportCSV}
						className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
						<Download size={16} />
						Export CSV
					</button>
				</div>
			</div>

			{/* ==================================================
			    STATS
			================================================== */}

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
				<StatsCard
					title="Total Orders"
					value={stats.total}
					icon={ShoppingBag}
				/>

				<StatsCard title="Pending" value={stats.pending} icon={Clock} />

				<StatsCard
					title="Processing"
					value={stats.processing}
					icon={Package}
				/>

				<StatsCard
					title="Delivered"
					value={stats.delivered}
					icon={CheckCircle}
				/>

				<div className="col-span-2 lg:col-span-1">
					<StatsCard
						title="Revenue"
						value={formatCurrency(stats.revenue)}
						icon={Wallet}
					/>
				</div>
			</div>

			{/* ==================================================
			    FILTERS
			================================================== */}

			<div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#131318]">
				<div className="flex flex-col gap-3 xl:flex-row">
					{/* Search */}

					<div className="relative flex-1">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<input
							type="text"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search order, customer, phone, email, tracking..."
							className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white/20"
						/>
					</div>

					{/* Status */}

					<div className="relative">
						<Filter
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<select
							value={statusFilter}
							onChange={(e) =>
								handleStatusFilterChange(e.target.value)
							}
							className="h-11 min-w-[170px] appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
							<option value="all">All Status</option>

							{ORDER_STATUSES.map((status) => (
								<option
									key={status}
									value={status}
									className="bg-white dark:bg-[#131318]">
									{status.charAt(0).toUpperCase() +
										status.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* Sort */}

					<div className="relative">
						<ArrowUpDown
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<select
							value={sortBy}
							onChange={(e) => handleSortChange(e.target.value)}
							className="h-11 min-w-[170px] appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
							<option value="newest">Newest First</option>

							<option value="oldest">Oldest First</option>

							<option value="highest">Highest Amount</option>

							<option value="lowest">Lowest Amount</option>
						</select>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-500">
					<span>
						Showing{' '}
						<strong className="text-gray-700 dark:text-gray-300">
							{filteredOrders.length}
						</strong>{' '}
						orders
					</span>

					{isFetching && (
						<span className="flex items-center gap-1.5">
							<LoaderCircle size={13} className="animate-spin" />
							Updating...
						</span>
					)}
				</div>
			</div>

			{/* ==================================================
			    EMPTY
			================================================== */}

			{filteredOrders.length === 0 && (
				<div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-white/10 dark:bg-[#131318]">
					<ShoppingBag size={42} className="mx-auto text-gray-400" />

					<h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
						No orders found
					</h3>

					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Try changing your search or filters.
					</p>
				</div>
			)}

			{/* ==================================================
			    TABLE
			================================================== */}

			{filteredOrders.length > 0 && (
				<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#131318]">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[1100px] text-left">
							<thead className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.025]">
								<tr>
									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Order
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Customer
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Items
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Total
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Payment
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Status
									</th>

									<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
										Actions
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-gray-200 dark:divide-white/10">
								{paginatedOrders.map((order) => {
									const customer =
										order.customer ||
										order.user ||
										order.shippingAddress ||
										{};

									const customerName =
										customer.name ||
										customer.fullName ||
										order.customerName ||
										'Guest Customer';

									const phone =
										customer.phone ||
										order.phone ||
										order.customerPhone ||
										'';

									const total = Number(
										order.totalAmount ??
											order.total ??
											order.grandTotal ??
											0
									);

									const status = String(
										order.status || 'pending'
									).toLowerCase();

									const busy = busyId === order._id;

									return (
										<tr
											key={order._id}
											className="transition hover:bg-gray-50 dark:hover:bg-white/[0.025]">
											{/* ORDER */}

											<td className="px-4 py-4">
												<div>
													<button
														type="button"
														onClick={() =>
															setSelectedId(
																order._id
															)
														}
														className="font-semibold text-gray-900 hover:underline dark:text-white">
														#{getOrderId(order)}
													</button>

													<p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
														{formatDate(
															order.createdAt
														)}
													</p>
												</div>
											</td>

											{/* CUSTOMER */}

											<td className="px-4 py-4">
												<div className="max-w-[190px]">
													<p className="truncate font-medium text-gray-900 dark:text-white">
														{customerName}
													</p>

													{phone && (
														<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
															{phone}
														</p>
													)}

													{customer.email && (
														<p className="truncate text-xs text-gray-500 dark:text-gray-500">
															{customer.email}
														</p>
													)}
												</div>
											</td>

											{/* ITEMS */}

											<td className="px-4 py-4">
												<div className="flex items-center gap-2">
													<div className="rounded-lg bg-gray-100 p-2 dark:bg-white/5">
														<ShoppingBag
															size={15}
															className="text-gray-500"
														/>
													</div>

													<span className="text-sm text-gray-700 dark:text-gray-300">
														{Array.isArray(
															order.items
														)
															? order.items.reduce(
																	(
																		sum,
																		item
																	) =>
																		sum +
																		Number(
																			item.quantity ||
																				1
																		),
																	0
																)
															: 0}{' '}
														item(s)
													</span>
												</div>
											</td>

											{/* TOTAL */}

											<td className="px-4 py-4">
												<span className="font-semibold text-gray-900 dark:text-white">
													{formatCurrency(total)}
												</span>
											</td>

											{/* PAYMENT */}

											<td className="px-4 py-4">
												<div className="space-y-1">
													<span className="text-sm text-gray-700 dark:text-gray-300">
														{order.paymentMethod ||
															'COD'}
													</span>

													<p className="text-xs capitalize text-gray-500 dark:text-gray-500">
														{order.paymentStatus ||
															'pending'}
													</p>
												</div>
											</td>

											{/* STATUS */}

											<td className="px-4 py-4">
												<div className="flex min-w-[150px] flex-col items-start gap-2">
													<StatusBadge
														status={status}
													/>

													<select
														value={status}
														disabled={busy}
														onChange={(e) =>
															handleQuickStatus(
																order,
																e.target.value
															)
														}
														className="h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
														{ORDER_STATUSES.map(
															(option) => (
																<option
																	key={option}
																	value={
																		option
																	}
																	className="bg-white dark:bg-[#131318]">
																	{option
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																		option.slice(
																			1
																		)}
																</option>
															)
														)}
													</select>
												</div>
											</td>

											{/* ACTIONS */}

											<td className="px-4 py-4">
												<div className="flex items-center gap-1.5">
													{/* VIEW */}

													<button
														type="button"
														title="View order"
														onClick={() =>
															setSelectedId(
																order._id
															)
														}
														className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">
														<Eye size={16} />
													</button>

													{/* WHATSAPP */}

													<button
														type="button"
														title="WhatsApp customer"
														onClick={() =>
															handleWhatsApp(
																order
															)
														}
														disabled={!phone}
														className="rounded-lg border border-green-500/20 bg-green-500/5 p-2 text-green-500 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40">
														<MessageCircle
															size={16}
														/>
													</button>

													{/* DELETE */}

													<button
														type="button"
														title="Delete order"
														onClick={() =>
															handleDelete(order)
														}
														disabled={busy}
														className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40">
														{busy ? (
															<LoaderCircle
																size={16}
																className="animate-spin"
															/>
														) : (
															<Trash2 size={16} />
														)}
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* ==================================================
					    PAGINATION
					================================================== */}

					<div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Page{' '}
							<span className="font-medium text-gray-900 dark:text-white">
								{safePage}
							</span>{' '}
							of{' '}
							<span className="font-medium text-gray-900 dark:text-white">
								{totalPages}
							</span>
						</p>

						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={safePage <= 1}
								onClick={() =>
									setPage((current) =>
										Math.max(1, current - 1)
									)
								}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
								<ChevronLeft size={16} />
								Previous
							</button>

							<button
								type="button"
								disabled={safePage >= totalPages}
								onClick={() =>
									setPage((current) =>
										Math.min(totalPages, current + 1)
									)
								}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
								Next
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ==================================================
			    ORDER DETAILS MODAL
			================================================== */}

			<AdminOrderDetailsModal
				isOpen={Boolean(selectedOrder)}
				order={selectedOrder}
				onClose={() => setSelectedId(null)}
				onUpdate={handleUpdate}
				isUpdating={
					selectedOrder ? busyId === selectedOrder._id : false
				}
			/>
		</div>
	);
}

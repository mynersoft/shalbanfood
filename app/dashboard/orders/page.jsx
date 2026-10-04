'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import { getOrderWhatsAppUrl } from '@/lib/whatsapp';

import AdminOrderDetailsModal, {
	ORDER_STATUSES,
	getOrderId,
} from '@/app/dashboard/components/order/AdminOrderDetailsModal';

import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import {
	useAdminOrders,
	useUpdateOrder,
	useDeleteOrder,
} from '@/hooks/useOrder';

const PAGE_SIZE = 10;

const BADGE = {
	pending: 'bg-yellow-100 text-yellow-800',
	processing: 'bg-blue-100 text-blue-800',
	shipped: 'bg-purple-100 text-purple-800',
	delivered: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800',
};

const STATUS_ICON = {
	pending: Clock,
	processing: RefreshCw,
	shipped: Truck,
	delivered: CheckCircle,
	cancelled: XCircle,
};

const StatusBadge = ({ status }) => {
	const Icon = STATUS_ICON[status] || Package;
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${
				BADGE[status] || 'bg-gray-100 text-gray-800'
			}`}>
			<Icon className="h-3.5 w-3.5" />
			{status}
		</span>
	);
};

const AdminOrders = () => {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useAdminOrders();

	const orders = Array.isArray(data) ? data : [];

	const updateOrder = useUpdateOrder();
	const deleteOrder = useDeleteOrder();

	const [filter, setFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('newest');
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState(null);
	const [busyId, setBusyId] = useState(null);

	const selectedOrder = useMemo(
		() => orders.find((o) => o._id === selectedId) || null,
		[orders, selectedId]
	);

	// ---------- stats ----------
	const stats = useMemo(() => {
		const count = (s) =>
			orders.filter((o) => (o.status || 'pending') === s).length;
		const revenue = orders
			.filter((o) => o.status !== 'cancelled')
			.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
		return {
			total: orders.length,
			pending: count('pending'),
			processing: count('processing'),
			delivered: count('delivered'),
			revenue,
		};
	}, [orders]);

	const filters = [
		{ id: 'all', label: 'All', count: orders.length },
		...ORDER_STATUSES.map((s) => ({
			id: s,
			label: s.charAt(0).toUpperCase() + s.slice(1),
			count: orders.filter((o) => (o.status || 'pending') === s).length,
		})),
	];

	// ---------- filter / search / sort ----------
	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();

		const list = orders.filter((o) => {
			const st = (o.status || 'pending').toLowerCase();
			if (filter !== 'all' && st !== filter) return false;
			if (!q) return true;

			const haystack = [
				getOrderId(o),
				o.customer?.name,
				o.customer?.phone,
				o.customer?.email,
				o.trackingNumber,
				...(o.orderItems || []).map((i) => i.name),
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(q);
		});

		list.sort((a, b) => {
			if (sort === 'oldest')
				return new Date(a.createdAt) - new Date(b.createdAt);
			if (sort === 'highest') return (b.total || 0) - (a.total || 0);
			if (sort === 'lowest') return (a.total || 0) - (b.total || 0);
			return new Date(b.createdAt) - new Date(a.createdAt);
		});
		return list;
	}, [orders, filter, search, sort]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const pageOrders = filtered.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE
	);

	// ---------- actions ----------

	const handleUpdate = async (id, payload) => {
		setBusyId(id);

		try {
			await updateOrder.mutateAsync({ id, payload });
		} finally {
			setBusyId(null);
		}
	};

	const handleQuickStatus = async (order, newStatus) => {
		const current = (order.status || 'pending').toLowerCase();

		if (newStatus === current || busyId === order._id) return;

		if (
			newStatus === 'cancelled' &&
			!window.confirm(`Cancel order #${getOrderId(order)}?`)
		) {
			return;
		}

		try {
			await handleUpdate(order._id, { status: newStatus });
		} catch {
			// Error toast is handled by the mutation hook.
		}
	};

	const handleDelete = async (order) => {
		if (
			!window.confirm(
				`Permanently delete order #${getOrderId(order)}? This cannot be undone.`
			)
		) {
			return;
		}

		setBusyId(order._id);

		try {
			await deleteOrder.mutateAsync(order._id);

			if (selectedId === order._id) {
				setSelectedId(null);
			}
		} catch {
			// Error toast is handled by the mutation hook.
		} finally {
			setBusyId(null);
		}
  };
  


  const handleOrderStatusChange = () => {}





	const exportCSV = () => {
		if (!filtered.length) {
			toast.error('No orders to export.');
			return;
		}
		const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
		const rows = [
			[
				'Order ID',
				'Date',
				'Customer',
				'Phone',
				'Email',
				'Items',
				'Total',
				'Payment',
				'Status',
				'Tracking',
			],
			...filtered.map((o) => [
				getOrderId(o),
				o.createdAt ? new Date(o.createdAt).toISOString() : '',
				o.customer?.name,
				o.customer?.phone,
				o.customer?.email,
				(o.orderItems || []).length,
				o.total,
				o.paymentStatus,
				o.status,
				o.trackingNumber,
			]),
		];
		const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n');
		const url = URL.createObjectURL(
			new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		);
		const a = document.createElement('a');
		a.href = url;
		a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// ---------- states ----------
	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<LoaderCircle className="mx-auto mb-3 h-9 w-9 animate-spin text-blue-600" />
					<p className="text-gray-600">Loading orders...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-white p-10 text-center">
				<XCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
				<h2 className="mb-2 text-xl font-semibold text-gray-900">
					Failed to load orders
				</h2>
				<button
					onClick={() => refetch()}
					className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					Try again
				</button>
			</div>
		);
	}

	const statCards = [
		{
			label: 'Total Orders',
			value: stats.total,
			icon: ShoppingBag,
			color: 'text-blue-500 bg-blue-50',
		},
		{
			label: 'Pending',
			value: stats.pending,
			icon: Clock,
			color: 'text-yellow-500 bg-yellow-50',
		},
		{
			label: 'Processing',
			value: stats.processing,
			icon: RefreshCw,
			color: 'text-indigo-500 bg-indigo-50',
		},
		{
			label: 'Delivered',
			value: stats.delivered,
			icon: CheckCircle,
			color: 'text-green-500 bg-green-50',
		},
		{
			label: 'Revenue',
			value: formatCurrency(stats.revenue),
			icon: Wallet,
			color: 'text-purple-500 bg-purple-50',
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Title */}
				<div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Orders
						</h1>
						<p className="text-sm text-gray-500">
							Manage and update customer orders
						</p>
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => refetch()}
							disabled={isFetching}
							className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
							<RefreshCw
								className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
							/>
							Refresh
						</button>
						<button
							onClick={exportCSV}
							className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
							<Download className="h-4 w-4" />
							Export CSV
						</button>
					</div>
				</div>

				{/* Stats */}
				<div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
					{statCards.map((c, i) => (
						<motion.div
							key={c.label}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
							<div className="flex items-center justify-between gap-2">
								<div className="min-w-0">
									<p className="text-xs text-gray-500">
										{c.label}
									</p>
									<p className="truncate text-xl font-bold text-gray-900">
										{c.value}
									</p>
								</div>
								<c.icon
									className={`h-10 w-10 shrink-0 rounded-lg p-2 ${c.color}`}
								/>
							</div>
						</motion.div>
					))}
				</div>

				{/* Search / filter / sort */}
				<div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setPage(1);
								}}
								placeholder="Search by order ID, customer, phone, email, product, tracking..."
								className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
							<option value="newest">Newest first</option>
							<option value="oldest">Oldest first</option>
							<option value="highest">Highest total</option>
							<option value="lowest">Lowest total</option>
						</select>
					</div>

					<div className="mt-4 flex gap-2 overflow-x-auto pb-1">
						{filters.map((f) => (
							<button
								key={f.id}
								onClick={() => {
									setFilter(f.id);
									setPage(1);
								}}
								className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
									filter === f.id
										? 'bg-blue-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}>
								{f.label}
								<span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
									{f.count}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Table */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					{pageOrders.length === 0 ? (
						<div className="p-12 text-center">
							<Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
							<h3 className="mb-1 text-xl font-semibold text-gray-900">
								No orders found
							</h3>
							<p className="text-gray-600">
								{search || filter !== 'all'
									? 'Try changing your search or filter.'
									: 'No orders have been placed yet.'}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[900px] text-left text-sm">
								<thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
									<tr>
										<th className="px-4 py-3">Order</th>
										<th className="px-4 py-3">Customer</th>
										<th className="px-4 py-3">Items</th>
										<th className="px-4 py-3">Total</th>
										<th className="px-4 py-3">Payment</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3 text-right">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{pageOrders.map((order) => {
										const st = (
											order.status || 'pending'
										).toLowerCase();
										const busy = busyId === order._id;
										const itemCount = (
											order.orderItems || []
										).length;

										return (
											<tr
												key={order._id}
												className="hover:bg-gray-50">
												<td className="px-4 py-3">
													<p className="font-semibold text-gray-900">
														#{getOrderId(order)}
													</p>
													<p className="text-xs text-gray-500">
														{order.createdAt
															? formatDate(
																	order.createdAt
																)
															: 'N/A'}
													</p>
												</td>
												<td className="px-4 py-3">
													<p className="font-medium text-gray-900">
														{order.customer?.name ||
															'Customer'}
													</p>
													<p className="text-xs text-gray-500">
														{order.customer
															?.phone ||
															order.customer
																?.email ||
															'—'}
													</p>
												</td>
												<td className="px-4 py-3 text-gray-700">
													{itemCount} item
													{itemCount !== 1 ? 's' : ''}
												</td>
												<td className="px-4 py-3 font-semibold text-gray-900">
													{formatCurrency(
														Number(order.total) || 0
													)}
												</td>
												<td className="px-4 py-3">
													<span
														className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
															order.paymentStatus ===
															'paid'
																? 'bg-green-100 text-green-800'
																: order.paymentStatus ===
																	  'refunded'
																	? 'bg-gray-200 text-gray-700'
																	: 'bg-orange-100 text-orange-800'
														}`}>
														{order.paymentStatus ||
															'unpaid'}
													</span>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col items-start gap-1.5">
														<StatusBadge
															status={st}
														/>
														<select
															value={st}
															disabled={busy}
															onChange={(e) =>
																handleQuickStatus(
																	order,
																	e.target
																		.value
																)
															}
															className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
															{ORDER_STATUSES.map(
																(s) => (
																	<option
																		key={s}
																		value={
																			s
																		}>
																		{s
																			.charAt(
																				0
																			)
																			.toUpperCase() +
																			s.slice(
																				1
																			)}
																	</option>
																)
															)}
														</select>
													</div>
												</td>

												<td className="px-4 py-3">
													<div className="flex items-center justify-end gap-2">
														{busy && (
															<LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
														)}
														<button
															onClick={() =>
																setSelectedId(
																	order._id
																)
															}
															className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
															<Eye className="h-3.5 w-3.5" />
															Manage
														</button>
														<td>
															<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                              <label className="block">
                                               
                                                <select className='text-black'
                                                  
                                                  onChange={(e) =>
                                                    handleOrderStatusChange(e.target.value)
                                                  }
                                                 >
                                                 
                                                    <option value={order.status}>
                                      { order.status}
                                    </option>
                                    
                                                    <option value={order.status}>
                                     processing
                                                    </option>
                                                    <option >
                                    confirm
                                                    </option>
                                                    <option >
                                     cancel
                                                    </option>
                                                  
                                                </select>
                                              </label>
                              
                              
                                            
                                            </div>
														</td>

														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();

																const url =
																	getOrderWhatsAppUrl(
																		order
																	);

																{
																	console.log(
																		order
																	);
																}

																if (!url) {
																	toast.error(
																		'Customer phone number not found'
																	);
																	return;
																}

																window.open(
																	url,
																	'_blank',
																	'noopener,noreferrer'
																);
															}}
															title="Message customer on WhatsApp"
															className="inline-flex items-center justify-center gap-2
        rounded-lg 
        px-3 py-2
        text-sm font-medium text-green-900
        transition hover:bg-green-500/20">
															<MessageCircle
																size={16}
															/>
														</button>
														<button
															onClick={() =>
																handleDelete(
																	order
																)
															}
															disabled={busy}
															aria-label="Delete order"
															className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50">
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					{/* Pagination */}
					{filtered.length > PAGE_SIZE && (
						<div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
							<p className="text-sm text-gray-600">
								Showing {(currentPage - 1) * PAGE_SIZE + 1}–
								{Math.min(
									currentPage * PAGE_SIZE,
									filtered.length
								)}{' '}
								of {filtered.length}
							</p>
							<div className="flex items-center gap-2">
								<button
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
									disabled={currentPage === 1}
									className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40">
									<ChevronLeft className="h-4 w-4" />
								</button>
								<span className="text-sm text-gray-700">
									{currentPage} / {totalPages}
								</span>
								<button
									onClick={() =>
										setPage((p) =>
											Math.min(totalPages, p + 1)
										)
									}
									disabled={currentPage === totalPages}
									className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40">
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Modal */}

			<AdminOrderDetailsModal
				isOpen={Boolean(selectedOrder)}
				order={selectedOrder}
				onClose={() => setSelectedId(null)}
				onUpdate={handleUpdate}
				isUpdating={
					Boolean(selectedOrder) && busyId === selectedOrder._id
				}
			/>
		</div>
	);
};

export default AdminOrders;

'use client';

import { useMemo, useState, useEffect } from 'react';
import {
	Search,
	Package,
	CheckCircle,
	Clock,
	XCircle,
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
	Plus,
	MapPin,
	Edit,
	BadgePercent,
} from 'lucide-react';

import { toast } from 'react-hot-toast';
import Link from 'next/link';

import {
	useAdminOrders,
	useUpdateOrder,
	useDeleteOrder,
} from '@/hooks/useOrder';

import { getOrderWhatsAppUrl } from '@/lib/whatsapp';

import AdminOrderDetailsModal, {
	getOrderId,
	ORDER_STATUSES,
} from '../components/order/AdminOrderDetailsModal';

import { STATUS_ICON } from '@/constants/icons';
import AdminDiscountModal from '@/components/Dashboard/AdminDiscountModal';
import { formatCurrency, formatDate } from '@/utils/formatters';

const PAGE_SIZE = 10;

const BADGE = {
	pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
	processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
	shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
	delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
	cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
	return: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'failed'];

function getOrderTotal(order) {
	return Number(order?.total ?? order?.totalAmount ?? order?.grandTotal ?? 0);
}

function getPaymentInfo(order) {
	const total = getOrderTotal(order);
	const paid = Number(order?.payment?.paidAmount || 0);

	return {
		total,
		paid,
		due: Math.max(0, total - paid),
		status: order?.payment?.status || 'unpaid',
		method: order?.payment?.method || 'COD',
	};
}

function StatusBadge({ status }) {
	const normalized = String(status || 'pending').toLowerCase();
	const Icon = STATUS_ICON[normalized] || Clock;

	const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${
				BADGE[normalized] ||
				'border-gray-500/20 bg-gray-500/10 text-gray-400'
			}`}>
			<Icon size={13} />
			{label}
		</span>
	);
}

function PaymentBadge({ status }) {
	const styles = {
		paid: 'border-green-500/20 bg-green-500/10 text-green-400',
		partial: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
		failed: 'border-red-500/20 bg-red-500/10 text-red-400',
		unpaid: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2  text-[8px] font-semibold capitalize ${
				styles[status] || styles.unpaid
			}`}>
			{status || 'unpaid'}
		</span>
	);
}

function StatsCard({ title, value, icon: Icon, description }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-[#131318] p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm text-gray-300">{title}</p>

					<p className="mt-1 text-2xl font-bold text-white">
						{value}
					</p>

					{description && (
						<p className="mt-1 text-sm text-gray-500">
							{description}
						</p>
					)}
				</div>

				<div className="rounded-xl bg-gray-950/50 p-2.5">
					<Icon size={20} className="text-gray-300" />
				</div>
			</div>
		</div>
	);
}

/* =========================================================
   PAYMENT EDITOR
========================================================= */

/* =========================================================
   PAYMENT DISPLAY
========================================================= */

function PaymentDisplay({ order, onEdit }) {
	const payment = getPaymentInfo(order);

	return (
		<div className="min-w-[115px] space-y-1.5">
			<div className="flex items-center gap-2">
				<PaymentBadge status={payment.status} />

				<button
					type="button"
					title="Edit Payment"
					onClick={() => onEdit(order)}
					className="inline-flex items-center justify-center rounded-md border border-white/10 p-1.5 text-gray-400 transition hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-400">
					<Edit size={13} />
				</button>
			</div>

			<div className="flex items-center  gap-2 text-[12px]">
				<span className="text-gray-500">Due </span>
				<span className="font-semibold text-yellow-400">
					{formatCurrency(payment.due)}
				</span>
			</div>
		</div>
	);
}

/* =========================================================
   PAYMENT EDIT MODAL
========================================================= */

function PaymentEditorModal({ order, onClose, onSave, busy }) {
	const payment = getPaymentInfo(order);

	const [paidAmount, setPaidAmount] = useState(String(payment.paid));
	const [paymentStatus, setPaymentStatus] = useState(payment.status);
	const [saving, setSaving] = useState(false);

	const parsedPaid = Number(paidAmount);

	const validAmount =
		paidAmount.trim() !== '' &&
		Number.isFinite(parsedPaid) &&
		parsedPaid >= 0 &&
		parsedPaid <= payment.total;

	const due = validAmount
		? Math.max(0, payment.total - parsedPaid)
		: payment.due;

	const validStatus =
		(paymentStatus === 'unpaid' && parsedPaid === 0) ||
		(paymentStatus === 'partial' &&
			parsedPaid > 0 &&
			parsedPaid < payment.total) ||
		(paymentStatus === 'paid' && parsedPaid === payment.total) ||
		paymentStatus === 'failed';

	const handlePaidChange = (value) => {
		setPaidAmount(value);

		if (value.trim() === '') return;

		const amount = Number(value);

		if (!Number.isFinite(amount) || amount < 0) return;

		if (amount === 0) {
			setPaymentStatus('unpaid');
		} else if (amount < payment.total) {
			setPaymentStatus('partial');
		} else if (amount === payment.total) {
			setPaymentStatus('paid');
		}
	};

	const handleStatusChange = (value) => {
		setPaymentStatus(value);

		if (value === 'paid') {
			setPaidAmount(String(payment.total));
		} else if (value === 'unpaid') {
			setPaidAmount('0');
		} else if (value === 'partial') {
			if (
				!Number.isFinite(parsedPaid) ||
				parsedPaid <= 0 ||
				parsedPaid >= payment.total
			) {
				setPaidAmount(payment.total > 1 ? '1' : '0');
			}
		}
	};

	const handleSave = async () => {
		if (!validAmount) {
			toast.error('Please enter a valid paid amount.');
			return;
		}

		if (!validStatus) {
			toast.error('Payment status and paid amount do not match.');
			return;
		}

		try {
			setSaving(true);

		
await onSave(order._id, {
	payment: {
		paidAmount: parsedPaid,
		status: paymentStatus,
	},
});


			onClose();
		} catch (error) {
			console.error('Payment update error:', error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			onClick={onClose}>
			<div
				className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#131318] shadow-2xl"
				onClick={(e) => e.stopPropagation()}>
				{/* HEADER */}
				<div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
					<div>
						<h2 className="text-base font-semibold text-white">
							Edit Payment
						</h2>

						<p className="mt-1 text-sm text-gray-500">
							Invoice: {order.invoiceNo || getOrderId(order)}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white">
						<XCircle size={19} />
					</button>
				</div>

				{/* BODY */}
				<div className="space-y-4 p-5">
					{/* SUMMARY */}
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
							<p className="text-sm text-gray-500">Order Total</p>

							<p className="mt-1 text-lg font-bold text-white">
								{formatCurrency(payment.total)}
							</p>
						</div>

						<div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
							<p className="text-sm text-gray-500">
								Previously Paid
							</p>

							<p className="mt-1 text-lg font-bold text-green-400">
								{formatCurrency(payment.paid)}
							</p>
						</div>
					</div>

					{/* PAYMENT METHOD */}
					<div>
						<label className="mb-1.5 block text-sm font-medium text-gray-400">
							Payment Method
						</label>

						<div className="rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-2.5 text-sm text-gray-300">
							{payment.method}
						</div>
					</div>

					{/* PAID AMOUNT */}
					<div>
						<label className="mb-1.5 block text-sm font-medium text-gray-400">
							Paid Amount (৳)
						</label>

						<input
							type="number"
							min="0"
							max={payment.total}
							step="any"
							value={paidAmount}
							onChange={(e) => handlePaidChange(e.target.value)}
							placeholder="Enter paid amount"
							className="h-11 w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 text-sm text-white outline-none focus:border-green-500"
						/>
					</div>

					{/* PAYMENT STATUS */}
					<div>
						<label className="mb-1.5 block text-sm font-medium text-gray-400">
							Payment Status
						</label>

						<select
							value={paymentStatus}
							onChange={(e) => handleStatusChange(e.target.value)}
							className="h-11 w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 text-sm text-white outline-none focus:border-green-500">
							{PAYMENT_STATUSES.map((status) => (
								<option key={status} value={status}>
									{status.charAt(0).toUpperCase() +
										status.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* NEW DUE */}
					<div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-400">
								New Due Amount
							</span>

							<strong className="text-lg text-red-400">
								{validAmount
									? formatCurrency(due)
									: 'Invalid amount'}
							</strong>
						</div>

						{!validStatus && validAmount && (
							<p className="mt-2 text-sm text-amber-400">
								Payment status does not match paid amount.
							</p>
						)}
					</div>
				</div>

				{/* FOOTER */}
				<div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50">
						Cancel
					</button>

					<button
						type="button"
						onClick={handleSave}
						disabled={
							!validAmount || !validStatus || busy || saving
						}
						className="inline-flex items-center gap-2 rounded-lg bg-[#1f5d3b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#17482d] disabled:cursor-not-allowed disabled:opacity-40">
						{saving && (
							<LoaderCircle size={15} className="animate-spin" />
						)}
						{saving ? 'Saving...' : 'Save Payment'}
					</button>
				</div>
			</div>
		</div>
	);
}

/* =========================================================
   MAIN ADMIN ORDERS PAGE
========================================================= */

export default function AdminOrders() {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useAdminOrders();

	const updateOrder = useUpdateOrder();
	const deleteOrder = useDeleteOrder();

	const orders = Array.isArray(data) ? data : [];

	const [search, setSearch] = useState('');
	const [discountOrder, setDiscountOrder] = useState(null);
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('newest');
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState(null);
	const [busyId, setBusyId] = useState(null);
	const [paymentOrder, setPaymentOrder] = useState(null);

	/* SELECTED ORDER */

	const selectedOrder = useMemo(() => {
		if (!selectedId) return null;

		return (
			orders.find((order) => String(order._id) === String(selectedId)) ||
			null
		);
	}, [orders, selectedId]);

	/* STATS */

	const stats = useMemo(() => {
		const total = orders.length;

		const pending = orders.filter(
			(order) => order.status === 'pending'
		).length;

		const processing = orders.filter(
			(order) => order.status === 'processing'
		).length;

		const delivered = orders.filter(
			(order) => order.status === 'delivered'
		).length;

		const revenue = orders
			.filter((order) => order.status !== 'cancelled')
			.reduce((sum, order) => sum + getOrderTotal(order), 0);

		return {
			total,
			pending,
			processing,
			delivered,
			revenue,
		};
	}, [orders]);

	/* FILTER + SEARCH + SORT */

	const filteredOrders = useMemo(() => {
		let result = [...orders];

		if (statusFilter !== 'all') {
			result = result.filter(
				(order) =>
					String(order.status || 'pending').toLowerCase() ===
					statusFilter
			);
		}

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

				const itemNames = Array.isArray(order.orderItems)
					? order.orderItems.map((item) => item.name || '').join(' ')
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

		result.sort((a, b) => {
			switch (sortBy) {
				case 'oldest':
					return (
						new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
					);

				case 'highest':
					return getOrderTotal(b) - getOrderTotal(a);

				case 'lowest':
					return getOrderTotal(a) - getOrderTotal(b);

				case 'newest':
				default:
					return (
						new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
					);
			}
		});

		return result;
	}, [orders, search, statusFilter, sortBy]);

	/* PAGINATION */

	const totalPages = Math.max(
		1,
		Math.ceil(filteredOrders.length / PAGE_SIZE)
	);

	const safePage = Math.min(page, totalPages);

	const paginatedOrders = useMemo(() => {
		const start = (safePage - 1) * PAGE_SIZE;

		return filteredOrders.slice(start, start + PAGE_SIZE);
	}, [filteredOrders, safePage]);

	/* FILTER HANDLERS */

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

	/* UPDATE ORDER */

	const handleUpdate = async (id, payload) => {
		if (!id) return;

		try {
			setBusyId(id);
			await updateOrder.mutateAsync({
				id,
				payload,
			});
			return true;
		} catch (err) {
			toast.error(
				err?.response?.data?.message ||
					err?.message ||
					'Failed to update order'
			);

			throw err;
		} finally {
			setBusyId(null);
		}
	};

	/* QUICK STATUS */

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

			if (!confirmed) return;
		}
		await handleUpdate(order._id, {
			status: newStatus,
			orderItems: order.orderItems,
		});
	};

	/* DELETE ORDER */

	const handleDelete = async (order) => {
		if (!order?._id) return;

		const confirmed = window.confirm(
			`Delete order #${getOrderId(order)} permanently?`
		);

		if (!confirmed) return;

		try {
			setBusyId(order._id);

			await deleteOrder.mutateAsync(order._id);

			toast.success('Order deleted successfully');

			if (String(selectedId) === String(order._id)) {
				setSelectedId(null);
			}
		} catch (err) {
			console.error('Delete order error:', err);

			toast.error('Failed to delete order');
		} finally {
			setBusyId(null);
		}
	};

	/* WHATSAPP */

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

	/* CSV EXPORT */

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
			'Subtotal',
			'Shipping',
			'Discount',
			'Total',
			'Paid Amount',
			'Due Amount',
			'Payment Method',
			'Payment Status',
			'Order Status',
			'Tracking Number',
			'Created At',
		];

		const rows = filteredOrders.map((order) => {
			const customer =
				order.customer || order.user || order.shippingAddress || {};

			const payment = getPaymentInfo(order);

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
				Number(order.subtotal || 0),
				Number(order.shippingFee || 0),
				Number(order.adminDiscount || order.discount || 0),
				payment.total,
				payment.paid,
				payment.due,
				payment.method,
				payment.status,
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

	/* LOADING */

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex items-center gap-3 text-gray-400">
					<LoaderCircle className="animate-spin" size={22} />
					<span>Loading orders...</span>
				</div>
			</div>
		);
	}

	/* ERROR */

	if (isError) {
		return (
			<div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
				<XCircle size={40} className="mx-auto text-red-400" />

				<h3 className="mt-3 font-semibold text-white">
					Failed to load orders
				</h3>

				<p className="mt-1 text-sm text-gray-400">
					{error?.message || 'Something went wrong.'}
				</p>

				<button
					type="button"
					onClick={() => refetch()}
					className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1f5d3b] px-4 py-2 text-sm font-medium text-white">
					<RefreshCw size={16} />
					Try Again
				</button>
			</div>
		);
	}

	/* RENDER */

	return (
		<div className="space-y-6">
			{/* HEADER */}

			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-white">Orders</h1>

					<p className="mt-1 text-sm text-gray-400">
						Manage customer orders, payment and deliveries.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => refetch()}
						disabled={isFetching}
						className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131318] px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-50">
						<RefreshCw
							size={16}
							className={isFetching ? 'animate-spin' : ''}
						/>
						Refresh
					</button>

					<button
						type="button"
						onClick={exportCSV}
						className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
						<Download size={16} />
						Export CSV
					</button>

					<Link
						href="/dashboard/orders/create"
						className="inline-flex items-center gap-2 rounded-lg bg-[#1f5d3b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17482d]">
						<Plus size={18} />
						Create Custom Order
					</Link>
				</div>
			</div>

			{/* STATS */}

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

			{/* FILTERS */}

			<div className="rounded-2xl border border-white/10 bg-[#131318] p-4">
				<div className="flex flex-col gap-3 xl:flex-row">
					<div className="relative flex-1">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<input
							type="text"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search order, customer, phone, email..."
							className="h-11 w-full rounded-xl border border-white/10 bg-[#0d0d11] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500"
						/>
					</div>

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
							className="h-11 min-w-[170px] appearance-none rounded-xl border border-white/10 bg-[#0d0d11] pl-9 pr-8 text-sm text-white outline-none">
							<option value="all">All Status</option>

							{ORDER_STATUSES.map((status) => (
								<option key={status} value={status}>
									{status.charAt(0).toUpperCase() +
										status.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div className="relative">
						<ArrowUpDown
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<select
							value={sortBy}
							onChange={(e) => handleSortChange(e.target.value)}
							className="h-11 min-w-[170px] appearance-none rounded-xl border border-white/10 bg-[#0d0d11] pl-9 pr-8 text-sm text-white outline-none">
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
							<option value="highest">Highest Amount</option>
							<option value="lowest">Lowest Amount</option>
						</select>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
					<span>
						Showing{' '}
						<strong className="text-gray-300">
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

			{/* EMPTY */}

			{filteredOrders.length === 0 && (
				<div className="rounded-2xl border border-dashed border-white/10 bg-[#131318] p-12 text-center">
					<ShoppingBag size={42} className="mx-auto text-gray-400" />

					<h3 className="mt-4 font-semibold text-white">
						No orders found
					</h3>

					<p className="mt-1 text-sm text-gray-400">
						Try changing your search or filters.
					</p>
				</div>
			)}

			{/* TABLE */}

			{filteredOrders.length > 0 && (
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131318]">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[1100px] text-left">
							<thead className="border-b border-white/10 bg-white/[0.02]">
								<tr>
									{[
										'Invoice No',
										'Customer',
										'Location',
										'Subtotal',
										'Shipping',
										'Discount',
										'Total',
										'Payment',
										'Order Status',
										'Actions',
									].map((heading) => (
										<th
											key={heading}
											className="whitespace-nowrap px-2 py-2 text-sm font-medium uppercase tracking-wide text-gray-400">
											{heading}
										</th>
									))}
								</tr>
							</thead>

							<tbody className="divide-y divide-white/10">
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

									const total = getOrderTotal(order);

									const discount = Number(
										order.adminDiscount > 0
											? order.adminDiscount
											: order.discount || 0
									);

									const status = String(
										order.status || 'pending'
									).toLowerCase();

									const busy = busyId === order._id;

									return (
										<tr
											key={order._id}
											className="transition hover:bg-white/[0.025]">
											{/* INVOICE */}
											<td className="whitespace-nowrap px-2 py-2">
												<p className="text-sm font-semibold text-gray-300">
													{order.invoiceNo ||
														getOrderId(order)}
												</p>

												<p className="mt-0.5 text-[10px] text-gray-500">
													{formatDate(
														order.createdAt
													)}
												</p>
											</td>

											{/* CUSTOMER */}
											<td className="px-2 py-2">
												<div className="max-w-[160px]">
													<p className="truncate text-sm font-medium text-white">
														{customerName}
													</p>

													{phone && (
														<p className="mt-0.5 text-[10px] text-gray-400">
															{phone}
														</p>
													)}

													{customer.email && (
														<p className="truncate text-[10px] text-gray-500">
															{customer.email}
														</p>
													)}
												</div>
											</td>

											{/* LOCATION */}
											<td className="px-2 py-2">
												<div className="flex items-center gap-1.5">
													<MapPin
														size={13}
														className="shrink-0 text-gray-400"
													/>

													<span className="text-sm leading-4 text-gray-300">
														{order.shippingAddress
															?.thana || '—'}
														<br />
														{order.shippingAddress
															?.city || '—'}
													</span>
												</div>
											</td>

											{/* SUBTOTAL */}
											<td className="whitespace-nowrap px-2 py-2">
												<span className="text-sm font-semibold text-white">
													{formatCurrency(
														order.subtotal
													)}
												</span>
											</td>

											{/* SHIPPING */}
											<td className="whitespace-nowrap px-2 py-2">
												<span className="text-sm font-semibold text-white">
													{formatCurrency(
														order.shippingFee
													)}
												</span>
											</td>

											{/* DISCOUNT */}
											<td className="whitespace-nowrap px-2 py-2">
												<span className="text-sm font-semibold text-red-400">
													{formatCurrency(discount)}
												</span>
											</td>

											{/* TOTAL */}
											<td className="whitespace-nowrap px-2 py-2">
												<span className="text-sm font-semibold text-white">
													{formatCurrency(total)}
												</span>
											</td>

											{/* PAYMENT */}
											<td className="min-w-[125px]  py-2">
												<div className="mb-1 text-[10px] text-gray-400">
													{order.payment?.method ||
														'COD'}
												</div>

												<PaymentDisplay
													order={order}
													onEdit={setPaymentOrder}
												/>
											</td>

											{/* ORDER STATUS */}
											<td className="px-2 py-2">
												<div className="flex min-w-[120px] flex-col items-start gap-1.5">
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
														className="h-7 w-full rounded-md border border-white/10 bg-[#0d0d11] px-1.5 text-sm text-gray-300 outline-none disabled:opacity-50">
														{ORDER_STATUSES.map(
															(option) => (
																<option
																	key={option}
																	value={
																		option
																	}>
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
											<td className="px-2 py-2">
												<div className="flex items-center gap-1">
													{/* DISCOUNT */}
													<button
														type="button"
														onClick={() =>
															setDiscountOrder(
																order
															)
														}
														disabled={
															order.payment
																?.status ===
																'paid' ||
															[
																'cancelled',
																'return',
															].includes(
																order.status
															)
														}
														title={
															Number(
																order.adminDiscount ||
																	0
															) > 0
																? 'Edit Discount'
																: 'Add Discount'
														}
														className="inline-flex cursor-pointer items-center justify-center rounded-md bg-green-900/40 p-1.5 text-green-300 transition-colors hover:bg-green-900/70 disabled:cursor-not-allowed disabled:opacity-50">
														<BadgePercent
															size={14}
														/>
													</button>

													{/* VIEW */}
													<button
														type="button"
														title="View order"
														onClick={() =>
															setSelectedId(
																order._id
															)
														}
														className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white/10 p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white">
														<Eye size={14} />
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
														className="cursor-pointer rounded-md border border-green-500/20 bg-green-500/5 p-1.5 text-green-500 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40">
														<MessageCircle
															size={14}
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
														className="cursor-pointer rounded-md border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40">
														{busy ? (
															<LoaderCircle
																size={14}
																className="animate-spin"
															/>
														) : (
															<Trash2 size={14} />
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

					{/* PAGINATION */}

					<div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-gray-400">
							Page{' '}
							<span className="font-medium text-white">
								{safePage}
							</span>{' '}
							of{' '}
							<span className="font-medium text-white">
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
								className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
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
								className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">
								Next
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ORDER DETAILS MODAL */}

			<AdminOrderDetailsModal
				isOpen={Boolean(selectedOrder)}
				order={selectedOrder}
				onClose={() => setSelectedId(null)}
				onUpdate={handleUpdate}
				isUpdating={
					selectedOrder ? busyId === selectedOrder._id : false
				}
			/>

			{/* DISCOUNT MODAL */}

			{discountOrder && (
				<AdminDiscountModal
					order={discountOrder}
					onClose={() => setDiscountOrder(null)}
				/>
			)}
			{/* PAYMENT MODAL */}

			{paymentOrder && (
				<PaymentEditorModal
					order={paymentOrder}
					onClose={() => setPaymentOrder(null)}
					onSave={handleUpdate}
					busy={busyId === paymentOrder._id}
				/>
			)}
		</div>
	);
}

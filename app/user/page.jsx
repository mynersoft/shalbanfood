
'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    CalendarDays,
    Package,
    CheckCircle2,
    Clock3,
    XCircle,
    ChevronRight,
    Eye,
    ShoppingBag,
    Wallet,
    Truck,
    RefreshCw,
    ShoppingCart,
    ArrowUpRight,
    ReceiptText,
} from 'lucide-react';

import OrderDetailsModal from '@/components/Order/OrderDetailsModal';
import useLoginUser from '@/hooks/useAuth';
import { useUserOrders } from '@/hooks/useOrder';
import ViewInvoice from '@/components/user/ViewInvoice';

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: 'bg-amber-50 text-amber-700 ring-amber-200',
        icon: Clock3,
    },
    processing: {
        label: 'Processing',
        color: 'bg-blue-50 text-blue-700 ring-blue-200',
        icon: RefreshCw,
    },
    shipped: {
        label: 'Shipped',
        color: 'bg-violet-50 text-violet-700 ring-violet-200',
        icon: Truck,
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-50 text-red-700 ring-red-200',
        icon: XCircle,
    },
};

const FILTERS = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
];

const formatCurrency = (amount) => {
    const value = Number(amount ?? 0);

    if (!Number.isFinite(value)) {
        return '৳0.00';
    }

    return `৳${value.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return 'Date unavailable';
    }

    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};


const normalizeStatus = (status) => {
    const value = String(status || 'pending').toLowerCase().trim();

    if (value === 'complete' || value === 'completed') {
        return 'delivered';
    }

    if (value === 'in transit' || value === 'in_transit') {
        return 'shipped';
    }

    if (value === 'processing' || value === 'shipped') {
        return value;
    }

    if (value === 'delivered') {
        return value;
    }

    if (
        ['cancelled', 'canceled', 'failed'].includes(value)
    ) {
        return 'cancelled';
    }

    return 'pending';
};

const normalizeItems = (order) => {
    if (Array.isArray(order?.itemsList)) return order.itemsList;
    if (Array.isArray(order?.items)) return order.items;
    if (Array.isArray(order?.orderItems)) return order.orderItems;

    return [];
};

const getOrderId = (order) =>
    order?.orderNumber ||
    order?.invoiceNumber ||
    order?.orderId ||
    order?.id ||
    order?._id ||
    'N/A';

const getOrderDate = (order) =>
    order?.createdAt ||
    order?.created_at ||
    order?.date ||
    null;

const getOrderTotal = (order) => {
    const value = Number(
        order?.grandTotal ??
        order?.total ??
        order?.totalAmount ??
        0
    );

    return Number.isFinite(value) ? value : 0;
};

const getItemName = (item) =>
    item?.name ||
    item?.productName ||
    item?.title ||
    item?.product?.name ||
    'Product';

const getItemQuantity = (item) => {
    const quantity = Number(
        item?.quantity ?? item?.qty ?? item?.count ?? 1
    );

    return Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 1;
};

const getItemPrice = (item) => {
    const price = Number(
        item?.price ??
        item?.unitPrice ??
        item?.product?.price ??
        0
    );

    return Number.isFinite(price) ? price : 0;
};

// --------------------------------------------------
// Reusable components
// --------------------------------------------------

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[normalizeStatus(status)];
    const Icon = config.icon;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                whitespace-nowrap rounded-full px-2.5 py-1
                text-xs font-semibold ring-1 ring-inset
                ${config.color}
            `}
        >
            <Icon size={13} />
            {config.label}
        </span>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
    delay = 0,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="
                min-w-0 rounded-2xl border border-slate-200
                bg-white p-4 shadow-sm
                sm:p-5
            "
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                        {title}
                    </p>

                    <p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        {value}
                    </p>

                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`
                        flex h-10 w-10 shrink-0 items-center
                        justify-center rounded-xl sm:h-11 sm:w-11
                        ${iconClass}
                    `}
                >
                    <Icon size={21} />
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ searchQuery, selectedFilter, onReset }) {
    const hasFilters =
        Boolean(searchQuery.trim()) || selectedFilter !== 'all';

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag
                    size={30}
                    className="text-slate-400"
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
                {hasFilters
                    ? 'No matching orders'
                    : 'No orders yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {hasFilters
                    ? 'Try another search term or change the selected filter.'
                    : 'Your order history will appear here when you place your first order.'}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="
                        mt-5 inline-flex min-h-11 items-center
                        justify-center gap-2 rounded-xl
                        bg-slate-900 px-5 py-2.5
                        text-sm font-semibold text-white
                        transition hover:bg-slate-700
                        focus:outline-none focus:ring-2
                        focus:ring-slate-400 focus:ring-offset-2
                    "
                >
                    <RefreshCw size={15} />
                    Clear filters
                </button>
            )}
        </div>
    );
}

// --------------------------------------------------
// Main component
// --------------------------------------------------

export default function OrderHistory() {
    const { user } = useLoginUser();

    const userId = user?._id || user?.id;

    const {
        data,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useUserOrders(userId);

   

    const orders = useMemo(() => {
        const list = Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data)
                ? data
                : [];

        return list;
    }, [data]);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --------------------------------------------------
    // Summary statistics
    // --------------------------------------------------

    const stats = useMemo(() => {
        const delivered = orders.filter(
            (order) => normalizeStatus(order?.status) === 'delivered'
        ).length;

        const inProgress = orders.filter((order) =>
            ['processing', 'shipped'].includes(
                normalizeStatus(order?.status)
            )
        ).length;

        const totalValue = orders.reduce((sum, order) => {
            // Cancelled orders are excluded from total order value.
            if (normalizeStatus(order?.status) === 'cancelled') {
                return sum;
            }

            return sum + getOrderTotal(order);
        }, 0);

        return {
            total: orders.length,
            delivered,
            inProgress,
            totalValue,
        };
    }, [orders]);

    // --------------------------------------------------
    // Filter counts
    // --------------------------------------------------

    const filterCounts = useMemo(() => {
        const counts = { all: orders.length };

        FILTERS.forEach(({ id }) => {
            if (id === 'all') return;

            counts[id] = orders.filter(
                (order) => normalizeStatus(order?.status) === id
            ).length;
        });

        return counts;
    }, [orders]);

    // --------------------------------------------------
    // Search and filter
    // --------------------------------------------------

    const filteredOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return orders.filter((order) => {
            const status = normalizeStatus(order?.status);

            if (
                selectedFilter !== 'all' &&
                status !== selectedFilter
            ) {
                return false;
            }

            if (!query) return true;

            const orderId = String(getOrderId(order)).toLowerCase();

            const items = normalizeItems(order);

            const productMatch = items.some((item) =>
                getItemName(item).toLowerCase().includes(query)
            );

            return orderId.includes(query) || productMatch;
        });
    }, [orders, searchQuery, selectedFilter]);

    // --------------------------------------------------
    // Actions
    // --------------------------------------------------

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedFilter('all');
    };

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl px-1 py-6 sm:px-2 sm:py-8">
                <div className="mb-6 space-y-2">
                    <div className="h-7 w-44 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200 sm:h-32"
                        />
                    ))}
                </div>

                <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                        Loading your orders...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Error
    // --------------------------------------------------

    if (isError) {
        return (
            <div className="mx-auto w-full max-w-7xl px-1 py-8">
                <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center sm:px-10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                        <XCircle size={28} className="text-red-500" />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Unable to load your orders
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Please check your internet connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch?.()}
                        disabled={!refetch || isFetching}
                        className="
                            mt-5 inline-flex min-h-11 items-center
                            justify-center gap-2 rounded-xl
                            bg-slate-900 px-5 py-2.5
                            text-sm font-semibold text-white
                            hover:bg-slate-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? 'animate-spin' : ''}
                        />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Main UI
    // --------------------------------------------------

    return (
		<div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 py-3 sm:space-y-6 sm:py-5">
			{/* Page heading */}

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
							<ReceiptText size={21} />
						</div>

						<div>
							<h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
								My Orders
							</h1>

							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								View and manage your order history.
							</p>
						</div>
					</div>
				</div>

				<button
					type="button"
					onClick={() => refetch?.()}
					disabled={!refetch || isFetching}
					className="
                        inline-flex min-h-10 w-full items-center
                        justify-center gap-2 rounded-xl
                        border border-slate-200 bg-white
                        px-4 py-2 text-sm font-semibold
                        text-slate-700 shadow-sm transition
                        hover:bg-slate-50 disabled:opacity-60
                        sm:w-auto
                    ">
					<RefreshCw
						size={15}
						className={isFetching ? 'animate-spin' : ''}
					/>
					Refresh orders
				</button>
			</div>

			{/* Summary cards */}

			<section
				aria-label="Order summary"
				className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
				<StatCard
					title="Total Orders"
					value={stats.total}
					subtitle="All placed orders"
					icon={ShoppingBag}
					iconClass="bg-blue-50 text-blue-600"
				/>

				<StatCard
					title="Delivered"
					value={stats.delivered}
					subtitle="Successfully delivered"
					icon={CheckCircle2}
					iconClass="bg-emerald-50 text-emerald-600"
					delay={0.05}
				/>

				<StatCard
					title="In Progress"
					value={stats.inProgress}
					subtitle="Processing or shipped"
					icon={Truck}
					iconClass="bg-violet-50 text-violet-600"
					delay={0.1}
				/>

				<StatCard
					title="Order Value"
					value={formatCurrency(stats.totalValue)}
					subtitle="Excluding cancelled orders"
					icon={Wallet}
					iconClass="bg-amber-50 text-amber-600"
					delay={0.15}
				/>
			</section>

			{/* Search and filters */}

			<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="space-y-4 p-4 sm:p-5">
					<div>
						<label
							htmlFor="order-search"
							className="mb-2 block text-sm font-semibold text-slate-800">
							Find an order
						</label>

						<div className="relative">
							<Search
								size={19}
								className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
							/>

							<input
								id="order-search"
								type="search"
								value={searchQuery}
								onChange={(event) =>
									setSearchQuery(event.target.value)
								}
								placeholder="Search by order ID or product name..."
								className="
                                    min-h-12 w-full rounded-xl
                                    border border-slate-200
                                    bg-slate-50 py-3 pl-11 pr-4
                                    text-sm text-slate-900
                                    outline-none transition
                                    placeholder:text-slate-400
                                    focus:border-emerald-500
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-emerald-500/10
                                "
							/>
						</div>
					</div>

					<div>
						<div className="mb-3 flex items-center gap-2">
							<Filter size={16} className="text-slate-500" />

							<h2 className="text-sm font-semibold text-slate-800">
								Filter by status
							</h2>
						</div>

						<div
							className="
                                -mx-1 flex gap-2 overflow-x-auto
                                px-1 pb-2
                            "
							role="group"
							aria-label="Filter orders by status">
							{FILTERS.map((filter) => {
								const active = selectedFilter === filter.id;

								return (
									<button
										key={filter.id}
										type="button"
										onClick={() =>
											setSelectedFilter(filter.id)
										}
										aria-pressed={active}
										className={`
                                            inline-flex min-h-10 shrink-0
                                            items-center gap-2
                                            rounded-xl border px-3.5 py-2
                                            text-xs font-semibold
                                            transition sm:text-sm
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-emerald-500
                                            focus:ring-offset-2
                                            ${
												active
													? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
													: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
											}
                                        `}>
										{filter.label}

										<span
											className={`
                                                rounded-md px-1.5 py-0.5
                                                text-[11px] tabular-nums
                                                ${
													active
														? 'bg-white/20 text-white'
														: 'bg-slate-100 text-slate-600'
												}
                                            `}>
											{filterCounts[filter.id] ?? 0}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
					<p className="text-xs text-slate-500 sm:text-sm">
						Showing{' '}
						<span className="font-semibold text-slate-800">
							{filteredOrders.length}
						</span>{' '}
						of{' '}
						<span className="font-semibold text-slate-800">
							{orders.length}
						</span>{' '}
						orders
					</p>

					{(searchQuery || selectedFilter !== 'all') && (
						<button
							type="button"
							onClick={handleResetFilters}
							className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 sm:text-sm">
							Clear filters
						</button>
					)}
				</div>
			</section>

			{/* Orders list */}

			<section aria-label="Order history" className="space-y-4">
				{filteredOrders.length === 0 ? (
					<EmptyState
						searchQuery={searchQuery}
						selectedFilter={selectedFilter}
						onReset={handleResetFilters}
					/>
				) : (
					filteredOrders.map((order, index) => {
						const items = normalizeItems(order);
						const orderId = getOrderId(order);
						const status = normalizeStatus(order?.status);
						const orderTotal = getOrderTotal(order);
						const orderDate = getOrderDate(order);

						const key =
							order?._id ||
							order?.id ||
							order?.orderId ||
							`${orderId}-${index}`;

						return (
							<motion.article
								key={key}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.25,
									delay: Math.min(index * 0.03, 0.15),
								}}
								className="
                                    overflow-hidden rounded-2xl
                                    border border-slate-200
                                    bg-white shadow-sm
                                    transition-shadow hover:shadow-md
                                ">
								{/* Order header */}

								<div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
												<ShoppingCart size={18} />
											</span>

											<div className="min-w-0">
												<p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
													Invoice No
												</p>

												<h3 className="break-all text-sm font-bold text-slate-900 sm:text-base">
													{order.invoiceNo}
												</h3>
											</div>

											<div className="ml-auto lg:ml-2">
												<StatusBadge status={status} />
											</div>
										</div>

										<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm">
											<span className="inline-flex items-center gap-1.5">
												<CalendarDays
													size={15}
													className="shrink-0"
												/>
												{formatDate(orderDate)}
											</span>

											<span className="inline-flex items-center gap-1.5">
												<Package
													size={15}
													className="shrink-0"
												/>
												{items.length}{' '}
												{items.length === 1
													? 'item'
													: 'items'}
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:min-w-52 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
										<div>
											<p className="text-xs text-slate-500">
												Order total
											</p>

											<p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
												{formatCurrency(orderTotal)}
											</p>
										</div>

										<button
											type="button"
											onClick={() =>
												handleViewOrder(order)
											}
											className="
                                                inline-flex min-h-10
                                                shrink-0 items-center
                                                justify-center gap-2
                                                rounded-xl bg-emerald-700
                                                px-3.5 py-2 text-xs
                                                font-semibold text-white
                                                transition
                                                hover:bg-emerald-800
                                                focus:outline-none
                                                focus:ring-2
                                                focus:ring-emerald-500
                                                focus:ring-offset-2
                                                sm:text-sm
                                            ">
											<Eye size={16} />
											View Details
											<ChevronRight size={15} />
										</button>
									</div>
								</div>

								{/* Product list */}

								<div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5">
									<div className="mb-3 flex items-center justify-between gap-2">
										<h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
											Ordered items
										</h4>

										{items.length > 3 && (
											<span className="text-xs text-slate-500">
												{items.length} products
											</span>
										)}
									</div>

									{items.length === 0 ? (
										<p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
											Product details are unavailable for
											this order.
										</p>
									) : (
										<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
											{items
												.slice(0, 3)
												.map((item, itemIndex) => (
													<div
														key={
															item?._id ||
															item?.productId ||
															`${orderId}-${itemIndex}`
														}
														className="
                                                            flex min-w-0
                                                            items-center gap-3
                                                            rounded-xl border
                                                            border-slate-100
                                                            bg-white p-3
                                                        ">
														<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
															<Package
																size={19}
															/>
														</div>

														<div className="min-w-0 flex-1">
															<p className="break-words text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
																{getItemName(
																	item
																)}
															</p>

															<p className="mt-1 text-xs text-slate-500">
																Qty:{' '}
																{getItemQuantity(
																	item
																)}
																{' × '}
																{formatCurrency(
																	getItemPrice(
																		item
																	)
																)}
															</p>
														</div>
													</div>
												))}

											{items.length > 3 && (
												<button
													type="button"
													onClick={() =>
														handleViewOrder(order)
													}
													className="
                                                        flex min-h-16
                                                        items-center
                                                        justify-center gap-2
                                                        rounded-xl border
                                                        border-dashed
                                                        border-slate-300
                                                        bg-white px-3 py-3
                                                        text-xs font-semibold
                                                        text-emerald-700
                                                        transition
                                                        hover:bg-emerald-50
                                                    ">
													+{items.length - 3} more
													items
													<ArrowUpRight size={15} />
												</button>
											)}
										</div>
									)}

									{/* Tracking and delivery */}

									{(order?.trackingNumber ||
										order?.deliveryDate ||
										order?.estimatedDelivery) && (
										<div className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
											{order?.trackingNumber && (
												<div className="flex min-w-0 items-start gap-2 text-xs sm:text-sm">
													<Truck
														size={16}
														className="mt-0.5 shrink-0 text-slate-500"
													/>

													<div className="min-w-0">
														<p className="text-slate-500">
															Tracking number
														</p>

														<p className="break-all font-semibold text-slate-800">
															{
																order.trackingNumber
															}
														</p>
													</div>
												</div>
											)}

											{order?.deliveryDate && (
												<p className="text-xs text-emerald-700 sm:text-sm">
													Delivered:{' '}
													<span className="font-semibold">
														{formatDate(
															order.deliveryDate
														)}
													</span>
												</p>
											)}

											{!order?.deliveryDate &&
												order?.estimatedDelivery && (
													<p className="text-xs text-slate-600 sm:text-sm">
														Estimated delivery:{' '}
														<span className="font-semibold">
															{formatDate(
																order.estimatedDelivery
															)}
														</span>
													</p>
												)}
										</div>
									)}
								</div>
							</motion.article>
						);
					})
				)}
			</section>

			{/* Order details modal */}
			{isModalOpen && selectedOrder && (
				<ViewInvoice
					order={selectedOrder}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	);
}

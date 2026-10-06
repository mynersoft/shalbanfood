'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Box,
    CheckCircle2,
    Clock3,
    DollarSign,
    Eye,
    Package,
    Plus,
    RefreshCw,
    ShoppingCart,
    Truck,
    Users,
    AlertTriangle,
    XCircle,
} from 'lucide-react';

import { useDashboardOverview } from '@/hooks/useDashboard';
import SalesCompare from "./components/overview/SalesCompare.jsx";


// ======================================================
// HELPERS
// ======================================================

function formatCurrency(value = 0) {
    return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

function getOrderAmount(order) {
    return Number(
        order?.totalAmount ??
        order?.totalPrice ??
        order?.grandTotal ??
        order?.amount ??
        order?.total ??
        0
    );
}

function getOrderStatus(order) {
    return String(order?.status || 'pending').toLowerCase();
}

function getCustomerName(order) {
    return (
        order?.customerName ||
        order?.name ||
        order?.shippingAddress?.name ||
        order?.user?.name ||
        order?.user?.email ||
        'Customer'
    );
}

function getOrderId(order) {
    return (
        order?._id ||
        order?.id ||
        order?.orderId ||
        ''
    );
}

function getOrderItems(order) {
    if (Array.isArray(order?.items)) {
        return order.items;
    }

    if (Array.isArray(order?.products)) {
        return order.products;
    }

    return [];
}

function getItemName(item) {
    return (
        item?.name ||
        item?.productName ||
        item?.product?.name ||
        'Product'
    );
}

function getItemQuantity(item) {
    return Number(
        item?.quantity ??
        item?.qty ??
        1
    );
}

function getProductStock(product) {
    return Number(product?.stock || 0);
}

function getProductSoldCount(product) {
    return Number(
        product?.soldCount ||
        product?.salesCount ||
        0
    );
}


// ======================================================
// STATUS CONFIG
// ======================================================

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: Clock3,
        className:
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },

    processing: {
        label: 'Processing',
        icon: RefreshCw,
        className:
            'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },

    shipped: {
        label: 'Shipped',
        icon: Truck,
        className:
            'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },

    delivered: {
        label: 'Delivered',
        icon: CheckCircle2,
        className:
            'bg-green-500/10 text-green-400 border-green-500/20',
    },

    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        className:
            'bg-red-500/10 text-red-400 border-red-500/20',
    },
};


// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function DashboardPage() {
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useDashboardOverview();

    const orders = data?.orders || [];
    const products = data?.products || [];
    const users = data?.users || [];


    // ==================================================
    // CALCULATE STATISTICS
    // ==================================================

    const stats = useMemo(() => {
        const totalSales = orders.reduce(
            (sum, order) => {
                const status =
                    getOrderStatus(order);

                // Cancelled order sales বাদ
                if (status === 'cancelled') {
                    return sum;
                }

                return (
                    sum +
                    getOrderAmount(order)
                );
            },
            0
        );

        const pendingOrders =
            orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'pending'
            ).length;

        const deliveredOrders =
            orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'delivered'
            ).length;

        const cancelledOrders =
            orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'cancelled'
            ).length;

        const lowStockProducts =
            products.filter(
                (product) =>
                    getProductStock(product) > 0 &&
                    getProductStock(product) <= 5
            ).length;

        const outOfStockProducts =
            products.filter(
                (product) =>
                    getProductStock(product) <= 0
            ).length;

        return {
            totalSales,
            totalOrders: orders.length,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            customers: users.length,
            products: products.length,
            lowStockProducts,
            outOfStockProducts,
        };
    }, [orders, products, users]);


    // ==================================================
    // RECENT ORDERS
    // ==================================================

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            )
            .slice(0, 6);
    }, [orders]);


    // ==================================================
    // ORDER STATUS
    // ==================================================

    const orderStatuses = useMemo(() => {
        return {
            pending: orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'pending'
            ).length,

            processing: orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'processing'
            ).length,

            shipped: orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'shipped'
            ).length,

            delivered: orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'delivered'
            ).length,

            cancelled: orders.filter(
                (order) =>
                    getOrderStatus(order) ===
                    'cancelled'
            ).length,
        };
    }, [orders]);


    // ==================================================
    // BEST SELLING PRODUCTS
    // ==================================================

    const bestSellingProducts =
        useMemo(() => {
            return [...products]
                .sort(
                    (a, b) =>
                        getProductSoldCount(b) -
                        getProductSoldCount(a)
                )
                .slice(0, 5);
        }, [products]);


    // ==================================================
    // LOW STOCK
    // ==================================================

    const lowStockProducts =
        useMemo(() => {
            return [...products]
                .filter(
                    (product) =>
                        getProductStock(product) <=
                        5
                )
                .sort(
                    (a, b) =>
                        getProductStock(a) -
                        getProductStock(b)
                )
                .slice(0, 5);
        }, [products]);


    // ==================================================
    // SALES LAST 7 DAYS
    // ==================================================

    const salesChart = useMemo(() => {
        const today = new Date();

        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);

            date.setDate(
                today.getDate() - i
            );

            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);

            nextDate.setDate(
                date.getDate() + 1
            );

            const amount = orders
                .filter((order) => {
                    const status =
                        getOrderStatus(order);

                    if (
                        status ===
                        'cancelled'
                    ) {
                        return false;
                    }

                    const created =
                        new Date(
                            order.createdAt
                        );

                    return (
                        created >= date &&
                        created < nextDate
                    );
                })
                .reduce(
                    (sum, order) =>
                        sum +
                        getOrderAmount(
                            order
                        ),
                    0
                );

            days.push({
                label:
                    date.toLocaleDateString(
                        'en-US',
                        {
                            weekday:
                                'short',
                        }
                    ),

                amount,
            });
        }

        return days;
    }, [orders]);


    const maxSales = Math.max(
        ...salesChart.map(
            (item) => item.amount
        ),
        1
    );


    // ==================================================
    // LOADING
    // ==================================================

    if (isLoading) {
        return <DashboardSkeleton />;
    }


    // ==================================================
    // ERROR
    // ==================================================

    if (isError) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#151821] p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        <AlertTriangle
                            size={26}
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-white">
                        Dashboard data failed
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        {error?.message ||
                            'Something went wrong while loading dashboard data.'}
                    </p>

                    <button
                        onClick={() =>
                            refetch()
                        }
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        <RefreshCw
                            size={16}
                        />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    // ==================================================
    // UI
    // ==================================================

    return (
        <div className="min-h-screen pb-10 text-white">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold md:text-3xl">
                            Dashboard
                        </h1>

                        {isFetching && (
                            <RefreshCw
                                size={17}
                                className="animate-spin text-gray-500"
                            />
                        )}
                    </div>

                    <p className="mt-1 text-sm text-gray-400">
                        Welcome back! Here's what's happening with Shalban Food.
                    </p>
                </div>


                <button
                    onClick={() =>
                        refetch()
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151821] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                >
                    <RefreshCw
                        size={16}
                        className={
                            isFetching
                                ? 'animate-spin'
                                : ''
                        }
                    />

                    Refresh
                </button>
            </div>


            {/* ==========================================
                QUICK ACTIONS
            ========================================== */}

            <div className="mb-6 flex flex-wrap gap-2">

                <Link
                    href="/dashboard/products/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                    <Plus size={16} />
                    Add Product
                </Link>

                <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151821] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                >
                    <ShoppingCart
                        size={16}
                    />
                    Orders
                </Link>

                <Link
                    href="/dashboard/products"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151821] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                >
                    <Package size={16} />
                    Products
                </Link>
            </div>


            {/* ==========================================
                STAT CARDS
            ========================================== */}

<SalesCompare/>



            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Sales"
                    value={formatCurrency(
                        stats.totalSales
                    )}
                    icon={DollarSign}
                    iconClass="bg-green-500/10 text-green-400"
                    href="/dashboard/orders"
                />

                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    iconClass="bg-blue-500/10 text-blue-400"
                    href="/dashboard/orders"
                />

                <StatCard
                    title="Customers"
                    value={stats.customers}
                    icon={Users}
                    iconClass="bg-purple-500/10 text-purple-400"
                    href="/dashboard/users"
                />

                <StatCard
                    title="Products"
                    value={stats.products}
                    icon={Package}
                    iconClass="bg-orange-500/10 text-orange-400"
                    href="/dashboard/products"
                />

            </div>


            {/* ==========================================
                SECONDARY STATS
            ========================================== */}

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <MiniStat
                    title="Pending Orders"
                    value={
                        stats.pendingOrders
                    }
                    icon={Clock3}
                    iconClass="text-yellow-400"
                    href="/dashboard/orders?status=pending"
                />

                <MiniStat
                    title="Delivered"
                    value={
                        stats.deliveredOrders
                    }
                    icon={CheckCircle2}
                    iconClass="text-green-400"
                    href="/dashboard/orders?status=delivered"
                />

                <MiniStat
                    title="Low Stock"
                    value={
                        stats.lowStockProducts
                    }
                    icon={AlertTriangle}
                    iconClass="text-orange-400"
                    href="/dashboard/inventory"
                />

                <MiniStat
                    title="Out of Stock"
                    value={
                        stats.outOfStockProducts
                    }
                    icon={XCircle}
                    iconClass="text-red-400"
                    href="/dashboard/inventory"
                />

            </div>


            {/* ==========================================
                SALES + ORDER STATUS
            ========================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">

                {/* SALES */}

                <div className="rounded-2xl border border-white/10 bg-[#151821]">

                    <div className="flex items-center justify-between border-b border-white/10 p-5">

                        <div>
                            <h2 className="font-semibold">
                                Sales Overview
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Sales from the last 7 days
                            </p>
                        </div>

                        <BarChart3
                            size={20}
                            className="text-blue-400"
                        />
                    </div>


                    <div className="p-5">

                        <div className="flex h-64 items-end gap-2 sm:gap-4">

                            {salesChart.map(
                                (
                                    item
                                ) => {
                                    const height =
                                        item.amount >
                                        0
                                            ? Math.max(
                                                  (item.amount /
                                                      maxSales) *
                                                      100,
                                                  6
                                              )
                                            : 3;

                                    return (
                                        <div
                                            key={
                                                item.label
                                            }
                                            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                        >

                                            <div className="group relative flex h-full w-full items-end justify-center">

                                                <div
                                                    className="w-full max-w-[42px] rounded-t-lg bg-blue-600/80 transition-all duration-300 group-hover:bg-blue-500"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                />

                                                {item.amount >
                                                    0 && (
                                                    <div className="absolute bottom-[calc(var(--bar-height)+8px)] hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#0f1117] px-2 py-1 text-[10px] text-gray-200 shadow-xl group-hover:block">
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-gray-500">
                                                {
                                                    item.label
                                                }
                                            </span>
                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>
                </div>


                {/* ORDER STATUS */}

                <div className="rounded-2xl border border-white/10 bg-[#151821]">

                    <div className="border-b border-white/10 p-5">
                        <h2 className="font-semibold">
                            Order Status
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Current order breakdown
                        </p>
                    </div>


                    <div className="space-y-3 p-5">

                        {Object.entries(
                            orderStatuses
                        ).map(
                            ([
                                status,
                                count,
                            ]) => {
                                const config =
                                    STATUS_CONFIG[
                                        status
                                    ];

                                const Icon =
                                    config.icon;

                                const percentage =
                                    stats.totalOrders >
                                    0
                                        ? Math.round(
                                              (count /
                                                  stats.totalOrders) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <Link
                                        key={
                                            status
                                        }
                                        href={`/dashboard/orders?status=${status}`}
                                        className="block rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.04]"
                                    >

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.className}`}
                                                >
                                                    <Icon
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {
                                                            config.label
                                                        }
                                                    </p>

                                                    <p className="text-[11px] text-gray-500">
                                                        {
                                                            percentage
                                                        }
                                                        % of orders
                                                    </p>
                                                </div>

                                            </div>

                                            <span className="text-lg font-bold">
                                                {
                                                    count
                                                }
                                            </span>

                                        </div>

                                    </Link>
                                );
                            }
                        )}

                    </div>
                </div>

            </div>


            {/* ==========================================
                RECENT ORDERS
            ========================================== */}

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#151821]">

                <div className="flex items-center justify-between border-b border-white/10 p-5">

                    <div>
                        <h2 className="font-semibold">
                            Recent Orders
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Latest customer orders
                        </p>
                    </div>

                    <Link
                        href="/dashboard/orders"
                        className="inline-flex items-center gap-1 text-sm text-blue-400 transition hover:text-blue-300"
                    >
                        View All
                        <ArrowRight
                            size={15}
                        />
                    </Link>

                </div>


                {recentOrders.length ===
                0 ? (
                    <EmptyState
                        icon={ShoppingCart}
                        text="No orders yet"
                    />
                ) : (
                    <div className="divide-y divide-white/5">

                        {recentOrders.map(
                            (order) => {
                                const status =
                                    getOrderStatus(
                                        order
                                    );

                                const config =
                                    STATUS_CONFIG[
                                        status
                                    ] ||
                                    STATUS_CONFIG.pending;

                                const StatusIcon =
                                    config.icon;

                                const id =
                                    getOrderId(
                                        order
                                    );

                                return (
                                    <div
                                        key={
                                            id
                                        }
                                        className="flex flex-col gap-3 p-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                                <Package
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium">
                                                    #
                                                    {String(
                                                        id
                                                    ).slice(
                                                        -8
                                                    )}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-gray-500">
                                                    {
                                                        getCustomerName(
                                                            order
                                                        )
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex items-center justify-between gap-4 sm:justify-end">

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
                                            >
                                                <StatusIcon
                                                    size={
                                                        12
                                                    }
                                                />
                                                {
                                                    config.label
                                                }
                                            </span>

                                            <span className="min-w-[80px] text-right text-sm font-semibold">
                                                {formatCurrency(
                                                    getOrderAmount(
                                                        order
                                                    )
                                                )}
                                            </span>

                                            <Link
                                                href={`/dashboard/orders/${id}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white"
                                                title="View order"
                                            >
                                                <Eye
                                                    size={
                                                        15
                                                    }
                                                />
                                            </Link>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>


            {/* ==========================================
                INVENTORY + BEST SELLING
            ========================================== */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

                {/* LOW STOCK */}

                <div className="rounded-2xl border border-white/10 bg-[#151821]">

                    <div className="flex items-center justify-between border-b border-white/10 p-5">

                        <div>
                            <h2 className="font-semibold">
                                Low Stock Products
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Products that need attention
                            </p>
                        </div>

                        <Link
                            href="/dashboard/inventory"
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            Manage
                        </Link>

                    </div>


                    {lowStockProducts.length ===
                    0 ? (
                        <EmptyState
                            icon={
                                CheckCircle2
                            }
                            text="All products have healthy stock"
                        />
                    ) : (
                        <div className="divide-y divide-white/5">

                            {lowStockProducts.map(
                                (
                                    product
                                ) => {
                                    const stock =
                                        getProductStock(
                                            product
                                        );

                                    return (
                                        <div
                                            key={
                                                product._id
                                            }
                                            className="flex items-center justify-between gap-3 p-4"
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                                                    {product.image ? (
                                                        <img
                                                            src={
                                                                product.image
                                                            }
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Box
                                                            size={
                                                                18
                                                            }
                                                            className="text-gray-500"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {
                                                            product.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {
                                                            product.size?.value
                                                        }{' '}
                                                        {
                                                            product.size?.unit
                                                        }
                                                    </p>
                                                </div>

                                            </div>

                                            <span
                                                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                                    stock <=
                                                    0
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-orange-500/10 text-orange-400'
                                                }`}
                                            >
                                                {stock <=
                                                0
                                                    ? 'Out of stock'
                                                    : `${stock} left`}
                                            </span>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>


                {/* BEST SELLING */}

                <div className="rounded-2xl border border-white/10 bg-[#151821]">

                    <div className="flex items-center justify-between border-b border-white/10 p-5">

                        <div>
                            <h2 className="font-semibold">
                                Best Selling Products
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Top products by sales
                            </p>
                        </div>

                        <Link
                            href="/dashboard/products"
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            View Products
                        </Link>

                    </div>


                    {bestSellingProducts.length ===
                    0 ? (
                        <EmptyState
                            icon={Package}
                            text="No product sales data"
                        />
                    ) : (
                        <div className="divide-y divide-white/5">

                            {bestSellingProducts.map(
                                (
                                    product,
                                    index
                                ) => (
                                    <div
                                        key={
                                            product._id
                                        }
                                        className="flex items-center gap-3 p-4"
                                    >

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-gray-400">
                                            #
                                            {index +
                                                1}
                                        </div>

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                                            {product.image ? (
                                                <img
                                                    src={
                                                        product.image
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Package
                                                    size={
                                                        17
                                                    }
                                                    className="text-gray-500"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {
                                                    product.name
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Stock:{' '}
                                                {
                                                    product.stock
                                                }
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {
                                                    product.soldCount ??
                                                    0
                                                }
                                            </p>

                                            <p className="text-[10px] text-gray-500">
                                                sold
                                            </p>
                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

            </div>


            {/* ==========================================
                FOOTER SUMMARY
            ========================================== */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <SummaryCard
                    title="Delivered Orders"
                    value={
                        stats.deliveredOrders
                    }
                    icon={CheckCircle2}
                    className="text-green-400"
                />

                <SummaryCard
                    title="Cancelled Orders"
                    value={
                        stats.cancelledOrders
                    }
                    icon={XCircle}
                    className="text-red-400"
                />

                <SummaryCard
                    title="Inventory Value"
                    value={formatCurrency(
                        products.reduce(
                            (sum, product) =>
                                sum +
                                Number(
                                    product.stock ||
                                        0
                                ) *
                                    Number(
                                        product.regularPrice ||
                                            0
                                    ),
                            0
                        )
                    )}
                    icon={DollarSign}
                    className="text-blue-400"
                />

            </div>

        </div>
    );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
    title,
    value,
    icon: Icon,
    iconClass,
    href,
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-white/10 bg-[#151821] p-5 transition hover:border-white/20 hover:bg-[#181c26]"
        >

            <div className="flex items-center justify-between">

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>

                <ArrowUpRight
                    size={17}
                    className="text-gray-600 transition group-hover:text-gray-300"
                />

            </div>

            <p className="mt-5 text-sm text-gray-400">
                {title}
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {value}
            </h2>

        </Link>
    );
}


// ======================================================
// MINI STAT
// ======================================================

function MiniStat({
    title,
    value,
    icon: Icon,
    iconClass,
    href,
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151821] p-4 transition hover:border-white/20"
        >

            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${iconClass}`}
            >
                <Icon size={19} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                    {title}
                </p>

                <p className="mt-0.5 text-lg font-bold">
                    {value}
                </p>
            </div>

            <ArrowRight
                size={15}
                className="text-gray-600"
            />

        </Link>
    );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
    title,
    value,
    icon: Icon,
    className,
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151821] p-5">

            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${className}`}
            >
                <Icon size={19} />
            </div>

            <div>
                <p className="text-xs text-gray-500">
                    {title}
                </p>

                <p className="mt-1 text-lg font-bold">
                    {value}
                </p>
            </div>

        </div>
    );
}


// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
    icon: Icon,
    text,
}) {
    return (
        <div className="flex min-h-[150px] flex-col items-center justify-center p-6 text-center">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-500">
                <Icon size={20} />
            </div>

            <p className="mt-3 text-sm text-gray-500">
                {text}
            </p>

        </div>
    );
}


// ======================================================
// SKELETON
// ======================================================

function DashboardSkeleton() {
    return (
        <div className="animate-pulse pb-10">

            <div className="mb-7">
                <div className="h-8 w-40 rounded-lg bg-white/10" />
                <div className="mt-2 h-4 w-72 rounded bg-white/5" />
            </div>


            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({
                    length: 4,
                }).map((_, i) => (
                    <div
                        key={i}
                        className="h-36 rounded-2xl border border-white/10 bg-[#151821]"
                    />
                ))}
            </div>


            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({
                    length: 4,
                }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 rounded-2xl border border-white/10 bg-[#151821]"
                    />
                ))}
            </div>


            <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">

                <div className="h-[360px] rounded-2xl border border-white/10 bg-[#151821]" />

                <div className="h-[360px] rounded-2xl border border-white/10 bg-[#151821]" />

            </div>

        </div>
    );
}
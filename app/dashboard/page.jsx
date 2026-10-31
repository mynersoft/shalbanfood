'use client';

import Link from 'next/link';
import {
	Plus,
	ShoppingCart,
	Package,
	RefreshCw,
	AlertTriangle,
} from 'lucide-react';

import { useDashboardOverview } from '@/hooks/useDashboard';

import StatCards from './components/dashboard/StatCards';
import MiniStats from './components/dashboard/MiniStats';
import SalesChart from './components/dashboard/SalesChart';
import OrderStatus from './components/dashboard/OrderStatus';
import RecentOrders from './components/dashboard/RecentOrders';
import InventoryPanels from './components/dashboard/InventoryPanels';
import SummaryCards from './components/dashboard/SummaryCards';

export default function DashboardPage() {
	const { data, isLoading, isFetching, isError, error, refetch } =
		useDashboardOverview();

	if (isLoading) {
		return (
			<div className="grid gap-4 p-4 sm:grid-cols-2">
				{[1, 2, 3, 4].map((item) => (
					<div
						key={item}
						className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#151821]"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-[#151821] p-8 text-center text-white">
				<AlertTriangle className="mx-auto text-red-400" size={30} />
				<h2 className="mt-3 font-semibold">Dashboard data failed</h2>
				<p className="mt-2 text-sm text-gray-400">
					{error?.message || 'Dashboard load failed'}
				</p>
				<button
					onClick={() => refetch()}
					className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5">
					Try Again
				</button>
			</div>
		);
	}

	const summary = data?.summary || {};
	const orders = data?.orders || [];
	const statusCounts = data?.statusCounts || {};

	return (
		<main className="min-h-screen space-y-6 pb-10 text-white">
			<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold md:text-3xl">
							Dashboard
						</h1>
						{isFetching && (
							<RefreshCw
								size={16}
								className="animate-spin text-gray-400"
							/>
						)}
					</div>
					<p className="mt-1 text-sm text-gray-400">
						Shalban Food — business overview
					</p>
				</div>

				<button
					onClick={() => refetch()}
					disabled={isFetching}
					className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151821] px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">
					<RefreshCw
						size={16}
						className={isFetching ? 'animate-spin' : ''}
					/>
					Refresh
				</button>
			</header>

			<div className="flex flex-wrap gap-2">
				<Link
					href="/dashboard/products/create"
					className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium">
					<Plus size={16} /> Add Product
				</Link>
				<Link
					href="/dashboard/orders"
					className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151821] px-4 py-2.5 text-sm">
					<ShoppingCart size={16} /> Orders
				</Link>
			</div>

			<StatCards summary={summary} />
			<SummaryCards summary={summary} />

			{/* <MiniStats summary={summary} statusCounts={statusCounts} /> */}

			<div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
				<SalesChart data={data?.salesByDay || []} />
				<OrderStatus
					statusCounts={statusCounts}
					totalOrders={summary.totalOrders || 0}
				/>
			</div>

			<RecentOrders orders={orders} />

			<InventoryPanels
				lowStockProducts={data?.lowStockProducts || []}
				bestSellingProducts={data?.bestSellingProducts || []}
			/>
		</main>
	);
}

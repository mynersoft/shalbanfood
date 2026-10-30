'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
	Search,
	RefreshCw,
	Eye,
	ChevronLeft,
	ChevronRight,
	Users,
	ShoppingBag,
	UserPlus,
} from 'lucide-react';

import { useCustomers } from '@/hooks/useCustomers';

export default function CustomersPage() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	const limit = 10;

	const { data, isLoading, isFetching, isError, error, refetch } =
		useCustomers({
			page,
			limit,
			search,
		});

	const customers = data?.customers || [];

	const pagination = data?.pagination || {
		page: 1,
		totalPages: 1,
		totalCustomers: 0,
	};

	// Search debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(1);
			setSearch(searchInput.trim());
		}, 400);

		return () => clearTimeout(timer);
	}, [searchInput]);

	// Loading
	if (isLoading) {
		return (
			<div className="min-h-screen space-y-6 bg-transparent p-4 md:p-6 dark:text-slate-100">
				<div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((item) => (
						<div
							key={item}
							className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800"
						/>
					))}
				</div>

				<div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
			</div>
		);
	}

	// Error
	if (isError) {
		return (
			<div className="p-6">
				<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
					<h2 className="font-semibold text-red-700 dark:text-red-400">
						Failed to load customers
					</h2>

					<p className="mt-1 text-sm text-red-600 dark:text-red-300">
						{error?.message}
					</p>

					<button
						onClick={() => refetch()}
						className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen space-y-6 bg-transparent p-4 text-gray-900 md:p-6 dark:text-slate-100">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
						Customers
					</h1>

					<p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
						Manage your Shalban Food customers
					</p>
				</div>

				<div className="flex gap-2">
					{/* Refresh */}
					<button
						onClick={() => refetch()}
						disabled={isFetching}
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
						<RefreshCw
							size={16}
							className={isFetching ? 'animate-spin' : ''}
						/>
						Refresh
					</button>

					{/* Create Customer */}
					<Link
						href="/dashboard/customers/create"
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f5d3b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#194b30] dark:bg-[#276b47] dark:hover:bg-[#327f55]">
						<UserPlus size={16} />
						Create Customer
					</Link>
				</div>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<SummaryCard
					title="Total Customers"
					value={pagination.totalCustomers}
					icon={<Users size={20} />}
				/>

				<SummaryCard
					title="Current Page"
					value={customers.length}
					icon={<UserPlus size={20} />}
				/>

				<SummaryCard
					title="Page"
					value={`${pagination.page} / ${pagination.totalPages}`}
					icon={<ShoppingBag size={20} />}
				/>
			</div>

			{/* Search */}
			<div className="rounded-xl border border-gray-200 bg-gray-900 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="relative max-w-lg">
					<Search
						size={18}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
					/>

					<input
						type="text"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search name, phone or email..."
						className="w-full rounded-lg border border-gray-200 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#4d9a70] dark:focus:ring-[#4d9a70]/20"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[1050px]">
						<thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/70">
							<tr>
								<th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Customer
								</th>

								<th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Phone
								</th>

								<th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Email
								</th>

								<th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Orders
								</th>

								<th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Spent
								</th>

								<th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Last Order
								</th>

								<th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Status
								</th>

								<th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
									Action
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-100 dark:divide-slate-800">
							{customers.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className="px-5 py-16 text-center">
										<Users
											size={40}
											className="mx-auto text-gray-300 dark:text-slate-600"
										/>

										<p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
											No customers found
										</p>
									</td>
								</tr>
							) : (
								customers.map((customer) => (
									<tr
										key={customer._id}
										className="transition hover:bg-gray-50 dark:hover:bg-slate-800/60">
										{/* Customer */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f5d3b]/10 font-semibold text-[#1f5d3b] dark:bg-[#4d9a70]/15 dark:text-[#75bd91]">
													{customer.name
														?.charAt(0)
														?.toUpperCase() || 'C'}
												</div>

												<div>
													<p className="font-medium text-gray-900 dark:text-slate-100">
														{customer.name}
													</p>

													<p className="text-xs text-gray-400 dark:text-slate-500">
														Customer
													</p>
												</div>
											</div>
										</td>

										{/* Phone */}
										<td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
											{customer.phone || '—'}
										</td>

										{/* Email */}
										<td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
											{customer.email || '—'}
										</td>

										{/* Orders */}
										<td className="px-5 py-4 text-center text-sm text-gray-900 dark:text-slate-100">
											<span className="font-semibold">
												{customer.totalOrders}
											</span>
										</td>

										{/* Spent */}
										<td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-slate-100">
											৳
											{Number(
												customer.totalSpent || 0
											).toLocaleString('en-BD')}
										</td>

										{/* Last Order */}
										<td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
											{customer.lastOrder
												? new Date(
														customer.lastOrder
													).toLocaleDateString(
														'en-BD',
														{
															day: '2-digit',
															month: 'short',
															year: 'numeric',
														}
													)
												: 'No order'}
										</td>

										{/* Status */}
										<td className="px-5 py-4 text-center">
											<StatusBadge
												status={customer.status}
											/>
										</td>

										{/* Action */}
										<td className="px-5 py-4 text-center">
											<Link
												href={`/dashboard/customers/${customer._id}`}
												className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#1f5d3b]/30 hover:bg-gray-50 hover:text-[#1f5d3b] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#4d9a70]/40 dark:hover:bg-slate-700 dark:hover:text-[#75bd91]">
												<Eye size={16} />
												View
											</Link>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="flex flex-col gap-3 border-t border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
					<p className="text-sm text-gray-500 dark:text-slate-400">
						Showing {customers.length} of{' '}
						{pagination.totalCustomers} customers
					</p>

					<div className="flex items-center gap-2">
						<button
							disabled={page <= 1}
							onClick={() =>
								setPage((prev) => Math.max(prev - 1, 1))
							}
							className="rounded-lg border border-gray-200 bg-gray-900 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							<ChevronLeft size={18} />
						</button>

						<span className="px-2 text-sm text-gray-700 dark:text-slate-300">
							{pagination.page} / {pagination.totalPages}
						</span>

						<button
							disabled={page >= pagination.totalPages}
							onClick={() =>
								setPage((prev) =>
									Math.min(prev + 1, pagination.totalPages)
								)
							}
							className="rounded-lg border border-gray-200 bg-gray-900 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// Summary Card
function SummaryCard({ title, value, icon }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-gray-900 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-500 dark:text-slate-400">
						{title}
					</p>

					<h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
						{value}
					</h2>
				</div>

				<div className="rounded-lg bg-[#1f5d3b]/10 p-3 text-[#1f5d3b] dark:bg-[#4d9a70]/15 dark:text-[#75bd91]">
					{icon}
				</div>
			</div>
		</div>
	);
}

// Status Badge
function StatusBadge({ status }) {
	if (status === 'active') {
		return (
			<span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
				Active
			</span>
		);
	}

	return (
		<span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
			New
		</span>
	);
}

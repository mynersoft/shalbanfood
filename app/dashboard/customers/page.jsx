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

const BRAND_COLOR = '#1f5d3b';

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

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen space-y-6 bg-gray-950 p-4 text-white md:p-6">
				<div className="h-8 w-48 animate-pulse rounded-lg bg-gray-800" />

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((item) => (
						<div
							key={item}
							className="h-32 animate-pulse rounded-xl border border-gray-800 bg-gray-900"
						/>
					))}
				</div>

				<div className="h-96 animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className="min-h-screen bg-gray-950 p-4 text-white md:p-6">
				<div className="rounded-xl border border-red-900/60 bg-gray-900 p-6">
					<h2 className="font-semibold text-red-400">
						Failed to load customers
					</h2>

					<p className="mt-2 text-sm text-gray-400">
						{error?.message || 'Something went wrong.'}
					</p>

					<button
						onClick={() => refetch()}
						className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen space-y-6 bg-gray-950 p-4 text-gray-100 md:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-white">
						Customers
					</h1>

					<p className="mt-1 text-sm text-gray-400">
						Manage your Shalban Food customers
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => refetch()}
						disabled={isFetching}
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
						<RefreshCw
							size={16}
							className={isFetching ? 'animate-spin' : ''}
						/>
						Refresh
					</button>

					<Link
						href="/dashboard/customers/create"
						className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
						style={{ backgroundColor: BRAND_COLOR }}>
						<UserPlus size={16} />
						Create customer
					</Link>
				</div>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<SummaryCard
					title="Total Customers"
					value={pagination.totalCustomers}
					icon={<Users size={21} />}
				/>

				<SummaryCard
					title="Customers on Page"
					value={customers.length}
					icon={<UserPlus size={21} />}
				/>

				<SummaryCard
					title="Current Page"
					value={`${pagination.page} / ${Math.max(
						pagination.totalPages,
						1
					)}`}
					icon={<ShoppingBag size={21} />}
				/>
			</div>

			{/* Search */}
			<div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
				<div className="relative w-full max-w-lg">
					<Search
						size={18}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
					/>

					<input
						type="text"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search name, phone or email..."
						className="w-full rounded-lg border border-gray-700 bg-gray-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/30"
					/>
				</div>

				{isFetching && (
					<p className="mt-2 text-xs text-gray-500">
						Updating customers...
					</p>
				)}
			</div>

			{/* Customers table */}
			<div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[1050px] text-left">
						<thead className="border-b border-gray-800 bg-gray-800/70">
							<tr>
								{[
									'Customer',
									'Phone',
									'Email',
									'Orders',
									'Spent',
									'Last Order',
									'Status',
									'Action',
								].map((heading, index) => (
									<th
										key={heading}
										className={`px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400 ${
											index === 3 ||
											index === 6 ||
											index === 7
												? 'text-center'
												: index === 4
													? 'text-right'
													: ''
										}`}>
										{heading}
									</th>
								))}
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-800">
							{customers.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className="px-5 py-16 text-center">
										<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-800">
											<Users
												size={26}
												className="text-gray-500"
											/>
										</div>

										<p className="mt-3 text-sm font-medium text-gray-300">
											No customers found
										</p>

										<p className="mt-1 text-xs text-gray-500">
											Try another search term.
										</p>
									</td>
								</tr>
							) : (
								customers.map((customer) => (
									<tr
										key={customer._id}
										className="transition-colors hover:bg-gray-800/60">
										{/* Customer */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-3">
												<div
													className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
													style={{
														backgroundColor:
															BRAND_COLOR,
													}}>
													{customer.name
														?.charAt(0)
														?.toUpperCase() || 'C'}
												</div>

												<div>
													<p className="font-medium text-gray-100">
														{customer.name ||
															'Unnamed'}
													</p>
													<p className="mt-0.5 text-xs text-gray-500">
														Customer
													</p>
												</div>
											</div>
										</td>

										{/* Phone */}
										<td className="px-5 py-4 text-sm text-gray-300">
											{customer.phone || '—'}
										</td>

										{/* Email */}
										<td className="px-5 py-4 text-sm text-gray-300">
											{customer.email || '—'}
										</td>

										{/* Orders */}
										<td className="px-5 py-4 text-center text-sm font-medium text-gray-200">
											{customer.totalOrders ?? 0}
										</td>

										{/* Spent */}
										<td className="px-5 py-4 text-right text-sm font-semibold text-gray-100">
											৳
											{Number(
												customer.totalSpent || 0
											).toLocaleString('en-BD')}
										</td>

										{/* Last Order */}
										<td className="px-5 py-4 text-sm text-gray-400">
											{customer.lastOrder &&
											!Number.isNaN(
												new Date(
													customer.lastOrder
												).getTime()
											)
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
												className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-700">
												<Eye size={15} />
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
				<div className="flex flex-col gap-3 border-t border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-gray-400">
						Showing{' '}
						<span className="font-medium text-gray-200">
							{customers.length}
						</span>{' '}
						of{' '}
						<span className="font-medium text-gray-200">
							{pagination.totalCustomers}
						</span>{' '}
						customers
					</p>

					<div className="flex items-center gap-2">
						<button
							aria-label="Previous page"
							disabled={page <= 1 || isFetching}
							onClick={() =>
								setPage((prev) => Math.max(prev - 1, 1))
							}
							className="rounded-lg border border-gray-700 bg-gray-950 p-2.5 text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
							<ChevronLeft size={18} />
						</button>

						<span className="min-w-20 px-2 text-center text-sm text-gray-300">
							{pagination.page} /{' '}
							{Math.max(pagination.totalPages, 1)}
						</span>

						<button
							aria-label="Next page"
							disabled={
								page >= pagination.totalPages || isFetching
							}
							onClick={() =>
								setPage((prev) =>
									Math.min(prev + 1, pagination.totalPages)
								)
							}
							className="rounded-lg border border-gray-700 bg-gray-950 p-2.5 text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
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
		<div className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm text-gray-400">{title}</p>

					<h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
						{value}
					</h2>
				</div>

				<div
					className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
					style={{
						backgroundColor: `${BRAND_COLOR}30`,
						color: '#70c99a',
					}}>
					{icon}
				</div>
			</div>
		</div>
	);
}

// Customer Status Badge
function StatusBadge({ status }) {
	const isActive = status === 'active';

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
				isActive
					? 'border-green-800/70 bg-green-950/60 text-green-400'
					: 'border-blue-800/70 bg-blue-950/60 text-blue-400'
			}`}>
			<span
				className={`h-1.5 w-1.5 rounded-full ${
					isActive ? 'bg-green-400' : 'bg-blue-400'
				}`}
			/>
			{isActive ? 'Active' : 'New'}
		</span>
	);
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Search,
	Package,
	AlertTriangle,
	CircleDollarSign,
	Boxes,
	RefreshCw,
	X,
	ChevronDown,
	LoaderCircle,
	Warehouse,
	CheckCircle2,
} from 'lucide-react';
import { LOW_STOCK_LIMIT } from '@/constants/dashboard';
import { formatUnit } from '@/helper/formateUnit';
import {
	useDashboardOverview,
	useUpdateVariantStock,
} from '@/hooks/useDashboard';

const BRAND = '#1f5d14';

const money = (value = 0) =>
	`৳${Number(value || 0).toLocaleString('en-BD', {
		maximumFractionDigits: 2,
	})}`;

function getStatus(stock) {
	if (stock <= 0) {
		return {
			label: 'স্টক শেষ',
			className: 'bg-red-500/10 text-red-400 ring-red-500/20',
		};
	}

	if (stock <= LOW_STOCK_LIMIT) {
		return {
			label: 'স্টক কম',
			className: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
		};
	}

	return {
		label: 'স্টক আছে',
		className: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
	};
}

function StatCard({ icon: Icon, title, value, subtitle }) {
	return (
		<div className="rounded-xl border border-[#292d2a] bg-[#171a18] p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-sm text-gray-400">{title}</p>
					<p className="mt-2 break-words text-2xl font-bold text-white">
						{value}
					</p>
					<p className="mt-1 text-xs text-gray-500">{subtitle}</p>
				</div>

				<div className="rounded-lg border border-[#303831] bg-[#202821] p-3">
					<Icon
						size={21}
						strokeWidth={1.7}
						style={{ color: BRAND }}
					/>
				</div>
			</div>
		</div>
	);
}

export default function InventoryPage() {
	const updateStockMutation = useUpdateVariantStock();
	const { data, isLoading, isFetching, isError, refetch } =
		useDashboardOverview();

	const summary = data?.summary;

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('all');
	const [statusFilter, setStatusFilter] = useState('available');
	const [sortBy, setSortBy] = useState('name');
	const [editingVariant, setEditingVariant] = useState(null);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState('');

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const productList = Array.isArray(data)
				? data
				: data?.products || data?.data || data?.items || [];

			setProducts(Array.isArray(productList) ? productList : []);
		} catch (err) {
			setError(err.message || 'পণ্য লোড করতে সমস্যা হয়েছে।');
		} finally {
			setLoading(false);
		}
	}, [data]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	// Flatten variants so every size/weight has its own inventory row.
	const inventory = useMemo(
		() =>
			(Array.isArray(products) ? products : []).flatMap((product) =>
				(Array.isArray(product.variants) ? product.variants : []).map(
					(variant) => ({
						productId: String(product._id),
						variantId: String(variant._id),
						name: product.name,
						category: product.category || 'uncategorized',
						image: product.image || '',
						isActive: product.isActive,
						value: variant.value,
						unit: variant.unit,
						stock: Number(variant.stock || 0),
						soldCount: Number(variant.soldCount || 0),
						buyPrice: Number(
							variant.buyPrice ??
								variant.purchasePrice ??
								variant.costPrice ??
								variant.regularPrice ??
								0
						),
						regularPrice: Number(variant.regularPrice || 0),
						sellPrice: Number(variant.sellPrice || 0),
						sku: variant.sku || '',
					})
				)
			),
		[products]
	);

	const categories = useMemo(
		() => [...new Set(inventory.map((item) => item.category))],
		[inventory]
	);

	const stats = useMemo(() => {
		const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);

		const stockCost = inventory.reduce(
			(sum, item) => sum + item.stock * item.buyPrice,
			0
		);

		const retailValue = inventory.reduce(
			(sum, item) => sum + item.stock * item.sellPrice,
			0
		);

		return {
			products: products.length,
			variants: inventory.length,
			totalUnits,
			stockCost,
			retailValue,
			lowStock: inventory.filter(
				(item) => item.stock > 0 && item.stock <= LOW_STOCK_LIMIT
			).length,
			outOfStock: inventory.filter((item) => item.stock <= 0).length,
		};
	}, [products, inventory]);

	const filteredInventory = useMemo(() => {
		const query = search.trim().toLowerCase();

		return inventory
			.filter((item) => {
				const matchesSearch =
					!query ||
					item.name.toLowerCase().includes(query) ||
					item.sku.toLowerCase().includes(query);

				const matchesCategory =
					category === 'all' || item.category === category;

				const matchesStatus =
					statusFilter === 'all' ||
					(statusFilter === 'low' &&
						item.stock > 0 &&
						item.stock <= LOW_STOCK_LIMIT) ||
					(statusFilter === 'out' && item.stock <= 0) ||
					(statusFilter === 'available' && item.stock > 0);

				return matchesSearch && matchesCategory && matchesStatus;
			})
			.sort((a, b) => {
				if (sortBy === 'stock-low') return a.stock - b.stock;
				if (sortBy === 'stock-high') return b.stock - a.stock;
				if (sortBy === 'value') {
					return b.stock * b.buyPrice - a.stock * a.buyPrice;
				}

				return a.name.localeCompare(b.name, 'bn');
			});
	}, [inventory, search, category, statusFilter, sortBy]);

	async function handleSaveStock(event) {
		event.preventDefault();

		if (!editingVariant || updateStockMutation.isPending) return;

		const nextStock = Number(editingVariant.stock);

		if (!Number.isSafeInteger(nextStock) || nextStock < 0) {
			setNotice('স্টক শূন্য বা তার বেশি পূর্ণ সংখ্যা হতে হবে।');
			return;
		}

		setNotice('');

		try {
			await updateStockMutation.mutateAsync({
				productId: editingVariant.productId,
				variantId: editingVariant.variantId,
				stock: nextStock,
			});

			setProducts((current) =>
				current.map((product) =>
					String(product._id) === editingVariant.productId
						? {
								...product,
								variants: product.variants.map((variant) =>
									String(variant._id) ===
									editingVariant.variantId
										? { ...variant, stock: nextStock }
										: variant
								),
							}
						: product
				)
			);

			setEditingVariant(null);
			setNotice('স্টক সফলভাবে আপডেট হয়েছে।');
		} catch (error) {
			setNotice(error.message || 'স্টক আপডেট ব্যর্থ হয়েছে।');
		}
	}

	const fieldClass =
		'w-full rounded-lg border border-[#343a36] bg-[#111412] px-3 py-2.5 text-sm text-gray-100 outline-none placeholder:text-gray-600 focus:border-[#1f5d3b]';

	return (
		<main className="min-h-screen bg-[#111412] p-4 text-gray-100 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Warehouse size={16} />
							<span>Admin Dashboard</span>
							<span>/</span>
							<span>Inventory</span>
						</div>

						<h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
							Inventory
						</h1>

						<p className="mt-1 text-sm text-gray-400">
							শালবন ফুডের পণ্য, ভ্যারিয়েন্ট ও স্টকের হিসাব
						</p>
					</div>

					<button
						type="button"
						onClick={fetchProducts}
						disabled={loading}
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#343a36] bg-[#171a18] px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-[#202521] disabled:opacity-50">
						<RefreshCw
							size={16}
							className={loading ? 'animate-spin' : ''}
						/>
						Refresh
					</button>
				</header>

				{notice && (
					<div
						role="status"
						className="flex items-center justify-between gap-3 rounded-lg border border-[#343a36] bg-[#171a18] px-4 py-3 text-sm text-gray-200">
						<span>{notice}</span>
						<button
							type="button"
							onClick={() => setNotice('')}
							aria-label="Close message">
							<X size={16} />
						</button>
					</div>
				)}

				{error && (
					<div className="rounded-lg border border-red-900/70 bg-[#1c1515] p-4 text-sm text-red-300">
						<p>{error}</p>
						<button
							type="button"
							onClick={fetchProducts}
							className="mt-3 font-semibold underline">
							Retry
						</button>
					</div>
				)}

				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<StatCard
						icon={Package}
						title="মোট পণ্য"
						value={summary?.totalProducts}
						subtitle={`${stats.variants}টি ভ্যারিয়েন্ট`}
					/>

					<StatCard
						icon={Boxes}
						title="মোট স্টক"
						value={summary?.stockQuantity}
						subtitle="সব ভ্যারিয়েন্টের ইউনিটের যোগফল"
					/>
					<StatCard
						icon={CircleDollarSign}
						title="স্টকের ক্রয়মূল্য"
						value={money(summary?.stockSalesValue)}
						subtitle="Regular price × stock"
					/>

					<StatCard
						icon={AlertTriangle}
						title="স্টক সতর্কতা"
						value={stats.lowStock + stats.outOfStock}
						subtitle={`${stats.lowStock}টি কম · ${stats.outOfStock}টি শেষ`}
					/>
				</section>

				<section className="overflow-hidden rounded-xl border border-[#292d2a] bg-[#171a18]">
					<div className="space-y-4 border-b border-[#292d2a] p-4 sm:p-5">
						<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
							<div>
								<h2 className="text-lg font-bold text-white">
									Stock Overview
								</h2>
								<p className="mt-1 text-sm text-gray-500">
									{filteredInventory.length}টি ভ্যারিয়েন্ট
								</p>
							</div>

							<div className="text-sm text-gray-400">
								বিক্রয়মূল্যে স্টকের মূল্য:{' '}
								<strong className="text-white">
									{money(stats.retailValue)}
								</strong>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
							<div className="relative xl:col-span-2">
								<Search
									size={17}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
								/>
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="পণ্যের নাম অথবা SKU"
									className={`${fieldClass} pl-10`}
								/>
							</div>

							<div className="relative">
								<select
									value={category}
									onChange={(e) =>
										setCategory(e.target.value)
									}
									className={`${fieldClass} appearance-none pr-9`}>
									<option value="all">সব ক্যাটাগরি</option>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
								<ChevronDown
									size={15}
									className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
								/>
							</div>

							<div className="relative">
								<select
									value={statusFilter}
									onChange={(e) =>
										setStatusFilter(e.target.value)
									}
									className={`${fieldClass} appearance-none pr-9`}>
									<option value="all">সব স্ট্যাটাস</option>
									<option value="available">স্টক আছে</option>
									<option value="low">স্টক কম (১–৫)</option>
									<option value="out">স্টক শেষ</option>
								</select>
								<ChevronDown
									size={15}
									className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
								/>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<span className="mr-1 text-xs text-gray-500">
								সাজান:
							</span>
							{[
								['name', 'নাম'],
								['stock-low', 'কম স্টক আগে'],
								['stock-high', 'বেশি স্টক আগে'],
								['value', 'স্টকের মূল্য'],
							].map(([value, label]) => (
								<button
									key={value}
									type="button"
									onClick={() => setSortBy(value)}
									className={`rounded-md border px-3 py-1.5 text-xs ${
										sortBy === value
											? 'border-[#1f5d3b] bg-[#1f5d3b] text-white'
											: 'border-[#343a36] bg-[#111412] text-gray-400 hover:bg-[#202521]'
									}`}>
									{label}
								</button>
							))}
						</div>
					</div>

					{loading ? (
						<div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-400">
							<LoaderCircle size={20} className="animate-spin" />
							পণ্যের তথ্য লোড হচ্ছে...
						</div>
					) : filteredInventory.length === 0 ? (
						<div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
							<Package size={35} className="text-gray-600" />
							<p className="mt-3 font-semibold text-gray-200">
								কোনো পণ্য পাওয়া যায়নি
							</p>
							<p className="mt-1 text-sm text-gray-500">
								সার্চ অথবা ফিল্টার পরিবর্তন করে দেখুন।
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[1120px] text-left text-sm">
								<thead className="border-y border-[#292d2a] bg-[#131614] text-xs text-gray-500">
									<tr>
										<th className="px-5 py-3 font-medium">
											Name
										</th>
										<th className="px-2 py-3 font-medium">
											SKU
										</th>
										<th className="px-2 py-3 font-medium">
											Weight/Size
										</th>
										<th className="px-2 py-3 font-medium">
											Buy price{' '}
										</th>
										<th className="px-2 py-3 font-medium">
											Regular Price
										</th>
										<th className="px-2 py-3 font-medium">
											Sell Price
										</th>
										<th className="px-2 py-3 font-medium">
											Profit
										</th>
										<th className="px-2 py-3 font-medium">
											Sold Count
										</th>

										<th className="px-4 py-3 font-medium">
											Stock Value
										</th>
										<th className="px-4 py-3 font-medium">
											Status
										</th>
										<th className="px-5 py-3 text-right font-medium">
											Actions
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-[#292d2a]">
									{filteredInventory.map((item) => {
										const status = getStatus(item.stock);

										return (
											<tr
												key={`${item.productId}-${item.variantId}`}
												className="hover:bg-[#1c211e]">
												<td className="px-5 py-4">
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#303632] bg-[#202521]">
															{item.image ? (
																<img
																	src={
																		item.image
																	}
																	alt={
																		item.name
																	}
																	className="h-full w-full object-cover"
																/>
															) : (
																<Package
																	size={18}
																	className="text-gray-500"
																/>
															)}
														</div>
														<div>
															<p className="font-semibold text-gray-100">
																{item.name}
															</p>
															<p className="mt-1 text-xs text-gray-500">
																{item.category}
															</p>
															{!item.isActive && (
																<p className="mt-1 text-xs text-amber-400">
																	নিষ্ক্রিয়
																	পণ্য
																</p>
															)}
														</div>
													</div>
												</td>

												<td className="px-4 py-4 text-gray-400">
													{item.sku || '—'}
												</td>

												<td className="px-4 py-4 text-gray-300">
													{formatUnit(
														item.value,
														item.unit
													)}
												</td>

												<td className="px-4 py-4 text-gray-400">
													{money(item.buyPrice)}
												</td>
												<td className="px-4 py-4 text-gray-400">
													{money(item.regularPrice)}
												</td>

												<td className="px-4 py-4 font-medium text-gray-200">
													{money(item.sellPrice)}
												</td>

												<td
													className={`px-4 py-4 font-medium ${
														item.sellPrice -
															item.buyPrice >=
														0
															? 'text-emerald-400'
															: 'text-red-400'
													}`}>
													{money(
														item.sellPrice -
															item.buyPrice
													)}
												</td>

												<td className="px-4 py-4 text-gray-400">
													{item.soldCount}
												</td>

												<td className="px-4 py-4 font-medium text-gray-200">
													{money(
														item.stock *
															item.buyPrice
													)}
												</td>

												<td className="px-4 py-4">
													<span
														className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}>
														{status.label}
													</span>
												</td>

												<td className="px-5 py-4 text-right">
													<button
														type="button"
														onClick={() => {
															setNotice('');
															setEditingVariant({
																productId:
																	item.productId,
																variantId:
																	item.variantId,
																name: item.name,
																variantLabel:
																	formatUnit(
																		item.value,
																		item.unit
																	),
																stock: String(
																	item.stock
																),
															});
														}}
														className="whitespace-nowrap rounded-lg border border-[#343a36] px-3 py-2 text-xs font-semibold text-gray-300 hover:border-[#1f5d3b] hover:text-emerald-400">
														স্টক আপডেট
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					<footer className="border-t border-[#292d2a] px-5 py-3 text-xs text-gray-500">
						Low stock: {LOW_STOCK_LIMIT} ইউনিট বা তার কম।
					</footer>
				</section>
			</div>

			{editingVariant && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget && !saving) {
							setEditingVariant(null);
						}
					}}>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby="stock-dialog-title"
						className="w-full max-w-md rounded-xl border border-[#343a36] bg-[#171a18] p-5 shadow-2xl sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2
									id="stock-dialog-title"
									className="text-lg font-bold text-white">
									স্টক আপডেট
								</h2>
								<p className="mt-1 text-sm text-gray-400">
									{editingVariant.name}
								</p>
								<p className="mt-1 text-xs text-gray-500">
									{editingVariant.variantLabel}
								</p>
							</div>

							<button
								type="button"
								disabled={saving}
								onClick={() => setEditingVariant(null)}
								aria-label="বন্ধ করুন"
								className="rounded-md p-1 text-gray-400 hover:bg-[#292d2a]">
								<X size={20} />
							</button>
						</div>

						<form
							onSubmit={handleSaveStock}
							className="mt-6 space-y-5">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-gray-300">
									নতুন স্টকের পরিমাণ
								</span>
								<input
									type="number"
									min="0"
									step="1"
									required
									autoFocus
									value={editingVariant.stock}
									onChange={(event) =>
										setEditingVariant((current) => ({
											...current,
											stock: event.target.value,
										}))
									}
									className="w-full rounded-lg border border-[#343a36] bg-[#111412] px-3 py-3 text-lg text-white outline-none focus:border-[#1f5d3b]"
								/>
							</label>

							<p className="text-xs leading-5 text-gray-500">
								এটি নির্বাচিত ভ্যারিয়েন্টের মোট স্টক সেট করবে,
								আগের স্টকের সঙ্গে যোগ করবে না।
							</p>

							<div className="flex justify-end gap-3">
								<button
									type="button"
									disabled={saving}
									onClick={() => setEditingVariant(null)}
									className="rounded-lg border border-[#343a36] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#242925]">
									বাতিল
								</button>

								<button
									type="submit"
									disabled={saving}
									className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
									style={{ backgroundColor: BRAND }}>
									{saving ? (
										<LoaderCircle
											size={16}
											className="animate-spin"
										/>
									) : (
										<CheckCircle2 size={16} />
									)}
									{saving ? 'সেভ হচ্ছে...' : 'স্টক সেভ করুন'}
								</button>
							</div>
						</form>
					</section>
				</div>
			)}
		</main>
	);
}

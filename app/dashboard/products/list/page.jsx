'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import {
	Archive,
	Boxes,
	Check,
	ChevronRight,
	Download,
	FileSpreadsheet,
	LayoutDashboard,
	LoaderCircle,
	Package,
	Printer,
	Search,
	Tags,
	Wallet,
} from 'lucide-react';

// Redux Slice — existing state and actions preserved
const productSlice = createSlice({
	name: 'products',
	initialState: {
		categories: {},
		allProducts: [],
		activeCategory: null,
		loading: false,
		searchText: '',
	},
	reducers: {
		setProductsByCategory(state, action) {
			state.categories = action.payload;
		},
		setAllProducts(state, action) {
			state.allProducts = action.payload;
		},
		setActiveCategory(state, action) {
			state.activeCategory = action.payload;
		},
		setLoading(state, action) {
			state.loading = action.payload;
		},
		setSearchText(state, action) {
			state.searchText = action.payload;
		},
	},
});

const {
	setProductsByCategory,
	setAllProducts,
	setActiveCategory,
	setLoading,
	setSearchText,
} = productSlice.actions;

const store = configureStore({
	reducer: {
		products: productSlice.reducer,
	},
});

const inputClass =
	'w-full rounded-lg border border-white/10 bg-[#10141d] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10';

function ProductListPage() {
	const dispatch = useDispatch();
	const { categories, allProducts, activeCategory, loading, searchText } =
		useSelector((state) => state.products);

	const [localProducts, setLocalProducts] = useState([]);
	const [changedRows, setChangedRows] = useState({});
	const [savingRows, setSavingRows] = useState({});
	const [refreshing, setRefreshing] = useState(false);

	const loadData = useCallback(async () => {
		try {
			setRefreshing(true);
			dispatch(setLoading(true));

			const res = await fetch('/api/products/getbycat', {
				cache: 'no-store',
			});

			if (!res.ok) {
				throw new Error(`Failed to load products (${res.status})`);
			}

			const data = await res.json();
			const cats = data.categories || {};
			const sortedCats = {};

			Object.keys(cats)
				.sort((a, b) => a.localeCompare(b))
				.forEach((key) => {
					sortedCats[key] = cats[key];
				});

			dispatch(setProductsByCategory(sortedCats));

			const flat = Object.values(sortedCats).flat();
			dispatch(setAllProducts(flat));
			setLocalProducts(flat);
			setChangedRows({});
		} catch (error) {
			console.error('Product loading error:', error);
			toast.error('Could not load products');
		} finally {
			dispatch(setLoading(false));
			setRefreshing(false);
		}
	}, [dispatch]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const filteredProducts = useMemo(() => {
		const query = (searchText || '').trim().toLowerCase();
		return localProducts.filter((product) =>
			(product.name || '').toLowerCase().includes(query)
		);
	}, [localProducts, searchText]);

	const shownProducts = useMemo(() => {
		if (activeCategory === null) return filteredProducts;
		return filteredProducts.filter(
			(product) => product.category === activeCategory
		);
	}, [activeCategory, filteredProducts]);

	const dirtyCount = Object.values(changedRows).filter(Boolean).length;
	const totalStock = shownProducts.reduce(
		(sum, product) => sum + (Number(product.stock) || 0),
		0
	);
	const totalSellValue = shownProducts.reduce(
		(sum, product) =>
			sum +
			(Number(product.sellPrice) || 0) * (Number(product.stock) || 0),
		0
	);

	const updateLocalField = (id, field, value) => {
		setLocalProducts((previous) =>
			previous.map((product) =>
				product._id === id ? { ...product, [field]: value } : product
			)
		);
		setChangedRows((previous) => ({ ...previous, [id]: true }));
	};

	// Update regular price, sell price and stock — same API endpoint
	const updateProductData = async (id, regularPrice, sellPrice, stock) => {
		try {
			setSavingRows((previous) => ({ ...previous, [id]: true }));

			const formData = new FormData();
			formData.append('regularPrice', regularPrice ?? '');
			formData.append('sellPrice', sellPrice ?? '');
			formData.append('stock', stock ?? '');

			const res = await fetch(`/api/products/${id}/updateprice`, {
				method: 'PUT',
				body: formData,
			});

			if (!res.ok) {
				const result = await res.json().catch(() => ({}));
				throw new Error(result.message || 'Update failed');
			}

			const updatedProduct = {
				regularPrice: Number(regularPrice) || 0,
				sellPrice: Number(sellPrice) || 0,
				stock: Number(stock) || 0,
			};

			setLocalProducts((previous) =>
				previous.map((product) =>
					product._id === id
						? { ...product, ...updatedProduct }
						: product
				)
			);
			dispatch(
				setAllProducts(
					allProducts.map((product) =>
						product._id === id
							? { ...product, ...updatedProduct }
							: product
					)
				)
			);
			setChangedRows((previous) => ({ ...previous, [id]: false }));
			toast.success('Product updated successfully');
		} catch (error) {
			console.error('Product update error:', error);
			toast.error(error.message || 'Update failed');
		} finally {
			setSavingRows((previous) => ({ ...previous, [id]: false }));
		}
	};

	const downloadNamesAsTxt = () => {
		const names = shownProducts.map((product) => product.name).join('\n');
		const blob = new Blob([names], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'product-names.txt';
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
		toast.success('Product names downloaded');
	};

	const exportToExcel = () => {
		const excelData = shownProducts.map((product, index) => ({
			SL: index + 1,
			Name: product.name,
			RegularPrice: product.regularPrice ?? '',
			SellPrice: product.sellPrice ?? '',
			Stock: product.stock ?? '',
			Remarks: product.remarks ?? '',
		}));

		const worksheet = XLSX.utils.json_to_sheet(excelData);
		worksheet['!cols'] = [
			{ wch: 8 },
			{ wch: 38 },
			{ wch: 16 },
			{ wch: 16 },
			{ wch: 12 },
			{ wch: 28 },
		];
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
		XLSX.writeFile(workbook, 'products.xlsx');
		toast.success('Excel file exported');
	};

	// Print a clean, light report for paper
	const printTable = () => {
		const safe = (value) =>
			String(value ?? '').replace(
				/[&<>"']/g,
				(character) =>
					({
						'&': '&amp;',
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						"'": '&#39;',
					})[character]
			);

		const rows = shownProducts
			.map(
				(product, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${safe(product.name)}</td>
                        <td>${safe(product.regularPrice)}</td>
                        <td>${safe(product.sellPrice)}</td>
                        <td>${safe(product.stock)}</td>
                        <td>${safe(product.remarks)}</td>
                    </tr>`
			)
			.join('');

		const win = window.open('', '_blank', 'width=1100,height=750');
		if (!win) {
			toast.error('Allow pop-ups to print this report');
			return;
		}

		win.document.write(`
            <!doctype html>
            <html>
            <head>
                <title>Product Report</title>
                <meta charset="utf-8" />
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                    h1 { font-size: 22px; margin-bottom: 4px; }
                    p { color: #4b5563; font-size: 12px; margin-bottom: 18px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 11px; text-align: left; }
                    th { background: #f3f4f6; }
                    tr { page-break-inside: avoid; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>Product Inventory Report</h1>
                <p>Category: ${safe(activeCategory || 'All Products')} · Products: ${shownProducts.length} · Generated: ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>SL</th><th>Product Name</th><th>Regular Price</th>
                            <th>Sell Price</th><th>Stock</th><th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
		win.document.close();
		win.focus();
		win.print();
	};

	const categoryCount = Object.keys(categories).length;

	return (
		<div className="min-h-screen bg-[#0b0e14] text-slate-100">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-[#0f131b] p-5 lg:block">
					<div className="mb-8 flex items-center gap-3 px-1">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20">
							<Boxes size={21} />
						</div>
						<div>
							<p className="font-semibold tracking-tight text-white">
								Inventory
							</p>
							<p className="text-xs text-slate-500">
								Product management
							</p>
						</div>
					</div>

					<p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
						Catalogue
					</p>
					<nav className="space-y-1">
						<button
							type="button"
							onClick={() => dispatch(setActiveCategory(null))}
							className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
								activeCategory === null
									? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/15'
									: 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
							}`}>
							<span className="flex items-center gap-3">
								<LayoutDashboard size={17} />
								All products
							</span>
							<span className="text-xs tabular-nums">
								{allProducts.length}
							</span>
						</button>

						{Object.keys(categories).map((category) => (
							<button
								key={category}
								type="button"
								onClick={() =>
									dispatch(setActiveCategory(category))
								}
								className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
									activeCategory === category
										? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/15'
										: 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
								}`}>
								<span className="flex min-w-0 items-center gap-3">
									<Tags size={16} className="shrink-0" />
									<span className="truncate">{category}</span>
								</span>
								<span className="ml-2 text-xs tabular-nums text-slate-500">
									{categories[category]?.length || 0}
								</span>
							</button>
						))}
					</nav>

					<div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
						<div className="mb-2 flex items-center gap-2 text-slate-400">
							<Archive size={15} />
							<span className="text-xs">Categories</span>
						</div>
						<p className="text-2xl font-semibold tracking-tight text-white">
							{categoryCount}
						</p>
						<p className="mt-1 text-xs text-slate-600">
							Active catalogue groups
						</p>
					</div>
				</aside>

				{/* Main */}
				<main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
					<div className="mx-auto max-w-[1600px]">
						<header className="mb-7 flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
									<span>Admin</span>
									<ChevronRight size={13} />
									<span>Products</span>
								</div>
								<h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
									{activeCategory || 'All Products'}
								</h1>
								<p className="mt-1.5 text-sm text-slate-500">
									Manage pricing, stock levels and product
									exports.
								</p>
							</div>
							<button
								type="button"
								onClick={loadData}
								disabled={refreshing}
								className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50 sm:self-auto">
								<LoaderCircle
									size={16}
									className={refreshing ? 'animate-spin' : ''}
								/>
								Refresh products
							</button>
						</header>

						{/* Summary cards */}
						<section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="rounded-2xl border border-white/[0.07] bg-[#111620] p-4 sm:p-5">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-400">
										Products shown
									</span>
									<span className="rounded-lg bg-sky-400/10 p-2 text-sky-300">
										<Package size={18} />
									</span>
								</div>
								<p className="mt-4 text-2xl font-semibold tabular-nums text-white">
									{shownProducts.length}
								</p>
								<p className="mt-1 text-xs text-slate-600">
									Matching current filters
								</p>
							</div>
							<div className="rounded-2xl border border-white/[0.07] bg-[#111620] p-4 sm:p-5">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-400">
										Total units in stock
									</span>
									<span className="rounded-lg bg-violet-400/10 p-2 text-violet-300">
										<Boxes size={18} />
									</span>
								</div>
								<p className="mt-4 text-2xl font-semibold tabular-nums text-white">
									{totalStock.toLocaleString()}
								</p>
								<p className="mt-1 text-xs text-slate-600">
									Based on displayed products
								</p>
							</div>
							<div className="rounded-2xl border border-white/[0.07] bg-[#111620] p-4 sm:p-5">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-400">
										Stock sell value
									</span>
									<span className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
										<Wallet size={18} />
									</span>
								</div>
								<p className="mt-4 break-words text-2xl font-semibold tabular-nums text-white">
									৳
									{totalSellValue.toLocaleString('en-BD', {
										maximumFractionDigits: 2,
									})}
								</p>
								<p className="mt-1 text-xs text-slate-600">
									Sell price × available stock
								</p>
							</div>
						</section>

						{/* Search + export toolbar */}
						<section className="mb-5 rounded-2xl border border-white/[0.07] bg-[#111620] p-4 sm:p-5">
							<div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
								<div className="relative w-full xl:max-w-md">
									<Search
										size={17}
										className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
									/>
									<input
										type="search"
										placeholder="Search by product name..."
										className={`${inputClass} pl-10`}
										value={searchText}
										onChange={(event) =>
											dispatch(
												setSearchText(
													event.target.value
												)
											)
										}
									/>
								</div>

								<div className="flex flex-wrap gap-2">
									<button
										type="button"
										onClick={exportToExcel}
										className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15">
										<FileSpreadsheet size={16} />
										Export Excel
									</button>
									<button
										type="button"
										onClick={printTable}
										className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white">
										<Printer size={16} />
										Print
									</button>
									<button
										type="button"
										onClick={downloadNamesAsTxt}
										className="inline-flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/10 px-3.5 py-2.5 text-sm font-medium text-violet-300 transition hover:bg-violet-400/15">
										<Download size={16} />
										Names TXT
									</button>
								</div>
							</div>

							<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
								<span>
									Showing{' '}
									<strong className="font-semibold text-slate-300">
										{shownProducts.length}
									</strong>{' '}
									of{' '}
									<strong className="font-semibold text-slate-300">
										{allProducts.length}
									</strong>{' '}
									products
								</span>
								{dirtyCount > 0 ? (
									<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-300">
										<span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
										{dirtyCount} unsaved{' '}
										{dirtyCount === 1
											? 'change'
											: 'changes'}
									</span>
								) : (
									<span className="inline-flex items-center gap-1.5 text-emerald-400/80">
										<Check size={14} />
										All changes saved
									</span>
								)}
							</div>
						</section>

						{/* Product table */}
						<section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111620]">
							<div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-5">
								<div>
									<h2 className="font-semibold text-white">
										Product inventory
									</h2>
									<p className="mt-1 text-xs text-slate-500">
										Edit values and save each product
										individually.
									</p>
								</div>
								<span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-slate-400">
									{shownProducts.length} items
								</span>
							</div>

							{loading ? (
								<div className="flex min-h-56 flex-col items-center justify-center gap-3 text-slate-500">
									<LoaderCircle
										size={25}
										className="animate-spin text-emerald-300"
									/>
									<p className="text-sm">
										Loading products...
									</p>
								</div>
							) : shownProducts.length === 0 ? (
								<div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
									<div className="mb-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-slate-500">
										<Package size={25} />
									</div>
									<p className="font-medium text-slate-300">
										No products found
									</p>
									<p className="mt-1 text-sm text-slate-600">
										Try another search term or select a
										different category.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full min-w-[920px] border-collapse text-left">
										<thead>
											<tr className="border-b border-white/[0.07] bg-white/[0.025] text-[11px] uppercase tracking-[0.12em] text-slate-500">
												<th className="px-4 py-4 font-semibold">
													#
												</th>
												<th className="min-w-[250px] px-4 py-4 font-semibold">
													Product
												</th>
												<th className="px-4 py-4 font-semibold">
													Regular price
												</th>
												<th className="px-4 py-4 font-semibold">
													Sell price
												</th>
												<th className="px-4 py-4 font-semibold">
													Stock
												</th>
												<th className="px-4 py-4 font-semibold">
													Action
												</th>
												<th className="min-w-[150px] px-4 py-4 font-semibold">
													Remarks
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-white/[0.055]">
											{shownProducts.map(
												(product, index) => {
													const isDirty = Boolean(
														changedRows[product._id]
													);
													const isSaving = Boolean(
														savingRows[product._id]
													);

													return (
														<tr
															key={product._id}
															className={`transition-colors hover:bg-white/[0.025] ${
																isDirty
																	? 'bg-amber-400/[0.025]'
																	: ''
															}`}>
															<td className="px-4 py-4 text-xs tabular-nums text-slate-600">
																{String(
																	index + 1
																).padStart(
																	2,
																	'0'
																)}
															</td>
															<td className="px-4 py-4">
																<div className="flex items-center gap-3">
																	<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-400">
																		<Package
																			size={
																				16
																			}
																		/>
																	</div>
																	<div className="min-w-0">
																		<p className="max-w-[300px] truncate text-sm font-medium text-slate-200">
																			{product.name ||
																				'Unnamed product'}
																		</p>
																		<p className="mt-1 text-[11px] text-slate-600">
																			ID:{' '}
																			{String(
																				product._id
																			).slice(
																				-8
																			)}
																		</p>
																	</div>
																</div>
															</td>
															<td className="px-4 py-3">
																<label className="relative block w-28">
																	<span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-600">
																		৳
																	</span>
																	<input
																		type="number"
																		min="0"
																		step="0.01"
																		aria-label={`Regular price for ${product.name}`}
																		value={
																			product.regularPrice ??
																			''
																		}
																		onChange={(
																			event
																		) =>
																			updateLocalField(
																				product._id,
																				'regularPrice',
																				event
																					.target
																					.value
																			)
																		}
																		className={`${inputClass} pl-6 tabular-nums`}
																	/>
																</label>
															</td>
															<td className="px-4 py-3">
																<label className="relative block w-28">
																	<span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-500">
																		৳
																	</span>
																	<input
																		type="number"
																		min="0"
																		step="0.01"
																		aria-label={`Sell price for ${product.name}`}
																		value={
																			product.sellPrice ??
																			''
																		}
																		onChange={(
																			event
																		) =>
																			updateLocalField(
																				product._id,
																				'sellPrice',
																				event
																					.target
																					.value
																			)
																		}
																		className={`${inputClass} pl-6 tabular-nums`}
																	/>
																</label>
															</td>
															<td className="px-4 py-3">
																<input
																	type="number"
																	min="0"
																	step="1"
																	aria-label={`Stock for ${product.name}`}
																	value={
																		product.stock ??
																		''
																	}
																	onChange={(
																		event
																	) =>
																		updateLocalField(
																			product._id,
																			'stock',
																			event
																				.target
																				.value
																		)
																	}
																	className={`${inputClass} w-20 tabular-nums`}
																/>
															</td>
															<td className="px-4 py-3">
																<button
																	type="button"
																	disabled={
																		!isDirty ||
																		isSaving
																	}
																	onClick={() =>
																		updateProductData(
																			product._id,
																			product.regularPrice,
																			product.sellPrice,
																			product.stock
																		)
																	}
																	className={`inline-flex min-w-[86px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed ${
																		isDirty
																			? 'bg-emerald-400 text-[#07110c] shadow-sm shadow-emerald-950/20 hover:bg-emerald-300'
																			: 'border border-white/[0.07] bg-white/[0.025] text-slate-600'
																	}`}>
																	{isSaving ? (
																		<LoaderCircle
																			size={
																				14
																			}
																			className="animate-spin"
																		/>
																	) : isDirty ? (
																		<Check
																			size={
																				14
																			}
																		/>
																	) : (
																		<Check
																			size={
																				14
																			}
																		/>
																	)}
																	{isSaving
																		? 'Saving'
																		: isDirty
																			? 'Save'
																			: 'Saved'}
																</button>
															</td>
															<td className="px-4 py-4 text-sm text-slate-500">
																<span
																	className="block max-w-[180px] truncate"
																	title={
																		product.remarks ||
																		''
																	}>
																	{product.remarks ||
																		'—'}
																</span>
															</td>
														</tr>
													);
												}
											)}
										</tbody>
									</table>
								</div>
							)}

							<div className="flex flex-col gap-2 border-t border-white/[0.06] px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
								<span>Inventory manager · Dark theme</span>
								<span>
									Remember to save edited rows before leaving
									this page.
								</span>
							</div>
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<Provider store={store}>
			<ProductListPage />
		</Provider>
	);
}

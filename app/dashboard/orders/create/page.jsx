'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
	ArrowLeft,
	Search,
	UserRound,
	Plus,
	Trash2,
	ShoppingBag,
	MapPin,
	Loader2,
	Save,
	X,
	PackageSearch,
	CheckCircle2,
	Package,
	AlertCircle,
} from 'lucide-react';

const initialCustomer = {
	name: '',
	phone: '',
	email: '',
};

const initialAddress = {
	area: '',
	thana: '',
	city: '',
};

const initialItem = {
	productId: '',
	variantId: '',
	variantLabel: '',
	name: '',
	quantity: 1,
	price: 0,
	image: '',
	productQuery: '',
	selectedProduct: null,
	selectedVariantId: '',
};

const formatPrice = (price) => `৳${Number(price || 0).toLocaleString('en-BD')}`;

const getVariantLabel = (variant) => {
	if (!variant) return '';
	return `${variant.value} ${variant.unit || ''}`.trim();
};

const getVariantPrice = (variant) =>
	Number(variant?.sellPrice ?? variant?.regularPrice ?? 0);

const getVariantStock = (variant) => Math.max(0, Number(variant?.stock) || 0);

export default function CreateCustomOrderPage() {
	const router = useRouter();

	// Customer
	const [search, setSearch] = useState('');
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showUsers, setShowUsers] = useState(false);
	const [searching, setSearching] = useState(false);

	const [customer, setCustomer] = useState(initialCustomer);
	const [address, setAddress] = useState(initialAddress);

	// Products
	const [products, setProducts] = useState([]);
	const [productsLoading, setProductsLoading] = useState(true);
	const [productLoadError, setProductLoadError] = useState('');

	// Items
	const [items, setItems] = useState([{ ...initialItem }]);

	// Pricing
	const [shippingFee, setShippingFee] = useState(0);
	const [discount, setDiscount] = useState(0);
	const [adminDiscount, setAdminDiscount] = useState(0);
	const [adminDiscountNote, setAdminDiscountNote] = useState('');

	// Order
	const [status, setStatus] = useState('pending');
	const [paymentMethod, setPaymentMethod] = useState('COD');
	const [paymentStatus, setPaymentStatus] = useState('unpaid');

	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('error');

	// Dark mode
	const inputClass =
		'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20 disabled:cursor-not-allowed disabled:opacity-60';

	const labelClass = 'mb-1.5 block text-sm font-medium text-gray-300';

	const sectionClass = 'rounded-xl border border-gray-800 bg-gray-900 p-5';

	// ==========================================
	// Load Products
	// ==========================================

	useEffect(() => {
		const controller = new AbortController();

		const loadProducts = async () => {
			try {
				setProductsLoading(true);
				setProductLoadError('');

				const res = await fetch('/api/products?page=1&limit=100', {
					cache: 'no-store',
					signal: controller.signal,
				});

				const data = await res.json();

				if (!res.ok || !data.success) {
					throw new Error(data.message || 'Failed to load products.');
				}

				setProducts(data.products || []);
			} catch (error) {
				if (error.name !== 'AbortError') {
					setProductLoadError(error.message);
					console.error(error);
				}
			} finally {
				if (!controller.signal.aborted) {
					setProductsLoading(false);
				}
			}
		};

		loadProducts();

		return () => controller.abort();
	}, []);

	// ==========================================
	// Customer Search
	// ==========================================

	useEffect(() => {
		if (search.trim().length < 2) {
			setUsers([]);
			setShowUsers(false);
			return;
		}

		const controller = new AbortController();

		const timer = setTimeout(async () => {
			try {
				setSearching(true);

				const res = await fetch(
					`/api/admin/custom-orders/users?q=${encodeURIComponent(search)}`,
					{ signal: controller.signal }
				);

				const data = await res.json();

				if (data.success) {
					setUsers(data.users || []);
					setShowUsers(true);
				}
			} catch (error) {
				if (error.name !== 'AbortError') {
					console.error(error);
				}
			} finally {
				if (!controller.signal.aborted) {
					setSearching(false);
				}
			}
		}, 350);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [search]);

	// ==========================================
	// Customer
	// ==========================================

	const selectCustomer = (user) => {
		setSelectedUser(user);

		setCustomer({
			name: user.name || '',
			phone: user.phone || '',
			email: user.email || '',
		});

		setAddress({
			area: user.address?.area || '',
			thana: user.address?.thana || '',
			city: user.address?.city || '',
		});

		setSearch(user.name || user.phone || '');
		setUsers([]);
		setShowUsers(false);
	};

	const clearCustomer = () => {
		setSelectedUser(null);
		setCustomer({ ...initialCustomer });
		setAddress({ ...initialAddress });
		setSearch('');
		setUsers([]);
		setShowUsers(false);
	};

	const updateCustomer = (field, value) => {
		setCustomer((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const updateAddress = (field, value) => {
		setAddress((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// ==========================================
	// Product Search
	// ==========================================

	const searchProducts = (query) => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) return [];

		return products
			.filter((product) => {
				if (product.isActive === false) return false;

				const searchableText = [
					product.name,
					product.category,
					product.subCategory,
					product.brand,
					product.sku,
					...(product.variants || []).map((variant) => variant.sku),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchableText.includes(normalizedQuery);
			})
			.slice(0, 10);
	};

	// ==========================================
	// Update Item
	// ==========================================

	const updateItem = (index, field, value) => {
		setItems((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, [field]: value } : item
			)
		);
	};

	// ==========================================
	// Select Product
	// ==========================================

	const selectProduct = (index, product) => {
		const variants = product.variants || [];

		const availableVariants = variants.filter(
			(variant) => getVariantStock(variant) > 0
		);

		const firstVariant = availableVariants[0] || variants[0] || null;

		const variantLabel = getVariantLabel(firstVariant);

		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;

				return {
					...item,
					productId: product._id,
					variantId: firstVariant?._id || '',
					variantLabel,
					name: firstVariant
						? `${product.name} (${variantLabel})`
						: product.name,
					price: firstVariant ? getVariantPrice(firstVariant) : 0,
					image: product.image || '',
					selectedProduct: product,
					selectedVariantId: firstVariant?._id || '',
					productQuery: product.name,
				};
			})
		);
	};

	// ==========================================
	// Change Variant
	// ==========================================

	const changeVariant = (index, variantId) => {
		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;

				const product = item.selectedProduct;

				if (!product) return item;

				const variant = product.variants?.find(
					(v) => String(v._id) === String(variantId)
				);

				if (!variant) return item;

				const variantLabel = getVariantLabel(variant);

				return {
					...item,
					selectedVariantId: String(variant._id),
					variantId: String(variant._id),
					variantLabel,
					name: `${product.name} (${variantLabel})`,
					price: getVariantPrice(variant),
				};
			})
		);
	};

	// ==========================================
	// Clear Product
	// ==========================================

	const clearSelectedProduct = (index) => {
		setItems((prev) =>
			prev.map((item, i) => (i === index ? { ...initialItem } : item))
		);
	};

	// ==========================================
	// Add / Remove
	// ==========================================

	const addItem = () => {
		setItems((prev) => [...prev, { ...initialItem }]);
	};

	const removeItem = (index) => {
		if (items.length === 1) return;

		setItems((prev) => prev.filter((_, i) => i !== index));
	};

	// ==========================================
	// Subtotal
	// ==========================================

	const subtotal = useMemo(
		() =>
			items.reduce(
				(sum, item) =>
					sum +
					(Number(item.quantity) || 0) * (Number(item.price) || 0),
				0
			),
		[items]
	);

	// ==========================================
	// Total
	// ==========================================

	const total = Math.max(
		0,
		subtotal +
			Number(shippingFee || 0) -
			Number(discount || 0) -
			Number(adminDiscount || 0)
	);

	// ==========================================
	// Stock Validation
	// ==========================================

	const stockErrors = useMemo(() => {
		const errors = [];

		items.forEach((item, index) => {
			if (!item.productId || !item.variantId) return;

			const variant = item.selectedProduct?.variants?.find(
				(v) => String(v._id) === String(item.variantId)
			);

			if (!variant) {
				errors.push({
					index,
					message: 'Selected variant not found.',
				});
				return;
			}

			const stock = getVariantStock(variant);
			const quantity = Number(item.quantity);

			if (stock <= 0) {
				errors.push({
					index,
					message: 'এই Variant-এর স্টক শেষ।',
				});
			} else if (quantity > stock) {
				errors.push({
					index,
					message: `পর্যাপ্ত স্টক নেই। Available: ${stock}`,
				});
			}
		});

		return errors;
	}, [items]);

	// ==========================================
	// Create Order
	// ==========================================

	const handleSubmit = async (e) => {
		e.preventDefault();

		setMessage('');
		setMessageType('error');

		if (!customer.name.trim() || !customer.phone.trim()) {
			setMessage('Customer name and phone are required.');
			return;
		}

		if (
			items.some(
				(item) =>
					!item.name.trim() ||
					!Number.isInteger(Number(item.quantity)) ||
					Number(item.quantity) <= 0 ||
					!Number.isFinite(Number(item.price)) ||
					Number(item.price) < 0
			)
		) {
			setMessage('Please enter valid product information.');
			return;
		}

		if (
			items.some(
				(item) => Boolean(item.productId) !== Boolean(item.variantId)
			)
		) {
			setMessage(
				'Please select a valid product variant or clear the product selection.'
			);
			return;
		}

		if (stockErrors.length > 0) {
			setMessage(stockErrors[0].message);
			return;
		}

		if (
			!Number.isFinite(Number(shippingFee)) ||
			!Number.isFinite(Number(discount)) ||
			!Number.isFinite(Number(adminDiscount)) ||
			Number(shippingFee) < 0 ||
			Number(discount) < 0 ||
			Number(adminDiscount) < 0
		) {
			setMessage('Please enter valid shipping and discount amounts.');
			return;
		}

		if (total <= 0) {
			setMessage('Order total must be greater than zero.');
			return;
		}

		try {
			setSaving(true);

			const res = await fetch('/api/admin/custom-orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: selectedUser?._id || null,

					customer,

					shippingAddress: {
						...address,
						phone: customer.phone,
					},

					orderItems: items.map((item) => ({
						productId: item.productId || null,
						variantId: item.variantId || null,
						variantLabel: item.variantLabel || '',
						name: item.name.trim(),
						quantity: Number(item.quantity),
						price: Number(item.price),
						image: item.image || '',
					})),

					shippingFee: Number(shippingFee),
					discount: Number(discount),
					adminDiscount: Number(adminDiscount),
					adminDiscountNote,

					status,
					paymentMethod,
					paymentStatus,
				}),
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Order creation failed.');
			}

			router.push('/dashboard/orders');
			router.refresh();
		} catch (error) {
			setMessage(error.message);
		} finally {
			setSaving(false);
		}
	};

	// ==========================================
	// UI
	// ==========================================

	return (
		<div className="min-h-screen space-y-6 bg-gray-950 p-4 text-gray-100 sm:p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.back()}
						className="rounded-lg border border-gray-800 bg-gray-900 p-2 text-gray-300 transition hover:bg-gray-800">
						<ArrowLeft size={19} />
					</button>

					<div>
						<h1 className="text-xl font-bold text-gray-100 sm:text-2xl">
							Create Custom Order
						</h1>

						<p className="mt-1 text-sm text-gray-400">
							Create an order manually for your customer.
						</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
					{/* Main Column */}
					<div className="space-y-6 xl:col-span-2">
						{/* Customer Information */}
						<section className={sectionClass}>
							<div className="mb-5 flex items-center justify-between">
								<h2 className="flex items-center gap-2 font-semibold text-gray-100">
									<UserRound
										size={19}
										className="text-green-500"
									/>
									Customer Information
								</h2>

								{selectedUser && (
									<button
										type="button"
										onClick={clearCustomer}
										className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300">
										<X size={15} />
										Clear customer
									</button>
								)}
							</div>

							<div className="relative mb-5">
								<div className="relative">
									<Search
										size={18}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
									/>

									<input
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setSelectedUser(null);
										}}
										onFocus={() => {
											if (users.length) {
												setShowUsers(true);
											}
										}}
										placeholder="Search customer by name, phone or email..."
										className={`${inputClass} pl-10 pr-10`}
									/>

									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										{searching && (
											<Loader2
												size={17}
												className="animate-spin text-gray-400"
											/>
										)}
									</div>
								</div>

								{showUsers && (
									<div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
										{users.length > 0 ? (
											users.map((user) => (
												<button
													type="button"
													key={user._id}
													onClick={() =>
														selectCustomer(user)
													}
													className="flex w-full items-center justify-between gap-3 border-b border-gray-800 p-3 text-left last:border-0 hover:bg-gray-800">
													<div className="min-w-0">
														<p className="truncate text-sm font-semibold text-gray-100">
															{user.name}
														</p>

														<p className="mt-1 text-xs text-gray-400">
															{user.phone ||
																'No phone'}
															{user.email &&
																` · ${user.email}`}
														</p>
													</div>

													<span className="shrink-0 text-xs font-medium text-green-400">
														Select
													</span>
												</button>
											))
										) : (
											<p className="p-4 text-center text-sm text-gray-400">
												No customer found.
											</p>
										)}
									</div>
								)}

								<p className="mt-2 text-xs text-gray-400">
									Search an existing customer or enter a new
									customer's details below.
								</p>
							</div>

							{selectedUser && (
								<div className="mb-4 flex items-center gap-2 rounded-lg border border-green-900 bg-green-950/40 p-3 text-sm text-green-400">
									<CheckCircle2 size={17} />
									Registered customer selected
								</div>
							)}

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass}>
										Customer Name *
									</label>

									<input
										required
										value={customer.name}
										onChange={(e) =>
											updateCustomer(
												'name',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="Customer name"
									/>
								</div>

								<div>
									<label className={labelClass}>
										Phone Number *
									</label>

									<input
										required
										value={customer.phone}
										onChange={(e) =>
											updateCustomer(
												'phone',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="01XXXXXXXXX"
									/>
								</div>

								<div className="sm:col-span-2">
									<label className={labelClass}>
										Email Address
									</label>

									<input
										type="email"
										value={customer.email}
										onChange={(e) =>
											updateCustomer(
												'email',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="customer@example.com"
									/>
								</div>
							</div>
						</section>

						{/* Shipping Address */}
						<section className={sectionClass}>
							<h2 className="mb-5 flex items-center gap-2 font-semibold text-gray-100">
								<MapPin size={19} className="text-green-500" />
								Shipping Address
							</h2>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass}>
										Area / Village
									</label>

									<input
										value={address.area}
										onChange={(e) =>
											updateAddress(
												'area',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="Area or village"
									/>
								</div>

								<div>
									<label className={labelClass}>
										Thana / Upazila
									</label>

									<input
										value={address.thana}
										onChange={(e) =>
											updateAddress(
												'thana',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="Thana / Upazila"
									/>
								</div>

								<div className="sm:col-span-2">
									<label className={labelClass}>
										District / City
									</label>

									<input
										value={address.city}
										onChange={(e) =>
											updateAddress(
												'city',
												e.target.value
											)
										}
										className={inputClass}
										placeholder="District / City"
									/>
								</div>
							</div>
						</section>

						{/* Order Items */}
						<section className={sectionClass}>
							<div className="mb-5 flex items-center justify-between gap-3">
								<h2 className="flex items-center gap-2 font-semibold text-gray-100">
									<ShoppingBag
										size={19}
										className="text-green-500"
									/>
									Order Items
								</h2>

								<button
									type="button"
									onClick={addItem}
									className="flex items-center gap-1.5 rounded-lg bg-[#1f5d3b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#17482d]">
									<Plus size={16} />
									Add Item
								</button>
							</div>

							{productsLoading && (
								<div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm text-gray-400">
									<Loader2
										size={17}
										className="animate-spin"
									/>
									Loading products...
								</div>
							)}

							{productLoadError && (
								<div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-400">
									{productLoadError}
								</div>
							)}

							<div className="space-y-4">
								{items.map((item, index) => {
									const matchedProducts = searchProducts(
										item.productQuery
									);

									const showProductDropdown =
										item.productQuery.trim().length >= 2 &&
										!item.productId;

									const variants =
										item.selectedProduct?.variants || [];

									const selectedVariant = variants.find(
										(v) =>
											String(v._id) ===
											String(item.variantId)
									);

									return (
										<div
											key={index}
											className="rounded-lg border border-gray-700 bg-gray-950/50 p-4">
											<div className="mb-4 flex items-center justify-between">
												<p className="text-sm font-semibold text-gray-200">
													Item #{index + 1}
												</p>

												<button
													type="button"
													disabled={
														items.length === 1
													}
													onClick={() =>
														removeItem(index)
													}
													className="rounded-lg p-2 text-red-400 hover:bg-red-950/40 disabled:opacity-30">
													<Trash2 size={17} />
												</button>
											</div>

											{/* Product Search */}
											<div className="relative mb-4">
												<label className={labelClass}>
													Search Product
												</label>

												<div className="relative">
													<PackageSearch
														size={18}
														className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
													/>

													<input
														value={
															item.productQuery
														}
														onChange={(e) => {
															const value =
																e.target.value;

															setItems((prev) =>
																prev.map(
																	(
																		current,
																		i
																	) =>
																		i ===
																		index
																			? {
																					...current,
																					productQuery:
																						value,
																					productId:
																						'',
																					variantId:
																						'',
																					variantLabel:
																						'',
																					selectedProduct:
																						null,
																					selectedVariantId:
																						'',
																				}
																			: current
																)
															);
														}}
														placeholder="Search by product name, category or SKU..."
														className={`${inputClass} pl-10`}
													/>

													{item.productId && (
														<button
															type="button"
															onClick={() =>
																clearSelectedProduct(
																	index
																)
															}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400">
															<X size={17} />
														</button>
													)}
												</div>

												{showProductDropdown && (
													<div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
														{matchedProducts.length >
														0 ? (
															matchedProducts.map(
																(product) => {
																	const firstVariant =
																		product
																			.variants?.[0];

																	const availableStock =
																		product.variants?.reduce(
																			(
																				sum,
																				variant
																			) =>
																				sum +
																				getVariantStock(
																					variant
																				),
																			0
																		) || 0;

																	return (
																		<button
																			type="button"
																			key={
																				product._id
																			}
																			onClick={() =>
																				selectProduct(
																					index,
																					product
																				)
																			}
																			className="flex w-full items-center gap-3 border-b border-gray-800 p-3 text-left last:border-0 hover:bg-gray-800">
																			<div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
																				{product.image ? (
																					<img
																						src={
																							product.image
																						}
																						alt={
																							product.name
																						}
																						className="h-full w-full object-cover"
																					/>
																				) : (
																					<div className="flex h-full items-center justify-center text-gray-500">
																						<ShoppingBag
																							size={
																								20
																							}
																						/>
																					</div>
																				)}
																			</div>

																			<div className="min-w-0 flex-1">
																				<p className="truncate text-sm font-semibold text-gray-100">
																					{
																						product.name
																					}
																				</p>

																				<p className="mt-1 text-xs text-gray-400">
																					{product.category ||
																						'Product'}
																					{firstVariant &&
																						` · ${getVariantLabel(firstVariant)}`}
																				</p>

																				<p className="mt-1 text-sm font-semibold text-green-400">
																					{formatPrice(
																						firstVariant
																							? getVariantPrice(
																									firstVariant
																								)
																							: 0
																					)}
																				</p>

																				<p className="mt-1 text-xs text-gray-500">
																					Total
																					variant
																					stock:{' '}
																					{
																						availableStock
																					}
																				</p>
																			</div>

																			<span className="shrink-0 text-xs font-medium text-green-400">
																				Select
																			</span>
																		</button>
																	);
																}
															)
														) : (
															<p className="p-4 text-center text-sm text-gray-400">
																No product
																found.
															</p>
														)}
													</div>
												)}

												<p className="mt-2 text-xs text-gray-500">
													Search and select a product
													to auto-fill its details.
												</p>
											</div>

											{/* Selected Product */}
											{item.selectedProduct && (
												<div className="mb-4 rounded-lg border border-green-900 bg-green-950/30 p-3">
													<div className="flex items-center gap-3">
														{item.image ? (
															<img
																src={item.image}
																alt={
																	item
																		.selectedProduct
																		.name
																}
																className="h-14 w-14 rounded-lg border border-gray-700 object-cover"
															/>
														) : (
															<div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-800 text-gray-500">
																<ShoppingBag
																	size={22}
																/>
															</div>
														)}

														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-semibold text-gray-100">
																{
																	item
																		.selectedProduct
																		.name
																}
															</p>

															<p className="mt-1 text-xs text-green-400">
																<CheckCircle2
																	size={13}
																	className="mr-1 inline"
																/>
																Product selected
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Variant Selection */}
											{variants.length > 0 && (
												<div className="mb-4">
													<label
														className={labelClass}>
														Select Size / Variant *
													</label>

													<select
														required
														value={
															item.selectedVariantId
														}
														onChange={(e) =>
															changeVariant(
																index,
																e.target.value
															)
														}
														className={inputClass}>
														{variants.map(
															(variant) => (
																<option
																	key={
																		variant._id
																	}
																	value={
																		variant._id
																	}>
																	{getVariantLabel(
																		variant
																	)}
																	{' - '}
																	{formatPrice(
																		getVariantPrice(
																			variant
																		)
																	)}
																	{
																		' | Stock: '
																	}
																	{getVariantStock(
																		variant
																	)}
																</option>
															)
														)}
													</select>
												</div>
											)}

											{/* Selected Variant Stock */}
											{selectedVariant && (
												<div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5">
													<div className="flex items-center gap-2 text-sm text-gray-300">
														<Package
															size={16}
															className="text-green-400"
														/>
														Selected stock
													</div>

													<span
														className={`text-sm font-semibold ${
															getVariantStock(
																selectedVariant
															) > 0
																? 'text-green-400'
																: 'text-red-400'
														}`}>
														{getVariantStock(
															selectedVariant
														)}{' '}
														available
													</span>
												</div>
											)}

											{/* Product Fields */}
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
												<div className="sm:col-span-2 lg:col-span-4">
													<label
														className={labelClass}>
														Product Name *
													</label>

													<input
														required
														value={item.name}
														onChange={(e) =>
															updateItem(
																index,
																'name',
																e.target.value
															)
														}
														className={inputClass}
														placeholder="e.g. Sundarbans Honey"
													/>
												</div>

												<div>
													<label
														className={labelClass}>
														Quantity
													</label>

													<input
														type="number"
														min="1"
														step="1"
														required
														value={item.quantity}
														onChange={(e) =>
															updateItem(
																index,
																'quantity',
																e.target.value
															)
														}
														className={inputClass}
													/>
												</div>

												<div>
													<label
														className={labelClass}>
														Unit Price (৳)
													</label>

													<input
														type="number"
														min="0"
														step="0.01"
														required
														value={item.price}
														onChange={(e) =>
															updateItem(
																index,
																'price',
																e.target.value
															)
														}
														className={inputClass}
														disabled={Boolean(
															item.productId
														)}
														title={
															item.productId
																? 'Product price is managed by the selected variant'
																: ''
														}
													/>
												</div>

												<div className="sm:col-span-2">
													<label
														className={labelClass}>
														Item Total
													</label>

													<div
														className={`${inputClass} bg-gray-800 font-semibold`}>
														{formatPrice(
															(Number(
																item.quantity
															) || 0) *
																(Number(
																	item.price
																) || 0)
														)}
													</div>
												</div>
											</div>

											{/* Stock Warning */}
											{stockErrors
												.filter(
													(error) =>
														error.index === index
												)
												.map((error) => (
													<div
														key={error.message}
														className="mt-3 flex items-center gap-2 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-400">
														<AlertCircle
															size={17}
														/>
														{error.message}
													</div>
												))}
										</div>
									);
								})}
							</div>
						</section>
					</div>

					{/* Summary Column */}
					<div className="space-y-6">
						{/* Order Summary */}
						<section className={sectionClass}>
							<h2 className="mb-5 font-semibold text-gray-100">
								Order Summary
							</h2>

							<div className="space-y-4">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-400">
										Subtotal
									</span>

									<span className="font-semibold text-gray-100">
										{formatPrice(subtotal)}
									</span>
								</div>

								<div>
									<label className={labelClass}>
										Shipping Fee (৳)
									</label>

									<input
										type="number"
										min="0"
										step="0.01"
										value={shippingFee}
										onChange={(e) =>
											setShippingFee(e.target.value)
										}
										className={inputClass}
									/>
								</div>

								<div>
									<label className={labelClass}>
										Discount (৳)
									</label>

									<input
										type="number"
										min="0"
										step="0.01"
										value={discount}
										onChange={(e) =>
											setDiscount(e.target.value)
										}
										className={inputClass}
									/>
								</div>

								<div>
									<label className={labelClass}>
										Additional Admin Discount (৳)
									</label>

									<input
										type="number"
										min="0"
										step="0.01"
										value={adminDiscount}
										onChange={(e) =>
											setAdminDiscount(e.target.value)
										}
										className={inputClass}
									/>
								</div>

								{Number(adminDiscount) > 0 && (
									<div>
										<label className={labelClass}>
											Discount Note
										</label>

										<input
											value={adminDiscountNote}
											onChange={(e) =>
												setAdminDiscountNote(
													e.target.value
												)
											}
											className={inputClass}
											placeholder="Reason for discount"
										/>
									</div>
								)}

								<div className="border-t border-gray-700 pt-4">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-gray-200">
											Grand Total
										</span>

										<span className="text-2xl font-bold text-green-400">
											{formatPrice(total)}
										</span>
									</div>
								</div>
							</div>
						</section>

						{/* Payment */}
						<section className={sectionClass}>
							<h2 className="mb-5 font-semibold text-gray-100">
								Payment Information
							</h2>

							<div className="space-y-4">
								<div>
									<label className={labelClass}>
										Payment Method
									</label>

									<select
										value={paymentMethod}
										onChange={(e) =>
											setPaymentMethod(e.target.value)
										}
										className={inputClass}>
										<option value="COD">
											Cash on Delivery
										</option>
										<option value="bKash">bKash</option>
										<option value="Nagad">Nagad</option>
										<option value="Rocket">Rocket</option>
										<option value="Bank">
											Bank Transfer
										</option>
										<option value="Cash">Cash</option>
									</select>
								</div>

								<div>
									<label className={labelClass}>
										Payment Status
									</label>

									<select
										value={paymentStatus}
										onChange={(e) =>
											setPaymentStatus(e.target.value)
										}
										className={inputClass}>
										<option value="unpaid">Unpaid</option>
										<option value="paid">Paid</option>
										<option value="failed">Failed</option>
									</select>
								</div>

								<div>
									<label className={labelClass}>
										Order Status
									</label>

									<select
										value={status}
										onChange={(e) =>
											setStatus(e.target.value)
										}
										className={inputClass}>
										<option value="pending">Pending</option>
										<option value="confirmed">
											Confirmed
										</option>
										<option value="processing">
											Processing
										</option>
										<option value="shipped">Shipped</option>
										<option value="delivered">
											Delivered
										</option>
									</select>
								</div>
							</div>
						</section>

						{/* Error */}
						{message && (
							<div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-400">
								{message}
							</div>
						)}

						{/* Submit */}
						<button
							type="submit"
							disabled={saving || stockErrors.length > 0}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5d3b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#17482d] disabled:cursor-not-allowed disabled:opacity-60">
							{saving ? (
								<>
									<Loader2
										size={18}
										className="animate-spin"
									/>
									Creating Order...
								</>
							) : (
								<>
									<Save size={18} />
									Create Custom Order
								</>
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

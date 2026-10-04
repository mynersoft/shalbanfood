'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	Search,
	Filter,
	Calendar,
	Package,
	CheckCircle,
	Clock,
	XCircle,
	ChevronRight,
	Download,
	Eye,
	ShoppingBag,
} from 'lucide-react';

import OrderDetailsModal from '@/components/Order/OrderDetailsModal';
import useLoginUser from '@/hooks/useAuth';
import { useUserOrders } from '@/hooks/useOrder';

const OrderHistory = () => {
	const { user } = useLoginUser();

	const userId = user?._id || user?.id;

	const { data, isLoading, isError } = useUserOrders(userId);

	const orders = Array.isArray(data?.orders) ? data.orders : [];

	console.log(orders);

	const [selectedFilter, setSelectedFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// --------------------------------------------------
	// Normalize order data
	// --------------------------------------------------
	const normalizeItems = (order) => {
		if (Array.isArray(order?.itemsList)) {
			return order.itemsList;
		}

		if (Array.isArray(order?.items)) {
			return order.items;
		}

		if (Array.isArray(order?.orderItems)) {
			return order.orderItems;
		}

		return [];
	};

	const getOrderId = (order) => {
		return (
			order?.id ||
			order?.orderId ||
			order?.invoiceNumber ||
			order?._id ||
			'N/A'
		);
	};

	const getOrderDate = (order) => {
		return (
			order?.date ||
			order?.createdAt ||
			order?.created_at ||
			new Date().toISOString()
		);
	};

	const getOrderTotal = (order) => {
		const total = Number(order?.total ?? order?.grandTotal ?? 0);

		return Number.isFinite(total) ? total : 0;
	};

	const getItemName = (item) => {
		return (
			item?.name ||
			item?.productName ||
			item?.title ||
			item?.product?.name ||
			'Product'
		);
	};

	const getItemQuantity = (item) => {
		const quantity = Number(
			item?.quantity ?? item?.qty ?? item?.count ?? 1
		);

		return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
	};

	const getItemPrice = (item) => {
		const price = Number(
			item?.price ?? item?.unitPrice ?? item?.product?.price ?? 0
		);

		return Number.isFinite(price) ? price : 0;
	};

	// --------------------------------------------------
	// Filters
	// --------------------------------------------------
	const filters = [
		{
			id: 'all',
			label: 'All Orders',
			count: orders.length,
		},
		{
			id: 'delivered',
			label: 'Delivered',
			count: orders.filter((o) => o?.status === 'delivered').length,
		},
		{
			id: 'processing',
			label: 'Processing',
			count: orders.filter((o) => o?.status === 'processing').length,
		},
		{
			id: 'shipped',
			label: 'Shipped',
			count: orders.filter((o) => o?.status === 'shipped').length,
		},
		{
			id: 'cancelled',
			label: 'Cancelled',
			count: orders.filter((o) => o?.status === 'cancelled').length,
		},
	];

	// --------------------------------------------------
	// Search
	// --------------------------------------------------
	const filteredOrders = orders.filter((order) => {
		const orderStatus = order?.status || 'pending';

		const matchesFilter =
			selectedFilter === 'all' || orderStatus === selectedFilter;

		const items = normalizeItems(order);

		const query = searchQuery.trim().toLowerCase();

		if (!query) {
			return matchesFilter;
		}

		const orderId = String(getOrderId(order)).toLowerCase();

		const matchesOrderId = orderId.includes(query);

		const matchesProduct = items.some((item) =>
			getItemName(item).toLowerCase().includes(query)
		);

		return matchesFilter && (matchesOrderId || matchesProduct);
	});

	// --------------------------------------------------
	// Status icon
	// --------------------------------------------------
	const getStatusIcon = (status) => {
		switch (status) {
			case 'delivered':
				return <CheckCircle className="w-4 h-4" />;

			case 'processing':
				return <Clock className="w-4 h-4" />;

			case 'shipped':
				return <Package className="w-4 h-4" />;

			case 'cancelled':
				return <XCircle className="w-4 h-4" />;

			default:
				return <Package className="w-4 h-4" />;
		}
	};

	// --------------------------------------------------
	// Status color
	// --------------------------------------------------
	const getStatusColor = (status) => {
		switch (status) {
			case 'delivered':
				return 'bg-green-100 text-green-800';

			case 'processing':
				return 'bg-blue-100 text-blue-800';

			case 'shipped':
				return 'bg-purple-100 text-purple-800';

			case 'cancelled':
				return 'bg-red-100 text-red-800';

			case 'pending':
				return 'bg-yellow-100 text-yellow-800';

			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	// --------------------------------------------------
	// View order
	// --------------------------------------------------
	const handleViewOrder = (order) => {
		setSelectedOrder(order);
		setIsModalOpen(true);
	};

	// --------------------------------------------------
	// Loading
	// --------------------------------------------------
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4">
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

							<p className="text-gray-600">
								Loading your orders...
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// --------------------------------------------------
	// Error
	// --------------------------------------------------
	if (isError) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4">
					<div className="bg-white rounded-xl border border-red-200 p-10 text-center">
						<XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Failed to load orders
						</h2>

						<p className="text-gray-600">
							Please refresh the page and try again.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// --------------------------------------------------
	// Total spent
	// --------------------------------------------------
	const totalSpent = orders.reduce(
		(sum, order) => sum + getOrderTotal(order),
		0
	);

	const deliveredCount = orders.filter(
		(o) => o?.status === 'delivered'
	).length;

	const progressCount = orders.filter(
		(o) => o?.status === 'processing' || o?.status === 'shipped'
	).length;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Stats */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Total Orders */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">
									Total Orders
								</p>

								<p className="text-2xl font-bold text-gray-900">
									{orders.length}
								</p>
							</div>

							<ShoppingBag className="w-10 h-10 text-blue-500 bg-blue-50 p-2 rounded-lg" />
						</div>
					</motion.div>

					{/* Delivered */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">
									Delivered
								</p>

								<p className="text-2xl font-bold text-gray-900">
									{deliveredCount}
								</p>
							</div>

							<CheckCircle className="w-10 h-10 text-green-500 bg-green-50 p-2 rounded-lg" />
						</div>
					</motion.div>

					{/* Progress */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">
									In Progress
								</p>

								<p className="text-2xl font-bold text-gray-900">
									{progressCount}
								</p>
							</div>

							<Clock className="w-10 h-10 text-yellow-500 bg-yellow-50 p-2 rounded-lg" />
						</div>
					</motion.div>

					{/* Total Spent */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">
									Total Spent
								</p>

								<p className="text-2xl font-bold text-gray-900">
									৳{totalSpent.toFixed(2)}
								</p>
							</div>

							<Calendar className="w-10 h-10 text-purple-500 bg-purple-50 p-2 rounded-lg" />
						</div>
					</motion.div>
				</div>

				{/* Search + Filter */}
				<div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

							<input
								type="text"
								placeholder="Search orders by ID or product..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							/>
						</div>

						{/* Filters */}
						<div className="flex items-center gap-2 overflow-x-auto pb-2">
							<Filter className="w-5 h-5 text-gray-500 shrink-0" />

							{filters.map((filter) => (
								<button
									key={filter.id}
									onClick={() => setSelectedFilter(filter.id)}
									className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
										selectedFilter === filter.id
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}>
									{filter.label}

									<span className="ml-2 bg-black/10 px-2 py-0.5 rounded-full text-xs">
										{filter.count}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Orders */}
				<div className="space-y-4">
					{filteredOrders.length === 0 ? (
						<div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
							<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />

							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								No orders found
							</h3>

							<p className="text-gray-600 mb-6">
								{searchQuery
									? 'Try a different search term'
									: "You haven't placed any orders yet"}
							</p>
						</div>
					) : (
						filteredOrders.map((order, index) => {
							const items = normalizeItems(order);
							const orderId = getOrderId(order);
							const orderTotal = getOrderTotal(order);
							const orderDate = getOrderDate(order);
							const status = order?.status || 'pending';

							return (
								<motion.div
									key={order?._id || orderId || index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: index * 0.05,
									}}>
									<div className="bg-white rounded-xl shadow-md hover:shadow-md transition-shadow border border-gray-400  overflow-hidden">
										<div className="p-6">
											{/* Header */}

											<div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
												<div>
													<div className="flex items-center gap-3 mb-2 flex-wrap">
														<h3 className="text-lg font-semibold text-gray-900">
															Order #{orderId}
														</h3>

														<span
															className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
																status
															)}`}>
															<span className="flex items-center gap-1">
																{getStatusIcon(
																	status
																)}

																{String(status)
																	.charAt(0)
																	.toUpperCase() +
																	String(
																		status
																	).slice(1)}
															</span>
														</span>
													</div>

													<div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
														<span className="flex items-center gap-1">
															<Calendar className="w-4 h-4" />

															{new Date(
																orderDate
															).toLocaleDateString(
																'en-US',
																{
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric',
																}
															)}
														</span>

														<span>•</span>

														<span>
															{items.length} item
															{items.length !== 1
																? 's'
																: ''}
														</span>

														<span>•</span>

														<span className="font-medium">
															৳
															{orderTotal.toFixed(
																2
															)}
														</span>
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center gap-3">
													<button
														onClick={() =>
															handleViewOrder(
																order
															)
														}
														className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
														<Eye className="w-4 h-4" />
														View Details
														<ChevronRight className="w-4 h-4" />
													</button>
												</div>
											</div>

											{/* Items */}
											<div className="mt-4 pt-4 border-t border-gray-100">
												<h4 className="text-sm font-medium text-gray-700 mb-3">
													Items
												</h4>

												{items.length === 0 ? (
													<div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
														No item information
														available.
													</div>
												) : (
													<div className="flex flex-wrap gap-4">
														{items
															.slice(0, 3)
															.map(
																(item, idx) => (
																	<div
																		key={
																			item?._id ||
																			item?.productId ||
																			idx
																		}
																		className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
																		<div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
																			<Package className="w-5 h-5 text-gray-400" />
																		</div>

																		<div>
																			<p className="text-sm font-medium text-gray-900">
																				{getItemName(
																					item
																				)}
																			</p>

																			<p className="text-sm text-gray-600">
																				{getItemQuantity(
																					item
																				)}{' '}
																				×
																				৳
																				{getItemPrice(
																					item
																				).toFixed(
																					2
																				)}
																			</p>
																		</div>
																	</div>
																)
															)}

														{items.length > 3 && (
															<div className="flex items-center justify-center bg-gray-50 rounded-lg p-3">
																<span className="text-sm text-gray-600">
																	+
																	{items.length -
																		3}{' '}
																	more items
																</span>
															</div>
														)}
													</div>
												)}
											</div>

											{/* Tracking */}
											{order?.trackingNumber && (
												<div className="mt-4 pt-4 border-t border-gray-100">
													<div className="flex items-center justify-between flex-wrap gap-3">
														<div className="flex items-center gap-2">
															<Package className="w-4 h-4 text-gray-500" />

															<span className="text-sm text-gray-600">
																Tracking:
															</span>

															<code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
																{
																	order.trackingNumber
																}
															</code>
														</div>

														<div className="text-sm text-gray-600">
															{order?.deliveryDate ? (
																<>
																	Delivered on{' '}
																	{new Date(
																		order.deliveryDate
																	).toLocaleDateString()}
																</>
															) : order?.estimatedDelivery ? (
																<>
																	Estimated
																	delivery:{' '}
																	{new Date(
																		order.estimatedDelivery
																	).toLocaleDateString()}
																</>
															) : null}
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</motion.div>
							);
						})
					)}
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && selectedOrder && (
				<OrderDetailsModal
					order={selectedOrder}
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedOrder(null);
					}}
				/>
			)}
		</div>
	);
};

export default OrderHistory;

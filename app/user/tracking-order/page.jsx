'use client';

import { useState } from 'react';
import {
	Package,
	Truck,
	CheckCircle,
	Clock,
	Search,
	XCircle,
	MapPin,
	CreditCard,
} from 'lucide-react';

export default function TrackOrderPage() {
	const [orderId, setOrderId] = useState('');
	const [order, setOrder] = useState(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleTrackOrder = async () => {
		const invoiceNo = orderId.trim();

		if (!invoiceNo) {
			setError('Please enter your order ID.');
			setOrder(null);
			return;
		}

		try {
			setLoading(true);
			setError('');
			setOrder(null);

			const res = await fetch(
				`/api/orders/track?invoiceNo=${encodeURIComponent(invoiceNo)}`,
				{
					method: 'GET',
					cache: 'no-store',
				}
			);

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Order not found');
			}

			setOrder(data.order);
		} catch (err) {
			console.error('Track order error:', err);

			setError(
				err.message ||
					'Unable to find your order. Please check the Order ID.'
			);

			setOrder(null);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleTrackOrder();
		}
	};

	const steps = [
		{
			key: 'pending',
			label: 'Order Placed',
			icon: Clock,
		},
		{
			key: 'processing',
			label: 'Processing',
			icon: Package,
		},
		{
			key: 'shipped',
			label: 'Shipped',
			icon: Truck,
		},
		{
			key: 'delivered',
			label: 'Delivered',
			icon: CheckCircle,
		},
	];

	const currentStepIndex = order
		? steps.findIndex((step) => step.key === order.status)
		: -1;

	const formatDate = (date) => {
		if (!date) return 'N/A';

		return new Date(date).toLocaleDateString('en-BD', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case 'pending':
				return 'Order Placed';

			case 'processing':
				return 'Processing';

			case 'shipped':
				return 'Shipped';

			case 'delivered':
				return 'Delivered';

			case 'cancelled':
				return 'Cancelled';

			default:
				return status;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 py-10">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
						<Truck className="w-8 h-8 text-[#004488]" />
					</div>

					<h1 className="text-3xl font-bold text-gray-900">
						Track Your Order
					</h1>

					<p className="text-gray-600 mt-2">
						Enter your order ID to see your delivery status
					</p>
				</div>

				{/* Search */}
				<div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search
								size={19}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
							/>

							<input
								type="text"
								placeholder="Enter Order ID e.g. TMBD-ADCF08"
								value={orderId}
								onChange={(e) => setOrderId(e.target.value)}
								onKeyDown={handleKeyDown}
								className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004488] focus:border-[#004488]"
							/>
						</div>

						<button
							onClick={handleTrackOrder}
							disabled={loading}
							className="flex items-center justify-center gap-2 bg-[#004488] text-white px-7 py-3 rounded-lg hover:bg-[#003366] transition disabled:opacity-60 disabled:cursor-not-allowed">
							<Search size={18} />

							{loading ? 'Tracking...' : 'Track'}
						</button>
					</div>

					{/* Error */}
					{error && (
						<div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							<XCircle className="w-5 h-5 shrink-0" />

							<span className="text-sm">{error}</span>
						</div>
					)}
				</div>

				{/* Order */}
				{order && (
					<>
						{/* Status Header */}
						<div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
								<div>
									<p className="text-sm text-gray-500">
										Order ID
									</p>

									<h2 className="text-xl font-bold text-gray-900">
										#{order.id}
									</h2>
								</div>

								<div>
									<span
										className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
											order.status === 'delivered'
												? 'bg-green-100 text-green-700'
												: order.status === 'cancelled'
													? 'bg-red-100 text-red-700'
													: 'bg-blue-100 text-blue-700'
										}`}>
										{getStatusLabel(order.status)}
									</span>
								</div>
							</div>

							{/* Timeline */}
							{order.status !== 'cancelled' ? (
								<div className="relative">
									<div className="hidden sm:block absolute top-6 left-[12%] right-[12%] h-1 bg-gray-200" />

									<div
										className="hidden sm:block absolute top-6 left-[12%] h-1 bg-[#004488] transition-all"
										style={{
											width:
												currentStepIndex >= 0
													? `${Math.max(
															0,
															(currentStepIndex /
																(steps.length -
																	1)) *
																76
														)}%`
													: '0%',
										}}
									/>

									<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
										{steps.map((step, index) => {
											const Icon = step.icon;

											const isActive =
												index <= currentStepIndex;

											return (
												<div
													key={step.key}
													className="text-center">
													<div
														className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 relative z-10 ${
															isActive
																? 'bg-[#004488] text-white'
																: 'bg-gray-200 text-gray-400'
														}`}>
														<Icon size={20} />
													</div>

													<p
														className={`text-sm font-medium ${
															isActive
																? 'text-[#004488]'
																: 'text-gray-400'
														}`}>
														{step.label}
													</p>
												</div>
											);
										})}
									</div>
								</div>
							) : (
								<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
									<XCircle className="text-red-500" />

									<div>
										<p className="font-medium text-red-700">
											This order has been cancelled.
										</p>

										<p className="text-sm text-red-600">
											Please contact customer support if
											you need assistance.
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Order Summary */}
						<div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
								<h2 className="font-bold text-xl text-gray-900">
									Order Summary
								</h2>

								<span className="text-sm text-gray-500">
									Placed on {formatDate(order.createdAt)}
								</span>
							</div>

							{/* Items */}
							<div className="space-y-4 mb-6">
								{order.items?.length > 0 ? (
									order.items.map((item, index) => (
										<div
											key={item.productId || index}
											className="flex items-center justify-between gap-4 border-b pb-4">
											<div className="flex items-center gap-3">
												{item.image ? (
													<img
														src={item.image}
														alt={item.name}
														className="w-14 h-14 object-cover rounded-lg border"
													/>
												) : (
													<div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
														<Package className="w-6 h-6 text-gray-400" />
													</div>
												)}

												<div>
													<p className="font-medium text-gray-900">
														{item.name}
													</p>

													<p className="text-sm text-gray-500">
														Qty: {item.quantity}
													</p>
												</div>
											</div>

											<div className="text-right">
												<p className="font-medium text-gray-900">
													৳
													{Number(
														item.price || 0
													).toFixed(2)}
												</p>

												<p className="text-xs text-gray-500">
													× {item.quantity}
												</p>
											</div>
										</div>
									))
								) : (
									<p className="text-gray-500 text-sm">
										No items found for this order.
									</p>
								)}
							</div>

							{/* Price */}
							<div className="border-t pt-4 space-y-2">
								<div className="flex justify-between text-sm text-gray-600">
									<span>Subtotal</span>

									<span>
										৳
										{Number(order.subtotal || 0).toFixed(2)}
									</span>
								</div>

								<div className="flex justify-between text-sm text-gray-600">
									<span>Shipping Fee</span>

									<span>
										৳
										{Number(order.shippingFee || 0).toFixed(
											2
										)}
									</span>
								</div>

								{Number(order.discount || 0) > 0 && (
									<div className="flex justify-between text-sm text-green-600">
										<span>Discount</span>

										<span>
											-৳
											{Number(order.discount).toFixed(2)}
										</span>
									</div>
								)}

								<div className="flex justify-between font-bold text-xl pt-3 border-t">
									<span>Total</span>

									<span className="text-[#004488]">
										৳{Number(order.total || 0).toFixed(2)}
									</span>
								</div>
							</div>
						</div>

						{/* Customer + Shipping */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Shipping */}
							<div className="bg-white rounded-xl shadow-sm border p-6">
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="w-5 h-5 text-[#004488]" />

									<h2 className="font-bold text-lg">
										Delivery Address
									</h2>
								</div>

								<div className="space-y-2 text-sm text-gray-600">
									<p>
										<span className="font-medium text-gray-900">
											Customer:
										</span>{' '}
										{order.customer?.name || 'N/A'}
									</p>

									<p>
										<span className="font-medium text-gray-900">
											Phone:
										</span>{' '}
										{order.customer?.phone ||
											order.shippingAddress?.phone ||
											'N/A'}
									</p>

									{order.shippingAddress?.area && (
										<p>
											<span className="font-medium text-gray-900">
												Area:
											</span>{' '}
											{order.shippingAddress.area}
										</p>
									)}

									{order.shippingAddress?.thana && (
										<p>
											<span className="font-medium text-gray-900">
												Thana:
											</span>{' '}
											{order.shippingAddress.thana}
										</p>
									)}

									{order.shippingAddress?.city && (
										<p>
											<span className="font-medium text-gray-900">
												City:
											</span>{' '}
											{order.shippingAddress.city}
										</p>
									)}
								</div>
							</div>

							{/* Payment */}
							<div className="bg-white rounded-xl shadow-sm border p-6">
								<div className="flex items-center gap-2 mb-4">
									<CreditCard className="w-5 h-5 text-[#004488]" />

									<h2 className="font-bold text-lg">
										Payment
									</h2>
								</div>

								<div className="space-y-3 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">
											Method
										</span>

										<span className="font-medium">
											{order.payment?.method || 'COD'}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-500">
											Status
										</span>

										<span
											className={`font-medium ${
												order.payment?.status === 'paid'
													? 'text-green-600'
													: order.payment?.status ===
														  'failed'
														? 'text-red-600'
														: 'text-yellow-600'
											}`}>
											{order.payment?.status || 'unpaid'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

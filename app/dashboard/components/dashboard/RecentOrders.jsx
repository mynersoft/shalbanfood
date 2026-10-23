import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Eye, Package, X } from 'lucide-react';
const money = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`;

const STATUS = {
	pending: 'text-yellow-400',
	processing: 'text-blue-400',
	shipped: 'text-purple-400',
	delivered: 'text-green-400',
	cancelled: 'text-red-400',
	return: 'text-orange-400',
};

const parseDate = (value) => {
	if (!value) return null;

	const raw = value?.$date || value;
	const date = new Date(raw);

	if (Number.isNaN(date.getTime())) return null;
	return date;
};

const formatDate = (value) => {
	const date = parseDate(value);
	if (!date) return '—';

	const time = date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
	const [timeValue, period] = time.split(' ');

	return `${timeValue.replace(':', '.')} ${period} ${date.toLocaleDateString(
		'en-GB',
		{
			day: '2-digit',
			month: 'short',
		}
	)}`;
};

const formatAddress = (shippingAddress) => {
	if (!shippingAddress) return 'Dhaka';

	const parts = [
		shippingAddress.area,
		shippingAddress.thana,
		shippingAddress.city,
	].filter(Boolean);
	return parts.length ? parts.join(', ') : 'Dhaka';
};

const getOrderId = (order) => {
	if (order?._id && typeof order._id === 'object')
		return order._id.$oid || order._id;
	if (order?._id) return String(order._id);
	return order?.invoiceNo || 'order';
};

const getOrderItemName = (order) => {
	const items = Array.isArray(order?.items)
		? order.items
		: Array.isArray(order?.orderItems)
			? order.orderItems
			: [];
	if (!items.length) return null;

	const firstItem = items[0];
	return (
		firstItem?.name ||
		firstItem?.product?.name ||
		firstItem?.productName ||
		firstItem?.item?.name ||
		firstItem?.menuItem?.name ||
		null
	);
};

function Invoice({ order, onClose }) {
	if (!order) return null;

	const items = Array.isArray(order.items)
		? order.items
		: Array.isArray(order.orderItems)
			? order.orderItems
			: [];

	const subtotal = Number(order.subtotal ?? order.total ?? 0);
	const total = Number(order.total ?? subtotal);
	const customerName = order.customer?.name || 'Customer';
	const invoiceNo =
		order.invoiceNo || `#${String(getOrderId(order)).slice(-8)}`;
	const address = formatAddress(order.shippingAddress);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
			<div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#151821] shadow-2xl">
				<div className="flex items-center justify-between border-b border-white/10 p-5">
					<div>
						<p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">
							Invoice
						</p>
						<h3 className="mt-2 text-xl font-semibold text-white">
							{invoiceNo}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:border-blue-500/40 hover:text-blue-400"
						aria-label="Close invoice">
						<X size={16} />
					</button>
				</div>

				<div className="grid gap-6 p-5 md:grid-cols-2">
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-400">
							Customer
						</p>
						<p className="mt-2 font-medium text-white">
							{customerName}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-400">
							Date
						</p>
						<p className="mt-2 font-medium text-white">
							{formatDate(order.createdAt) || '—'}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-400">
							Status
						</p>
						<p
							className={`mt-2 text-sm font-medium capitalize ${STATUS[order.status] || 'text-gray-400'}`}>
							{order.status || 'pending'}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-400">
							Address
						</p>
						<p className="mt-2 font-medium text-white">{address}</p>
					</div>
				</div>

				<div className="border-t border-b border-white/10 px-5 py-4">
					<table className="w-full text-left text-sm">
						<thead className="text-xs uppercase tracking-wide text-gray-400">
							<tr>
								<th className="py-2 font-medium">Item</th>
								<th className="py-2 text-right font-medium">
									Qty
								</th>
								<th className="py-2 text-right font-medium">
									Price
								</th>
							</tr>
						</thead>
						<tbody>
							{items.length ? (
								items.map((item, index) => {
									const itemName =
										item?.name ||
										item?.product?.name ||
										item?.productName ||
										item?.item?.name ||
										item?.menuItem?.name ||
										`Item ${index + 1}`;
									const qty = Number(
										item?.quantity ?? item?.qty ?? 1
									);
									const price = Number(
										item?.price ??
											item?.unitPrice ??
											item?.total ??
											0
									);

									return (
										<tr
											key={`${itemName}-${index}`}
											className="border-t border-white/5">
											<td className="py-3 text-white">
												{itemName}
											</td>
											<td className="py-3 text-right text-gray-300">
												{qty}
											</td>
											<td className="py-3 text-right text-white">
												{money(price)}
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td
										colSpan="3"
										className="py-3 text-gray-400">
										No items available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-between p-5 text-sm">
					<span className="text-gray-400">Subtotal</span>
					<span className="font-medium text-white">
						{money(subtotal)}
					</span>
				</div>
				<div className="flex items-center justify-between p-5 text-sm">
					<span className="text-gray-400">Delivery charge</span>
					<span className="font-medium text-white">
						{money(order.shippingFee)}
					</span>
				</div>
				<div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-base">
					<span className="font-medium text-white">Total</span>
					<span className="font-semibold text-blue-400">
						{money(total)}
					</span>
				</div>
			</div>
		</div>
	);
}

export default function RecentOrders({ orders = [] }) {
	const [selectedOrder, setSelectedOrder] = useState(null);

	const recent = [...orders]
		.filter((order) => order?.status !== 'delivered')
		.sort((a, b) => {
			const aDate = parseDate(a.createdAt)?.getTime?.() || 0;
			const bDate = parseDate(b.createdAt)?.getTime?.() || 0;
			return bDate - aDate;
		})
		.slice(0, 6);

	return (
		<>
			<section className="rounded-2xl border border-white/10 bg-[#151821]">
				<div className="flex items-center justify-between border-b border-white/10 p-5">
					<div>
						<h2 className="font-semibold">Recent Orders</h2>
						<p className="mt-1 text-xs text-gray-400">
							Latest orders
						</p>
					</div>
					<Link
						href="/dashboard/orders"
						className="flex items-center gap-1 text-sm text-blue-400">
						View All <ArrowRight size={15} />
					</Link>
				</div>

				{recent.length === 0 ? (
					<p className="p-8 text-center text-sm text-gray-400">
						No orders yet
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-gray-400">
								<tr>
									<th className="px-4 py-3 font-medium">
										Order
									</th>
									<th className="px-4 py-3 font-medium">
										Product
									</th>
									<th className="px-4 py-3 font-medium">
										Customer
									</th>
									<th className="px-4 py-3 font-medium">
										Status
									</th>
									<th className="px-4 py-3 font-medium">
										Subtotal
									</th>
									<th className="px-4 py-3 font-medium">
										Total
									</th>
									<th className="px-4 py-3 font-medium">
										Action
									</th>
								</tr>
							</thead>

							<tbody>
								{recent.map((order) => {
									const orderId = getOrderId(order);
									const productName =
										getOrderItemName(order) || '—';

									return (
										<tr
											key={orderId}
											className="border-b border-white/5 last:border-0">
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
														<Package size={16} />
													</span>
													<div>
														<p className="font-medium text-white">
															{order.invoiceNo ||
																`#${String(orderId).slice(-8)}`}
														</p>
														<p className="mt-1 text-xs text-gray-400">
															{formatAddress(
																order.shippingAddress
															)}
														</p>
													</div>
												</div>
											</td>

											<td className="px-4 py-3">
												<p className="font-medium text-white">
													{productName}
												</p>
											</td>
											<td className="px-4 py-3">
												<p className="font-medium text-white">
													{order.customer?.name ||
														'—'}
												</p>
											</td>

											<td className="px-4 py-3">
												<span
													className={`text-xs capitalize ${STATUS[order.status] || 'text-gray-400'}`}>
													{order.status}
												</span>
											</td>

											<td className="px-4 py-3 font-medium text-white">
												{money(
													order.subtotal ??
														order.total
												)}
											</td>

											<td className="px-4 py-3 font-medium text-white">
												{money(order.total)}
											</td>

											<td className="px-4 py-3">
												<button
													type="button"
													onClick={() =>
														setSelectedOrder(order)
													}
													title="View invoice"
													className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-gray-300 transition hover:border-blue-500/40 hover:text-blue-400">
													<Eye size={15} />
													View
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{selectedOrder && (
				<Invoice
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</>
	);
}

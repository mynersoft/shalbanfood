'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
	CalendarDays,
	UserRound,
	Phone,
	Mail,
	MapPin,
	CreditCard,
	Package,
	Printer,
	Download,
	X,
	LoaderCircle,
	ReceiptText,
	Truck,
	Save,
	Ban,
	StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export const ORDER_STATUSES = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'];

export const STATUS_STYLES = {
	pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
	processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
	shipped: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
	delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
	cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const formatMoney = (amount) => formatCurrency(Number(amount) || 0);

export const getOrderId = (order) =>
	order?.orderId || order?._id?.slice(-8)?.toUpperCase() || 'N/A';

const getAddress = (address = {}) =>
	[
		address.area,
		address.thana,
		address.city,
		address.district,
		address.division,
		address.postalCode,
	]
		.filter(Boolean)
		.join(', ') || 'Address not provided';

const DetailRow = ({ label, value }) => (
	<div className="flex items-start justify-between gap-4 py-2">
		<span className="text-sm text-gray-400">{label}</span>
		<span className="break-words text-right text-sm font-medium text-gray-100">
			{value || 'N/A'}
		</span>
	</div>
);

const Section = ({ icon: Icon, title, children }) => (
	<section className="rounded-xl border border-gray-700/70 bg-gray-800/60 p-4 sm:p-5">
		<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
			<Icon size={17} className="text-emerald-400" />
			{title}
		</h3>
		{children}
	</section>
);

const inputClass =
	'w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

/**
 * Props:
 *  - order, isOpen, onClose
 *  - onUpdate(orderId, payload): Promise  (payload: status, paymentStatus, trackingNumber, adminNote)
 *  - isUpdating: boolean
 */
const AdminOrderDetailsModal = ({
	isOpen,
	onClose,
	order,
	onUpdate,
	isUpdating = false,
}) => {
	const invoiceRef = useRef(null);
	const [downloading, setDownloading] = useState(false);

	const [status, setStatus] = useState('pending');
	const [paymentStatus, setPaymentStatus] = useState('unpaid');
	const [trackingNumber, setTrackingNumber] = useState('');
	const [adminNote, setAdminNote] = useState('');
	const [confirmCancel, setConfirmCancel] = useState(false);

	// Sync local form state whenever a different order is opened / refreshed
	useEffect(() => {
		if (!order) return;
		setStatus((order.status || 'pending').toLowerCase());
		setPaymentStatus((order.paymentStatus || 'unpaid').toLowerCase());
		setTrackingNumber(order.trackingNumber || '');
		setAdminNote(order.adminNote || '');
		setConfirmCancel(false);
	}, [order]);

	// Close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e) => e.key === 'Escape' && onClose?.();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	if (!isOpen || !order) return null;

	const orderId = getOrderId(order);
	const customer = order.customer || {};
	const address = order.shippingAddress || {};
	const items = order?.orderItems || [];
	const currentStatus = (order.status || 'pending').toLowerCase();

	const subtotal = Number(
		order.subtotal ??
			items.reduce(
				(s, i) => s + Number(i.price || 0) * Number(i.quantity || 0),
				0
			)
	);
	const shippingCost = Number(order.shippingCost || 0);
	const tax = Number(order.tax || 0);
	const total = Number(order.total ?? subtotal + shippingCost + tax);
	const invoiceDate = order.createdAt ? formatDate(order.createdAt) : 'N/A';

	const isLocked =
		currentStatus === 'cancelled' || currentStatus === 'delivered';

	const hasChanges =
		status !== currentStatus ||
		paymentStatus !== (order.paymentStatus || 'unpaid').toLowerCase() ||
		trackingNumber !== (order.trackingNumber || '') ||
		adminNote !== (order.adminNote || '');

	const save = async (overrides = {}) => {
		if (typeof onUpdate !== 'function') {
			toast.error('Update handler is missing.');
			return;
		}
		const payload = {
			status,
			paymentStatus,
			trackingNumber: trackingNumber.trim(),
			adminNote: adminNote.trim(),
			...overrides,
		};
		if (payload.status === 'shipped' && !payload.trackingNumber) {
			toast('Tip: add a tracking number for shipped orders.', {
				icon: 'ℹ️',
			});
		}
		try {
			await onUpdate(order._id, payload);
		} catch {
			/* toast handled in hook */
		}
	};

	const cancelOrder = async () => {
		setStatus('cancelled');
		await save({ status: 'cancelled' });
		setConfirmCancel(false);
	};

	const downloadInvoice = async () => {
		if (!invoiceRef.current) return;
		try {
			setDownloading(true);
			await html2pdf()
				.set({
					margin: 10,
					filename: `Shalban-Food-Invoice-${orderId}.pdf`,
					image: { type: 'jpeg', quality: 0.98 },
					html2canvas: {
						scale: 2,
						useCORS: true,
						backgroundColor: '#ffffff',
					},
					jsPDF: {
						unit: 'mm',
						format: 'a4',
						orientation: 'portrait',
					},
				})
				.from(invoiceRef.current)
				.save();
			toast.success('Invoice downloaded!');
		} catch (e) {
			console.error(e);
			toast.error('Could not download invoice.');
		} finally {
			setDownloading(false);
		}
	};

	const printInvoice = () => {
		if (!invoiceRef.current) return;
		const w = window.open('', '_blank', 'width=900,height=700');
		if (!w) {
			toast.error('Please allow pop-ups to print.');
			return;
		}
		w.document
			.write(`<!DOCTYPE html><html><head><title>Invoice ${orderId}</title>
			<meta charset="UTF-8" />
			<style>
				*{box-sizing:border-box}
				body{margin:0;padding:24px;font-family:Arial,"Noto Sans Bengali",sans-serif;color:#222}
				@page{size:A4;margin:12mm}
				@media print{body{padding:0}}
			</style></head>
			<body>${invoiceRef.current.innerHTML}
			<script>window.onload=function(){setTimeout(function(){window.print()},400)};
			window.onafterprint=function(){window.close()};<\/script></body></html>`);
		w.document.close();
	};

	const statusClass =
		STATUS_STYLES[currentStatus] ||
		'bg-gray-500/10 text-gray-300 border-gray-500/20';

	const th = { padding: '10px 8px', borderBottom: '1px solid #a7f3d0' };
	const td = { padding: '9px 8px', borderBottom: '1px solid #e5e7eb' };

	return (
		<>
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-5"
				onClick={onClose}>
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby="admin-order-title"
					className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 text-gray-100 shadow-2xl"
					onClick={(e) => e.stopPropagation()}>
					{/* Header */}
					<div className="flex items-center justify-between border-b border-gray-700 px-4 py-4 sm:px-6">
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
								<ReceiptText
									className="text-emerald-400"
									size={23}
								/>
							</div>
							<div>
								<h2
									id="admin-order-title"
									className="text-lg font-bold text-white sm:text-xl">
									Manage Order
								</h2>
								<p className="mt-1 text-xs text-gray-400">
									Invoice #{orderId}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white">
							<X size={21} />
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
						{/* Banner */}
						<div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800/60 p-4 sm:flex-row sm:items-center">
							<div>
								<p className="text-xs text-gray-400">
									Order reference
								</p>
								<p className="mt-1 font-semibold text-white">
									#{orderId}
								</p>
								<p className="mt-1 text-sm text-gray-400">
									Placed on {invoiceDate}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<span
									className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
									{currentStatus}
								</span>
								<span className="text-lg font-bold text-emerald-400">
									{formatMoney(total)}
								</span>
							</div>
						</div>

						{/* ADMIN CONTROLS */}
						<Section icon={Truck} title="Update Order">
							{isLocked && (
								<p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
									This order is {currentStatus}. You can still
									change it, but be careful.
								</p>
							)}

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<label className="block">
									<span className="mb-1.5 block text-xs text-gray-400">
										Order status
									</span>
									<select
										value={status}
										onChange={(e) =>
											setStatus(e.target.value)
										}
										className={inputClass}>
										{ORDER_STATUSES.map((s) => (
											<option key={s} value={s}>
												{s.charAt(0).toUpperCase() +
													s.slice(1)}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-1.5 block text-xs text-gray-400">
										Payment status
									</span>
									<select
										value={paymentStatus}
										onChange={(e) =>
											setPaymentStatus(e.target.value)
										}
										className={inputClass}>
										{PAYMENT_STATUSES.map((s) => (
											<option key={s} value={s}>
												{s.charAt(0).toUpperCase() +
													s.slice(1)}
											</option>
										))}
									</select>
								</label>

								<label className="block sm:col-span-2">
									<span className="mb-1.5 block text-xs text-gray-400">
										Tracking number
									</span>
									<input
										type="text"
										value={trackingNumber}
										onChange={(e) =>
											setTrackingNumber(e.target.value)
										}
										placeholder="e.g. SF-2026-000123"
										className={inputClass}
									/>
								</label>

								<label className="block sm:col-span-2">
									<span className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-400">
										<StickyNote size={13} /> Internal note
										(not shown to customer)
									</span>
									<textarea
										rows={3}
										value={adminNote}
										onChange={(e) =>
											setAdminNote(e.target.value)
										}
										className={inputClass}
									/>
								</label>
							</div>

							{/* Quick actions */}
							<div className="mt-4 flex flex-wrap items-center gap-2">
								<span className="text-xs text-gray-400">
									Quick:
								</span>
								{[
									['processing', 'Mark Processing'],
									['shipped', 'Mark Shipped'],
									['delivered', 'Mark Delivered'],
								].map(([val, label]) => (
									<button
										key={val}
										type="button"
										disabled={
											isUpdating || currentStatus === val
										}
										onClick={() => {
											setStatus(val);
											save({ status: val });
										}}
										className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
										{label}
									</button>
								))}
							</div>

							<div className="mt-5 flex flex-col gap-3 border-t border-gray-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
								{currentStatus !== 'cancelled' ? (
									confirmCancel ? (
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-sm text-red-300">
												Cancel this order?
											</span>
											<button
												type="button"
												onClick={cancelOrder}
												disabled={isUpdating}
												className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50">
												Yes, cancel
											</button>
											<button
												type="button"
												onClick={() =>
													setConfirmCancel(false)
												}
												className="rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800">
												No
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() =>
												setConfirmCancel(true)
											}
											className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
											<Ban size={16} /> Cancel Order
										</button>
									)
								) : (
									<span className="text-sm text-red-400">
										This order is cancelled.
									</span>
								)}

								<button
									type="button"
									onClick={() => save()}
									disabled={!hasChanges || isUpdating}
									className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
									{isUpdating ? (
										<LoaderCircle
											size={16}
											className="animate-spin"
										/>
									) : (
										<Save size={16} />
									)}
									{isUpdating ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</Section>

						{/* Info grid */}
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Section
								icon={CalendarDays}
								title="Order Information">
								<DetailRow label="Order ID" value={orderId} />
								<DetailRow
									label="Order date"
									value={invoiceDate}
								/>
								<DetailRow
									label="Payment method"
									value={
										order.paymentMethod ||
										'Cash on Delivery'
									}
								/>
								<DetailRow
									label="Payment status"
									value={order.paymentStatus || 'N/A'}
								/>
							</Section>

							<Section
								icon={UserRound}
								title="Customer Information">
								<DetailRow
									label="Full name"
									value={customer.name}
								/>
								<div className="flex items-start gap-2 py-2">
									<Phone
										size={15}
										className="mt-0.5 text-gray-400"
									/>
									{customer.phone ? (
										<a
											href={`tel:${customer.phone}`}
											className="break-all text-sm text-emerald-400 hover:underline">
											{customer.phone}
										</a>
									) : (
										<span className="text-sm text-gray-200">
											N/A
										</span>
									)}
								</div>
								<div className="flex items-start gap-2 py-2">
									<Mail
										size={15}
										className="mt-0.5 text-gray-400"
									/>
									{customer.email ? (
										<a
											href={`mailto:${customer.email}`}
											className="break-all text-sm text-emerald-400 hover:underline">
											{customer.email}
										</a>
									) : (
										<span className="text-sm text-gray-200">
											N/A
										</span>
									)}
								</div>
							</Section>

							<Section icon={MapPin} title="Shipping Information">
								<p className="text-sm leading-6 text-gray-200">
									{getAddress(address)}
								</p>
								<div className="mt-3 border-t border-gray-700 pt-2">
									<DetailRow
										label="Shipping method"
										value={
											order.shippingMethod ||
											'Standard Delivery'
										}
									/>
									<DetailRow
										label="Tracking number"
										value={
											order.trackingNumber ||
											'Not assigned'
										}
									/>
								</div>
							</Section>

							<Section icon={CreditCard} title="Payment Summary">
								<DetailRow
									label="Subtotal"
									value={formatMoney(subtotal)}
								/>
								<DetailRow
									label="Shipping charge"
									value={formatMoney(shippingCost)}
								/>
								<DetailRow
									label="Tax"
									value={formatMoney(tax)}
								/>
								<div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-4">
									<span className="font-semibold text-white">
										Grand total
									</span>
									<span className="text-xl font-bold text-emerald-400">
										{formatMoney(total)}
									</span>
								</div>
							</Section>
						</div>

						{/* Items */}
						<section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/40">
							<div className="flex items-center justify-between border-b border-gray-700 px-4 py-4 sm:px-5">
								<h3 className="flex items-center gap-2 font-semibold text-white">
									<Package
										size={18}
										className="text-emerald-400"
									/>
									Order Items
								</h3>
								<span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-200">
									{items.length} products
								</span>
							</div>
							<div className="divide-y divide-gray-700/70">
								{items.length > 0 ? (
									items.map((item, index) => (
										<div
											key={
												item._id ||
												item.productId ||
												index
											}
											className="flex items-center gap-3 p-4 sm:gap-4">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
												{item.image ? (
													<img
														src={item.image}
														alt={
															item.name ||
															'Product'
														}
														className="h-full w-full object-cover"
													/>
												) : (
													<Package
														size={23}
														className="text-gray-500"
													/>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="break-words text-sm font-semibold text-white">
													{item.name ||
														'Unnamed product'}
												</p>
												<p className="mt-1 text-xs text-gray-400">
													{Number(item.quantity || 0)}{' '}
													× {formatMoney(item.price)}
												</p>
											</div>
											<p className="shrink-0 text-sm font-semibold text-gray-100">
												{formatMoney(
													Number(item.quantity || 0) *
														Number(item.price || 0)
												)}
											</p>
										</div>
									))
								) : (
									<p className="p-5 text-sm text-gray-400">
										No products found.
									</p>
								)}
							</div>
						</section>
					</div>

					{/* Footer */}
					<div className="flex flex-col-reverse gap-3 border-t border-gray-700 bg-gray-900 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
						<p className="hidden text-xs text-gray-500 sm:block">
							Shalban Food · Admin order management
						</p>
						<div className="grid grid-cols-1 gap-2 sm:flex">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white">
								Close
							</button>
							<button
								type="button"
								onClick={printInvoice}
								className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-gray-800">
								<Printer size={16} /> Print Invoice
							</button>
							<button
								type="button"
								onClick={downloadInvoice}
								disabled={downloading}
								className="flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-600/10 disabled:opacity-60">
								{downloading ? (
									<LoaderCircle
										size={17}
										className="animate-spin"
									/>
								) : (
									<Download size={17} />
								)}
								{downloading
									? 'Generating PDF...'
									: 'Download Invoice'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Offscreen invoice for PDF / print */}
			<div
				ref={invoiceRef}
				style={{
					position: 'fixed',
					left: '-10000px',
					top: 0,
					width: '794px',
					padding: '36px',
					background: '#fff',
					color: '#1f2937',
					fontFamily: 'Arial, sans-serif',
					fontSize: '12px',
					lineHeight: 1.5,
					zIndex: -1,
				}}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						borderBottom: '2px solid #059669',
						paddingBottom: '20px',
					}}>
					<div>
						<h1
							style={{
								fontSize: 28,
								fontWeight: 800,
								color: '#047857',
								margin: 0,
							}}>
							Shalban Food
						</h1>
						<p style={{ color: '#6b7280', margin: '5px 0' }}>
							Quality Foods · Trusted Service
						</p>
					</div>
					<div style={{ textAlign: 'right' }}>
						<h2 style={{ fontSize: 23, margin: 0 }}>INVOICE</h2>
						<p style={{ margin: '6px 0 2px' }}>
							<strong>Invoice No:</strong> {orderId}
						</p>
						<p style={{ margin: '2px 0' }}>
							<strong>Date:</strong> {invoiceDate}
						</p>
						<p style={{ margin: '2px 0' }}>
							<strong>Status:</strong>{' '}
							{currentStatus.toUpperCase()}
						</p>
					</div>
				</div>

				<div style={{ display: 'flex', gap: 30, margin: '25px 0' }}>
					<div style={{ flex: 1 }}>
						<h3
							style={{
								color: '#047857',
								fontSize: 13,
								borderBottom: '1px solid #e5e7eb',
								paddingBottom: 7,
							}}>
							BILL TO
						</h3>
						<p style={{ margin: '5px 0' }}>
							<strong>{customer.name || 'Customer'}</strong>
						</p>
						<p style={{ margin: '5px 0' }}>
							Phone: {customer.phone || 'N/A'}
						</p>
						<p
							style={{
								margin: '5px 0',
								overflowWrap: 'anywhere',
							}}>
							Email: {customer.email || 'N/A'}
						</p>
					</div>
					<div style={{ flex: 1 }}>
						<h3
							style={{
								color: '#047857',
								fontSize: 13,
								borderBottom: '1px solid #e5e7eb',
								paddingBottom: 7,
							}}>
							SHIP TO
						</h3>
						<p style={{ margin: '5px 0', lineHeight: 1.7 }}>
							{getAddress(address)}
						</p>
						<p style={{ margin: '5px 0' }}>
							Payment: {order.paymentMethod || 'Cash on Delivery'}
						</p>
					</div>
				</div>

				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ background: '#ecfdf5', color: '#065f46' }}>
							<th style={{ ...th, textAlign: 'left' }}>#</th>
							<th style={{ ...th, textAlign: 'left' }}>
								Product
							</th>
							<th style={{ ...th, textAlign: 'right' }}>Price</th>
							<th style={{ ...th, textAlign: 'center' }}>Qty</th>
							<th style={{ ...th, textAlign: 'right' }}>
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						{items.map((item, i) => (
							<tr key={item._id || i}>
								<td style={td}>{i + 1}</td>
								<td style={{ ...td, overflowWrap: 'anywhere' }}>
									{item.name || 'Product'}
								</td>
								<td style={{ ...td, textAlign: 'right' }}>
									{formatMoney(item.price)}
								</td>
								<td style={{ ...td, textAlign: 'center' }}>
									{Number(item.quantity || 0)}
								</td>
								<td style={{ ...td, textAlign: 'right' }}>
									{formatMoney(
										Number(item.price || 0) *
											Number(item.quantity || 0)
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<div style={{ width: 300, marginLeft: 'auto', marginTop: 22 }}>
					{[
						['Subtotal', subtotal],
						['Shipping', shippingCost],
						['Tax', tax],
					].map(([label, value]) => (
						<div
							key={label}
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								padding: '6px 0',
								borderBottom: '1px solid #e5e7eb',
							}}>
							<span>{label}</span>
							<strong>{formatMoney(value)}</strong>
						</div>
					))}
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							padding: '13px 0',
							color: '#047857',
							fontSize: 16,
							fontWeight: 800,
						}}>
						<span>GRAND TOTAL</span>
						<span>{formatMoney(total)}</span>
					</div>
				</div>

				<div
					style={{
						marginTop: 45,
						borderTop: '1px solid #e5e7eb',
						paddingTop: 16,
						textAlign: 'center',
						color: '#6b7280',
					}}>
					<p
						style={{
							fontWeight: 700,
							color: '#047857',
							margin: '0 0 5px',
						}}>
						Thank you for shopping with Shalban Food!
					</p>
					<p style={{ margin: 0 }}>
						This is a computer-generated invoice.
					</p>
				</div>
			</div>
		</>
	);
};

export default AdminOrderDetailsModal;

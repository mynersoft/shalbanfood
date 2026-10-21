'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const money = (n = 0) => `৳${Number(n || 0).toLocaleString('en-US')}`;

const fmtDate = (d) => {
	if (!d || Number.isNaN(new Date(d).getTime())) return '—';

	return new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'Asia/Dhaka',
	}).format(new Date(d));
};

const cap = (s = '') =>
	s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';

function Detail({ label, children }) {
	return (
		<div className="flex justify-between gap-4 py-2">
			<dt className="text-sm text-neutral-500">{label}</dt>
			<dd className="text-right text-sm font-medium text-neutral-900">
				{children}
			</dd>
		</div>
	);
}

export default function ViewInvoice({ order, onClose }) {
	useEffect(() => {
		const handleKey = (e) => {
			if (e.key === 'Escape') onClose?.();
		};

		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKey);

		return () => {
			document.body.style.overflow = previous;
			document.removeEventListener('keydown', handleKey);
		};
	}, [onClose]);

	if (typeof document === 'undefined' || !order) return null;

	const {
		invoiceNo,
		createdAt,
		status,
		payment = {},
		customer = {},
		shippingAddress: addr = {},
		orderItems = [],
		subtotal = 0,
		shippingFee = 0,
		discount = 0,
		total = 0,
	} = order;

	const isCOD =
		String(payment.method || '').toUpperCase() === 'COD' &&
		String(payment.status || '').toLowerCase() !== 'paid';

	return createPortal(
		<div
			onClick={onClose}
			className="fixed inset-0 z-[100] overflow-y-auto bg-white px-4 py-5 sm:py-8 print:static print:p-0">
			{/* Actions */}
			<div
				onClick={(e) => e.stopPropagation()}
				className="mx-auto mb-5 flex max-w-[800px] justify-end gap-2 print:hidden">
				<button
					type="button"
					onClick={() => window.print()}
					className="border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
					Print / Save PDF
				</button>
				<button
					type="button"
					onClick={onClose}
					className="border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
					Close
				</button>
			</div>

			<article
				className="invoice-paper mx-auto max-w-[800px] bg-white text-neutral-900"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-300 pb-6">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Shalban Food
						</h1>
						<p className="mt-1 text-sm text-neutral-500">
							স্বাদের সাথে আস্থার বন্ধন
						</p>
						<p className="mt-3 text-sm uppercase ">
							Invoice:{' '}
							<span className="font-semibold">
								{invoiceNo || '—'}
							</span>
						</p>
					</div>

					<div className="text-left sm:text-right">
						<p className="text-sm text-neutral-500">Invoice date</p>
						<p className="mt-1 text-sm font-medium">
							{fmtDate(createdAt)}
						</p>
						<p className="mt-4 text-sm text-neutral-500">
							Order status
						</p>
						<p className="mt-1 text-sm font-semibold">
							{cap(status)}
						</p>
					</div>
				</header>

				{/* Customer & Seller */}
				<section className="grid gap-8 border-b border-neutral-200 py-7 sm:grid-cols-2">
					<div>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
							Bill & Ship To
						</h2>
						<p className="font-semibold">
							{customer.name || 'Customer'}
						</p>
						{addr.area && (
							<p className="mt-1 text-sm">{addr.area}</p>
						)}
						{addr.thana && <p className="text-sm">{addr.thana}</p>}
						{addr.city && <p className="text-sm">{addr.city}</p>}
						{addr.phone && (
							<p className="mt-1 text-sm">{addr.phone}</p>
						)}
					</div>

					<div>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
							Sold By
						</h2>
						<p className="font-semibold">Shalban Food</p>
						<p className="mt-1 text-sm">
							Madhupur, Tangail, Bangladesh
						</p>
						<p className="mt-1 text-sm">support@shalban.com</p>
					</div>
				</section>

				{/* Items */}
				<section className="py-7">
					<h2 className="mb-4 text-base font-semibold">
						Order details
					</h2>

					<div className="overflow-x-auto">
						<table className="w-full min-w-[500px] text-left">
							<thead>
								<tr className="border-y border-neutral-300 text-xs text-neutral-500">
									<th className="py-3 pr-3 font-medium">
										Product
									</th>
									<th className="px-3 py-3 text-right font-medium">
										Price
									</th>
									<th className="px-3 py-3 text-right font-medium">
										Qty
									</th>
									<th className="py-3 pl-3 text-right font-medium">
										Amount
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-neutral-200">
								{orderItems.map((item, index) => (
									<tr
										key={
											item._id || `${item.name}-${index}`
										}
										className="break-inside-avoid">
										<td className="py-4 pr-3">
											<div className="flex items-center gap-3">
												{item.image && (
													<img
														src={item.image}
														alt=""
														className="h-10 w-10 shrink-0 border border-neutral-200 object-cover"
													/>
												)}
												<span className="text-sm font-medium">
													{item.name || 'Product'}
												</span>
											</div>
										</td>
										<td className="px-3 py-4 text-right text-sm tabular-nums">
											{money(item.price)}
										</td>
										<td className="px-3 py-4 text-right text-sm tabular-nums">
											{item.quantity ?? 0}
										</td>
										<td className="py-4 pl-3 text-right text-sm font-medium tabular-nums">
											{money(
												Number(item.price || 0) *
													Number(item.quantity || 0)
											)}
										</td>
									</tr>
								))}

								{orderItems.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className="py-8 text-center text-sm text-neutral-500">
											No order items found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Totals */}
					<div className="ml-auto mt-6 w-full max-w-sm">
						<dl>
							<Detail label="Subtotal">{money(subtotal)}</Detail>
							<Detail label="Shipping fee">
								{money(shippingFee)}
							</Detail>
							{Number(discount) > 0 && (
								<Detail label="Discount">
									−{money(discount)}
								</Detail>
							)}
						</dl>

						<div className="mt-3 flex items-center justify-between border-t-2 border-neutral-900 py-4">
							<div>
								<p className="font-semibold">Total</p>
								<p className="mt-1 text-xs text-neutral-500">
									{isCOD
										? 'Pay on delivery'
										: String(
													payment.status || ''
											  ).toLowerCase() === 'paid'
											? 'Payment received'
											: 'Order amount'}
								</p>
							</div>
							<p className="text-2xl font-bold tabular-nums">
								{money(total)}
							</p>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-t border-neutral-300 py-5 text-center">
					<p className="text-sm font-medium">
						Thank you for choosing Shalban Food.
					</p>
					<p className="mt-1 text-xs text-neutral-500">
						Please keep this invoice for your records.
					</p>
				</footer>
			</article>

			<style jsx global>{`
				@media print {
					@page {
						size: A4;
						margin: 12mm;
					}

					html,
					body {
						margin: 0 !important;
						padding: 0 !important;
						background: white !important;
					}

					body * {
						visibility: hidden;
					}

					.invoice-paper,
					.invoice-paper * {
						visibility: visible;
					}

					.invoice-paper {
						position: absolute !important;
						top: 0 !important;
						left: 0 !important;
						width: 100% !important;
						max-width: none !important;
						margin: 0 !important;
					}

					.invoice-paper section,
					.invoice-paper tr,
					.invoice-paper footer {
						break-inside: avoid;
					}

					.invoice-paper table {
						width: 100% !important;
						min-width: 0 !important;
					}

					.invoice-paper th,
					.invoice-paper td {
						padding: 8px 5px !important;
					}

					.invoice-paper img {
						max-width: 35px !important;
						max-height: 35px !important;
					}
				}
			`}</style>
		</div>,
		document.body
	);
}

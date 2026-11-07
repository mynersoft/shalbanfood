'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FancyLoader from '@/components/Loader/FancyLoader';
import { formatDate, formatCurrency } from '@/utils/formatters';

const cap = (s = '') =>
	s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';

function Detail({ label, children }) {
	return (
		<div className="flex justify-between gap-4 py-1">
			<dt className="text-sm text-neutral-500">{label}</dt>
			<dd className="text-right text-sm font-medium text-neutral-900">
				{children}
			</dd>
		</div>
	);
}

function InvoiceShow() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get('orderId');

	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!orderId) {
			setError('Order ID not found');
			setLoading(false);
			return;
		}

		const fetchOrder = async () => {
			try {
				setLoading(true);
				setError('');

				const res = await fetch(
					`/api/orders?orderId=${encodeURIComponent(orderId)}`,
					{
						method: 'GET',
						cache: 'no-store',
					}
				);

				const data = await res.json();

				console.log('ORDER API:', data);

				if (!res.ok || !data.success) {
					throw new Error(data.message || 'Failed to fetch order');
				}

				setOrder(data.order);
			} catch (error) {
				console.error('FETCH ORDER ERROR:', error);
				setError(error.message || 'Failed to load order');
			} finally {
				setLoading(false);
			}
		};

		fetchOrder();
	}, [orderId]);

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

	if (loading) {
		return <FancyLoader />;
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-red-500">
						Order not found
					</h2>

					<p className="mt-2 text-gray-500">{error}</p>

					<p className="mt-2 text-sm text-gray-400">
						Order ID: {orderId || 'N/A'}
					</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-red-500">
						Invoice not available
					</h2>
					<p className="mt-2 text-gray-500">
						Order information could not be loaded.
					</p>
					<p className="mt-2 text-sm text-gray-400">
						Order ID: {orderId || 'N/A'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full bg-white px-4 py-5 sm:py-8">
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
			</div>

			<article
				className="invoice-paper mx-auto max-w-[800px] bg-white text-neutral-900"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<section className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-300 pb-6">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Shalban Food
						</h1>
						<p className="mt-1 text-sm text-neutral-500">
							স্বাদের সাথে আস্থার বন্ধন
						</p>
						<p className="mt-3 text-sm uppercase ">
							Invoice No:{' '}
							<span className="font-semibold">
								{invoiceNo || '—'}
							</span>
						</p>
					</div>

					<div className="text-left sm:text-right">
						<p className="text-sm text-neutral-500">Invoice date</p>
						<p className="mt-1 text-sm font-medium">
							{formatDate(createdAt)}
						</p>
						<p className="mt-4 text-sm text-neutral-800">
							Order status
						</p>
						<p className="mt-1 text-sm font-semibold">
							{cap(status)}
						</p>
					</div>
				</section>

				{/* Customer & Seller */}
				<section className="grid gap-8 border-b border-neutral-200  sm:grid-cols-2 justify-between">
					<div>
						<h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">
							Bill & Ship To
						</h2>
						<p className="font-semibold">
							{customer.name || 'Customer'}
						</p>
						{addr.area && (
							<p className="mt-1 text-sm">{addr.area}</p>
						)}
						{addr.thana && (
							<p className="text-sm">
								{addr.thana}, {addr.city}
							</p>
						)}

						{addr.phone && (
							<p className="mt-1 text-sm">{addr.phone}</p>
						)}
					</div>

					<div className="sm:text-right">
						<h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-800">
							Sold By
						</h2>
						<p className="font-semibold">Shalban Food</p>
						<p className="mt-1 text-sm">
							Madhupur, Tangail, Bangladesh
						</p>
						<p className="mt-1 text-sm">01868944080</p>
						<p className="mt-1 text-sm">shalbanfood@gmail.com</p>
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
								<tr className="border-y border-neutral-300 text-xs text-neutral-800">
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
										<td className="py-2 pr-3">
											<div className="flex items-center gap-3">
												{item.image && (
													<img
														src={item.image}
														alt=""
														className="h-10 w-10 shrink-0 border border-neutral-200 object-cover"
													/>
												)}
												<span className="text-sm font-medium">
													{item.name || 'Product'} -
													{item.variantLabel}
												</span>
											</div>
										</td>
										<td className="px-3 py-2 text-right text-sm tabular-nums">
											{formatCurrency(item.price)}
										</td>
										<td className="px-3 py-4 text-right text-sm tabular-nums">
											{item.quantity ?? 0}
										</td>
										<td className="py-4 pl-3 text-right text-sm font-medium tabular-nums">
											{formatCurrency(
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
					<div className="ml-auto mt-4 w-full max-w-sm">
						<dl>
							<Detail label="Subtotal">
								{formatCurrency(subtotal)}
							</Detail>
							<Detail label="Shipping fee">
								{formatCurrency(shippingFee)}
							</Detail>
							{Number(discount) > 0 && (
								<Detail label="Discount">
									−{formatCurrency(discount)}
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
								{formatCurrency(total)}
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
						background: #fff !important;
					}

					/* Hide everything first */
					body * {
						visibility: hidden !important;
					}

					/* Show invoice only */
					.invoice-paper,
					.invoice-paper * {
						visibility: visible !important;
					}

					.invoice-paper {
						position: absolute !important;
						top: 0 !important;
						left: 0 !important;
						width: 100% !important;
						max-width: none !important;
						margin: 0 !important;
						padding: 0 !important;
						background: #fff !important;
						color: #000 !important;
					}

					.invoice-paper * {
						color: #000 !important;
						box-shadow: none !important;
					}

					/* Prevent unwanted page breaks */
					.invoice-paper header,
					.invoice-paper section,
					.invoice-paper tr,
					.invoice-paper footer {
						break-inside: avoid !important;
						page-break-inside: avoid !important;
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
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense fallback={<FancyLoader />}>
			<InvoiceShow />
		</Suspense>
	);
}

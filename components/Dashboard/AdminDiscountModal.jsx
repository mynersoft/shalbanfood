'use client';

import { useEffect, useState } from 'react';
import { Tag, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminDiscountModal({ order, onClose, onUpdated }) {
	const [amount, setAmount] = useState(String(order.adminDiscount || 0));
	const [note, setNote] = useState(order.adminDiscountNote || '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const handleEscape = (event) => {
			if (event.key === 'Escape' && !loading) onClose();
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [loading, onClose]);

	const subtotal = Number(order.subtotal || 0);
	const discount = Number(order.discount || 0);
	const shippingFee = Number(order.shippingFee || 0);
	const maxDiscount = Math.max(0, subtotal - discount + shippingFee);

	const newTotal = Math.max(
		0,
		subtotal - discount + shippingFee - Number(amount || 0)
	);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');

		const value = Number(amount);

		if (amount.trim() === '' || !Number.isFinite(value) || value < 0) {
			setError('সঠিক discount amount লিখুন।');
			return;
		}

		if (value > maxDiscount) {
			setError(
				`সর্বোচ্চ discount ৳${maxDiscount.toFixed(2)} দিতে পারবেন।`
			);
			return;
		}

		if (order.payment?.status === 'paid') {
			setError('Paid order-এর discount সরাসরি পরিবর্তন করা যাবে না।');
			return;
		}

		if (['cancelled', 'return'].includes(order.status)) {
			setError('Cancelled বা returned order পরিবর্তন করা যাবে না।');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`/api/orders/${order._id}/admin-add-discount`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					adminDiscount: value,
					adminDiscountNote: note.trim(),
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Discount save করা যায়নি।');
			}

			onUpdated?.(data.order);
			onClose();
		} catch (err) {
			setError(err.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !loading) {
					onClose();
				}
			}}>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="discount-modal-title"
				className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
				<div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-green-100 p-2 text-green-700 dark:bg-green-900/40 dark:text-green-400">
							<Tag size={20} />
						</div>
						<div>
							<h2
								id="discount-modal-title"
								className="font-semibold text-gray-900 dark:text-white">
								Add Order Discount
							</h2>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Invoice: {order.invoiceNo || order._id}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						disabled={loading}
						aria-label="Close modal"
						className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800">
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5 p-5">
					<div className="grid grid-cols-2 gap-3">
						<div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Current Total
							</p>
							<p className="mt-1 font-semibold text-gray-900 dark:text-white">
								৳{Number(order.total || 0).toFixed(2)}
							</p>
						</div>

						<div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Maximum Discount
							</p>
							<p className="mt-1 font-semibold text-gray-900 dark:text-white">
								৳{maxDiscount.toFixed(2)}
							</p>
						</div>
					</div>

					<div>
						<label
							htmlFor="admin-discount-amount"
							className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							Discount Amount (৳)
						</label>

						<input
							id="admin-discount-amount"
							type="number"
							min="0"
							max={maxDiscount}
							step="0.01"
							required
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							placeholder="Enter discount amount"
							className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
						/>

						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							আগের admin discount পরিবর্তন করতে চাইলে নতুন amount
							লিখুন।
						</p>
					</div>

					<div>
						<label
							htmlFor="admin-discount-note"
							className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
							Note (Optional)
						</label>

						<textarea
							id="admin-discount-note"
							value={note}
							onChange={(event) => setNote(event.target.value)}
							maxLength={300}
							rows={3}
							placeholder="যেমন: Special customer discount"
							className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
						/>
						<p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
							{note.length}/300
						</p>
					</div>

					<div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
						<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
							<span>New Order Total</span>
							<span className="font-bold text-green-700 dark:text-green-400">
								৳
								{Number.isFinite(newTotal)
									? newTotal.toFixed(2)
									: '0.00'}
							</span>
						</div>
					</div>

					{error && (
						<p
							role="alert"
							className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
							{error}
						</p>
					)}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
							Cancel
						</button>

						<button
							type="submit"
							disabled={loading}
							className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1f5d3b] px-4 py-3 font-semibold text-white transition hover:bg-[#194a30] disabled:cursor-not-allowed disabled:opacity-60">
							{loading ? (
								<Loader2 size={18} className="animate-spin" />
							) : (
								<CheckCircle2 size={18} />
							)}
							{loading ? 'Saving...' : 'Save Discount'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

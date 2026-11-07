'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	Search,
	PackageCheck,
	Package,
	Truck,
	CheckCircle2,
	Clock,
	XCircle,
	LoaderCircle,
	ArrowRight,
	ShoppingBag,
} from 'lucide-react';

const ORDER_STEPS = [
	{
		status: 'pending',
		label: 'অর্ডার পেন্ডিং',
		description:
			'আপনার অর্ডারটি গ্রহণ করা হয়েছে। নিশ্চিতকরণের অপেক্ষায় রয়েছে।',
		icon: Clock,
	},
	{
		status: 'confirmed',
		label: 'অর্ডার কনফার্মড',
		description: 'আপনার অর্ডারটি সফলভাবে নিশ্চিত করা হয়েছে।',
		icon: PackageCheck,
	},
	{
		status: 'processing',
		label: 'পণ্য প্রস্তুত হচ্ছে',
		description: 'আপনার পণ্য প্রস্তুত ও প্যাকেজিং করা হচ্ছে।',
		icon: Package,
	},
	{
		status: 'shipped',
		label: 'কুরিয়ারে পাঠানো হয়েছে',
		description: 'আপনার অর্ডারটি কুরিয়ারের কাছে হস্তান্তর করা হয়েছে।',
		icon: Truck,
	},
	{
		status: 'delivered',
		label: 'ডেলিভারি সম্পন্ন',
		description: 'আপনার অর্ডারটি সফলভাবে পৌঁছে গেছে।',
		icon: CheckCircle2,
	},
];

const STATUS_MAP = {
	pending: 'pending',
	confirmed: 'confirmed',
	processing: 'processing',
	shipped: 'shipped',
	dispatched: 'shipped',
	delivered: 'delivered',
};

function normalizeStatus(status) {
	return (
		STATUS_MAP[
			String(status || '')
				.toLowerCase()
				.trim()
		] || null
	);
}

function TrackingOrderClient() {
	const searchParams = useSearchParams();

	const [invoiceNo, setInvoiceNo] = useState('');
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleTrackOrder = useCallback(async (invoiceValue) => {
		const invoice = String(invoiceValue || '').trim();

		if (!invoice) {
			setError('অনুগ্রহ করে আপনার Invoice Number লিখুন।');
			return;
		}

		setLoading(true);
		setError('');
		setOrder(null);

		try {
			const response = await fetch(
				`/api/orders/track?invoiceNo=${encodeURIComponent(invoice)}`,
				{
					method: 'GET',
					cache: 'no-store',
				}
			);

			const data = await response.json();

			if (!response.ok || !data.success || !data.order) {
				throw new Error(
					data.message || 'এই Invoice Number-এর অর্ডার পাওয়া যায়নি।'
				);
			}

			setOrder(data.order);
		} catch (err) {
			setError(
				err.message ||
					'অর্ডারের তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
			);
		} finally {
			setLoading(false);
		}
	}, []);

	// URL query থাকলে automatically search হবে
	useEffect(() => {
		const invoiceFromUrl = searchParams.get('invoiceNo');

		if (invoiceFromUrl?.trim()) {
			setInvoiceNo(invoiceFromUrl.trim());
			handleTrackOrder(invoiceFromUrl);
		}
	}, [searchParams, handleTrackOrder]);

	const onSubmit = (e) => {
		e.preventDefault();
		handleTrackOrder(invoiceNo);
	};

	const rawStatus = order?.status;
	const currentStatus = normalizeStatus(rawStatus);

	const currentStepIndex = ORDER_STEPS.findIndex(
		(step) => step.status === currentStatus
	);

	const isCancelled =
		String(rawStatus || '')
			.toLowerCase()
			.trim() === 'cancelled';

	const isUnknownStatus = order && !isCancelled && currentStepIndex === -1;

	return (
		<main className="min-h-screen bg-[#f5f7f4] px-4 py-10 sm:py-16">
			<div className="mx-auto max-w-3xl">
				{/* Header */}
				<header className="mb-9 text-center">
					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f5d3b] text-white shadow-lg shadow-green-900/15">
						<ShoppingBag size={30} />
					</div>

					<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 ">
						অর্ডার ট্র্যাক করুন
					</h1>
				</header>

				{/* Search Card */}
				<section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)] sm:p-8">
					<form onSubmit={onSubmit}>
						<label
							htmlFor="invoiceNo"
							className="mb-2 block text-sm font-semibold text-gray-700">
							Enter Invoice Number
						</label>

						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1">
								<Search
									size={19}
									className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									id="invoiceNo"
									type="text"
									value={invoiceNo}
									onChange={(e) =>
										setInvoiceNo(e.target.value)
									}
									placeholder="যেমন: Shalban-9BF333"
									autoComplete="off"
									className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:bg-white focus:ring-4 focus:ring-green-800/10"
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#1f5d3b] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#17482d] disabled:cursor-not-allowed disabled:opacity-60">
								{loading ? (
									<>
										<LoaderCircle
											size={18}
											className="animate-spin"
										/>
										খোঁজা হচ্ছে...
									</>
								) : (
									<>
										ট্র্যাক করুন
										<ArrowRight size={18} />
									</>
								)}
							</button>
						</div>
					</form>

					{error && (
						<div
							role="alert"
							className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
							<XCircle size={19} className="mt-0.5 shrink-0" />
							<p>{error}</p>
						</div>
					)}

					{loading && (
						<div className="mt-5 flex items-center gap-2 text-sm text-[#1f5d3b]">
							<LoaderCircle size={16} className="animate-spin" />
							আপনার অর্ডারের তথ্য খোঁজা হচ্ছে...
						</div>
					)}
				</section>

				{/* Order Details */}
				{order && (
					<section
						aria-live="polite"
						className="mt-7 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
						{/* Invoice Header */}

						{/* Cancelled */}
						{isCancelled ? (
							<div className="px-6 py-12 text-center sm:px-10">
								<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
									<XCircle size={38} />
								</div>

								<h2 className="text-2xl font-extrabold text-gray-900">
									অর্ডার বাতিল করা হয়েছে
								</h2>

								<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
									দুঃখিত, আপনার এই অর্ডারটি বাতিল করা হয়েছে।
									বিস্তারিত জানতে আমাদের সঙ্গে যোগাযোগ করুন।
								</p>
							</div>
						) : isUnknownStatus ? (
							<div className="px-6 py-12 text-center">
								<Clock
									size={42}
									className="mx-auto mb-4 text-amber-500"
								/>

								<h2 className="text-xl font-bold text-gray-900">
									অর্ডারের স্ট্যাটাস আপডেট হচ্ছে
								</h2>

								<p className="mt-2 text-sm text-gray-500">
									বর্তমান স্ট্যাটাস:{' '}
									{String(rawStatus || 'Unknown')}
								</p>
							</div>
						) : (
							<>
								{/* Current Status Banner */}
								<div className="bg-[#1f5d3b] px-6 py-7 text-white sm:px-8">
									<p className="text-sm font-medium text-green-100">
										আপনার অর্ডারের বর্তমান অবস্থা
									</p>

									<div className="mt-3 flex items-center gap-3">
										{(() => {
											const Icon =
												ORDER_STEPS[currentStepIndex]
													.icon;
											return <Icon size={32} />;
										})()}

										<h2 className="text-2xl font-extrabold">
											{
												ORDER_STEPS[currentStepIndex]
													.label
											}
										</h2>
									</div>

									<p className="mt-3 text-sm leading-6 text-green-100">
										{
											ORDER_STEPS[currentStepIndex]
												.description
										}
									</p>
								</div>

								{/* Timeline */}
								<div className="px-6 py-8 sm:px-9 sm:py-10">
									<div className="mb-8 flex items-center justify-between">
										<h3 className="text-lg font-extrabold text-gray-900">
											অর্ডারের অগ্রগতি
										</h3>

										<span className="text-xs font-semibold text-[#1f5d3b]">
											ধাপ {currentStepIndex + 1} /{' '}
											{ORDER_STEPS.length}
										</span>
									</div>

									{/* Progress Bar */}
									<div className="mb-9 h-2 overflow-hidden rounded-full bg-gray-100">
										<div
											className="h-full rounded-full bg-[#1f5d3b] transition-all duration-500"
											style={{
												width: `${((currentStepIndex + 1) / ORDER_STEPS.length) * 100}%`,
											}}
										/>
									</div>

									{/* Steps */}
									<div className="relative">
										{ORDER_STEPS.map((step, index) => {
											const Icon = step.icon;
											const completed =
												index < currentStepIndex;
											const active =
												index === currentStepIndex;
											const reached =
												index <= currentStepIndex;

											return (
												<div
													key={step.status}
													className="relative flex gap-4 pb-9 last:pb-0">
													{/* Connector */}
													{index <
														ORDER_STEPS.length -
															1 && (
														<div
															className={`absolute left-5 top-11 h-[calc(100%-12px)] w-0.5 ${
																completed
																	? 'bg-[#1f5d3b]'
																	: 'bg-gray-200'
															}`}
														/>
													)}

													{/* Icon */}
													<div
														className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
															active
																? 'border-[#1f5d3b] bg-[#1f5d3b] text-white ring-4 ring-green-100'
																: completed
																	? 'border-[#1f5d3b] bg-[#1f5d3b] text-white'
																	: 'border-gray-200 bg-white text-gray-400'
														}`}>
														{completed ? (
															<CheckCircle2
																size={21}
															/>
														) : (
															<Icon size={19} />
														)}
													</div>

													{/* Text */}
													<div className="flex-1 pt-1">
														<div className="flex flex-wrap items-center gap-2">
															<h4
																className={`text-sm font-bold sm:text-base ${
																	reached
																		? 'text-gray-900'
																		: 'text-gray-400'
																}`}>
																{step.label}
															</h4>

															{active && (
																<span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-[#1f5d3b]">
																	বর্তমান
																	অবস্থা
																</span>
															)}

															{completed && (
																<span className="text-xs font-medium text-green-700">
																	সম্পন্ন
																</span>
															)}
														</div>

														<p
															className={`mt-1 text-sm leading-6 ${
																reached
																	? 'text-gray-500'
																	: 'text-gray-400'
															}`}>
															{step.description}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</>
						)}
					</section>
				)}

				{/* Empty State */}
				{!order && !loading && !error && (
					<div className="mt-7 rounded-3xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#1f5d3b]">
							<Package size={27} />
						</div>

						<h3 className="font-bold text-gray-800">
							অর্ডারের তথ্য এখানে দেখানো হবে
						</h3>

						<p className="mt-2 text-sm text-gray-500">
							আপনার Invoice Number লিখে অর্ডার ট্র্যাক করুন।
						</p>
					</div>
				)}

				{/* Footer */}
				<footer className="mt-9 text-center">
					<p className="text-sm leading-7 text-gray-500">
						অর্ডার সম্পর্কে কোনো সাহায্য প্রয়োজন?
					</p>

					<a
						href="https://wa.me/8801603816721"
						target="_blank"
						rel="noopener noreferrer"
						className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#1f5d3b] hover:underline">
						WhatsApp-এ যোগাযোগ করুন
						<ArrowRight size={15} />
					</a>

					<p className="mt-6 text-xs text-gray-400">
						Shalban Food — স্বাদের সাথে আস্থার বন্ধন
					</p>
				</footer>
			</div>
		</main>
	);
}

export default function TrackingOrderPage() {
	return (
		<Suspense fallback={<div>Loading tracking...</div>}>
			<TrackingOrderClient />
		</Suspense>
	);
}

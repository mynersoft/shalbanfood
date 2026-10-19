'use client';

import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { useAddOrder } from '@/hooks/useOrder';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import useLoginUser from '@/hooks/useAuth';
import ShippingInfo from './ShippingInfo';

import {
	ArrowLeft,
	CheckCircle2,
	Loader2,
	Mail,
	Phone,
	ShoppingBag,
	Truck,
	User,
	Lock,
} from 'lucide-react';

import CartItems from '@/components/Cart/CartItems';
import CheckEmptyCart from '@/components/Cart/CheckEmptyCart';
import { calculateShippingFee } from '@/lib/calculateShippingFee';

/* =========================================================
   HELPERS
========================================================= */

const PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UNIT_LABELS = {
	gram: 'গ্রাম',
	kg: 'কেজি',
	milliliter: 'মিলিলিটার',
	litre: 'লিটার',
	piece: 'পিস',
};

const EMPTY_SHIPPING_SETTINGS = {
	districtRates: [],
	defaultCharge: 0,
	freeDeliveryEnabled: false,
	freeDeliveryMinimum: 0,
};

const getSizeLabel = (item) => {
	const value = item?.size?.value;
	const unit = item?.size?.unit;

	if (!value || !unit) return '';

	return `${value} ${UNIT_LABELS[unit] || unit}`;
};

const getUnitPrice = (item) => Math.max(Number(item?.sellPrice) || 0, 0);

const getQuantity = (item) => Math.max(1, Number(item?.quantity) || 1);

const getProductId = (item) => item?.productId || item?._id || item?.id || '';

/* =========================================================
   CHECKOUT CLIENT
========================================================= */

export default function CheckoutClient() {
	const router = useRouter();

	const { status } = useSession();
	const { user } = useLoginUser();

	const cart = useSelector((state) => state.cart.items);
	const { applyVoucher } = useSelector((state) => state.voucher);

	const mutation = useAddOrder();

	const [processing, setProcessing] = useState(false);
	const [orderPlaced, setOrderPlaced] = useState(false);



	const [shippingSettings, setShippingSettings] = useState(
		EMPTY_SHIPPING_SETTINGS
	);

	const [shippingSettingsLoading, setShippingSettingsLoading] =
		useState(true);

useEffect(() => {
	let cancelled = false;

	const fetchShippingSettings = async () => {
		try {
			const response = await fetch('/api/shipping', {
				method: 'GET',
				cache: 'no-store',
			});

			if (!response.ok) {
				throw new Error('Shipping API failed');
			}

			const result = await response.json();

			if (!result?.success || !result?.settings) {
				throw new Error('Shipping settings unavailable');
			}

			const settings = result.settings;

			if (!cancelled) {
				setShippingSettings({
					districtRates: Array.isArray(settings.districtRates)
						? settings.districtRates
						: [],

					defaultCharge: Number(settings.defaultCharge) || 0,

					freeDeliveryEnabled: settings.freeDeliveryEnabled === true,

					freeDeliveryMinimum:
						Number(settings.freeDeliveryMinimum) || 0,
				});
			}
		} catch (error) {
			console.error('Shipping settings error:', error);

			if (!cancelled) {
				setShippingSettings(EMPTY_SHIPPING_SETTINGS);
			}
		} finally {
			if (!cancelled) {
				setShippingSettingsLoading(false);
			}
		}
	};

	fetchShippingSettings();

	return () => {
		cancelled = true;
	};
}, []);

	/* =========================================================
	   ORDER FORM
========================================================= */

	const [orderData, setOrderData] = useState({
		customer: {
			name: '',
			email: '',
			phone: '',
		},

		address: {
			area: '',
			city: '',
			thana: '',
		},

		payment: {
			method: 'COD',
			status: 'unpaid',
			transactionId: null,
		},
	});

	/* =========================================================
	   LOGIN CHECK
========================================================= */

	useEffect(() => {
		if (status !== 'unauthenticated') return;

		toast.error('Checkout করতে প্রথমে Login করুন', {
			id: 'checkout-login-required',
			duration: 2500,
		});

		const timer = setTimeout(() => {
			router.replace(
				`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`
			);
		}, 1200);

		return () => clearTimeout(timer);
	}, [status, router]);

	/* =========================================================
	   AUTO FILL LOGGED-IN USER
========================================================= */

	useEffect(() => {
		if (!user) return;

		setOrderData((prev) => ({
			...prev,

			customer: {
				name: prev.customer.name || user.name || user.username || '',
				email: prev.customer.email || user.email || '',
				phone: prev.customer.phone || user.phone || '',
			},

			address: {
				area: prev.address.area || user.address?.area || '',
				city: prev.address.city || user.address?.city || '',
				thana: prev.address.thana || user.address?.thana || '',
			},
		}));
	}, [user]);

	/* =========================================================
	   TOTALS
	   Display only. The backend must recalculate the final amount.
========================================================= */

	const subtotal = useMemo(() => {
		return cart.reduce(
			(sum, item) => sum + getUnitPrice(item) * getQuantity(item),
			0
		);
	}, [cart]);

	const discount = Math.max(Number(applyVoucher?.discount) || 0, 0);

	const voucherCode = applyVoucher?.code || applyVoucher?.voucherCode || '';

	/*
	 * orderData.address.city stores the selected district.
	 * Recalculation happens automatically when the district changes.
	 */

	const deliveryCharge = useMemo(() => {
		return calculateShippingFee({
			subtotal,
			district: orderData.address.city,
			settings: shippingSettings,
		});
	}, [subtotal, orderData.address.city, shippingSettings]);

	const grandTotal = Math.max(subtotal - discount, 0) + deliveryCharge;

	/* =========================================================
	   FORM CHANGE
========================================================= */

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name.includes('.')) {
			const [parent, child] = name.split('.');

			setOrderData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));

			return;
		}

		setOrderData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	/* =========================================================
	   PLACE ORDER
========================================================= */

	const placeOrder = (payload) => {
		mutation.mutate(payload, {
			onSuccess: () => {
				setOrderPlaced(true);

				toast.success('অর্ডার সফল হয়েছে!');
				setProcessing(false);
			},

			onError: (error) => {
				console.error('Place order error:', error);

				toast.error(
					error?.response?.data?.message ||
						error?.message ||
						'অর্ডার করা যায়নি। আবার চেষ্টা করুন।'
				);

				setProcessing(false);
			},
		});
	};

	/* =========================================================
	   CONFIRM ORDER
========================================================= */

	const handleConfirmOrder = () => {
		if (processing || orderPlaced) return;

		if (status !== 'authenticated' || !user) {
			toast.error('অর্ডার করতে প্রথমে Login করুন', {
				id: 'order-login-required',
			});

			router.replace(
				`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`
			);

			return;
		}

		const name = orderData.customer.name.trim();
		const email = orderData.customer.email.trim();
		const phone = orderData.customer.phone.trim().replace(/[\s-]/g, '');

		const area = orderData.address.area.trim();
		const city = orderData.address.city.trim();
		const thana = orderData.address.thana.trim();

		/* Required validation */

		if (!name) {
			toast.error('আপনার নাম লিখুন');
			return;
		}

		if (!phone) {
			toast.error('আপনার মোবাইল নম্বর লিখুন');
			return;
		}

		if (!PHONE_REGEX.test(phone)) {
			toast.error('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)');
			return;
		}

		if (email && !EMAIL_REGEX.test(email)) {
			toast.error('সঠিক ইমেইল ঠিকানা লিখুন');
			return;
		}

		if (!city) {
			toast.error('আপনার জেলা নির্বাচন করুন');
			return;
		}

		if (!area) {
			toast.error('আপনার ডেলিভারি এলাকা লিখুন');
			return;
		}

		if (!cart.length) {
			toast.error('আপনার কার্ট খালি');
			return;
		}

		if (shippingSettingsLoading) {
			toast.error('ডেলিভারি চার্জ লোড হচ্ছে। একটু অপেক্ষা করুন।');
			return;
		}

		/* Validate cart items */

		const hasInvalidItem = cart.some(
			(item) => !getProductId(item) || getUnitPrice(item) <= 0
		);

		if (hasInvalidItem) {
			toast.error(
				'কার্টে একটি পণ্যের তথ্য ঠিক নেই। পণ্যটি সরিয়ে আবার যোগ করুন।'
			);
			return;
		}

		/* Order items */

		const orderItems = cart.map((item) => {
			const sizeLabel = getSizeLabel(item);
			const baseName = item.name || '';

			return {
				productId: String(getProductId(item)),

				name: sizeLabel ? `${baseName} - ${sizeLabel}` : baseName,

				quantity: getQuantity(item),
				price: getUnitPrice(item),
				image: item.image || item.images?.[0] || '',
			};
		});

		/* Payload */

		const payload = {
			userId: user?.id || user?._id || undefined,

			customer: {
				name,
				email,
				phone,
			},

			shippingAddress: {
				thana,
				area,
				city,
				phone,
			},

			orderItems,
			voucherCode,

			payment: {
				method: 'COD',
				status: 'unpaid',
			},
		};

		setProcessing(true);
		placeOrder(payload);
	};

	/* =========================================================
	   SESSION LOADING
========================================================= */

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2
						size={32}
						className="animate-spin text-emerald-600"
					/>

					<p className="text-sm text-gray-500">
						Checkout যাচাই করা হচ্ছে...
					</p>
				</div>
			</div>
		);
	}

	/* =========================================================
	   NOT LOGGED IN
========================================================= */

	if (status === 'unauthenticated') {
		return (
			<div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
				<div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
					<div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
						<Lock size={28} className="text-emerald-600" />
					</div>

					<h2 className="text-xl font-bold text-gray-900 mt-5">
						Login Required
					</h2>

					<p className="text-sm text-gray-500 mt-2">
						Checkout করতে প্রথমে Login করতে হবে।
					</p>

					<button
						type="button"
						onClick={() =>
							router.replace(
								`/auth/login?callbackUrl=${encodeURIComponent(
									'/checkout'
								)}`
							)
						}
						className="mt-6 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition">
						Login করুন
					</button>
				</div>
			</div>
		);
	}

	/* =========================================================
	   EMPTY CART
========================================================= */

	if (cart.length === 0) {
		return <CheckEmptyCart />;
	}

	/* =========================================================
	   CHECKOUT
========================================================= */

	return (
		<div className="min-h-screen bg-[#fafafa]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
				{/* HEADER */}

				<div className="mb-7">
					<button
						type="button"
						onClick={() => router.back()}
						className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-4">
						<ArrowLeft size={17} />
						Back to cart
					</button>

					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Checkout
					</h1>

					<p className="text-sm text-gray-500 mt-1">
						Complete your order and pay when you receive it.
					</p>
				</div>

				{/* MAIN GRID */}

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_410px] gap-6 lg:gap-8">
					{/* LEFT */}

					<div className="space-y-6">
						{/* CUSTOMER */}

						<div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
									<User size={19} className="text-gray-700" />
								</div>

								<div>
									<h2 className="font-semibold text-gray-900">
										Customer Information
									</h2>

									<p className="text-xs text-gray-500 mt-0.5">
										Your account information
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* NAME */}

								<div className="sm:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Full Name
									</label>

									<div className="relative">
										<User
											size={17}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
										/>

										<input
											type="text"
											name="customer.name"
											value={orderData.customer.name}
											onChange={handleChange}
											placeholder="Enter your full name"
											autoComplete="name"
											className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
										/>
									</div>
								</div>

								{/* EMAIL */}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Email (optional)
									</label>

									<div className="relative">
										<Mail
											size={17}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
										/>

										<input
											type="email"
											name="customer.email"
											value={orderData.customer.email}
											onChange={handleChange}
											placeholder="you@example.com"
											autoComplete="email"
											className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
										/>
									</div>
								</div>

								{/* PHONE */}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Phone Number
									</label>

									<div className="relative">
										<Phone
											size={17}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
										/>

										<input
											type="tel"
											name="customer.phone"
											value={orderData.customer.phone}
											onChange={handleChange}
											placeholder="01XXXXXXXXX"
											autoComplete="tel"
											className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* SHIPPING
						    ShippingInfo receives the selected district,
						    shared form handler and calculated delivery fee.
						*/}

						<ShippingInfo
							orderData={{
								...orderData,
								phone: orderData.customer.phone,
								shippingCharge: deliveryCharge,
							}}
							handleChange={(e) => {
								const { name, value } = e.target;

								if (name === 'phone') {
									setOrderData((prev) => ({
										...prev,
										customer: {
											...prev.customer,
											phone: value,
										},
									}));

									return;
								}

								handleChange(e);
							}}
							shippingCharge={deliveryCharge}
						/>

						{/* PAYMENT */}

						<div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
							<div className="flex items-center gap-3 mb-5">
								<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
									<CheckCircle2
										size={20}
										className="text-green-600"
									/>
								</div>

								<div>
									<h2 className="font-semibold text-gray-900">
										Payment
									</h2>

									<p className="text-xs text-gray-500 mt-0.5">
										Only Cash on Delivery is available
									</p>
								</div>
							</div>

							<div className="border border-green-200 bg-green-50/70 rounded-xl p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="w-11 h-11 rounded-xl bg-white border border-green-200 flex items-center justify-center">
											<Truck
												size={21}
												className="text-green-600"
											/>
										</div>

										<div>
											<p className="font-semibold text-gray-900">
												Cash on Delivery
											</p>

											<p className="text-sm text-gray-500 mt-0.5">
												Pay when you receive your order
											</p>
										</div>
									</div>

									<div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
										<CheckCircle2
											size={15}
											className="text-white"
										/>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
								<Lock size={13} />
								<span>No online payment required.</span>
							</div>
						</div>

						{/* MOBILE ITEMS */}

						<div className="lg:hidden bg-white border border-gray-200 rounded-2xl p-5">
							<div className="flex items-center justify-between mb-5">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
										<ShoppingBag
											size={19}
											className="text-gray-700"
										/>
									</div>

									<h2 className="font-semibold text-gray-900">
										Your Items
									</h2>
								</div>

								<span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
									{cart.length} items
								</span>
							</div>

							<CartItems subtotal={subtotal} />
						</div>
					</div>

					{/* RIGHT */}

					<div className="space-y-6">
						{/* DESKTOP ITEMS */}

						<div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-5">
							<div className="flex items-center justify-between mb-5">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
										<ShoppingBag
											size={19}
											className="text-gray-700"
										/>
									</div>

									<h2 className="font-semibold text-gray-900">
										Your Items
									</h2>
								</div>

								<span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
									{cart.length} items
								</span>
							</div>

							<CartItems subtotal={subtotal} />
						</div>

						{/* SUMMARY */}

						<div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6">
							<h2 className="font-semibold text-gray-900 text-lg mb-5">
								Order Summary
							</h2>

							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">
										Subtotal
									</span>

									<span className="font-medium text-gray-900">
										৳{subtotal.toFixed(2)}
									</span>
								</div>

								{discount > 0 && (
									<div className="flex justify-between">
										<span className="text-gray-500">
											Discount
										</span>

										<span className="font-medium text-green-600">
											-৳{discount.toFixed(2)}
										</span>
									</div>
								)}

								<div className="flex justify-between">
									<span className="text-gray-500">
										Delivery
									</span>

									<span
										className={
											deliveryCharge === 0
												? 'font-medium text-green-600'
												: 'font-medium text-gray-900'
										}>
										{deliveryCharge === 0
											? orderData.address.city
												? 'FREE'
												: 'জেলা নির্বাচন করুন'
											: `৳${deliveryCharge.toFixed(2)}`}
									</span>
								</div>

								{shippingSettings.freeDeliveryEnabled &&
									subtotal >=
										Number(
											shippingSettings.freeDeliveryMinimum
										) && (
										<p className="text-xs text-green-600">
											আপনার অর্ডারে ফ্রি ডেলিভারি
											প্রযোজ্য।
										</p>
									)}
							</div>

							<div className="border-t border-gray-200 mt-5 pt-5">
								<div className="flex items-end justify-between">
									<div>
										<p className="text-sm text-gray-500">
											Total Amount
										</p>

										<p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
											৳{grandTotal.toFixed(2)}
										</p>
									</div>

									<div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
										<Truck size={14} />
										COD
									</div>
								</div>
							</div>

							{/* PLACE ORDER */}

							<button
								type="button"
								onClick={handleConfirmOrder}
								disabled={
									processing ||
									orderPlaced ||
									cart.length === 0 ||
									shippingSettingsLoading
								}
								className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 px-5 rounded-xl font-semibold text-base hover:bg-black active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
								{processing ? (
									<>
										<Loader2
											size={19}
											className="animate-spin"
										/>
										Placing Order...
									</>
								) : orderPlaced ? (
									<>
										<CheckCircle2 size={19} />
										Order Placed
									</>
								) : shippingSettingsLoading ? (
									<>
										<Loader2
											size={19}
											className="animate-spin"
										/>
										Loading Delivery...
									</>
								) : (
									<>
										<Truck size={19} />
										Place Order
									</>
								)}
							</button>

							<p className="text-center text-xs text-gray-400 mt-3">
								Pay cash when your order arrives
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
	Minus,
	Plus,
	Trash2,
	Package,
	MapPin,
	Building,
	Tag,
	ShieldCheck,
} from 'lucide-react';

import { DISTRICTS } from '@/constants';
import { useAddOrder } from '@/hooks/useOrder';
import useLoginUser from '@/hooks/useAuth';

import { removeFromCart, updateQuantity } from '@/redux/store/slices/cartSlice';

import { calculateShippingFee } from '@/lib/calculateShippingFee';

/* =========================================================
   CONSTANTS
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

const BRAND = '#1f5d3b';

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}

	const number = Number(value);

	return Number.isFinite(number) ? number : fallback;
};

const formatPrice = (value) =>
	toNumber(value).toLocaleString('en-BD', {
		maximumFractionDigits: 2,
	});

const getProductId = (item) => {
	const product = item?.product;

	return String(
		item?._id ||
			item?.productId ||
			(typeof product === 'object' ? product?._id : product) ||
			item?.slug ||
			''
	);
};

const getVariantIdentity = (item) => ({
	productId: getProductId(item),
	variantId: item?.variantId ?? null,
	variantKey: item?.variantKey ?? null,
});

const getQuantity = (item) =>
	Math.max(1, Math.floor(toNumber(item?.quantity, 1)));

const getUnitPrice = (item) => {
	const price = toNumber(item?.price, NaN);

	if (Number.isFinite(price) && price >= 0) {
		return price;
	}

	return Math.max(toNumber(item?.sellPrice ?? item?.regularPrice, 0), 0);
};

const getOriginalPrice = (item) =>
	Math.max(
		toNumber(item?.regularPrice, getUnitPrice(item)),
		getUnitPrice(item)
	);

const getProductImage = (item) => {
	const image =
		item?.image ||
		item?.featureImg ||
		item?.images?.[0] ||
		item?.galleryImages?.[0];

	return typeof image === 'string' && image.trim()
		? image
		: '/images/placeholder.png';
};

const getVariantLabel = (item) => {
	if (item?.variantLabel) {
		return item.variantLabel;
	}

	if (item?.size?.value !== undefined && item?.size?.value !== null) {
		return `${item.size.value} ${
			UNIT_LABELS[item.size.unit] || item.size.unit || ''
		}`.trim();
	}

	return '';
};

const getDiscountText = (item) => {
	const value = toNumber(item?.discount?.value, 0);

	if (value <= 0) return null;

	if (item?.discount?.type === 'percentage') {
		return `${value}% OFF`;
	}

	if (item?.discount?.type === 'fixed') {
		return `৳${formatPrice(value)} OFF`;
	}

	return null;
};

/* =========================================================
   CHECKOUT CLIENT
========================================================= */

export default function CheckoutClient() {
	const dispatch = useDispatch();
	const router = useRouter();

	const { status } = useSession();
	const { user } = useLoginUser();

	const cart = useSelector((state) => state.cart?.items ?? []);
	const hydrated = useSelector((state) => state.cart?.hydrated ?? false);

	const { applyVoucher } = useSelector((state) => state.voucher ?? {});

	const mutation = useAddOrder();

	const [processing, setProcessing] = useState(false);
	const [orderPlaced, setOrderPlaced] = useState(false);

	const [shippingSettings, setShippingSettings] = useState(
		EMPTY_SHIPPING_SETTINGS
	);

	const [shippingSettingsLoading, setShippingSettingsLoading] =
		useState(true);

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
	});

	/* =====================================================
       LOGIN CHECK
    ===================================================== */

	useEffect(() => {
		if (status !== 'unauthenticated') return;

		toast.error('Checkout করতে প্রথমে Login করুন', {
			id: 'checkout-login-required',
		});

		const timer = setTimeout(() => {
			router.replace(
				`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`
			);
		}, 1200);

		return () => clearTimeout(timer);
	}, [status, router]);

	/* =====================================================
       AUTO FILL USER
    ===================================================== */

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

	/* =====================================================
       SHIPPING SETTINGS
    ===================================================== */

	useEffect(() => {
		let cancelled = false;

		const fetchShippingSettings = async () => {
			setShippingSettingsLoading(true);

			try {
				const response = await fetch('/api/shipping/get', {
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

						freeDeliveryEnabled:
							settings.freeDeliveryEnabled === true,

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

	/* =====================================================
       TOTAL CALCULATION
    ===================================================== */

	const subtotal = useMemo(() => {
		return cart.reduce(
			(sum, item) => sum + getUnitPrice(item) * getQuantity(item),
			0
		);
	}, [cart]);

	const discount = Math.max(toNumber(applyVoucher?.discount, 0), 0);

	const voucherCode = applyVoucher?.code || applyVoucher?.voucherCode || '';

	const deliveryCharge = useMemo(() => {
		return calculateShippingFee({
			subtotal,
			district: orderData.address.city,
			settings: shippingSettings,
		});
	}, [subtotal, orderData.address.city, shippingSettings]);

	const grandTotal = Math.max(subtotal - discount, 0) + deliveryCharge;

	/* =====================================================
       FORM CHANGE
    ===================================================== */

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

	/* =====================================================
       REMOVE CART ITEM
    ===================================================== */

	const handleRemove = (item) => {
		dispatch(removeFromCart(getVariantIdentity(item)));

		toast.success('Product removed from cart');
	};

	/* =====================================================
       UPDATE QUANTITY
    ===================================================== */

	const handleQuantityChange = (item, newQty) => {
		const quantity = Number(newQty);

		if (!Number.isInteger(quantity) || quantity < 1) {
			return;
		}

		const hasStock =
			item?.stock !== null &&
			item?.stock !== undefined &&
			item?.stock !== '';

		const stock = Math.floor(toNumber(item?.stock, 0));

		if (hasStock && stock <= 0) {
			toast.error('This variant is out of stock');
			return;
		}

		if (hasStock && quantity > stock) {
			toast.error(`Only ${stock} items available`);
			return;
		}

		dispatch(
			updateQuantity({
				...getVariantIdentity(item),
				quantity,
			})
		);
	};

	/* =====================================================
       PLACE ORDER
    ===================================================== */

	const placeOrder = (payload) => {
		mutation.mutate(payload, {
			onSuccess: (result) => {
				setOrderPlaced(true);
				setProcessing(false);

				toast.success('অর্ডার সফল হয়েছে!');

				// Keep cart until the success page has handled it.
				// Clear cart in your order-success flow if needed.

				if (result?.order?._id) {
					router.push(`/order-success?orderId=${result.order._id}`);
				}
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

	/* =====================================================
       CONFIRM ORDER
    ===================================================== */

	const handleConfirmOrder = () => {
		if (processing || orderPlaced) return;

		if (status !== 'authenticated' || !user) {
			toast.error('অর্ডার করতে প্রথমে Login করুন');

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

		/* Customer validation */

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

		/* Address validation */

		if (!city) {
			toast.error('আপনার জেলা নির্বাচন করুন');
			return;
		}

		if (!thana) {
			toast.error('আপনার থানা / উপজেলা লিখুন');
			return;
		}

		if (!area) {
			toast.error('আপনার ডেলিভারি ঠিকানা লিখুন');
			return;
		}

		if (!cart.length) {
			toast.error('আপনার কার্ট খালি');
			return;
		}

		if (shippingSettingsLoading) {
			toast.error('ডেলিভারি চার্জ লোড হচ্ছে। অপেক্ষা করুন।');
			return;
		}

		/* Cart validation */

		const hasInvalidItem = cart.some((item) => {
			return (
				!getProductId(item) ||
				!item?.variantId ||
				getUnitPrice(item) <= 0 ||
				getQuantity(item) < 1
			);
		});

		if (hasInvalidItem) {
			toast.error(
				'কার্টে কোনো পণ্যের variant বা মূল্য সঠিক নেই। পণ্যটি আবার যোগ করুন।'
			);

			return;
		}

		/* Prepare order items */

		const orderItems = cart.map((item) => {
			const variantLabel = getVariantLabel(item);

			return {
				productId: String(getProductId(item)),

				variantId: String(item.variantId),

				variantLabel,

				name: item.name || 'Product',

				quantity: getQuantity(item),

				// Display value only. Backend should verify price.
				price: getUnitPrice(item),

				image: getProductImage(item),
			};
		});

		/* Push notification FID */

		const pushFid =
			typeof window !== 'undefined'
				? localStorage.getItem('shalban_push_fid')
				: null;

		/* Final payload */

		const payload = {
			pushFid,

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

	/* =====================================================
       SESSION LOADING
    ===================================================== */

	if (status === 'loading' || !hydrated) {
		return (
			<div className="min-h-screen bg-[#f8faf8] flex items-center justify-center">
				<div className="text-center">
					<Loader2
						size={34}
						className="mx-auto animate-spin text-[#1f5d3b]"
					/>

					<p className="mt-3 text-sm text-gray-500">
						Checkout লোড হচ্ছে...
					</p>
				</div>
			</div>
		);
	}

	/* =====================================================
       NOT LOGGED IN
    ===================================================== */

	if (status === 'unauthenticated') {
		return (
			<div className="min-h-screen bg-[#f8faf8] flex items-center justify-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#1f5d3b]">
						<Lock size={28} />
					</div>

					<h2 className="mt-5 text-xl font-bold text-gray-900">
						Login Required
					</h2>

					<p className="mt-2 text-sm text-gray-500">
						Checkout করতে প্রথমে Login করতে হবে।
					</p>

					<button
						type="button"
						onClick={() =>
							router.replace(
								`/auth/login?callbackUrl=${encodeURIComponent('/checkout')}`
							)
						}
						className="mt-6 w-full rounded-xl bg-[#1f5d3b] py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
						Login করুন
					</button>
				</div>
			</div>
		);
	}

	/* =====================================================
       EMPTY CART
    ===================================================== */

	if (cart.length === 0) {
		return (
			<div className="min-h-screen bg-[#f8faf8] flex items-center justify-center px-4">
				<div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
					<Package size={42} className="mx-auto text-[#1f5d3b]" />

					<h2 className="mt-4 text-xl font-bold text-gray-900">
						Your Cart is Empty
					</h2>

					<p className="mt-2 text-sm text-gray-500">
						You haven't added any products yet.
					</p>

					<Link
						href="/shop"
						className="mt-5 inline-flex rounded-xl bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white">
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	/* =====================================================
       MAIN CHECKOUT UI
    ===================================================== */

	return (
		<main className="min-h-screen bg-[#f8faf8] pb-12">
			{/* HEADER */}

			<div className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<Link
						href="/shop"
						className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#1f5d3b]">
						<ArrowLeft size={17} />
						Continue Shopping
					</Link>

					<div className="flex items-center gap-2 text-sm font-semibold text-[#1f5d3b]">
						<ShieldCheck size={18} />
						Secure Checkout
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
				{/* PAGE TITLE */}

				<div className="mb-7">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1f5d3b]">
						Shalban Food
					</p>

					<h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
						Checkout
					</h1>

					<p className="mt-1 text-sm text-gray-500">
						Complete your information to place your order.
					</p>
				</div>

				<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
					{/* LEFT COLUMN */}

					<div className="space-y-5">
						{/* CUSTOMER INFORMATION */}

						<section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
							<div className="mb-5 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#1f5d3b]">
									<User size={19} />
								</div>

								<div>
									<h2 className="font-bold text-gray-900">
										Customer Information
									</h2>

									<p className="text-xs text-gray-500">
										Your contact details
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{/* NAME */}

								<div className="sm:col-span-2">
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										Full Name *
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
											className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50"
										/>
									</div>
								</div>

								{/* EMAIL */}

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										Email Address
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
											className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50"
										/>
									</div>
								</div>

								{/* PHONE */}

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										Phone Number *
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
											className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50"
										/>
									</div>
								</div>
							</div>
						</section>

						{/* SHIPPING INFORMATION */}

						<section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
							<div className="mb-5 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#1f5d3b]">
									<Truck size={19} />
								</div>

								<div>
									<h2 className="font-bold text-gray-900">
										Delivery Information
									</h2>

									<p className="text-xs text-gray-500">
										Where should we deliver your order?
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{/* ADDRESS */}

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										Area / Full Address *
									</label>

									<div className="relative">
										<Building
											size={17}
											className="absolute left-3 top-3.5 text-gray-400"
										/>

										<input
											type="text"
											name="address.area"
											value={orderData.address.area}
											onChange={handleChange}
											placeholder="House, road, village or area"
											autoComplete="street-address"
											className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50"
										/>
									</div>
								</div>

								{/* THANA */}

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										Thana / Upazila *
									</label>

									<div className="relative">
										<MapPin
											size={17}
											className="absolute left-3 top-3.5 text-gray-400"
										/>

										<input
											type="text"
											name="address.thana"
											value={orderData.address.thana}
											onChange={handleChange}
											placeholder="Enter your thana or upazila"
											className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50"
										/>
									</div>
								</div>

								{/* DISTRICT */}

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-gray-600">
										District *
									</label>

									<select
										name="address.city"
										value={orderData.address.city}
										onChange={handleChange}
										className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#1f5d3b] focus:ring-2 focus:ring-green-50">
										<option value="">
											Select your district
										</option>

										{DISTRICTS.map((district) => (
											<option
												key={district}
												value={district}>
												{district}
											</option>
										))}
									</select>
								</div>

								{/* DELIVERY CHARGE */}

								{orderData.address.city && (
									<div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50/70 p-4">
										<div className="flex items-center gap-3">
											<Truck
												size={19}
												className="text-[#1f5d3b]"
											/>

											<div>
												<p className="text-sm font-semibold text-gray-900">
													Delivery Charge
												</p>

												<p className="text-xs text-gray-500">
													{orderData.address.city}
												</p>
											</div>
										</div>

										<p className="text-lg font-bold text-[#1f5d3b]">
											{shippingSettingsLoading
												? '...'
												: `৳${formatPrice(deliveryCharge)}`}
										</p>
									</div>
								)}
							</div>
						</section>

						{/* MOBILE CART */}

						<section className="rounded-2xl border border-gray-200 bg-white p-5 lg:hidden">
							<div className="mb-5 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<ShoppingBag
										size={19}
										className="text-[#1f5d3b]"
									/>

									<h2 className="font-bold text-gray-900">
										Your Items
									</h2>
								</div>

								<span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1f5d3b]">
									{cart.length} items
								</span>
							</div>

							<CartList
								items={cart}
								onRemove={handleRemove}
								onQuantityChange={handleQuantityChange}
							/>
						</section>
					</div>

					{/* RIGHT COLUMN */}

					<aside className="space-y-5">
						{/* DESKTOP CART */}

						<section className="hidden rounded-2xl border border-gray-200 bg-white p-5 lg:block">
							<div className="mb-5 flex items-center justify-between">
								<h2 className="font-bold text-gray-900">
									Your Items
								</h2>

								<span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1f5d3b]">
									{cart.length} items
								</span>
							</div>

							<CartList
								items={cart}
								onRemove={handleRemove}
								onQuantityChange={handleQuantityChange}
							/>
						</section>

						{/* ORDER SUMMARY */}

						<section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 lg:sticky lg:top-6">
							<h2 className="mb-5 text-lg font-bold text-gray-900">
								Order Summary
							</h2>

							<div className="space-y-3 text-sm">
								<div className="flex justify-between gap-3">
									<span className="text-gray-500">
										Subtotal
									</span>

									<span className="font-semibold text-gray-900">
										৳{formatPrice(subtotal)}
									</span>
								</div>

								{discount > 0 && (
									<div className="flex justify-between gap-3">
										<span className="flex items-center gap-1.5 text-gray-500">
											<Tag size={14} />
											Discount
										</span>

										<span className="font-semibold text-green-700">
											-৳{formatPrice(discount)}
										</span>
									</div>
								)}

								<div className="flex justify-between gap-3">
									<span className="text-gray-500">
										Delivery
									</span>

									<span className="font-semibold text-gray-900">
										{shippingSettingsLoading
											? 'Loading...'
											: deliveryCharge === 0
												? orderData.address.city
													? 'FREE'
													: 'Select district'
												: `৳${formatPrice(deliveryCharge)}`}
									</span>
								</div>

								{shippingSettings.freeDeliveryEnabled &&
									subtotal >=
										Number(
											shippingSettings.freeDeliveryMinimum
										) && (
										<p className="rounded-lg bg-green-50 p-2 text-xs text-green-700">
											আপনার অর্ডারে ফ্রি ডেলিভারি
											প্রযোজ্য।
										</p>
									)}
							</div>

							<div className="my-5 border-t border-dashed border-gray-200" />

							<div className="flex items-end justify-between gap-3">
								<div>
									<p className="text-xs text-gray-500">
										Total Amount
									</p>

									<p className="mt-1 text-2xl font-extrabold text-gray-900">
										৳{formatPrice(grandTotal)}
									</p>
								</div>

								<div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-[#1f5d3b]">
									<Truck size={15} />
									Cash on Delivery
								</div>
							</div>

							<button
								type="button"
								onClick={handleConfirmOrder}
								disabled={
									processing ||
									orderPlaced ||
									!cart.length ||
									shippingSettingsLoading
								}
								className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5d3b] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#17472d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
								{processing ? (
									<>
										<Loader2
											size={18}
											className="animate-spin"
										/>
										Placing Order...
									</>
								) : orderPlaced ? (
									<>
										<CheckCircle2 size={18} />
										Order Placed
									</>
								) : (
									<>
										<ShoppingBag size={18} />
										Place Order
									</>
								)}
							</button>

							<p className="mt-3 text-center text-xs text-gray-400">
								Pay cash when your order arrives.
							</p>

							<div className="mt-5 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
								<ShieldCheck size={15} />
								Your information is secure.
							</div>
						</section>
					</aside>
				</div>
			</div>
		</main>
	);
}

/* =========================================================
   CART LIST
   Same page - no separate component file required.
========================================================= */

function CartList({ items, onRemove, onQuantityChange }) {
	if (!items?.length) {
		return (
			<div className="py-8 text-center">
				<Package size={32} className="mx-auto text-gray-300" />

				<p className="mt-2 text-sm text-gray-500">
					Your cart is empty.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{items.map((item, index) => {
				const productId = getProductId(item);

				const quantity = getQuantity(item);
				const price = getUnitPrice(item);
				const originalPrice = getOriginalPrice(item);

				const itemTotal = price * quantity;
				const savedAmount = Math.max(
					(originalPrice - price) * quantity,
					0
				);

				const stockValue = item?.stock;

				const hasStock =
					stockValue !== null &&
					stockValue !== undefined &&
					stockValue !== '';

				const stock = Math.floor(toNumber(stockValue, 0));

				const isOutOfStock = hasStock && stock <= 0;
				const isMaxStock = hasStock && stock > 0 && quantity >= stock;

				const variantLabel = getVariantLabel(item);

				const productHref = item?.slug
					? `/product/${encodeURIComponent(item.slug)}`
					: productId
						? `/product/${encodeURIComponent(productId)}`
						: '/shop';

				const itemKey =
					[
						productId,
						item?.variantId || '',
						item?.variantKey || '',
					].join('-') || index;

				return (
					<article
						key={itemKey}
						className="rounded-xl border border-gray-100 bg-white  transition hover:border-gray-200">
						<div className="flex gap-1">
							{/* IMAGE */}

							<Link
								href={productHref}
								className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg bg-[#f7f8f6]">
								<Image
									src={getProductImage(item)}
									alt={item?.name || 'Product'}
									fill
									sizes="76px"
									className="object-contain "
								/>
							</Link>

							{/* PRODUCT INFO */}

							<div className="min-w-0 flex-1">
								<div className="flex items-start justify-between">
									<h3 className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#1f5d3b]">
										{item?.name || 'Product'}
										{' - '}
										{variantLabel && variantLabel}
									</h3>

									<button
										type="button"
										onClick={() => onRemove(item)}
										className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-800 cursor-pointer transition hover:bg-red-50 hover:text-red-500"
										aria-label="Remove product">
										<Trash2 size={15} />
									</button>
								</div>
								<div className=" flex flex-wrap items-center gap-2">
									<span className="text-sm font-bold text-[#1f5d3b]">
										৳{formatPrice(price)}
									</span>

									{originalPrice > price && (
										<span className="text-xs text-gray-400 line-through">
											৳{formatPrice(originalPrice)}
										</span>
									)}

									{getDiscountText(item) &&
										originalPrice > price && (
											<span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
												{getDiscountText(item)}
											</span>
										)}
								</div>

								<div className="flex justify-between gap-2">
									{savedAmount > 0 && (
										<p className="text-[11px] font-medium text-green-700">
											You save ৳{formatPrice(savedAmount)}
										</p>
									)}
									{hasStock && (
										<div
											className={`rounded-lg px-3  text-[11px] font-medium ${
												isOutOfStock
													? 'bg-red-50 text-red-600'
													: isMaxStock
														? 'bg-amber-50 text-amber-700'
														: 'bg-gray-50 text-gray-500'
											}`}>
											{isOutOfStock
												? 'This variant is out of stock.'
												: isMaxStock
													? 'Maximum available stock reached.'
													: `stock: ${stock}`}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* QUANTITY + TOTAL */}

						<div className="flex items-center justify-between border-t border-gray-100 pt-3">
							<div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
								<button
									type="button"
									onClick={() =>
										onQuantityChange(item, quantity - 1)
									}
									disabled={quantity <= 1 || isOutOfStock}
									className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-green-50 hover:text-[#1f5d3b] disabled:opacity-30"
									aria-label="Decrease quantity">
									<Minus size={14} />
								</button>

								<span className="flex h-8 min-w-9 items-center justify-center border-x border-gray-200 px-2 text-xs font-bold text-gray-900">
									{quantity}
								</span>

								<button
									type="button"
									onClick={() =>
										onQuantityChange(item, quantity + 1)
									}
									disabled={isOutOfStock || isMaxStock}
									className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-green-50 hover:text-[#1f5d3b] disabled:opacity-30"
									aria-label="Increase quantity">
									<Plus size={14} />
								</button>
							</div>

							<div className="text-right">
								<p className="text-[10px] text-gray-400">
									Item Total
								</p>

								<p className="text-sm font-bold text-gray-900">
									৳{formatPrice(itemTotal)}
								</p>
							</div>
						</div>

						{/* STOCK */}
					</article>
				);
			})}
		</div>
	);
}

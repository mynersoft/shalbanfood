'use client';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useAddOrder } from '@/hooks/useOrder';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useLoginUser from '@/hooks/useAuth';

import ShippingInfo from './ShippingInfo';
import { shippingCost } from '@/utils/shippingCost';

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

export default function CheckoutClient() {
	const { user } = useLoginUser();

	const cart = useSelector((state) => state.cart.items);
	const { applyVoucher } = useSelector((state) => state.voucher);

	const router = useRouter();
	const mutation = useAddOrder();

	const [processing, setProcessing] = useState(false);

	const [parentVoucher, setParentVoucher] = useState('');

	/*
	|--------------------------------------------------------------------------
	| Customer + Order State
	|--------------------------------------------------------------------------
	*/

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

		cartItems: [],

		voucherCode: '',

		payment: {
			method: 'COD',
			status: 'unpaid',
			transactionId: null,
		},
	});

	/*
	|--------------------------------------------------------------------------
	| Cart Items
	|--------------------------------------------------------------------------
	*/

	useEffect(() => {
		setOrderData((prev) => ({
			...prev,
			cartItems: cart,
		}));
	}, [cart]);

	/*
	|--------------------------------------------------------------------------
	| Logged-in User Auto Fill
	|--------------------------------------------------------------------------
	*/

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

	/*
	|--------------------------------------------------------------------------
	| Subtotal
	|--------------------------------------------------------------------------
	*/

	const subtotal = cart.reduce((sum, item) => {
		let price = Number(item.salePrice) || 0;

		if (item.discount) {
			if (item.discount.type === 'percentage') {
				price =
					price - (price * Number(item.discount.value || 0)) / 100;
			}

			if (item.discount.type === 'fixed') {
				price = price - Number(item.discount.value || 0);
			}
		}

		price = Math.max(price, 0);

		return sum + price * Number(item.quantity || 1);
	}, 0);

	/* Discount */

	const discount = Number(applyVoucher?.discount || 0);



	const grandTotal = subtotal - discount + Number(shippingCost || 0);

	
	useEffect(() => {
		setOrderData((prev) => ({
			...prev,
			voucherCode: parentVoucher,
		}));
	}, [parentVoucher]);

	

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

	/* Place Order 	*/
	const placeOrder = (payload) => {
		mutation.mutate(payload, {
			onSuccess: (res) => {
				try {
					const whatsappNumber = '01603816721';

					const itemsText = payload.orderItems
						.map(
							(item, index) =>
								`${index + 1}. ${item.name}
   পরিমাণ: ${item.quantity}
   দাম: ৳${Number(item.price).toFixed(0)}`
						)
						.join('\n\n');

					const address = payload.shippingAddress;

					const message = `🛒 শালবন ফুডে নতুন অর্ডার

👤 নাম: ${payload.customer.name}
📞 ফোন: ${payload.customer.phone}

📍 ঠিকানা:
থানা: ${address.thana || '-'}
এলাকা: ${address.area || '-'}
জেলা: ${address.city || '-'}

📦 পণ্য:
${itemsText}

💰 মোট: ৳${Number(grandTotal).toFixed(0)}

💳 পেমেন্ট: ক্যাশ অন ডেলিভারি

অর্ডারটি কনফার্ম করার জন্য ধন্যবাদ ❤️`;

					const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
						message
					)}`;

					// Show success toast
					toast.success('অর্ডার সফল হয়েছে! whatsapp চেক করুন ');

					// Open WhatsApp
					const whatsappWindow = window.open(
						whatsappUrl,
						'_blank',
						'noopener,noreferrer'
					);

					if (!whatsappWindow) {
						toast.error(
							'WhatsApp খুলতে পারেনি। Browser popup allow করুন।'
						);
					}
					setProcessing(false);
				} catch (error) {
					console.error('WhatsApp error:', error);

					toast.success('অর্ডার সফল হয়েছে! whatsapp চেক করুন ');

					setProcessing(false);
				}
			},

			onError: (error) => {
				console.error(error);

				toast.error(
					error?.response?.data?.message ||
						'Order failed. Please try again.'
				);

				setProcessing(false);
			},
		});
	};

	/*
	|--------------------------------------------------------------------------
	| Confirm Order
	|--------------------------------------------------------------------------
	*/

	const handleConfirmOrder = () => {
		const name = orderData.customer.name.trim();
		const email = orderData.customer.email.trim();
		const phone = orderData.customer.phone.trim();

		const area = orderData.address.area.trim();
		const city = orderData.address.city.trim();
		const thana = orderData.address.thana.trim();

		/* Required Validation */

		if (!name) {
			toast.error('Please enter your name');
			return;
		}

		if (!phone) {
			toast.error('Please enter your phone number');
			return;
		}

		if (!area) {
			toast.error('Please enter your delivery area');
			return;
		}

		if (!cart.length) {
			toast.error('Your cart is empty');
			return;
		}

		/*
		|--------------------------------------------------------------------------
		| Create Order Items According To Order Model
		|--------------------------------------------------------------------------
		*/

		const orderItems = cart.map((item) => {
			let price = Number(item.salePrice) || 0;

			if (item.discount) {
				if (item.discount.type === 'percentage') {
					price =
						price -
						(price * Number(item.discount.value || 0)) / 100;
				}

				if (item.discount.type === 'fixed') {
					price = price - Number(item.discount.value || 0);
				}
			}

			price = Math.max(price, 0);

			return {
				productId: item.productId || item._id || item.id || '',

				name: item.name || '',

				quantity: Number(item.quantity) || 1,

				price,

				image: item.image || item.images?.[0] || '',
			};
		});

		const payload = {
			...(user?._id || user?.id
				? {
						userId: user._id || user.id,
					}
				: {}),

			customer: {
				name,
				email,
				phone,
			},

			shippingAddress: {
				thana,
				area,
				city,
			},

			orderItems,

			voucherCode: orderData.voucherCode,

			payment: {
				method: 'COD',
				status: 'unpaid',
			},
		};

		setProcessing(true);

		placeOrder(payload);
	};

	/*
	|--------------------------------------------------------------------------
	| Empty Cart
	|--------------------------------------------------------------------------
	*/

	if (cart.length === 0) {
		return <CheckEmptyCart />;
	}

	return (
		<div className="min-h-screen bg-[#fafafa]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
				{/* =====================================================
				    HEADER
				===================================================== */}

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

				{/* =====================================================
				    MAIN GRID
				===================================================== */}

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_410px] gap-6 lg:gap-8">
					{/* =================================================
					    LEFT
					================================================= */}

					<div className="space-y-6">
						{/* =============================================
						    CUSTOMER INFORMATION
						============================================= */}

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
										{user
											? 'Your account information'
											: 'You can order without creating an account'}
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
											className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
										/>
									</div>
								</div>

								{/* EMAIL */}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Email
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
											className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* =============================================
						    SHIPPING
						============================================= */}

						<div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
									<Truck
										size={19}
										className="text-gray-700"
									/>
								</div>

								<div>
									<h2 className="font-semibold text-gray-900">
										Delivery Information
									</h2>

									<p className="text-xs text-gray-500 mt-0.5">
										Where should we deliver your order?
									</p>
								</div>
							</div>

							<ShippingInfo
								orderData={{
									...orderData,
									phone: orderData.customer.phone,
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
								}}
							/>
						</div>

						{/* =============================================
						    COD
						============================================= */}

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

						{/* =============================================
						    MOBILE ITEMS
						============================================= */}

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

					{/* =================================================
					    RIGHT
					================================================= */}

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

						{/* =============================================
						    SUMMARY
						============================================= */}

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
											-৳
											{discount.toFixed(2)}
										</span>
									</div>
								)}

								<div className="flex justify-between">
									<span className="text-gray-500">
										Delivery
									</span>

									<span
										className={
											shippingCost === 0
												? 'font-medium text-green-600'
												: 'font-medium text-gray-900'
										}>
										{shippingCost === 0
											? 'FREE'
											: `৳${Number(shippingCost).toFixed(
													2
												)}`}
									</span>
								</div>
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

							{/* =========================================
							    PLACE ORDER
							========================================= */}

							<button
								type="button"
								onClick={handleConfirmOrder}
								disabled={processing || cart.length === 0}
								className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 px-5 rounded-xl font-semibold text-base hover:bg-black active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
								{processing ? (
									<>
										<Loader2
											size={19}
											className="animate-spin"
										/>
										Placing Order...
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

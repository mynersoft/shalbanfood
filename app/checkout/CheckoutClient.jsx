'use client';

import { useSelector } from 'react-redux';

import { useEffect, useState } from 'react';
import { useAddOrder } from '@/hooks/useOrder';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useLoginUser from '@/hooks/useAuth';
import ShippingInfo from './ShippingInfo';
import { shippingCost, tax } from '@/utils/shippingCost';
import {
	ArrowLeft,
	CreditCard,
	Loader2,
	ShoppingBag,
	Truck,
	Wallet,
	CheckCircle2,
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

	const [orderData, setOrderData] = useState({
		address: { area: '', city: '', thana: '' },
		phone: '',
		cartItems: [],
		totalAmount: 0,
		voucherCode: parentVoucher || '',
		payment: {
			method: 'COD',
			status: 'unpaid',
			transactionId: null,
		},
	});

	/* ================= PRODUCTS ================= */
	useEffect(() => {
		setOrderData((prev) => ({
			...prev,
			cartItems: cart,
		}));
	}, [cart]);

	/* ================= AUTOFILL ================= */
	useEffect(() => {
		if (!user) return;

		if (!orderData.phone) {
			setOrderData((prev) => ({
				...prev,
				phone: user.phone || '',
				address: {
					area: user.address?.area || '',
					city: user.address?.city || '',
					thana: user.address?.thana || '',
				},
			}));
		}
	}, [orderData.phone, user]);

	/* ================= TOTAL ================= */
	const subtotal = cart.reduce((sum, item) => {
		let price = item.salePrice;

		if (item.discount) {
			if (item.discount.type === 'percentage') {
				price = price - (price * item.discount.value) / 100;
			}

			if (item.discount.type === 'fixed') {
				price = price - item.discount.value;
			}
		}

		// negative price avoid
		price = Math.max(price, 0);

		return sum + price * item.quantity;
	}, 0);

	const grandTotal =
		subtotal + shippingCost + (applyVoucher ? applyVoucher.discount : 0);

	useEffect(() => {
		setOrderData((prev) => ({
			...prev,
			totalAmount: grandTotal,
		}));
	}, [grandTotal]);
	useEffect(() => {
		setOrderData((prev) => ({
			...prev,
			voucherCode: parentVoucher,
		}));
	}, [parentVoucher]);

	/* ================= CHANGE ================= */
	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setOrderData((prev) => ({
				...prev,
				[parent]: { ...prev[parent], [child]: value },
			}));
		} else {
			setOrderData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handlePaymentChange = (method) => {
		setOrderData((prev) => ({
			...prev,
			payment: { ...prev.payment, method },
		}));
	};

	/* ================= PLACE ORDER ================= */
	const placeOrder = (data) => {
		mutation.mutate(data, {
			onSuccess: (res) => {
				router.push(`/checkout/success?orderId=${res._id}`);
			},
			onError: () => {
				toast.error('Order failed');
				setProcessing(false);
			},
		});
	};

	/* ================= CONFIRM ================= */
	const handleConfirmOrder = () => {
		if (!orderData.address.area || !orderData.phone) {
			toast.error('Please fill required fields');
			return;
		}

		setProcessing(true);

		if (orderData.payment.method === 'COD') {
			placeOrder({
				...orderData,
				payment: {
					method: 'COD',
					status: 'unpaid',
					transactionId: null,
				},
			});
		} else {
			toast.error('bKash flow handled separately');
			setProcessing(false);
		}
	};

	if (cart.length === 0) return <CheckEmptyCart />;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex items-center gap-3 mb-2">
				<button
					onClick={() => router.back()}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					aria-label="Go back">
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
			</div>
			<p className="text-gray-600 mb-8 ml-12">Complete your order</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column - Order Details */}
				<div className="space-y-8">
					{/* Shipping Information */}

					<ShippingInfo
						orderData={orderData}
						handleChange={handleChange}
					/>

					{/* Payment Method */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-blue-100 rounded-lg">
								<CreditCard
									className="text-blue-600"
									size={20}
								/>
							</div>
							<h2 className="text-xl font-bold text-gray-900">
								Payment Method
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Cash on Delivery */}
							<button
								onClick={() => handlePaymentChange('COD')}
								className={`p-4 border-2 rounded-xl transition-all ${
									orderData.payment.method === 'COD'
										? 'border-green-500 bg-green-50'
										: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
								}`}>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											orderData.payment.method === 'COD'
												? 'bg-green-100 text-green-600'
												: 'bg-gray-100 text-gray-600'
										}`}>
										<Truck size={20} />
									</div>
									<div className="text-left">
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												Cash on Delivery
											</span>
											{orderData.payment.method ===
												'COD' && (
												<CheckCircle2
													size={16}
													className="text-green-500"
												/>
											)}
										</div>
										<p className="text-sm text-gray-500 mt-1">
											Pay when you receive
										</p>
									</div>
								</div>
							</button>

							{/* bKash */}
							<button
								onClick={() => handlePaymentChange('bKash')}
								className={`p-4 border-2 rounded-xl transition-all ${
									orderData.payment.method === 'bKash'
										? 'border-pink-500 bg-pink-50'
										: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
								}`}>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											orderData.payment.method === 'bKash'
												? 'bg-pink-100 text-pink-600'
												: 'bg-gray-100 text-gray-600'
										}`}>
										<Wallet size={20} />
									</div>
									<div className="text-left">
										<div className="flex items-center gap-2">
											<span className="font-semibold">
												bKash
											</span>
											{orderData.payment.method ===
												'bKash' && (
												<CheckCircle2
													size={16}
													className="text-pink-500"
												/>
											)}
										</div>
										<p className="text-sm text-gray-500 mt-1">
											Pay with mobile wallet
										</p>
									</div>
								</div>
							</button>
						</div>

						{orderData.payment.method === 'bKash' && (
							<div className="mt-4 p-4 bg-blue-50 rounded-lg">
								<div className="flex items-center gap-3">
									<Lock size={16} className="text-blue-600" />
									<p className="text-sm text-blue-700">
										You will be redirected to bKash for
										secure payment
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Column - Order Summary & Checkout */}
				<div className="space-y-8">
					<div className="border border-gray-100 p-2 rounded">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-blue-100 rounded-lg">
								<ShoppingBag
									className="text-blue-600"
									size={20}
								/>
							</div>
							<h2 className="text-xl font-bold text-gray-900">
								Order Items
							</h2>
							<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
								{cart.length} items
							</span>
						</div>
						<CartItems subtotal={subtotal} />
					</div>

					{/* Order Summary */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
						<h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
							Order Summary
						</h2>

						<div className="space-y-3 mb-4">
							<div className="flex justify-between">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-medium">
									৳{subtotal.toFixed(2)}
								</span>
							</div>

							{applyVoucher !== null && (
								<div className="flex justify-between">
									<span className="text-gray-600">
										Discount
									</span>
									<span className="font-medium">
										৳{applyVoucher.discount}
									</span>
								</div>
							)}

							<div className="flex justify-between">
								<span className="text-gray-600">Shipping</span>
								<span
									className={
										shippingCost === 0
											? 'text-green-600 font-medium'
											: 'font-medium'
									}>
									{shippingCost === 0
										? 'FREE'
										: `৳${shippingCost.toFixed(2)}`}
								</span>
							</div>
						</div>

						<div className="border-t border-gray-200 pt-4 mb-6">
							<div className="flex justify-between items-center">
								<span className="text-lg font-bold text-gray-900">
									Total Amount
								</span>
								<div className="text-right">
									<div className="text-2xl font-bold text-blue-600">
										৳{grandTotal.toFixed(2)}
									</div>
								</div>
							</div>
							<div>
								<ApplyVoucher
									subtotal={subtotal}
									cartItems={cart}
									setVoucherInParent={setParentVoucher}
								/>
							</div>
						</div>

						{/* Terms & Conditions */}
						<div className="mb-6">
							<label className="flex items-start gap-3">
								<input
									type="checkbox"
									className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									required
								/>
								<span className="text-sm text-gray-600">
									I agree to the{' '}
									<a
										href="/terms"
										className="text-blue-600 hover:underline">
										Terms & Conditions
									</a>{' '}
									and{' '}
									<a
										href="/privacy"
										className="text-blue-600 hover:underline">
										Privacy Policy
									</a>
								</span>
							</label>
						</div>

						{/* Confirm Order Button */}
						<button
							onClick={handleConfirmOrder}
							disabled={processing || cart.length === 0}
							className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
							{processing ? (
								<>
									<Loader2
										size={20}
										className="animate-spin"
									/>
									Processing...
								</>
							) : (
								<>
									{orderData.payment.method === 'COD' ? (
										<>
											<Truck size={20} />
											Place Order (Cash on Delivery)
										</>
									) : (
										<>
											<Wallet size={20} />
											Pay with bKash
										</>
									)}
								</>
							)}
						</button>

						{/* Security Badge */}
						<div className="mt-6 pt-6 border-t border-gray-100">
							<div className="flex items-center justify-center gap-2">
								<Lock size={16} className="text-gray-400" />
								<p className="text-sm text-gray-500">
									Secure checkout • 256-bit SSL encryption
								</p>
							</div>
						</div>
					</div>

					{/* Need Help */}
					<div className="bg-blue-50 rounded-xl p-6">
						<h3 className="font-bold text-gray-900 mb-3">
							Need Help?
						</h3>
						<div className="space-y-2">
							<p className="text-sm text-gray-600">
								<span className="font-medium">Phone:</span>{' '}
								09678-123456
							</p>
							<p className="text-sm text-gray-600">
								<span className="font-medium">Email:</span>{' '}
								support@store.com
							</p>
							<p className="text-sm text-gray-600">
								<span className="font-medium">Hours:</span> 9AM
								- 11PM, 7 days a week
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

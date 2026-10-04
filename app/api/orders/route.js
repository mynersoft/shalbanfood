import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { withErrorHandler } from '@/lib/withErrorHandler';
import { ApiError } from '@/lib/ApiError';
import { validateVoucher } from '@/lib/validateVoucher';
// import { createAdminNotification } from '@/utils/createNotification';
import { shippingCost } from '@/utils/shippingCost';

import { generateInvoiceID } from '@/utils/generateInvoiceId';

export const runtime = 'nodejs';

// get by orderId
export async function GET(req) {
	try {
		const url = new URL(req.url);
		const orderId = url.searchParams.get('orderId');

		if (!orderId) {
			return NextResponse.json(
				{
					success: false,
					message: 'orderId is required',
				},
				{ status: 400 }
			);
		}

		if (!mongoose.Types.ObjectId.isValid(orderId)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid orderId',
				},
				{ status: 400 }
			);
		}

		await connectDB();

		console.log('DATABASE:', mongoose.connection.name);
		console.log('HOST:', mongoose.connection.host);

		// প্রথমে findById
		const orders = await Order.findById(orderId).lean();

		if (!orders) {
			// Debug করার জন্য database-এর latest IDs দেখাবে
			const latestOrders = await Order.find({})
				.select('_id invoiceNo')
				.sort({ createdAt: -1 })
				.limit(5)
				.lean();

			return NextResponse.json(
				{
					success: false,
					message: 'Order not found',
					debug: {
						orderId,
						database: mongoose.connection.name,
						latestOrders,
					},
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			orders,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Internal Server Error',
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
| Supports:
| 1. Guest checkout
| 2. Logged-in checkout
| 3. Cash on Delivery only
|
|--------------------------------------------------------------------------
*/

export const POST = withErrorHandler(async (req) => {
	let body;

	try {
		body = await req.json();
	} catch {
		throw new ApiError('Invalid JSON body', 400);
	}

	const { userId, customer, shippingAddress, orderItems, voucherCode } = body;

	if (!customer) {
		throw new ApiError('Customer information is required', 400);
	}

	if (!customer.name || !customer.phone) {
		throw new ApiError('Name and phone are required', 400);
	}

	if (!shippingAddress) {
		throw new ApiError('Shipping address is required', 400);
	}

	if (
		!shippingAddress.area ||
		!shippingAddress.city ||
		!shippingAddress.thana
	) {
		throw new ApiError('Complete shipping address is required', 400);
	}

	if (!Array.isArray(orderItems) || orderItems.length === 0) {
		throw new ApiError('Order items are required', 400);
	}

	await connectDB();

	const subtotal = orderItems.reduce((sum, item) => {
		const price = Number(item.price) || 0;

		const quantity = Number(item.quantity) || 1;

		return sum + price * quantity;
	}, 0);

	let discountAmount = 0;

	if (voucherCode) {
		try {
			const voucherResponse = await validateVoucher({
				voucherCode,
				cartItems: orderItems,
				subtotal,
			});

			const checkedVoucher = await voucherResponse.json();

			if (checkedVoucher?.valid && checkedVoucher?.discount) {
				discountAmount = Number(checkedVoucher.discount) || 0;
			}
		} catch (error) {
			console.error('Voucher validation error:', error);

			/*
			 * If voucher validation fails,
			 * continue without discount.
			 */
			discountAmount = 0;
		}
	}

	const deliveryFee = Number(shippingCost) || 0;

	const total = Math.max(0, subtotal - discountAmount + deliveryFee);

	let invoiceNo = null;

	for (let i = 0; i < 5; i++) {
		const generatedInvoice = generateInvoiceID();

		const existingOrder = await Order.findOne({
			invoiceNo: generatedInvoice,
		});

		if (!existingOrder) {
			invoiceNo = generatedInvoice;
			break;
		}
	}

	if (!invoiceNo) {
		throw new ApiError('Invoice generation failed', 500);
	}

	const codPayment = {
		method: 'COD',
		status: 'unpaid',
		transactionId: null,
	};

	const formattedOrderItems = orderItems.map((item) => ({
		productId: String(item.productId || item._id || ''),

		name: item.name || '',

		quantity: Number(item.quantity) || 1,

		price: Number(item.price) || 0,

		image: item.image || '',
	}));

	const orderPayload = {
		invoiceNo,

		customer: {
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
		},

		subtotal,

		total,

		shippingFee: deliveryFee,

		status: 'pending',

		discount: discountAmount,

		payment: codPayment,

		shippingAddress: {
			thana: shippingAddress.thana,

			area: shippingAddress.area,

			city: shippingAddress.city,

			phone: customer.phone,
		},

		orderItems: formattedOrderItems,
	};

	if (userId) {
		orderPayload.userId = userId;
	}

	const order = await Order.create(orderPayload);

	return NextResponse.json(
		{
			success: true,

			message: 'Order created successfully',

			order,
		},
		{
			status: 201,
		}
	);
});

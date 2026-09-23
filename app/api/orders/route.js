import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { withErrorHandler } from '@/lib/withErrorHandler';
import { ApiError } from '@/lib/ApiError';
import crypto from 'crypto';
import { validateVoucher } from '@/lib/validateVoucher';
// import { createAdminNotification } from '@/utils/createNotification';
import { shippingCost } from '@/utils/shippingCost';

export const runtime = 'nodejs';

export async function GET(req) {
	try {
		const url = new URL(req.url);
		const orderId = url.searchParams.get('orderId');

		console.log('=================================');
		console.log('REQUEST URL:', req.url);
		console.log('ORDER ID:', orderId);
		console.log('ORDER ID TYPE:', typeof orderId);
		console.log(
			'VALID OBJECT ID:',
			mongoose.Types.ObjectId.isValid(orderId)
		);

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
		const order = await Order.findById(orderId).lean();

		console.log('FOUND ORDER:', order);

		if (!order) {
			// Debug করার জন্য database-এর latest IDs দেখাবে
			const latestOrders = await Order.find({})
				.select('_id invoiceNo')
				.sort({ createdAt: -1 })
				.limit(5)
				.lean();

			console.log('LATEST ORDERS:', latestOrders);

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
			order,
		});
	} catch (error) {
		console.error('=================================');
		console.error('GET ORDER ERROR:', error);
		console.error('ERROR MESSAGE:', error.message);
		console.error('ERROR STACK:', error.stack);

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

// ✅ Secure unique invoice
function generateInvoiceID() {
	return 'Shalban-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
| Supports:
|
| 1. Guest checkout
| 2. Logged-in checkout
| 3. Cash on Delivery only
|
|--------------------------------------------------------------------------
*/

export const POST = withErrorHandler(async (req) => {
	/*
	|--------------------------------------------------------------------------
	| Body
	|--------------------------------------------------------------------------
	*/

	let body;

	try {
		body = await req.json();
	} catch {
		throw new ApiError('Invalid JSON body', 400);
	}

	/*
	|--------------------------------------------------------------------------
	| Get Data
	|--------------------------------------------------------------------------
	*/

	const {
		userId,
		customer,
		shippingAddress,
		orderItems,
		voucherCode,
		payment,
	} = body;

	/*
	|--------------------------------------------------------------------------
	| Basic Validation
	|--------------------------------------------------------------------------
	*/

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

	/*
	|--------------------------------------------------------------------------
	| Connect Database
	|--------------------------------------------------------------------------
	*/

	await connectDB();

	/*
	|--------------------------------------------------------------------------
	| Calculate Subtotal
	|--------------------------------------------------------------------------
	|
	| IMPORTANT:
	| Price is taken from frontend orderItems.
	|
	| If your Product model should be used as the
	| source of truth for price, we can change this
	| later to fetch products from MongoDB.
	|
	|--------------------------------------------------------------------------
	*/

	const subtotal = orderItems.reduce((sum, item) => {
		const price = Number(item.price) || 0;

		const quantity = Number(item.quantity) || 1;

		return sum + price * quantity;
	}, 0);

	/*
	|--------------------------------------------------------------------------
	| Voucher
	|--------------------------------------------------------------------------
	*/

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

	/*
	|--------------------------------------------------------------------------
	| Shipping
	|--------------------------------------------------------------------------
	*/

	const deliveryFee = Number(shippingCost) || 0;

	/*
	|--------------------------------------------------------------------------
	| Total
	|--------------------------------------------------------------------------
	*/

	const total = Math.max(0, subtotal - discountAmount + deliveryFee);

	/*
	|--------------------------------------------------------------------------
	| Invoice Number
	|--------------------------------------------------------------------------
	*/

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

	/*
	|--------------------------------------------------------------------------
	| Payment
	|--------------------------------------------------------------------------
	|
	| COD ONLY
	|
	| Ignore whatever payment method
	| frontend sends.
	|
	|--------------------------------------------------------------------------
	*/

	const codPayment = {
		method: 'COD',
		status: 'unpaid',
		transactionId: null,
	};

	/*
	|--------------------------------------------------------------------------
	| Order Items
	|--------------------------------------------------------------------------
	*/

	const formattedOrderItems = orderItems.map((item) => ({
		productId: String(item.productId || item._id || ''),

		name: item.name || '',

		quantity: Number(item.quantity) || 1,

		price: Number(item.price) || 0,

		image: item.image || '',
	}));

	/*
	|--------------------------------------------------------------------------
	| Create Order
	|--------------------------------------------------------------------------
	|
	| userId is OPTIONAL.
	|
	| Guest:
	|   userId = undefined
	|
	| Logged in:
	|   userId = actual user ID
	|
	|--------------------------------------------------------------------------
	*/

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

	/*
	|--------------------------------------------------------------------------
	| Add userId ONLY if available
	|--------------------------------------------------------------------------
	*/

	if (userId) {
		orderPayload.userId = userId;
	}

	/*
	|--------------------------------------------------------------------------
	| Save Order
	|--------------------------------------------------------------------------
	*/

	const order = await Order.create(orderPayload);

	/*
	|--------------------------------------------------------------------------
	| Response
	|--------------------------------------------------------------------------
	*/

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

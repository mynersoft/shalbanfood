import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { checkAuthRole } from '@/lib/checkAuthRole';
import { generateInvoiceID } from '@/utils/generateInvoiceId';
import { deductOrderStock } from '@/lib/deductOrderStock';

export const runtime = 'nodejs';

export async function POST(request) {
	let session;

	try {
		const { isAdmin } = await checkAuthRole();

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 403 }
			);
		}

		await connectDB();

		const body = await request.json();

		const {
			userId,
			customer,
			shippingAddress,
			orderItems,
			shippingFee = 0,
			discount = 0,
			adminDiscount = 0,
			adminDiscountNote = '',
			status = 'pending',
			paymentMethod = 'COD',
			paymentStatus = 'unpaid',
		} = body;

		// Customer validation
		if (!customer?.name?.trim() || !customer?.phone?.trim()) {
			return NextResponse.json(
				{
					success: false,
					message: 'Customer name and phone are required',
				},
				{ status: 400 }
			);
		}

		// Order items validation
		if (!Array.isArray(orderItems) || orderItems.length === 0) {
			return NextResponse.json(
				{ success: false, message: 'Add at least one product' },
				{ status: 400 }
			);
		}

		const validStatuses = [
			'pending',
			'confirmed',
			'processing',
			'shipped',
			'delivered',
			'cancelled',
			'return',
		];

		const validPaymentStatuses = ['unpaid', 'paid', 'failed'];

		if (!validStatuses.includes(status)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid order status' },
				{ status: 400 }
			);
		}

		if (!validPaymentStatuses.includes(paymentStatus)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid payment status' },
				{ status: 400 }
			);
		}

		const amounts = [shippingFee, discount, adminDiscount].map(Number);

		if (amounts.some((value) => !Number.isFinite(value) || value < 0)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid order amounts' },
				{ status: 400 }
			);
		}

		// Registered customer validation
		let validUserId;

		if (userId) {
			if (!mongoose.Types.ObjectId.isValid(userId)) {
				return NextResponse.json(
					{ success: false, message: 'Invalid customer ID' },
					{ status: 400 }
				);
			}

			const existingUser = await User.findOne({
				_id: userId,
				role: 'user',
			}).select('_id');

			if (!existingUser) {
				return NextResponse.json(
					{ success: false, message: 'Customer not found' },
					{ status: 404 }
				);
			}

			validUserId = existingUser._id;
		}

		// Normalize items
		const items = orderItems.map((item) => ({
			productId: String(item.productId || '').trim() || null,
			variantId: String(item.variantId || '').trim() || null,
			variantLabel: String(item.variantLabel || '').trim(),
			name: String(item.name || '').trim(),
			quantity: Number(item.quantity),
			price: Number(item.price),
			image: String(item.image || ''),
		}));

		const invalidItem = items.some((item) => {
			if (
				!item.name ||
				!Number.isInteger(item.quantity) ||
				item.quantity <= 0 ||
				!Number.isFinite(item.price) ||
				item.price < 0
			) {
				return true;
			}

			// Product item হলে variant বাধ্যতামূলক
			if (
				item.productId &&
				!mongoose.Types.ObjectId.isValid(item.productId)
			) {
				return true;
			}

			if (
				item.variantId &&
				!mongoose.Types.ObjectId.isValid(item.variantId)
			) {
				return true;
			}

			if (Boolean(item.productId) !== Boolean(item.variantId)) {
				return true;
			}

			return false;
		});

		if (invalidItem) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid product or variant information',
				},
				{ status: 400 }
			);
		}

		const subtotal = items.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0
		);

		const finalDiscount = Number(discount) + Number(adminDiscount);

		const total = subtotal + Number(shippingFee) - finalDiscount;

		if (total < 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Discount cannot exceed order amount',
				},
				{ status: 400 }
			);
		}

		// Invoice generation
		let invoiceNo = null;

		for (let i = 0; i < 5; i++) {
			const generatedInvoice = generateInvoiceID();

			const existingOrder = await Order.findOne({
				invoiceNo: generatedInvoice,
			}).select('_id');

			if (!existingOrder) {
				invoiceNo = generatedInvoice;
				break;
			}
		}

		if (!invoiceNo) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invoice generation failed',
				},
				{ status: 500 }
			);
		}

		const orderPayload = {
			invoiceNo,

			...(validUserId && { userId: validUserId }),

			customer: {
				name: customer.name.trim(),
				phone: customer.phone.trim(),
				email: customer.email?.trim() || '',
			},

			subtotal,
			total,
			shippingFee: Number(shippingFee),
			discount: Number(discount),
			adminDiscount: Number(adminDiscount),
			adminDiscountNote: String(adminDiscountNote || '').trim(),

			...(Number(adminDiscount) > 0 && {
				adminDiscountUpdatedAt: new Date(),
			}),

			status,

			payment: {
				method: paymentMethod,
				status: paymentStatus,
			},

			shippingAddress: {
				area: shippingAddress?.area || '',
				thana: shippingAddress?.thana || '',
				city: shippingAddress?.city || '',
				phone: shippingAddress?.phone || customer.phone,
			},

			orderItems: items,
		};

		// Stock deduction + order creation
		session = await mongoose.startSession();

		let order;

		await session.withTransaction(async () => {
			await deductOrderStock(items, session);

			const createdOrders = await Order.create([orderPayload], {
				session,
			});

			order = createdOrders[0];
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Custom order created successfully',
				order,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Custom order creation error:', error);

		const status =
			Number.isInteger(error.status) &&
			error.status >= 400 &&
			error.status < 600
				? error.status
				: 500;

		return NextResponse.json(
			{
				success: false,
				message:
					status !== 500
						? error.message
						: 'Failed to create custom order',
			},
			{ status }
		);
	} finally {
		if (session) {
			await session.endSession();
		}
	}
}

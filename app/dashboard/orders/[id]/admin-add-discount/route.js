import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';
import { connectDB } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
	try {
		const { isAdmin } = await checkAuthRole();

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, message: 'Admin access required.' },
				{ status: 403 }
			);
		}

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid order ID.' },
				{ status: 400 }
			);
		}

		let body;

		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ success: false, message: 'Invalid JSON body.' },
				{ status: 400 }
			);
		}

		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid request body.' },
				{ status: 400 }
			);
		}

		const { adminDiscount, adminDiscountNote = '' } = body;

		if (
			adminDiscount === '' ||
			adminDiscount === null ||
			adminDiscount === undefined ||
			typeof adminDiscount === 'boolean' ||
			(typeof adminDiscount !== 'number' &&
				typeof adminDiscount !== 'string')
		) {
			return NextResponse.json(
				{ success: false, message: 'Enter a valid discount amount.' },
				{ status: 400 }
			);
		}

		const amount = Number(adminDiscount);

		if (
			!Number.isFinite(amount) ||
			amount < 0 ||
			!Number.isSafeInteger(Math.round(amount * 100)) ||
			Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001
		) {
			return NextResponse.json(
				{ success: false, message: 'Invalid discount amount.' },
				{ status: 400 }
			);
		}

		if (
			typeof adminDiscountNote !== 'string' ||
			adminDiscountNote.length > 300
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'Note must be within 300 characters.',
				},
				{ status: 400 }
			);
		}

		await connectDB();

		const order = await Order.findById(id);

		if (!order) {
			return NextResponse.json(
				{ success: false, message: 'Order not found.' },
				{ status: 404 }
			);
		}

		if (order.payment?.status === 'paid') {
			return NextResponse.json(
				{
					success: false,
					message: 'Paid order cannot be modified directly.',
				},
				{ status: 400 }
			);
		}

		if (['cancelled', 'return'].includes(order.status)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Cannot modify cancelled or returned orders.',
				},
				{ status: 400 }
			);
		}

		const subtotal = Number(order.subtotal);
		const discount = Number(order.discount || 0);
		const shippingFee = Number(order.shippingFee || 0);

		if (
			!Number.isFinite(subtotal) ||
			!Number.isFinite(discount) ||
			!Number.isFinite(shippingFee) ||
			subtotal < 0 ||
			discount < 0 ||
			shippingFee < 0
		) {
			return NextResponse.json(
				{ success: false, message: 'Invalid order totals.' },
				{ status: 400 }
			);
		}

		const maxDiscount = Math.max(0, subtotal - discount + shippingFee);

		if (amount > maxDiscount) {
			return NextResponse.json(
				{
					success: false,
					message: `Maximum discount is ৳${maxDiscount.toFixed(2)}.`,
				},
				{ status: 400 }
			);
		}

		const finalTotal =
			Math.round((subtotal - discount + shippingFee - amount) * 100) /
			100;

		order.adminDiscount = amount;
		order.adminDiscountNote = adminDiscountNote.trim();
		order.adminDiscountUpdatedAt = new Date();
		order.total = finalTotal;

		await order.save();

		return NextResponse.json({
			success: true,
			message: 'Discount updated successfully.',
			order: {
				_id: order._id,
				invoiceNo: order.invoiceNo,
				subtotal: order.subtotal,
				discount: order.discount,
				adminDiscount: order.adminDiscount,
				adminDiscountNote: order.adminDiscountNote,
				adminDiscountUpdatedAt: order.adminDiscountUpdatedAt,
				shippingFee: order.shippingFee,
				total: order.total,
				status: order.status,
				payment: order.payment,
			},
		});
	} catch (error) {
		console.error('ADMIN DISCOUNT ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to update order discount.',
			},
			{ status: 500 }
		);
	}
}

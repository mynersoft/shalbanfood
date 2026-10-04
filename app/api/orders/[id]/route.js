import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';

export const runtime = 'nodejs';

const ORDER_STATUSES = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
];

const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'];

export async function PATCH(req, { params }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 }
			);
		}

		if (session.user.role !== 'admin') {
			return NextResponse.json(
				{ success: false, message: 'Admin access required' },
				{ status: 403 }
			);
		}

		const { id } = await params;

		if (!mongoose.isValidObjectId(id)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid order ID' },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const update = {};

		if (body.status !== undefined) {
			const status = String(body.status).toLowerCase();

			if (!ORDER_STATUSES.includes(status)) {
				return NextResponse.json(
					{ success: false, message: 'Invalid order status' },
					{ status: 400 }
				);
			}

			update.status = status;
		}

		if (body.paymentStatus !== undefined) {
			const paymentStatus = String(body.paymentStatus).toLowerCase();

			if (!PAYMENT_STATUSES.includes(paymentStatus)) {
				return NextResponse.json(
					{ success: false, message: 'Invalid payment status' },
					{ status: 400 }
				);
			}

			update.paymentStatus = paymentStatus;
		}

		if (body.trackingNumber !== undefined) {
			update.trackingNumber = String(body.trackingNumber).trim();
		}

		if (body.adminNote !== undefined) {
			update.adminNote = String(body.adminNote).trim();
		}

		if (Object.keys(update).length === 0) {
			return NextResponse.json(
				{ success: false, message: 'No fields to update' },
				{ status: 400 }
			);
		}

		await connectDB();

		const order = await Order.findByIdAndUpdate(
			id,
			{ $set: update },
			{ new: true, runValidators: true }
		).lean();

		if (!order) {
			return NextResponse.json(
				{ success: false, message: 'Order not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Order updated successfully',
			order,
		});
	} catch (error) {
		console.error('ORDER PATCH ERROR:', error);

		return NextResponse.json(
			{ success: false, message: 'Failed to update order' },
			{ status: 500 }
		);
	}
}

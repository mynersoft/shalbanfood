import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';

// ==========================================
// ALLOWED STATUSES
// ==========================================

const ORDER_STATUSES = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
];

// ==========================================
// PATCH /api/orders/:id
// ==========================================

export async function PATCH(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid order ID',
				},
				{
					status: 400,
				}
			);
		}

		const body = await request.json();

		const { status, paymentStatus, trackingNumber, adminNote } = body;

		// ======================================
		// BUILD UPDATE OBJECT
		// ======================================

		const update = {};

		// STATUS

		if (status !== undefined) {
			const normalizedStatus = String(status).toLowerCase().trim();

			if (!ORDER_STATUSES.includes(normalizedStatus)) {
				return NextResponse.json(
					{
						success: false,
						message: 'Invalid order status',
						allowedStatuses: ORDER_STATUSES,
					},
					{
						status: 400,
					}
				);
			}

			update.status = normalizedStatus;
		}

		// PAYMENT STATUS

		if (paymentStatus !== undefined) {
			update.paymentStatus = paymentStatus;
		}

		// TRACKING NUMBER

		if (trackingNumber !== undefined) {
			update.trackingNumber = String(trackingNumber).trim();
		}

		// ADMIN NOTE

		if (adminNote !== undefined) {
			update.adminNote = String(adminNote).trim();
		}

		// ======================================
		// NOTHING TO UPDATE
		// ======================================

		if (Object.keys(update).length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'No valid update fields provided',
				},
				{
					status: 400,
				}
			);
		}

		// ======================================
		// UPDATE
		// ======================================

		const order = await Order.findByIdAndUpdate(
			id,
			{
				$set: update,
			},
			{
				new: true,
				runValidators: true,
			}
		);

		if (!order) {
			return NextResponse.json(
				{
					success: false,
					message: 'Order not found',
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Order updated successfully',
			order,
		});
	} catch (error) {
		console.error('UPDATE ORDER ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Failed to update order',
			},
			{
				status: 500,
			}
		);
	}
}

// ==========================================
// DELETE /api/orders/:id
// ==========================================

export async function DELETE(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid order ID',
				},
				{
					status: 400,
				}
			);
		}

		const order = await Order.findByIdAndDelete(id);

		if (!order) {
			return NextResponse.json(
				{
					success: false,
					message: 'Order not found',
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Order deleted successfully',
			orderId: id,
		});
	} catch (error) {
		console.error('DELETE ORDER ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Failed to delete order',
			},
			{
				status: 500,
			}
		);
	}
}

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';
import { createAndSendNotification } from '@/lib/notifications/createAndSend';

export const runtime = 'nodejs';

const ORDER_STATUSES = [
	'pending',
	'confirmed',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
	'return',
];

const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed'];

const STATUS_MESSAGES = {
	pending: {
		title: 'Order Received',
		message: 'Your order is currently pending.',
	},
	confirmed: {
		title: 'Order Confirmed',
		message: 'Your order has been confirmed successfully.',
	},
	processing: {
		title: 'Order Processing',
		message: 'Your order is being prepared.',
	},
	shipped: {
		title: 'Order Shipped',
		message: 'Your order has been handed over to the courier.',
	},
	delivered: {
		title: 'Order Delivered',
		message: 'Your order has been delivered successfully.',
	},
	cancelled: {
		title: 'Order Cancelled',
		message: 'Your order has been cancelled.',
	},
	return: {
		title: 'Order Returned',
		message: 'Your order has been returned.',
	},
};

function jsonError(message, status = 400) {
	return NextResponse.json({ success: false, message }, { status });
}

async function authorizeAdmin() {
	const auth = await checkAuthRole();

	if (!auth?.authenticated) {
		return jsonError('Please log in to continue.', 401);
	}

	// This assumes checkAuthRole() returns isAdmin: true for admins.
	if (auth.isAdmin !== true) {
		return jsonError('You are not authorized to perform this action.', 403);
	}

	return null;
}

async function getOrderId(params) {
	const { id } = await params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return { error: jsonError('Invalid order ID.', 400) };
	}

	return { id };
}

// PATCH /api/orders/:id
export async function PATCH(request, { params }) {
	const authError = await authorizeAdmin();
	if (authError) return authError;

	try {
		const result = await getOrderId(params);
		if (result.error) return result.error;

		let body;

		try {
			body = await request.json();
		} catch {
			return jsonError('Invalid JSON request body.', 400);
		}

		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return jsonError('Invalid request body.', 400);
		}

		const { status, paymentStatus, trackingNumber, adminNote } = body;
		const update = {};

		if (status !== undefined) {
			if (
				typeof status !== 'string' ||
				!ORDER_STATUSES.includes(status.trim().toLowerCase())
			) {
				return NextResponse.json(
					{
						success: false,
						message: 'Invalid order status.',
						allowedStatuses: ORDER_STATUSES,
					},
					{ status: 400 }
				);
			}

			update.status = status.trim().toLowerCase();
		}

		if (paymentStatus !== undefined) {
			if (
				typeof paymentStatus !== 'string' ||
				!PAYMENT_STATUSES.includes(paymentStatus.trim().toLowerCase())
			) {
				return NextResponse.json(
					{
						success: false,
						message: 'Invalid payment status.',
						allowedStatuses: PAYMENT_STATUSES,
					},
					{ status: 400 }
				);
			}

			update['payment.status'] = paymentStatus.trim().toLowerCase();
		}

		if (trackingNumber !== undefined) {
			if (
				typeof trackingNumber !== 'string' ||
				trackingNumber.trim().length > 100
			) {
				return jsonError('Invalid tracking number.', 400);
			}

			update.trackingNumber = trackingNumber.trim();
		}

		if (adminNote !== undefined) {
			if (typeof adminNote !== 'string' || adminNote.length > 2000) {
				return jsonError('Invalid admin note.', 400);
			}

			update.adminNote = adminNote.trim();
		}

		if (Object.keys(update).length === 0) {
			return jsonError('No valid update fields provided.', 400);
		}

		await connectDB();

		const order = await Order.findById(result.id);

		if (!order) {
			return jsonError('Order not found.', 404);
		}

		const previousStatus = order.status;
		const previousPaymentStatus = order.payment?.status;

		if (update.status !== undefined) {
			order.status = update.status;
		}

		if (update['payment.status'] !== undefined) {
			order.payment.status = update['payment.status'];
		}

		if (update.trackingNumber !== undefined) {
			order.trackingNumber = update.trackingNumber;
		}

		if (update.adminNote !== undefined) {
			order.adminNote = update.adminNote;
		}

		await order.save();

		const statusChanged = previousStatus !== order.status;
		const paymentStatusChanged =
			previousPaymentStatus !== order.payment?.status;

		// Notify the customer only when the order status changes.
		if (statusChanged && order.userId) {
			const statusInfo = STATUS_MESSAGES[order.status];
			const invoiceRef = order.invoiceNo || 'Your order';

			try {
				await createAndSendNotification({
					userId: order.userId,
					title: statusInfo.title,
					message: `${invoiceRef} — ${statusInfo.message}`,
					type: 'order',
					link: order.invoiceNo
						? `/user/tracking-order?invoiceNo=${encodeURIComponent(order.invoiceNo)}`
						: '/user/tracking-order',
					eventKey: `order:${order._id}:${order.status}`,
				});
			} catch (notificationError) {
				console.error('ORDER NOTIFICATION ERROR:', notificationError);
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Order updated successfully.',
			order,
			changes: {
				statusChanged,
				paymentStatusChanged,
			},
		});
	} catch (error) {
		console.error('UPDATE ORDER ERROR:', error);

		if (error?.name === 'ValidationError') {
			return jsonError('Order validation failed.', 400);
		}

		return jsonError('Failed to update order.', 500);
	}
}

// DELETE /api/orders/:id
export async function DELETE(request, { params }) {
	const authError = await authorizeAdmin();
	if (authError) return authError;

	try {
		const result = await getOrderId(params);
		if (result.error) return result.error;

		await connectDB();

		const order = await Order.findByIdAndDelete(result.id);

		if (!order) {
			return jsonError('Order not found.', 404);
		}

		return NextResponse.json({
			success: true,
			message: 'Order deleted successfully.',
			orderId: result.id,
		});
	} catch (error) {
		console.error('DELETE ORDER ERROR:', error);
		return jsonError('Failed to delete order.', 500);
	}
}

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/connectDB';
import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';
import { createAndSendNotification } from '@/lib/notifications/createAndSend';
import { withErrorHandler } from '@/lib/withErrorHandler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Product from '@/models/Product';
import { ApiError } from '@/lib/ApiError';
import ComboOffer from '@/models/ComboOffer';

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

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'failed'];

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

function getPaymentInfo(order) {
	const total = Number(order.total || 0);
	const paidAmount = Number(order.payment?.paidAmount || 0);

	return {
		total,
		paidAmount,
		dueAmount: Math.max(0, total - paidAmount),
		status: order.payment?.status || 'unpaid',
	};
}

async function authorizeAdmin() {
	const auth = await checkAuthRole();

	if (!auth?.authenticated) {
		return jsonError('Please log in to continue.', 401);
	}

	if (auth.isAdmin !== true) {
		return jsonError('You are not authorized to perform this action.', 403);
	}

	return null;
}

async function getOrderId(params) {
	const { id } = await params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return {
			error: jsonError('Invalid order ID.', 400),
		};
	}

	return { id };
}


const ALLOWED_STATUSES = [
	'pending',
	'confirmed',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
	'return',
];

const TERMINAL_RESTORE_STATUSES = ['cancelled', 'return'];

// -----------------------------------------
// 1. Aggregate duplicate order items
// -----------------------------------------
function aggregateOrderItems(orderItems = []) {
	const products = new Map();
	const combos = new Map();

	for (const item of orderItems) {
		const type = item.type === 'combo' ? 'combo' : 'product';
		const quantity = Number(item.quantity);

		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new ApiError('Invalid order item quantity', 400);
		}

		if (type === 'combo') {
			const comboId = String(item.comboOfferId || item.productId || '');

			if (!mongoose.Types.ObjectId.isValid(comboId)) {
				throw new ApiError('Invalid combo information', 400);
			}

			const existing = combos.get(comboId);

			if (existing) {
				existing.quantity += quantity;
			} else {
				combos.set(comboId, {
					comboOfferId: comboId,
					name: item.name,
					quantity,
				});
			}

			continue;
		}

		const productId = String(item.productId || '');
		const variantId = String(item.variantId || '');

		if (
			!mongoose.Types.ObjectId.isValid(productId) ||
			!mongoose.Types.ObjectId.isValid(variantId)
		) {
			throw new ApiError(
				`Invalid product or variant information: ${item.name}`,
				400
			);
		}

		const key = `${productId}_${variantId}`;

		const existing = products.get(key);

		if (existing) {
			existing.quantity += quantity;
		} else {
			products.set(key, {
				productId,
				variantId,
				name: item.name,
				quantity,
			});
		}
	}

	return {
		products: [...products.values()],
		combos: [...combos.values()],
	};
}

// -----------------------------------------
// 2. Update one product variant
// -----------------------------------------
async function updateProductInventory(item, action) {
	const { productId, variantId, quantity } = item;

	const variantObjectId = new mongoose.Types.ObjectId(variantId);

	const isDeduct = action === 'deduct';

	const filter = {
		_id: productId,
	};

	if (isDeduct) {
		filter.variants = {
			$elemMatch: {
				_id: variantObjectId,
				stock: { $gte: quantity },
			},
		};
	} else {
		filter['variants._id'] = variantObjectId;
	}

	const updated = await Product.updateOne(
		filter,
		{
			$inc: {
				'variants.$[variant].stock': isDeduct ? -quantity : quantity,

				'variants.$[variant].soldCount': isDeduct
					? quantity
					: -quantity,
			},
		},
		{
			arrayFilters: [
				{
					'variant._id': variantObjectId,
				},
			],
		}
	);

	if (!updated.matchedCount) {
		if (isDeduct) {
			throw new ApiError(
				`Insufficient stock or variant not found: ${item.name}`,
				400
			);
		}

		throw new ApiError(
			`Product variant not found during stock restoration: ${item.name}`,
			404
		);
	}
}

// -----------------------------------------
// 3. Update one combo offer
// -----------------------------------------
async function updateComboInventory(item, action) {
	const { comboOfferId, quantity } = item;

	const isDeduct = action === 'deduct';

	const updated = await ComboOffer.updateOne(
		{
			_id: comboOfferId,

			...(isDeduct ? { stock: { $gte: quantity } } : {}),
		},
		{
			$inc: {
				stock: isDeduct ? -quantity : quantity,
				soldCount: isDeduct ? quantity : -quantity,
			},
		}
	);

	if (!updated.matchedCount) {
		if (isDeduct) {
			throw new ApiError(`Insufficient combo stock: ${item.name}`, 400);
		}

		throw new ApiError(
			`Combo offer not found during stock restoration: ${item.name}`,
			404
		);
	}
}

// -----------------------------------------
// 4. Deduct or restore complete inventory
//    Automatically rollback on failure
// -----------------------------------------
async function updateOrderInventory(orderItems, action) {
	const { products, combos } = aggregateOrderItems(orderItems);

	const completed = [];

	try {
		// Update product variants
		for (const item of products) {
			await updateProductInventory(item, action);

			completed.push({
				type: 'product',
				item,
			});
		}

		// Update combo offers
		for (const item of combos) {
			await updateComboInventory(item, action);

			completed.push({
				type: 'combo',
				item,
			});
		}
	} catch (error) {
		console.error('Inventory update failed:', error);

		// Reverse completed updates
		const rollbackAction = action === 'deduct' ? 'restore' : 'deduct';

		for (const completedItem of completed.reverse()) {
			try {
				if (completedItem.type === 'product') {
					await updateProductInventory(
						completedItem.item,
						rollbackAction
					);
				} else {
					await updateComboInventory(
						completedItem.item,
						rollbackAction
					);
				}
			} catch (rollbackError) {
				console.error('Inventory rollback failed:', rollbackError);
			}
		}

		throw error;
	}
}

// -----------------------------------------
// 5. PATCH: Update order status
// -----------------------------------------

export const PATCH = withErrorHandler(async (req, { params }) => {
	// -----------------------------------------
	// 1. Admin authentication
	// -----------------------------------------

	const session = await getServerSession(authOptions);

	if (!session?.user) {
		throw new ApiError('Unauthorized', 401);
	}

	if (session.user.role !== 'admin') {
		throw new ApiError('Admin access required', 403);
	}

	// -----------------------------------------
	// 2. Validate order ID
	// -----------------------------------------

	const { id } = await params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError('Invalid order ID', 400);
	}

	// -----------------------------------------
	// 3. Parse request body
	// -----------------------------------------

	let body;

	try {
		body = await req.json();
	} catch {
		throw new ApiError('Invalid JSON body', 400);
	}

	const { status, payment } = body;

	await connectDB();

	// -----------------------------------------
	// 4. Find order
	// -----------------------------------------

	const order = await Order.findById(id);

	if (!order) {
		throw new ApiError('Order not found', 404);
	}

	const previousStatus = order.status;

	// -----------------------------------------
	// 5. Validate status
	// -----------------------------------------

	const allowedStatuses = [
		'pending',
		'confirmed',
		'processing',
		'shipped',
		'delivered',
		'cancelled',
		'return',
	];

	if (status !== undefined && !allowedStatuses.includes(status)) {
		throw new ApiError('Invalid order status', 400);
	}

	const hasStatusChange = status !== undefined && previousStatus !== status;

	// -----------------------------------------
	// 6. Validate payment
	// -----------------------------------------

	const updatePayment = {};

	if (payment !== undefined) {
		if (!payment || typeof payment !== 'object' || Array.isArray(payment)) {
			throw new ApiError('Invalid payment information', 400);
		}

		const allowedPaymentStatuses = ['unpaid', 'partial', 'paid', 'failed'];

		if (payment.status !== undefined) {
			if (!allowedPaymentStatuses.includes(payment.status)) {
				throw new ApiError('Invalid payment status', 400);
			}

			updatePayment['payment.status'] = payment.status;
		}

		if (payment.paidAmount !== undefined) {
			const paidAmount = Number(payment.paidAmount);

			if (
				!Number.isFinite(paidAmount) ||
				paidAmount < 0 ||
				paidAmount > order.total
			) {
				throw new ApiError('Invalid paid amount', 400);
			}

			updatePayment['payment.paidAmount'] = paidAmount;
		}

		if (payment.transactionId !== undefined) {
			if (typeof payment.transactionId !== 'string') {
				throw new ApiError('Invalid transaction ID', 400);
			}

			updatePayment['payment.transactionId'] =
				payment.transactionId.trim();
		}
	}

	const hasPaymentChange = Object.keys(updatePayment).length > 0;

	// -----------------------------------------
	// 7. Check if anything needs updating
	// -----------------------------------------

	if (!hasStatusChange && !hasPaymentChange) {
		return NextResponse.json({
			success: true,
			message: 'No changes to update',
			order,
		});
	}

	// -----------------------------------------
	// 8. Inventory operation decision
	// -----------------------------------------

	let inventoryAction = null;

	// Inventory changes ONLY when order status changes

	if (hasStatusChange && status === 'delivered' && !order.stockDeducted) {
		// First time delivered:
		// Deduct stock and increase soldCount

		inventoryAction = 'deduct';
	}

	if (
		hasStatusChange &&
		TERMINAL_RESTORE_STATUSES.includes(status) &&
		order.stockDeducted
	) {
		// Cancelled or returned:
		// Restore stock and decrease soldCount

		inventoryAction = 'restore';
	}

	// -----------------------------------------
	// 9. Atomically claim inventory operation
	// -----------------------------------------

	let inventoryClaimed = false;

	if (inventoryAction === 'deduct') {
		const claimedOrder = await Order.findOneAndUpdate(
			{
				_id: id,
				stockDeducted: false,
			},
			{
				$set: {
					stockDeducted: true,
				},
			},
			{
				new: true,
			}
		);

		if (!claimedOrder) {
			throw new ApiError(
				'Inventory is already being updated. Please retry.',
				409
			);
		}

		inventoryClaimed = true;
	}

	if (inventoryAction === 'restore') {
		const claimedOrder = await Order.findOneAndUpdate(
			{
				_id: id,
				stockDeducted: true,
			},
			{
				$set: {
					stockDeducted: false,
				},
			},
			{
				new: true,
			}
		);

		if (!claimedOrder) {
			throw new ApiError(
				'Inventory is already being updated. Please retry.',
				409
			);
		}

		inventoryClaimed = true;
	}

	// -----------------------------------------
	// 10. Perform inventory update
	// -----------------------------------------

	try {
		if (inventoryAction) {
			await updateOrderInventory(order.orderItems, inventoryAction);
		}
	} catch (error) {
		// Reset inventory flag if operation fails

		if (inventoryClaimed) {
			try {
				await Order.updateOne(
					{ _id: id },
					{
						$set: {
							stockDeducted: inventoryAction === 'restore',
						},
					}
				);
			} catch (rollbackError) {
				console.error(
					'Order inventory flag rollback failed:',
					rollbackError
				);
			}
		}

		throw error;
	}

	// -----------------------------------------
	// 11. Update order status and payment
	// -----------------------------------------

	const updateData = {
		...updatePayment,
	};

	if (hasStatusChange) {
		updateData.status = status;
	}

	const updatedOrder = await Order.findByIdAndUpdate(
		id,
		{
			$set: updateData,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	if (!updatedOrder) {
		throw new ApiError('Order update failed', 500);
	}

	// -----------------------------------------
	// 12. Success response
	// -----------------------------------------

	let message = 'Order updated successfully';

	if (inventoryAction === 'deduct') {
		message =
			'Order delivered. Product and combo stock deducted successfully.';
	} else if (inventoryAction === 'restore') {
		message = 'Order cancelled/returned. Stock restored successfully.';
	} else if (hasPaymentChange && !hasStatusChange) {
		message = 'Payment information updated successfully';
	} else if (hasPaymentChange && hasStatusChange) {
		message = 'Order status and payment updated successfully';
	} else if (hasStatusChange) {
		message = 'Order status updated successfully';
	}

	console.log(updatedOrder, '====================================');

	// -----------------------------------------
	// Send notification after successful update
	// -----------------------------------------

	if (hasStatusChange && updatedOrder.userId) {
		const statusInfo = STATUS_MESSAGES[updatedOrder.status];

		if (statusInfo) {
			try {
				await createAndSendNotification({
					userId: updatedOrder.userId,
					orderId: updatedOrder._id,
					title: statusInfo.title,
					message: `${updatedOrder.invoiceNo || 'Your order'} — ${statusInfo.message}`,
					type: 'order',
					link: updatedOrder.invoiceNo
						? `/tracking-order?invoiceNo=${encodeURIComponent(
								updatedOrder.invoiceNo
							)}`
						: '/tracking-order',
					eventKey: `order:${updatedOrder._id}:${updatedOrder.status}`,
				});
			} catch (notificationError) {
				console.error('ORDER NOTIFICATION ERROR:', notificationError);
			}
		}
	}

	// -----------------------------------------
	// Send payment notification
	// -----------------------------------------

	if (hasPaymentChange && updatedOrder.userId) {
		try {
			await createAndSendNotification({
				userId: updatedOrder.userId,
				orderId: updatedOrder._id,
				title: 'Payment Updated',
				message: `${updatedOrder.invoiceNo || 'Your order'} — Payment status: ${updatedOrder.payment.status}.
				Amount: ${updatedOrder.payment.paidAmount || 0}`,
				type: 'payment',
				link: '#',
				eventKey: `payment:${updatedOrder._id}:${updatedOrder.payment.status}:${updatedOrder.payment.paidAmount}`,
			});
		} catch (notificationError) {
			console.error('PAYMENT NOTIFICATION ERROR:', notificationError);
		}
	}

	return NextResponse.json(
		{
			success: true,
			message,
			order: updatedOrder,
			inventory: {
				updated: Boolean(inventoryAction),
				action: inventoryAction,
			},
		},
		{ status: 200 }
	);
});

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

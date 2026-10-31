import mongoose from 'mongoose';
import Product from '@/models/Product';
import { ApiError } from '@/lib/ApiError';

// Duplicate product variants একত্র করা
function groupOrderItems(orderItems) {
	const grouped = new Map();

	for (const item of orderItems) {
		const key = `${item.productId}_${item.variantId}`;

		if (grouped.has(key)) {
			grouped.get(key).quantity += Number(item.quantity);
		} else {
			grouped.set(key, {
				productId: String(item.productId),
				variantId: String(item.variantId),
				quantity: Number(item.quantity),
			});
		}
	}

	return [...grouped.values()];
}

// Rollback previously deducted stock
export async function rollbackOrderStock(deductedItems) {
	const errors = [];

	// Reverse order of deduction
	for (const item of [...deductedItems].reverse()) {
		try {
			await Product.updateOne(
				{
					_id: item.productId,
					'variants._id': item.variantId,
				},
				{
					$inc: {
						'variants.$.stock': item.quantity,
						'variants.$.soldCount': -item.quantity,
					},
				}
			);
		} catch (error) {
			errors.push(error);
			console.error(
				'Stock rollback failed:',
				item.productId,
				item.variantId,
				error
			);
		}
	}

	if (errors.length) {
		throw new Error(`${errors.length} stock rollback operation(s) failed`);
	}
}

// Atomic stock deduction without transaction
export async function deductOrderStock(orderItems) {
	const items = groupOrderItems(orderItems);
	const deductedItems = [];

	try {
		for (const item of items) {
			if (
				!mongoose.Types.ObjectId.isValid(item.productId) ||
				!mongoose.Types.ObjectId.isValid(item.variantId) ||
				!Number.isInteger(item.quantity) ||
				item.quantity <= 0
			) {
				throw new ApiError('Invalid order stock information', 400);
			}

			const updatedProduct = await Product.findOneAndUpdate(
				{
					_id: item.productId,
					isActive: true,
					variants: {
						$elemMatch: {
							_id: new mongoose.Types.ObjectId(item.variantId),
							stock: { $gte: item.quantity },
						},
					},
				},
				{
					$inc: {
						'variants.$.stock': -item.quantity,
						'variants.$.soldCount': item.quantity,
					},
				},
				{
					new: true,
				}
			);

			if (!updatedProduct) {
				throw new ApiError(
					'Insufficient stock or product unavailable',
					409
				);
			}

			// Track successful deduction
			deductedItems.push(item);
		}

		return deductedItems;
	} catch (error) {
		try {
			await rollbackOrderStock(deductedItems);
		} catch (rollbackError) {
			console.error('Stock recovery error:', rollbackError);
		}

		throw error;
	}
}

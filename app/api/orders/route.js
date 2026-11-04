import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { withErrorHandler } from '@/lib/withErrorHandler';
import { ApiError } from '@/lib/ApiError';
import { validateVoucher } from '@/lib/validateVoucher';
import PushSubscription from '@/models/PushSubscription';
import { generateInvoiceID } from '@/utils/generateInvoiceId';
import ShippingCost from '@/models/ShippingCost';

import { deductOrderStock, rollbackOrderStock } from '@/lib/deductOrderStock';
import ComboOffer from '@/models/ComboOffer';

export const runtime = 'nodejs';

// ============================================
// GET ORDER BY ID
// ============================================

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

		const order = await Order.findById(orderId).lean();

		if (!order) {
			return NextResponse.json(
				{
					success: false,
					message: 'Order not found',
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			orders: order,
		});
	} catch (error) {
		console.error('Get order error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Internal Server Error',
			},
			{ status: 500 }
		);
	}
}

// ============================================
// CREATE CUSTOMER ORDER
// ============================================

export const POST = withErrorHandler(async (req) => {
	let body;

	try {
		body = await req.json();
	} catch {
		throw new ApiError('Invalid JSON body', 400);
	}

	const { userId, customer, shippingAddress, orderItems, voucherCode } = body;

	// 1. Customer validation
	if (!customer?.name?.trim() || !customer?.phone?.trim()) {
		throw new ApiError('Name and phone are required', 400);
	}

	// 2. Shipping validation
	if (
		!shippingAddress?.area ||
		!shippingAddress?.city ||
		!shippingAddress?.thana
	) {
		throw new ApiError('Complete shipping address is required', 400);
	}

	// 3. Cart validation
	if (!Array.isArray(orderItems) || orderItems.length === 0) {
		throw new ApiError('Order items are required', 400);
	}

	if (orderItems.length > 50) {
		throw new ApiError('Too many order items', 400);
	}

	await connectDB();

	const formattedOrderItems = [];
	const formattedProductItems = [];
	const formattedComboItems = [];

	// 4. Validate Product and Combo Offer separately
	for (const item of orderItems) {
		const type = item.type === 'combo' ? 'combo' : 'product';

		const productId = String(item.productId || item._id || '').trim();

		const quantity = Number(item.quantity);

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			throw new ApiError('Invalid product information', 400);
		}

		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new ApiError('Invalid product quantity', 400);
		}
		

		// --------------------------------
		// COMBO OFFER
		// --------------------------------
		if (type === 'combo') {
			const comboOffer = await ComboOffer.findOne({
				_id: productId,
				isActive: true,
			}).lean();

			if (!comboOffer) {
				throw new ApiError('Combo offer not found or unavailable', 404);
			}

			const stock = Number(comboOffer.stock);
			const price = Number(comboOffer.offerPrice);

			if (!Number.isFinite(stock) || stock < quantity) {
				throw new ApiError(
					`Insufficient stock for ${comboOffer.name}`,
					400
				);
			}

			if (!Number.isFinite(price) || price <= 0) {
				throw new ApiError(`Invalid price for ${comboOffer.name}`, 400);
			}

			const formattedItem = {
				type: 'combo',
				productId: String(comboOffer._id),
				comboOfferId: String(comboOffer._id),
				comboItems: (comboOffer.items || []).map((comboItem) => ({
					name: comboItem.name || '',
					quantity: String(comboItem.quantity || ''),
				})),
				variantId: null,
				variantLabel: '',
				name: comboOffer.name,
				quantity,
				price,
				image: comboOffer.featureImg || '',
			};

			formattedOrderItems.push(formattedItem);
			formattedComboItems.push(formattedItem);

			continue;
		}

		// --------------------------------
		// NORMAL PRODUCT
		// --------------------------------
		const variantId = String(item.variantId || '').trim();

		if (!mongoose.Types.ObjectId.isValid(variantId)) {
			throw new ApiError('Product variant information is required', 400);
		}

		const product = await Product.findOne({
			_id: productId,
			isActive: true,
		}).lean();

		if (!product) {
			throw new ApiError('Product not found or unavailable', 404);
		}

		const variant = product.variants?.find(
			(v) => String(v._id) === variantId
		);

		if (!variant) {
			throw new ApiError(
				`Selected variant not found for ${product.name}`,
				404
			);
		}

		const price = Number(variant.sellPrice);

		if (!Number.isFinite(price) || price <= 0) {
			throw new ApiError(`Invalid price for ${product.name}`, 400);
		}

		const formattedItem = {
			type: 'product',
			productId: String(product._id),
			variantId: String(variant._id),
			variantLabel: `${variant.value} ${variant.unit}`,
			name: product.name,
			quantity,
			price,
			image: product.image || '',
		};

		formattedOrderItems.push(formattedItem);
		formattedProductItems.push(formattedItem);
	}

	// 5. Calculate subtotal using database prices
	const subtotal = formattedOrderItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	// 6. Voucher validation
	let discountAmount = 0;

	if (voucherCode) {
		try {
			const voucherResponse = await validateVoucher({
				voucherCode,
				cartItems: formattedOrderItems,
				subtotal,
			});

			const checkedVoucher = await voucherResponse.json();

			if (checkedVoucher?.valid && checkedVoucher?.discount) {
				discountAmount = Number(checkedVoucher.discount) || 0;
			}
		} catch (error) {
			console.error('Voucher validation error:', error);
			discountAmount = 0;
		}
	}

	discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

	// 7. Shipping calculation
	const shippingCost = await ShippingCost.findOne({}).lean();

	const district = String(
		shippingAddress.district || shippingAddress.city || ''
	)
		.trim()
		.toLowerCase();

	const districtRate = shippingCost?.districtRates?.find(
		(rate) =>
			String(rate.district || '')
				.trim()
				.toLowerCase() === district
	);

	let shippingFee =
		Number(districtRate?.charge ?? shippingCost?.defaultCharge) || 0;

	if (
		shippingCost?.freeDeliveryEnabled &&
		subtotal >= (Number(shippingCost.freeDeliveryMinimum) || 0)
	) {
		shippingFee = 0;
	}

	const total = Math.max(0, subtotal - discountAmount + shippingFee);

	// 8. Generate invoice
	let invoiceNo = null;

	for (let i = 0; i < 5; i++) {
		const generatedInvoice = generateInvoiceID();

		const existingOrder = await Order.findOne({
			invoiceNo: generatedInvoice,
		}).lean();

		if (!existingOrder) {
			invoiceNo = generatedInvoice;
			break;
		}
	}

	if (!invoiceNo) {
		throw new ApiError('Invoice generation failed', 500);
	}

	// 9. Push notification device
	const requestedFid = typeof body.pushFid === 'string' ? body.pushFid : null;

	const matchingDevice =
		requestedFid && userId
			? await PushSubscription.findOne({
					userId,
					fid: requestedFid,
					enabled: true,
				}).select('fid')
			: null;

	// 10. Prepare order payload
	const orderPayload = {
		invoiceNo,
		pushFid: matchingDevice?.fid || null,

		customer: {
			name: customer.name.trim(),
			email: customer.email?.trim() || '',
			phone: customer.phone.trim(),
		},

		subtotal,
		total,
		shippingFee,
		status: 'pending',
		discount: discountAmount,

		payment: {
			method: 'COD',
			status: 'unpaid',
			transactionId: null,
		},

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

	// 11. Deduct stock and create order
	let deductedProductItems = [];
	const deductedComboItems = [];
	let order;

	try {
		// Deduct normal product stock only
		if (formattedProductItems.length > 0) {
			deductedProductItems = await deductOrderStock(
				formattedProductItems
			);
		}

		// Deduct combo stock atomically
		for (const item of formattedComboItems) {
			const updatedCombo = await ComboOffer.findOneAndUpdate(
				{
					_id: item.comboOfferId,
					isActive: true,
					stock: { $gte: item.quantity },
				},
				{
					$inc: { stock: -item.quantity },
				},
				{ new: true }
			);

			if (!updatedCombo) {
				throw new ApiError(
					`Insufficient combo stock for ${item.name}`,
					400
				);
			}

			deductedComboItems.push({
				comboOfferId: item.comboOfferId,
				quantity: item.quantity,
			});
		}

		const createdOrders = await Order.create([orderPayload]);
		order = createdOrders[0];
	} catch (error) {
		console.error('Order creation error:', error);

		// Rollback normal product stock
		if (deductedProductItems.length > 0) {
			try {
				await rollbackOrderStock(deductedProductItems);
			} catch (rollbackError) {
				console.error('Product stock rollback failed:', rollbackError);
			}
		}

		// Rollback combo stock
		for (const item of deductedComboItems) {
			try {
				await ComboOffer.updateOne(
					{ _id: item.comboOfferId },
					{ $inc: { stock: item.quantity } }
				);
			} catch (rollbackError) {
				console.error('Combo stock rollback failed:', rollbackError);
			}
		}

		throw error;
	}

	// 12. Success
	return NextResponse.json(
		{
			success: true,
			message: 'Order created successfully',
			order,
		},
		{ status: 201 }
	);
});

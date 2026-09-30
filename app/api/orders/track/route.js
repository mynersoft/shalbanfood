import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const invoiceNo = searchParams.get('invoiceNo');

		if (!invoiceNo) {
			return NextResponse.json(
				{
					success: false,
					message: 'Order ID is required',
				},
				{ status: 400 }
			);
		}

		const order = await Order.findOne({
			invoiceNo: invoiceNo.trim(),
		}).lean();

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
			order: {
				id: order.invoiceNo,
				status: order.status,
				total: order.total,
				subtotal: order.subtotal,
				shippingFee: order.shippingFee,
				discount: order.discount || 0,

				createdAt: order.createdAt,

				customer: {
					name: order.customer?.name || '',
					phone: order.customer?.phone || '',
					email: order.customer?.email || '',
				},

				shippingAddress: {
					thana: order.shippingAddress?.thana || '',
					area: order.shippingAddress?.area || '',
					city: order.shippingAddress?.city || '',
					phone: order.shippingAddress?.phone || '',
				},

				payment: {
					method: order.payment?.method || 'COD',
					status: order.payment?.status || 'unpaid',
				},

				items: Array.isArray(order.orderItems)
					? order.orderItems.map((item) => ({
							productId: item.productId,
							name: item.name,
							quantity: item.quantity || 1,
							price: item.price || 0,
							image: item.image || '',
						}))
					: [],
			},
		});
	} catch (error) {
		console.error('Track order error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to track order',
			},
			{ status: 500 }
		);
	}
}

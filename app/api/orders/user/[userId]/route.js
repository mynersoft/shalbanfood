import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(request, { params }) {
	try {
		await connectDB();

		const { userId } = await params;

		if (!userId) {
			return NextResponse.json(
				{
					success: false,
					message: 'User ID is required',
				},
				{ status: 400 }
			);
		}

		const orders = await Order.find({ userId })
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json(
			{
				success: true,
				count: orders.length,
				orders,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Get user orders error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch user orders',
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

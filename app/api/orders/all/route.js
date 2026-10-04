import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
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

		await connectDB();

		const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

		return NextResponse.json({
			success: true,
			count: orders.length,
			orders,
		});
	} catch (error) {
		console.error('ADMIN ORDERS GET:', error);

		return NextResponse.json(
			{ success: false, message: 'Failed to fetch orders' },
			{ status: 500 }
		);
	}
}

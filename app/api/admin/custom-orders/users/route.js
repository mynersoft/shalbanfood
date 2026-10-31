import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { checkAuthRole } from '@/lib/checkAuthRole';

export async function GET(request) {
	try {
		const {isAdmin} = await checkAuthRole();

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 403 }
			);
		}

		
		await connectDB();

		const { searchParams } = new URL(request.url);
		const q = searchParams.get('q')?.trim();

		if (!q || q.length < 2) {
			return NextResponse.json({
				success: true,
				users: [],
			});
		}

		const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		const users = await User.find({
			role: 'user',
			$or: [
				{ name: { $regex: safeQuery, $options: 'i' } },
				{ phone: { $regex: safeQuery, $options: 'i' } },
				{ email: { $regex: safeQuery, $options: 'i' } },
			],
		})
			.select('name email phone address')
			.limit(10)
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json({
			success: true,
			users,
		});
	} catch (error) {
		console.error('Customer search error:', error);

		return NextResponse.json(
			{ success: false, message: 'Failed to search customers' },
			{ status: 500 }
		);
	}
}

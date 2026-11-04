import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export const runtime = 'nodejs';

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json(
				{ success: false, message: 'অনুগ্রহ করে লগইন করুন।' },
				{ status: 401 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const limit = Math.min(
			Math.max(Number(searchParams.get('limit')) || 30, 1),
			100
		);

		const [notifications, unreadCount] = await Promise.all([
			Notification.find({ userId })
				.sort({ createdAt: -1 })
				.limit(limit)
				.lean(),

			Notification.countDocuments({ userId, isRead: false }),
		]);

		return NextResponse.json({
			success: true,
			notifications,
			unreadCount,
		});
	} catch (error) {
		console.error('Notifications GET error:', error);

		return NextResponse.json(
			{ success: false, message: 'নোটিফিকেশন লোড করা যায়নি।' },
			{ status: 500 }
		);
	}
}


export async function PATCH(request) {
	try {
		const session = await getServerSession(authOptions);
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json(
				{ success: false, message: 'অনুগ্রহ করে লগইন করুন।' },
				{ status: 401 }
			);
		}

		const { action, notificationId } = await request.json();

		await connectDB();

		// Mark all notifications as read
		if (action === 'read-all') {
			await Notification.updateMany(
				{ userId, isRead: false },
				{ $set: { isRead: true } }
			);
		}

		// Mark single notification as read
		else if (action === 'read') {
			if (
				typeof notificationId !== 'string' ||
				!/^[a-f\d]{24}$/i.test(notificationId)
			) {
				return NextResponse.json(
					{
						success: false,
						message: 'নোটিফিকেশন আইডি সঠিক নয়।',
					},
					{ status: 400 }
				);
			}

			await Notification.updateOne(
				{
					_id: notificationId,
					userId,
				},
				{
					$set: { isRead: true },
				}
			);
		}

		// Invalid action
		else {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid notification action.',
				},
				{ status: 400 }
			);
		}

		const unreadCount = await Notification.countDocuments({
			userId,
			isRead: false,
		});

		return NextResponse.json({
			success: true,
			unreadCount,
		});
	} catch (error) {
		console.error('Notifications PATCH error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'আপডেট করা যায়নি।',
			},
			{ status: 500 }
		);
	}
}

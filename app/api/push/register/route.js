import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import PushSubscription from '@/models/PushSubscription';

export const runtime = 'nodejs';

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json(
				{ success: false, message: 'আগে লগইন করুন।' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { token } = body;

		if (
			typeof token !== 'string' ||
			token.length < 20 ||
			token.length > 4096
		) {
			return NextResponse.json(
				{ success: false, message: 'FCM registration token সঠিক নয়।' },
				{ status: 400 }
			);
		}

		await connectDB();

		await PushSubscription.findOneAndUpdate(
			{ token },
			{
				$set: {
					userId,
					token,
					enabled: true,
					platform: 'web',
					lastSeenAt: new Date(),
				},
			},
			{
				upsert: true,
				new: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		);

		return NextResponse.json({
			success: true,
			message: 'Push Notification চালু হয়েছে।',
		});
	} catch (error) {
		console.error('Push registration error:', error);

		return NextResponse.json(
			{ success: false, message: 'Push চালু করা যায়নি।' },
			{ status: 500 }
		);
	}
}

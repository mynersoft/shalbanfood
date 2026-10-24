import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import PushSubscription from '@/models/PushSubscription';
import { createAndSendNotification } from '@/lib/notifications/createAndSend';

export const runtime = 'nodejs';

const allowedTypes = ['offer', 'announcement'];

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);

		// প্রকৃত MongoDB ID এবং role server-side session-এ থাকতে হবে।
		if (!session?.user?.id || session.user.role !== 'admin') {
			return NextResponse.json(
				{ success: false, message: 'Admin permission প্রয়োজন।' },
				{ status: 403 }
			);
		}

		const { title, message, type, link } = await request.json();

		if (
			typeof title !== 'string' ||
			typeof message !== 'string' ||
			!title.trim() ||
			!message.trim() ||
			title.length > 120 ||
			message.length > 600 ||
			!allowedTypes.includes(type)
		) {
			return NextResponse.json(
				{ success: false, message: 'তথ্য যাচাই করুন।' },
				{ status: 400 }
			);
		}

		const safeLink =
			typeof link === 'string' &&
			link.startsWith('/') &&
			!link.startsWith('//') &&
			!link.includes('\\')
				? link
				: '/';

		await connectDB();

		const recipients = await PushSubscription.distinct('userId', {
			enabled: true,
		});

		let saved = 0;
		let sent = 0;
		let failed = 0;

		// Vercel function timeout এড়াতে production-এ queue ব্যবহার করো।
		for (const userId of recipients) {
			try {
				const result = await createAndSendNotification({
					userId,
					title: title.trim(),
					message: message.trim(),
					type,
					link: safeLink,
					eventKey: `admin:${type}:${crypto.randomUUID()}:${userId}`,
				});

				if (!result.duplicate) saved++;

				if (result.pushSent) sent++;
			} catch (error) {
				failed++;
				console.error('Announcement delivery failed:', error.message);
			}
		}

		return NextResponse.json({
			success: true,
			recipientCount: recipients.length,
			saved,
			pushSent: sent,
			failed,
		});
	} catch (error) {
		console.error('Admin announcement error:', error);

		return NextResponse.json(
			{ success: false, message: 'নোটিফিকেশন পাঠানো যায়নি।' },
			{ status: 500 }
		);
	}
}

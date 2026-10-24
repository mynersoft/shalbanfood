import 'server-only';

import { connectDB } from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import PushSubscription from '@/models/PushSubscription';
import { getFCM } from '@/lib/firebase/admin';

const SITE_URL = process.env.BASE_URL;


function safePath(path) {
	if (
		typeof path !== 'string' ||
		!path.startsWith('/') ||
		path.startsWith('//') ||
		path.includes('\\')
	) {
		return '/dashboard';
	}

	return path;
}

export async function createAndSendNotification({
	userId,
	title,
	message,
	type = 'announcement',
	link = '/user',
	eventKey = null,
	targetFid = null,
}) {
	await connectDB();

	// Notification history আগে সংরক্ষণ করবে।
	let notification;

	try {
		notification = await Notification.create({
			userId,
			title,
			message,
			type,
			link: safePath(link),
			eventKey,
		});
	} catch (error) {
		// Unique eventKey duplicate হলে দ্বিতীয় notification নয়।
		if (error?.code === 11000 && eventKey) {
			return { duplicate: true, pushSent: false };
		}

		throw error;
	}

	const filter = {
		userId,
		enabled: true,
	};

	// নির্দিষ্ট অর্ডার-ডিভাইসকে লক্ষ্য করা হলে।
	if (targetFid) {
		filter.fid = targetFid;
	}

	const devices = await PushSubscription.find(filter).select('fid');

	let pushSent = false;

	for (const device of devices) {
		try {
			await getFCM().send({
				fid: device.fid,
				notification: {
					title,
					body: message,
				},
				webpush: {
					fcmOptions: {
						link: new URL(safePath(link), SITE_URL).href,
					},
				},
			});

			pushSent = true;
		} catch (error) {
			console.error('FCM delivery error:', error.code || error.message);
		}
	}

	return {
		notification,
		pushSent,
		devicesFound: devices.length,
	};
}

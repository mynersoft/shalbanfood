import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { checkAuthRole } from '@/lib/checkAuthRole';

const DEFAULT_KEY = 'main';

async function authorizeAdmin() {
	const auth = await checkAuthRole();

	if (!auth?.authenticated) {
		return NextResponse.json(
			{ success: false, message: 'অনুগ্রহ করে লগইন করুন।' },
			{ status: 401 }
		);
	}

	if (!auth?.isAdmin) {
		return NextResponse.json(
			{ success: false, message: 'Admin permission required.' },
			{ status: 403 }
		);
	}

	return null;
}

export async function GET() {
	try {
		await connectDB();

		let settings = await Settings.findOne({ key: DEFAULT_KEY }).lean();

		if (!settings) {
			const created = await Settings.create({ key: DEFAULT_KEY });
			settings = created.toObject();
		}

		return NextResponse.json({ success: true, data: settings });
	} catch (error) {
		console.error('GET SETTINGS ERROR:', error);
		return NextResponse.json(
			{ success: false, message: 'Settings লোড করা যায়নি।' },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const denied = await authorizeAdmin();
		if (denied) return denied;

		await connectDB();

		const body = await request.json();

		// Only allow fields defined for settings sections.
		const allowedSections = [
			'store',
			'order',
			'delivery',
			'payment',
			'notification',
			'customer',
			'invoice',
			'seo',
			'appearance',
			'security',
			'system',
		];

		const update = {};

		for (const section of allowedSections) {
			if (
				body[section] &&
				typeof body[section] === 'object' &&
				!Array.isArray(body[section])
			) {
				update[section] = body[section];
			}
		}

		const settings = await Settings.findOneAndUpdate(
			{ key: DEFAULT_KEY },
			{ $set: update },
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		).lean();

		return NextResponse.json({
			success: true,
			message: 'Settings updated',
			data: settings,
		});
	} catch (error) {
		console.error('UPDATE SETTINGS ERROR:', error);
		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Settings সেভ করা যায়নি।',
			},
			{ status: 500 }
		);
	}
}

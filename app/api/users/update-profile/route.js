import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function PUT(request) {
	try {
		// 1. Verify login
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json(
				{
					success: false,
					message: 'প্রথমে লগইন করুন।',
				},
				{ status: 401 }
			);
		}

		const userId = session.user.id;

		if (!userId || !mongoose.isValidObjectId(userId)) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক User ID পাওয়া যায়নি।',
				},
				{ status: 401 }
			);
		}

		// 2. Read request body
		let body;

		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক JSON ডেটা পাঠান।',
				},
				{ status: 400 }
			);
		}

		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক প্রোফাইল ডেটা পাঠান।',
				},
				{ status: 400 }
			);
		}

		// 3. Validate name
		const name = typeof body.name === 'string' ? body.name.trim() : '';

		if (!name || name.length > 100) {
			return NextResponse.json(
				{
					success: false,
					message: 'নাম দিন (সর্বোচ্চ ১০০ অক্ষর)।',
				},
				{ status: 400 }
			);
		}

		// 4. Validate email
		const email =
			typeof body.email === 'string'
				? body.email.trim().toLowerCase()
				: '';

		if (
			email &&
			(email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক ইমেইল ঠিকানা দিন।',
				},
				{ status: 400 }
			);
		}

		// 5. Validate phone
		const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

		if (
			phone &&
			(!/^[0-9+\-\s()]{7,20}$/.test(phone) ||
				phone.replace(/\D/g, '').length < 7)
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক ফোন নম্বর দিন।',
				},
				{ status: 400 }
			);
		}

		// 6. Validate address
		const rawAddress =
			body.address &&
			typeof body.address === 'object' &&
			!Array.isArray(body.address)
				? body.address
				: {};

		const address = {
			area:
				typeof rawAddress.area === 'string'
					? rawAddress.area.trim()
					: '',
			thana:
				typeof rawAddress.thana === 'string'
					? rawAddress.thana.trim()
					: '',
			city:
				typeof rawAddress.city === 'string'
					? rawAddress.city.trim()
					: '',
		};

		if (Object.values(address).some((value) => value.length > 150)) {
			return NextResponse.json(
				{
					success: false,
					message:
						'ঠিকানার প্রতিটি অংশ সর্বোচ্চ ১৫০ অক্ষরের হতে পারবে।',
				},
				{ status: 400 }
			);
		}

		// 7. Connect to MongoDB
		await connectDB();

		// 8. Update only allowed fields
		const updateData = {
			name,
			address,
		};

		const unsetData = {};

		if (email) {
			updateData.email = email;
		} else {
			unsetData.email = 1;
		}

		if (phone) {
			updateData.phone = phone;
		} else {
			unsetData.phone = 1;
		}

		const updateQuery = { $set: updateData };

		if (Object.keys(unsetData).length > 0) {
			updateQuery.$unset = unsetData;
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
			new: true,
			runValidators: true,
		})
			.select('-password')
			.lean();

		if (!updatedUser) {
			return NextResponse.json(
				{
					success: false,
					message: 'ব্যবহারকারীকে পাওয়া যায়নি।',
				},
				{ status: 404 }
			);
		}

		// 9. Return safe user data
		return NextResponse.json(
			{
				success: true,
				message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে।',
				user: updatedUser,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Update profile error:', error);

		if (error?.code === 11000) {
			const duplicateField = Object.keys(error.keyPattern || {})[0];

			const message =
				duplicateField === 'email'
					? 'এই ইমেইল দিয়ে অন্য একটি অ্যাকাউন্ট রয়েছে।'
					: duplicateField === 'phone'
						? 'এই ফোন নম্বর দিয়ে অন্য একটি অ্যাকাউন্ট রয়েছে।'
						: 'এই তথ্যটি আগে থেকেই ব্যবহার করা হয়েছে।';

			return NextResponse.json(
				{ success: false, message },
				{ status: 409 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: 'প্রোফাইল আপডেট করা যায়নি। আবার চেষ্টা করুন।',
			},
			{ status: 500 }
		);
	}
}

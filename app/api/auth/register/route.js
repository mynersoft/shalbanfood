import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {connectDB} from '@/lib/dbConnect';
import User from '@/models/User';

function normalizeEmail(email) {
	if (!email) return null;

	const value = email.trim().toLowerCase();

	return value || null;
}

function normalizePhone(phone) {
	if (!phone) return null;

	let value = phone.trim().replace(/\s+/g, '');

	// +8801XXXXXXXXX → 01XXXXXXXXX
	if (value.startsWith('+880')) {
		value = '0' + value.substring(4);
	}

	// 8801XXXXXXXXX → 01XXXXXXXXX
	if (value.startsWith('880')) {
		value = '0' + value.substring(3);
	}

	return value;
}

function isValidPhone(phone) {
	return /^01[3-9]\d{8}$/.test(phone);
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
	try {
		const body = await request.json();

		const name = body.name?.trim();
		const email = normalizeEmail(body.email);
		const phone = normalizePhone(body.phone);
		const password = body.password;

		// Name
		if (!name) {
			return NextResponse.json(
				{
					success: false,
					message: 'নাম দিন',
				},
				{ status: 400 }
			);
		}

		// Email অথবা Phone যেকোনো একটি লাগবে
		if (!email && !phone) {
			return NextResponse.json(
				{
					success: false,
					message: 'Email অথবা Phone Number যেকোনো একটি দিন',
				},
				{ status: 400 }
			);
		}

		// Email থাকলে validate
		if (email && !isValidEmail(email)) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক Email Address দিন',
				},
				{ status: 400 }
			);
		}

		// Phone থাকলে validate
		if (phone && !isValidPhone(phone)) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক বাংলাদেশি Phone Number দিন',
				},
				{ status: 400 }
			);
		}

		// Password
		if (!password) {
			return NextResponse.json(
				{
					success: false,
					message: 'Password দিন',
				},
				{ status: 400 }
			);
		}

		if (password.length < 8) {
			return NextResponse.json(
				{
					success: false,
					message: 'Password কমপক্ষে ৮ অক্ষরের হতে হবে',
				},
				{ status: 400 }
			);
		}

		// Connect MongoDB
		await connectDB();

		// Existing account check
		const conditions = [];

		if (email) {
			conditions.push({ email });
		}

		if (phone) {
			conditions.push({ phone });
		}

		const existingUser = await User.findOne({
			$or: conditions,
		});

		if (existingUser) {
			if (email && existingUser.email === email) {
				return NextResponse.json(
					{
						success: false,
						message: 'এই Email দিয়ে ইতিমধ্যে Account আছে',
					},
					{ status: 409 }
				);
			}

			if (phone && existingUser.phone === phone) {
				return NextResponse.json(
					{
						success: false,
						message: 'এই Phone Number দিয়ে ইতিমধ্যে Account আছে',
					},
					{ status: 409 }
				);
			}

			return NextResponse.json(
				{
					success: false,
					message: 'এই তথ্য দিয়ে Account ইতিমধ্যে আছে',
				},
				{ status: 409 }
			);
		}

		// Password hash
		const hashedPassword = await bcrypt.hash(password, 12);

		// User data
		const userData = {
			name,
			password: hashedPassword,
			role: 'user',
		};

		// Empty field database-এ save হবে না
		if (email) {
			userData.email = email;
		}

		if (phone) {
			userData.phone = phone;
		}

		const user = await User.create(userData);

		return NextResponse.json(
			{
				success: true,
				message: 'Account successfully created',
				user: {
					id: user._id.toString(),
					name: user.name,
					email: user.email || null,
					phone: user.phone || null,
					role: user.role,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('REGISTER ERROR:', error);

		// Duplicate key
		if (error.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					message:
						'Email অথবা Phone Number ইতিমধ্যে ব্যবহার করা হয়েছে',
				},
				{ status: 409 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: 'Account তৈরি করা যায়নি',
			},
			{ status: 500 }
		);
	}
}

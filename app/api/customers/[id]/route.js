import { NextResponse } from 'next/server';

import mongoose from 'mongoose';

import { connectDB } from '@/lib/connectDB';
import User from '@/models/User';
import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';

export async function GET(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		// --------------------------------
		// Validate ID
		// --------------------------------
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid customer ID',
				},
				{
					status: 400,
				}
			);
		}

		// --------------------------------
		// Find customer
		// --------------------------------
		const customer = await User.findOne({
			_id: id,
			role: 'user',
		})
			.select('_id name email phone address role createdAt updatedAt')
			.lean();

		if (!customer) {
			return NextResponse.json(
				{
					success: false,
					message: 'Customer not found',
				},
				{
					status: 404,
				}
			);
		}

		console.log(customer);

		// --------------------------------
		// Get customer orders
		// --------------------------------
		const orders = await Order.find({
			userId: id,
		})
			.select(
				'invoiceNo subtotal total shippingFee discount status payment shippingAddress orderItems createdAt updatedAt'
			)
			.sort({
				createdAt: -1,
			})
			.lean();

		// --------------------------------
		// Exclude cancelled orders
		// --------------------------------
		const validOrders = orders.filter(
			(order) => order.status !== 'cancelled'
		);

		// --------------------------------
		// Calculate statistics
		// --------------------------------
		const totalOrders = validOrders.length;

		const totalSpent = validOrders.reduce(
			(sum, order) => sum + Number(order.total || 0),
			0
		);

		const lastOrder =
			validOrders.length > 0 ? validOrders[0].createdAt : null;

		return NextResponse.json({
			success: true,

			customer: {
				_id: customer._id,
				name: customer.name,

				email: customer.email || '',
				phone: customer.phone || '',
				role: customer.role,
				address: {
					area: customer.address.area,
					thana: customer.address.thana,
					city: customer.address.city,
				},
				createdAt: customer.createdAt,
				updatedAt: customer.updatedAt,
				totalOrders,
				totalSpent,
				lastOrder,
				status: totalOrders > 0 ? 'active' : 'new',
			},

			orders,
		});
	} catch (error) {
		console.error('GET /api/customers/[id] error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch customer',
				error: error.message,
			},
			{
				status: 500,
			}
		);
	}
}

// update customer/user info

export async function PUT(request, { params }) {
	try {
		const { isAdmin } = await checkAuthRole();

		if (!isAdmin) {
			return NextResponse.json(
				{
					success: false,
					message: 'আপনার এই কাজ করার অনুমতি নেই।',
				},
				{ status: 403 }
			);
		}

		const { id } = await params;

		if (!mongoose.isValidObjectId(id)) {
			return NextResponse.json(
				{ success: false, message: 'সঠিক কাস্টমার আইডি নয়।' },
				{ status: 400 }
			);
		}

		await connectDB();

		const body = await request.json();

		const name = typeof body.name === 'string' ? body.name.trim() : '';

		const phone =
			typeof body.phone === 'string'
				? body.phone.replace(/\s+/g, '').trim()
				: '';

		const address = body.address || {};

		const area =
			typeof address.area === 'string' ? address.area.trim() : '';

		const thana =
			typeof address.thana === 'string' ? address.thana.trim() : '';

		const city =
			typeof address.city === 'string' ? address.city.trim() : '';

		if (!/^01[3-9]\d{8}$/.test(phone)) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক ১১ ডিজিটের বাংলাদেশি ফোন নম্বর দিন।',
				},
				{ status: 400 }
			);
		}

		if (name.length > 100) {
			return NextResponse.json(
				{
					success: false,
					message: 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারবে।',
				},
				{ status: 400 }
			);
		}

		if (area.length > 150 || thana.length > 150 || city.length > 150) {
			return NextResponse.json(
				{
					success: false,
					message:
						'ঠিকানার প্রতিটি অংশ সর্বোচ্চ ১৫০ অক্ষরের হতে পারবে।',
				},
				{ status: 400 }
			);
		}

		const customer = await User.findById(id).select(
			'_id name phone role address'
		);

		if (!customer || customer.role !== 'user') {
			return NextResponse.json(
				{ success: false, message: 'কাস্টমার পাওয়া যায়নি।' },
				{ status: 404 }
			);
		}

		const existingUser = await User.findOne({
			phone,
			_id: { $ne: customer._id },
		}).select('_id');

		if (existingUser) {
			return NextResponse.json(
				{
					success: false,
					message:
						'এই ফোন নম্বরটি অন্য একটি অ্যাকাউন্টে ব্যবহার হচ্ছে।',
				},
				{ status: 409 }
			);
		}

		customer.name = name || phone;
		customer.phone = phone;
		customer.address = { area, thana, city };

		// Password intentionally remains unchanged.
		await customer.save();

		return NextResponse.json({
			success: true,
			message: 'কাস্টমারের তথ্য সফলভাবে আপডেট হয়েছে।',
			customer: {
				_id: customer._id,
				name: customer.name,
				phone: customer.phone,
				role: customer.role,
				address: customer.address,
			},
		});
	} catch (error) {
		console.error('UPDATE CUSTOMER ERROR:', error);

		if (error.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					message: 'এই ফোন নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে।',
				},
				{ status: 409 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: 'কাস্টমারের তথ্য আপডেট করা যায়নি।',
			},
			{ status: 500 }
		);
	}
}

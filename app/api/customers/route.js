import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';
import bcrypt from 'bcryptjs';

export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);

		const page = Math.max(1, Number(searchParams.get('page')) || 1);

		const limit = Math.min(
			100,
			Math.max(1, Number(searchParams.get('limit')) || 10)
		);

		const search = searchParams.get('search')?.trim() || '';

		// ==================================================
		// USER FILTER
		// ==================================================

		const userMatch = {
			role: { $ne: 'admin' },
		};

		if (search) {
			userMatch.$or = [
				{
					name: {
						$regex: search,
						$options: 'i',
					},
				},
				{
					email: {
						$regex: search,
						$options: 'i',
					},
				},
				{
					phone: {
						$regex: search,
						$options: 'i',
					},
				},
			];
		}

		// ==================================================
		// TOTAL CUSTOMERS
		// ==================================================

		const totalCustomers = await User.countDocuments(userMatch);

		const totalPages = Math.ceil(totalCustomers / limit);

		// ==================================================
		// CUSTOMERS
		// ==================================================

		const customers = await User.aggregate([
			{
				$match: userMatch,
			},

			// ----------------------------------------------
			// Get orders belonging to this user
			// ----------------------------------------------

			{
				$lookup: {
					from: 'orders',
					let: {
						customerId: '$_id',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: ['$userId', '$$customerId'],
								},
							},
						},

						{
							$sort: {
								createdAt: -1,
							},
						},
					],
					as: 'orders',
				},
			},

			// ----------------------------------------------
			// Statistics
			// ----------------------------------------------

			{
				$addFields: {
					totalOrders: {
						$size: '$orders',
					},

					totalSpent: {
						$sum: '$orders.total',
					},

					deliveredOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'delivered'],
								},
							},
						},
					},

					cancelledOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'cancelled'],
								},
							},
						},
					},

					returnOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'return'],
								},
							},
						},
					},

					pendingOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'pending'],
								},
							},
						},
					},

					processingOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'processing'],
								},
							},
						},
					},

					shippedOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.status', 'shipped'],
								},
							},
						},
					},

					paidOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.payment.status', 'paid'],
								},
							},
						},
					},

					unpaidOrders: {
						$size: {
							$filter: {
								input: '$orders',
								as: 'order',
								cond: {
									$eq: ['$$order.payment.status', 'unpaid'],
								},
							},
						},
					},

					firstOrderDate: {
						$min: '$orders.createdAt',
					},

					lastOrder: {
						$max: '$orders.createdAt',
					},

					customerSince: '$createdAt',
				},
			},

			// ----------------------------------------------
			// Customer status
			// ----------------------------------------------

			{
				$addFields: {
					status: {
						$cond: [
							{
								$gt: ['$totalOrders', 0],
							},
							'active',
							'new',
						],
					},

					averageOrderValue: {
						$cond: [
							{
								$gt: ['$totalOrders', 0],
							},
							{
								$divide: ['$totalSpent', '$totalOrders'],
							},
							0,
						],
					},
				},
			},

			// ----------------------------------------------
			// Remove sensitive/unnecessary fields
			// ----------------------------------------------

			{
				$project: {
					password: 0,
					orders: 0,
				},
			},

			// ----------------------------------------------
			// Sort
			// ----------------------------------------------

			{
				$sort: {
					createdAt: -1,
				},
			},

			// ----------------------------------------------
			// Pagination
			// ----------------------------------------------

			{
				$skip: (page - 1) * limit,
			},

			{
				$limit: limit,
			},
		]);

		// ==================================================
		// SUMMARY
		// ==================================================

		const summaryResult = await Order.aggregate([
			{
				$match: {
					userId: {
						$exists: true,
						$ne: null,
					},
				},
			},

			{
				$group: {
					_id: null,

					totalOrders: {
						$sum: 1,
					},

					totalSpent: {
						$sum: {
							$ifNull: ['$total', 0],
						},
					},

					deliveredOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'delivered'],
								},
								1,
								0,
							],
						},
					},

					cancelledOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'cancelled'],
								},
								1,
								0,
							],
						},
					},

					returnOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'return'],
								},
								1,
								0,
							],
						},
					},

					pendingOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'pending'],
								},
								1,
								0,
							],
						},
					},

					processingOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'processing'],
								},
								1,
								0,
							],
						},
					},

					shippedOrders: {
						$sum: {
							$cond: [
								{
									$eq: ['$status', 'shipped'],
								},
								1,
								0,
							],
						},
					},
				},
			},
		]);

		const summary = summaryResult[0] || {
			totalOrders: 0,
			totalSpent: 0,
			deliveredOrders: 0,
			cancelledOrders: 0,
			returnOrders: 0,
			pendingOrders: 0,
			processingOrders: 0,
			shippedOrders: 0,
		};

		// ==================================================
		// RESPONSE
		// ==================================================

		return NextResponse.json({
			success: true,

			customers,

			pagination: {
				page,
				limit,
				totalCustomers,
				totalPages,

				hasNextPage: page < totalPages,

				hasPrevPage: page > 1,
			},

			summary,
		});
	} catch (error) {
		console.error('GET /api/customers ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch customers',
				error: error.message,
			},
			{
				status: 500,
			}
		);
	}
}




// create customer by admin 
export async function POST(request) {
	try {
		// Admin authorization
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

		await connectDB();

		const body = await request.json();

		const name = body.name?.trim() || '';
		const phone = body.phone?.replace(/\s+/g, '').trim() || '';
		const area = body.address?.area?.trim() || '';
		const thana = body.address?.thana?.trim() || '';
		const city = body.address?.city?.trim() || '';

		// Bangladesh phone validation
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

		// Check duplicate phone
		const existingUser = await User.findOne({ phone }).select('_id');

		if (existingUser) {
			return NextResponse.json(
				{
					success: false,
					message:
						'এই ফোন নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে।',
				},
				{ status: 409 }
			);
		}

		// Phone number will be the initial password
		const hashedPassword = await bcrypt.hash(phone, 12);

		const customer = await User.create({
			name: name || phone,
			phone,
			password: hashedPassword,
			role: 'user',
			address: {
				area,
				thana,
				city,
			},
		});

		return NextResponse.json(
			{
				success: true,
				message: 'কাস্টমার সফলভাবে তৈরি হয়েছে।',
				customer: {
					_id: customer._id,
					name: customer.name,
					phone: customer.phone,
					role: customer.role,
					address: customer.address,
					createdAt: customer.createdAt,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('CREATE CUSTOMER ERROR:', error);

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
				message: 'কাস্টমার তৈরি করা সম্ভব হয়নি।',
			},
			{ status: 500 }
		);
	}
}
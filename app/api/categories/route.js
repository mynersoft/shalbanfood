import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Category from '@/models/Category';
import { log } from 'console';

// ========================================
// GET ALL
// ========================================
export async function GET() {
	try {
		await connectDB();

		const categories = await Category.find({})
			.sort({ createdAt: -1 })
			.lean();
		return NextResponse.json(
			{
				success: true,
				categories,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch categories',
			},
			{ status: 500 }
		);
	}
}

// ========================================
// CREATE
// ========================================
export async function POST(req) {
	try {
		await connectDB();

		const body = await req.json();

		const name = body?.name?.trim();

		if (!name) {
			return NextResponse.json(
				{
					success: false,
					message: 'Category name is required',
				},
				{ status: 400 }
			);
		}

		const existing = await Category.findOne({
			name: {
				$regex: `^${name}$`,
				$options: 'i',
			},
		});

		if (existing) {
			return NextResponse.json(
				{
					success: false,
					message: 'Category already exists',
				},
				{ status: 409 }
			);
		}

		const category = await Category.create({
			name,
			subCategories: Array.isArray(body.subCategories)
				? body.subCategories
				: [],
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Category created successfully',
				category,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('CREATE CATEGORY ERROR:', error.message);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to create category',
			},
			{ status: 500 }
		);
	}
}

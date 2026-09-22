import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectDB } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

// ========================================
// GET ALL CATEGORIES
// ========================================
export async function GET() {
	try {
		await connectDB();

		const categories = await Category.find({})
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json(categories, {
			status: 200,
		});
	} catch (error) {
		console.error('GET /api/categories error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch categories',
				message: error?.message || 'Database error',
			},
			{
				status: 500,
			}
		);
	}
}

// ========================================
// CREATE CATEGORY
// ========================================
export async function POST(request) {
	try {
		await connectDB();

		const body = await request.json();

		if (!body || typeof body !== 'object') {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid request body',
				},
				{
					status: 400,
				}
			);
		}

		const name = String(body.name || '').trim();

		if (!name) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category name is required',
				},
				{
					status: 400,
				}
			);
		}

		let subCategories = [];

		if (Array.isArray(body.subCategories)) {
			subCategories = body.subCategories
				.map((item) => String(item).trim())
				.filter(Boolean);
		}

		// Remove duplicate subcategories
		subCategories = [...new Set(subCategories)];

		// Check duplicate category
		const existingCategory = await Category.findOne({
			name: {
				$regex: `^${escapeRegex(name)}$`,
				$options: 'i',
			},
		});

		if (existingCategory) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category already exists',
				},
				{
					status: 409,
				}
			);
		}

		const category = await Category.create({
			name,
			subCategories,
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Category created successfully',
				category,
			},
			{
				status: 201,
			}
		);
	} catch (error) {
		console.error('POST /api/categories error:', error);

		// MongoDB duplicate key
		if (error?.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category already exists',
				},
				{
					status: 409,
				}
			);
		}

		// Mongoose validation
		if (error?.name === 'ValidationError') {
			return NextResponse.json(
				{
					success: false,
					error: 'Validation failed',
					message: error.message,
				},
				{
					status: 400,
				}
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to create category',
				message: error?.message || 'Unknown server error',
			},
			{
				status: 500,
			}
		);
	}
}

// ========================================
// ESCAPE REGEX
// ========================================
function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

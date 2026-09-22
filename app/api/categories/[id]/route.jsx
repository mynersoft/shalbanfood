import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import Category from '@/models/Category';
import { connectDB } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

// ========================================
// GET SINGLE CATEGORY
// ========================================
export async function GET(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid category ID',
				},
				{
					status: 400,
				}
			);
		}

		const category = await Category.findById(id).lean();

		if (!category) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category not found',
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json(category, {
			status: 200,
		});
	} catch (error) {
		console.error('GET /api/categories/[id] error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch category',
				message: error?.message || 'Unknown server error',
			},
			{
				status: 500,
			}
		);
	}
}

// ========================================
// UPDATE CATEGORY
// ========================================
export async function PUT(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid category ID',
				},
				{
					status: 400,
				}
			);
		}

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

		subCategories = [...new Set(subCategories)];

		// Check if another category has same name
		const duplicate = await Category.findOne({
			_id: { $ne: id },
			name: {
				$regex: `^${escapeRegex(name)}$`,
				$options: 'i',
			},
		});

		if (duplicate) {
			return NextResponse.json(
				{
					success: false,
					error: 'Another category with this name already exists',
				},
				{
					status: 409,
				}
			);
		}

		const category = await Category.findByIdAndUpdate(
			id,
			{
				name,
				subCategories,
			},
			{
				new: true,
				runValidators: true,
			}
		);

		if (!category) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category not found',
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Category updated successfully',
				category,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.error('PUT /api/categories/[id] error:', error);

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

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to update category',
				message: error?.message || 'Unknown server error',
			},
			{
				status: 500,
			}
		);
	}
}

// ========================================
// DELETE CATEGORY
// ========================================
export async function DELETE(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid category ID',
				},
				{
					status: 400,
				}
			);
		}

		const category = await Category.findByIdAndDelete(id);

		if (!category) {
			return NextResponse.json(
				{
					success: false,
					error: 'Category not found',
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Category deleted successfully',
				id,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.error('DELETE /api/categories/[id] error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to delete category',
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

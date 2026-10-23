import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConnect';
import { checkAuthRole } from '@/lib/checkAuthRole';
import Product from '@/models/Product';

export async function PATCH(request, { params }) {
	try {
		// 1. Admin authorization
		const { authenticated, isAdmin } = await checkAuthRole();

		if (!authenticated) {
			return NextResponse.json(
				{ success: false, message: 'লগইন করতে হবে।' },
				{ status: 401 }
			);
		}

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, message: 'এই কাজের অনুমতি নেই।' },
				{ status: 403 }
			);
		}

		// 2. Validate route IDs
		const { id, variantId } = await params;

		if (
			!mongoose.Types.ObjectId.isValid(id) ||
			!mongoose.Types.ObjectId.isValid(variantId)
		) {
			return NextResponse.json(
				{ success: false, message: 'Product বা variant ID সঠিক নয়।' },
				{ status: 400 }
			);
		}

		// 3. Validate stock
		const body = await request.json();
		const stock = body?.stock;

		if (
			stock === undefined ||
			typeof stock !== 'number' ||
			!Number.isSafeInteger(stock) ||
			stock < 0
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'স্টক শূন্য বা তার বেশি পূর্ণ সংখ্যা হতে হবে।',
				},
				{ status: 400 }
			);
		}

		// 4. Connect database and find product
		await connectDB();

		const product = await Product.findById(id);

		if (!product) {
			return NextResponse.json(
				{ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি।' },
				{ status: 404 }
			);
		}

		// 5. Find the specific variant
		const variant = product.variants.id(variantId);

		if (!variant) {
			return NextResponse.json(
				{
					success: false,
					message: 'প্রোডাক্টের ভ্যারিয়েন্ট পাওয়া যায়নি।',
				},
				{ status: 404 }
			);
		}

		// 6. Update only this variant's stock
		variant.stock = stock;

		await product.save();

		return NextResponse.json({
			success: true,
			message: 'স্টক সফলভাবে আপডেট হয়েছে।',
			data: {
				productId: String(product._id),
				variantId: String(variant._id),
				stock: variant.stock,
			},
		});
	} catch (error) {
		console.error('Stock update error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'স্টক আপডেট করা যায়নি।',
			},
			{ status: 500 }
		);
	}
}

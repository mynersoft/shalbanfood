import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectDB } from '@/lib/dbConnect';

export async function GET(req, { params }) {
	try {
		await connectDB();
		const { slug } = await params;

		console.log(slug, "dkfj===========================================================================================================");
		

		const product = await Product.findOne({ slug }).lean();

		if (!product) {
			return NextResponse.json(
				{ success: false, message: 'Product not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, product }, { status: 200 });
	} catch (err) {
		console.error('Product API error:', err);

		return NextResponse.json(
			{
				success: false,
				message: err?.message || 'Something went wrong',
			},
			{ status: 500 }
		);
	}
}

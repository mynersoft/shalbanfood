import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/dbConnect";

export async function GET() {
	await connectDB();

	try {
		const bestSelling = await Product.find()
			.sort({ soldCount: -1 }) // descending
			.limit(2); // top 1

		return NextResponse.json(bestSelling[0]);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

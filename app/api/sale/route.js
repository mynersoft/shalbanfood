// app/api/sale/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import SaleProfit from "@/models/SaleProfit";

export async function GET() {
	await connectDB();
	try {
		const sales = await Sale.find();

		return NextResponse.json({ success: true, sales }, { status: 200 });
	} catch (error) {
		console.error("🔥 GET SALE ERROR:", error);

		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}

export async function POST(req) {
	try {
		await connectDB();

		const body = await req.json();
		const { customer, items, discount, subtotal, total, invoice } = body;

		// Save Sale
		const newSale = await Sale.create({
			customer,
			items,
			discount,
			subtotal,
			total,
			invoice,
		});

		for (let item of items) {
			// Always find product by ID
			const product = await Product.findOne({ name: item.name });

			if (!product) continue;

			// PROFIT ENTRY
			const profitPerItem = item.price - product.regularPrice;

			await SaleProfit.create({
				productId: product._id,
				productName: product.name,
				qty: item.qty,
				sellPrice: item.price,
				regularPrice: product.regularPrice,
				totalSale: item.price * item.qty,
				profit: profitPerItem * item.qty,
			});

			// STOCK & SOLD COUNT UPDATE
			product.stock -= item.qty;

			product.soldCount = (product.soldCount || 0) + item.qty;

			await product.save();
		}

		return NextResponse.json({
			success: true,
			sale: newSale,
			message: "Sale & Profit stored successfully",
		});
	} catch (error) {
		console.log("SALE ERROR:", error);
		return NextResponse.json(
			{ success: false, message: "Server error" },
			{ status: 500 }
		);
	}
}

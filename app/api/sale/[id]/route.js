import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import SaleProfit from "@/models/SaleProfit";

export async function GET(req, { params }) {
	await connectDB();
	const sale = await Sale.findById(params.id);
	return NextResponse.json(sale);
}

export async function DELETE(req, { params }) {
	await connectDB();

	try {
		const saleId = params.id; // correct usage
		const sale = await Sale.findById(saleId);

		if (!sale) {
			return NextResponse.json(
				{ success: false, message: "Sale not found" },
				{ status: 404 }
			);
		}

		// Restore stock & delete SaleProfit entries
		for (let item of sale.items) {
			const product = await Product.findOne({ name: item.name });
			if (product) {
				product.stock += item.qty;
				await product.save();
			}

			// Delete related SaleProfit entries for this product & sale date
			await SaleProfit.deleteOne({
				productId: product?._id,
			});
		}

		// Delete the sale
		await sale.deleteOne();

		return NextResponse.json({
			success: true,
			message: "Sale deleted successfully",
		});
	} catch (error) {
		console.error("DELETE SALE ERROR:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}

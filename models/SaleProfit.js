// models/Sale.js
import mongoose from "mongoose";

const SaleProfitSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		productName: String,
		qty: Number,
		sellPrice: Number,
		regularPrice: Number,
		totalSale: Number,
		profit: Number,
	},
	{ timestamps: true }
);

export default mongoose.models.SaleProfit ||
	mongoose.model("SaleProfit", SaleProfitSchema);

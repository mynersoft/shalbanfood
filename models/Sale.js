import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
	name: { type: String, required: true },
	qty: { type: Number, default: 1 },
	price: { type: Number, default: 0 },
	total: { type: Number, default: 0 },
});

const SaleSchema = new mongoose.Schema({
	customer: {
		name: { type: String, default: "Walk-in Customer" },
		phone: { type: String, default: "" },
	},
	items: [ItemSchema], 
	discount: { type: Number, default: 0 },
	subtotal: { type: Number, default: 0 },
	total: { type: Number, default: 0 },
	invoice: { type: String, required: true },
	date: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);

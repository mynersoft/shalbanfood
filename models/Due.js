import mongoose from "mongoose";

const CustomerDueSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },

		phone: { type: String },
		amount: { type: Number, required: true },
		date: { type: Date, default: Date.now },
		status: { type: String, enum: ["due", "paid"], default: "due" },
		note: { type: String },
	},
	{ timestamps: true }
);

export default mongoose.models.CustomerDue ||
	mongoose.model("CustomerDue", CustomerDueSchema);

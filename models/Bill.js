import mongoose, { Schema } from "mongoose";

const BillSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // YYYY-MM
    status: { type: String, default: "paid" }, // "paid" | "due"
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
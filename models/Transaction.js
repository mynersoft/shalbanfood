import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["invest", "income"], 
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
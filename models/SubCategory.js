import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default mongoose.models.SubCategory ||
  mongoose.model("SubCategory", SubCategorySchema);
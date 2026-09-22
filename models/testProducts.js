import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: String,
    public_id: String,
  },
  { _id: false }
);

const TestProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  images: [ImageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TestProduct ||
  mongoose.model("TestProduct", TestProductSchema);
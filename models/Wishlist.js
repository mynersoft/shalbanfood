import mongoose, { Schema } from "mongoose";


const WishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Wishlist =
  mongoose.models.Wishlist ||
  mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
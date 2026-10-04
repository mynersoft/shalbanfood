
import mongoose, { Schema, Model } from 'mongoose';


const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add index for faster queries
CartSchema.index({ user: 1 });


// Create or retrieve model
const Cart =
  mongoose.models.Cart || mongoose.model('Cart', CartSchema);

export default Cart;

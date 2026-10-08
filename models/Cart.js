import mongoose, { Schema } from 'mongoose';

const CartItemSchema = new Schema(
	{
		product: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
			required: true,
		},

		// Product-এর variant-এর _id
		// Variant না থাকলে null থাকবে
		variantId: {
			type: Schema.Types.ObjectId,
			default: null,
		},

		quantity: {
			type: Number,
			default: 1,
			min: 1,
		},

		// Add to cart করার সময়কার price
		price: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ _id: true }
);

const CartSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},

		products: [CartItemSchema],
	},
	{
		timestamps: true,
	}
);

CartSchema.index({ user: 1 });

const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

export default Cart;

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
	{
		invoiceNo: { type: String, unique: true, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

		customer: {
			name: { type: String, required: true },
			email: { type: String,  },
			phone: { type: String, required: true },
		},

		subtotal: { type: Number, required: true },
		total: { type: Number, required: true },
		shippingFee: { type: Number, required: true },
		status: {
			type: String,
			enum: [
				'pending',
				'processing',
				'shipped',
				'delivered',
				'cancelled',
			],
			default: 'pending',
		},
		discount: { type: Number, default: 0 },
		payment: {
			method: { type: String, default: 'COD' },
			status: {
				type: String,
				enum: ['unpaid', 'paid', 'failed'],
				default: 'unpaid',
			},
			transactionId: String,
		},

		shippingAddress: {
			thana: String,
			area: String,
			city: String,
			phone: String,
		},

		orderItems: [
			{
				productId: String,
				name: String,
				quantity: Number,
				price: Number,
				image: String,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

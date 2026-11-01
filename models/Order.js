import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
	{
		invoiceNo: {
			type: String,
			unique: true,
			required: true,
		},

		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},

		customer: {
			name: { type: String, required: true },
			email: String,
			phone: { type: String, required: true },
		},

		subtotal: {
			type: Number,
			required: true,
		},

		total: {
			type: Number,
			required: true,
		},

		shippingFee: {
			type: Number,
			required: true,
		},

		discount: {
			type: Number,
			default: 0,
			min: 0,
		},

		adminDiscount: {
			type: Number,
			default: 0,
			min: 0,
		},

		adminDiscountNote: {
			type: String,
			default: '',
			trim: true,
		},

		adminDiscountUpdatedAt: {
			type: Date,
			default: null,
		},

		status: {
			type: String,
			enum: [
				'pending',
				'confirmed',
				'processing',
				'shipped',
				'delivered',
				'cancelled',
				'return',
			],
			default: 'pending',
		},

		payment: {
			method: {
				type: String,
				default: 'COD',
			},

			status: {
				type: String,
				enum: ['unpaid', 'partial', 'paid', 'failed'],
				default: 'unpaid',
			},

			paidAmount: {
				type: Number,
				default: 0,
				min: 0,
			},

			transactionId: {
				type: String,
				default: '',
			},
		},

		shippingAddress: {
			thana: String,
			area: String,
			city: String,
			phone: String,
		},

		orderItems: [
			{
				type: {
					type: String,
					enum: ['product', 'combo'],
					default: 'product',
				},

				productId: {
					type: String,
					default: null,
				},

				variantId: {
					type: String,
					default: null,
				},

				variantLabel: {
					type: String,
					default: '',
				},

				comboOfferId: {
					type: String,
					default: null,
				},

				comboItems: [
					{
						name: { type: String, default: '' },
						quantity: { type: String, default: '' },
					},
				],

				name: {
					type: String,
					required: true,
				},

				quantity: {
					type: Number,
					required: true,
					min: 1,
				},

				price: {
					type: Number,
					required: true,
					min: 0,
				},

				image: {
					type: String,
					default: '',
				},
			},
		],

		pushFid: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

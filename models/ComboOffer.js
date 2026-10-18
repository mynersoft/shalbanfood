import mongoose from 'mongoose';

const ComboItemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Item name is required'],
			trim: true,
		},
		quantity: {
			type: String,
			required: [true, 'Item quantity is required'],
			trim: true,
		},
	},
	{ _id: false }
);

const ComboOfferSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Offer name is required'],
			trim: true,
			maxlength: 200,
		},

		slug: {
			type: String,
			required: [true, 'Slug is required'],
			unique: true,
			lowercase: true,
			trim: true,
			maxlength: 220,
		},

		description: {
			type: String,
			default: '',
			trim: true,
		},

		shortDescription: {
			type: String,
			default: '',
			trim: true,
			maxlength: 300,
		},

		items: {
			type: [ComboItemSchema],
			required: true,
			validate: {
				validator(items) {
					return (
						Array.isArray(items) &&
						items.length >= 2 &&
						items.every(
							(item) => item.name?.trim() && item.quantity?.trim()
						)
					);
				},
				message: 'A combo must contain at least 2 complete items',
			},
		},

		regularPrice: {
			type: Number,
			required: true,
			min: 0,
		},

		offerPrice: {
			type: Number,
			required: true,
			min: 0,
			validate: {
				validator(value) {
					return Number.isFinite(value) && value <= this.regularPrice;
				},
				message: 'Offer price cannot exceed regular price',
			},
		},

		featureImg: {
			type: String,
			required: [true, 'Feature image is required'],
			trim: true,
		},

		images: {
			type: [String],
			default: [],
		},

		stock: {
			type: Number,
			default: 0,
			min: 0,
			validate: {
				validator: Number.isInteger,
				message: 'Stock must be a whole number',
			},
		},

		sold: {
			type: Number,
			default: 0,
			min: 0,
			validate: {
				validator: Number.isInteger,
				message: 'Sold count must be a whole number',
			},
		},

		startDate: {
			type: Date,
			required: true,
		},

		endDate: {
			type: Date,
			required: true,
			validate: {
				validator(value) {
					return !this.startDate || value > this.startDate;
				},
				message: 'End date must be after start date',
			},
		},

		isActive: {
			type: Boolean,
			default: true,
		},

		isFeatured: {
			type: Boolean,
			default: false,
		},

		priority: {
			type: Number,
			default: 0,
			validate: {
				validator: Number.isInteger,
				message: 'Priority must be a whole number',
			},
		},

		seoTitle: {
			type: String,
			default: '',
			trim: true,
			maxlength: 70,
		},

		seoDescription: {
			type: String,
			default: '',
			trim: true,
			maxlength: 170,
		},

		keywords: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Calculate discount percentage.
ComboOfferSchema.virtual('discount').get(function () {
	if (!this.regularPrice || this.regularPrice <= 0) {
		return 0;
	}

	return Math.round(
		((this.regularPrice - this.offerPrice) / this.regularPrice) * 100
	);
});

// Calculate current offer status.
ComboOfferSchema.virtual('offerStatus').get(function () {
	const now = new Date();

	if (!this.isActive) return 'inactive';
	if (now < this.startDate) return 'upcoming';
	if (now > this.endDate) return 'expired';
	if (this.stock <= 0) return 'out_of_stock';

	return 'active';
});

export default mongoose.models.ComboOffer ||
	mongoose.model('ComboOffer', ComboOfferSchema);

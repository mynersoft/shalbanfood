import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema(
	{
		value: {
			type: Number,
			required: true,
			min: 0,
		},

		unit: {
			type: String,
			required: true,
			enum: ['gram', 'kg', 'milliliter', 'litre', 'piece'],
		},

		regularPrice: {
			type: Number,
			required: true,
			min: 0,
		},

		sellPrice: {
			type: Number,
			required: true,
			min: 0,
		},

		stock: {
			type: Number,
			default: 0,
			min: 0,
		},

		soldCount: {
			type: Number,
			default: 0,
			min: 0,
		},

		sku: {
			type: String,
			trim: true,
			uppercase: true,
			default: '',
		},
	},
	{
		_id: true,
	}
);

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},

		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			index: true,
		},

		category: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			index: true,
		},

		subCategory: {
			type: String,
			trim: true,
			lowercase: true,
			default: '',
		},

		brand: {
			type: String,
			trim: true,
			default: '',
		},

		warranty: {
			type: String,
			trim: true,
			default: '',
		},

		shortDescription: {
			type: String,
			trim: true,
			maxlength: 500,
			default: '',
		},

		description: {
			type: String,
			trim: true,
			default: '',
		},
		image: {
			type: String,
			trim: true,
			default: '',
		},
		variants: {
			type: [VariantSchema],

			required: true,

			validate: {
				validator: function (variants) {
					return (
						Array.isArray(variants) &&
						variants.length >= 1 &&
						variants.length <= 4
					);
				},

				message: 'Product must have 1 to 4 variants.',
			},
		},

		sku: {
			type: String,
			trim: true,
			uppercase: true,
			default: '',
			index: true,
		},

		seoTitle: {
			type: String,
			trim: true,
			maxlength: 70,
			default: '',
		},

		seoDescription: {
			type: String,
			trim: true,
			maxlength: 160,
			default: '',
		},

		keywords: {
			type: [String],
			default: [],
		},

		canonicalUrl: {
			type: String,
			trim: true,
			default: '',
		},

		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},

		isFeatured: {
			type: Boolean,
			default: false,
			index: true,
		},
	},

	{
		timestamps: true,
	}
);


ProductSchema.pre('validate', function () {
	if (!Array.isArray(this.variants)) return;

	for (const variant of this.variants) {
		if (Number(variant.sellPrice) > Number(variant.regularPrice)) {
			throw new Error(
				'Variant sell price cannot be higher than regular price.'
			);
		}
	}
});


ProductSchema.index({
	category: 1,
	isActive: 1,
});

ProductSchema.index({
	category: 1,
	createdAt: -1,
});

ProductSchema.index({
	'variants.sellPrice': 1,
});

ProductSchema.index({
	'variants.sku': 1,
});

ProductSchema.index({
	isFeatured: 1,
	createdAt: -1,
});


export default mongoose.models.Product ||
	mongoose.model('Product', ProductSchema);

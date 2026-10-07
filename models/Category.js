import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		slug: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
	},
	{
		_id: true,
		timestamps: true,
	}
);

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},

		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},

		subCategories: {
			type: [SubCategorySchema],
			default: [],
		},

		status: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

const Category =
	mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;

import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Category name is required'],
			unique: true,
			trim: true,
		},

		subCategories: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

const Category =
	mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;

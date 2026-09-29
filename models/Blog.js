import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},

		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},

		excerpt: {
			type: String,
			default: '',
			trim: true,
		},

		content: {
			type: String,
			required: true,
			default: '',
		},

		featuredImage: {
			type: String,
			default: '',
		},

		featuredImagePublicId: {
			type: String,
			default: '',
		},

		category: {
			type: String,
			default: 'Food & Nutrition',
			trim: true,
		},

		tags: {
			type: [String],
			default: [],
		},

		author: {
			type: String,
			default: 'Shalban Food',
			trim: true,
		},

		seoTitle: {
			type: String,
			default: '',
			trim: true,
		},

		seoDescription: {
			type: String,
			default: '',
			trim: true,
		},

		keywords: {
			type: [String],
			default: [],
		},

		canonicalUrl: {
			type: String,
			default: '',
			trim: true,
		},

		status: {
			type: String,
			enum: ['draft', 'published'],
			default: 'draft',
		},

		publishedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

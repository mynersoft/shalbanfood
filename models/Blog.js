import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 180,
		},

		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},

		excerpt: {
			type: String,
			trim: true,
			maxlength: 300,
		},

		content: {
			type: String,
			required: true,
		},

		featuredImage: {
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
		},

		seoTitle: {
			type: String,
			trim: true,
			maxlength: 70,
		},

		seoDescription: {
			type: String,
			trim: true,
			maxlength: 160,
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
			index: true,
		},

		publishedAt: {
			type: Date,
			default: null,
		},

		views: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

BlogSchema.index({
	title: 'text',
	excerpt: 'text',
	content: 'text',
	tags: 'text',
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

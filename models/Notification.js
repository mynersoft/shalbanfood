import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},

		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Order',
			default: null,
		},

		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 120,
		},

		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 600,
		},

		type: {
			type: String,
			enum: ['order', 'offer', 'announcement', 'payment', 'account'],
			default: 'announcement',
			index: true,
		},

		link: {
			type: String,
			default: '/user',
			maxlength: 300,
		},

		isRead: {
			type: Boolean,
			default: false,
			index: true,
		},

		// একই event যেন একই ব্যবহারকারীর জন্য বারবার
		// Notification তৈরি না করে।
		eventKey: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

NotificationSchema.index(
	{ userId: 1, eventKey: 1 },
	{
		unique: true,
		partialFilterExpression: { eventKey: { $type: 'string' } },
	}
);

export default mongoose.models.Notification ||
	mongoose.model('Notification', NotificationSchema);

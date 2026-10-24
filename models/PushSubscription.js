import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},

		token: {
			type: String,
			required: true,
			unique: true,
		},

		enabled: {
			type: Boolean,
			default: true,
		},
		token: {
			type: String,
			required: true,
			unique: true,
		},

		platform: {
			type: String,
			default: 'web',
		},

		lastSeenAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.PushSubscription ||
	mongoose.model('PushSubscription', PushSubscriptionSchema);

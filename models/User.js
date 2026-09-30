import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		email: {
			type: String,
			lowercase: true,
			trim: true,
			unique: true,
			sparse: true,
			default: undefined,
		},

		phone: {
			type: String,
			trim: true,
			unique: true,
			sparse: true,
			default: undefined,
		},

		password: {
			type: String,
			required: true,
		},

		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

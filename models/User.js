import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
	{
		area: {
			type: String,
			trim: true,
			default: '',
		},
		thana: {
			type: String,
			trim: true,
			default: '',
		},
		city: {
			type: String,
			trim: true,
			default: '',
		},
	},
	{ _id: false }
);

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
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
			select: false,
		},

	
		address: {
			type: AddressSchema,
			default: () => ({}),
		},

		role: {
			type: String,
			enum: ['user', 'admin', 'seller'],
			default: 'user',
		},
	},
	{
		timestamps: true,
		minimize: false,
	}
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

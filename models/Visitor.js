import mongoose, { Schema, Document, Model } from 'mongoose';

const visitorSchema = new Schema(
	{
		ip: { type: String, required: true },
		userAgent: { type: String },
		path: { type: String }, // page visited
	},
	{ timestamps: true }
);

// Prevent model overwrite in dev
const Visitor =
	mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

export default Visitor;

// models/ServiceRecord.js
import mongoose from "mongoose";

const ServiceRecordSchema = new mongoose.Schema(
	{
		customerName: {
			type: String,
			default: "John",
			trim: true,
		},
		phone: { type: String, trim: true },
		servicingeDevice: { type: String, required: true, trim: true },
		billAmount: { type: Number, default: 0 },
		warranty: {
			hasWarranty: { type: Boolean, default: false },
			warrantyMonths: { type: Number, default: 0 }, // if warranty given, months length
		},
		notes: { type: String, default: "" },
	},
	{ timestamps: true }
);

export default mongoose.models.ServiceRecord ||
	mongoose.model("ServiceRecord", ServiceRecordSchema);

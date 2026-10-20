import mongoose from 'mongoose';

const DistrictRateSchema = new mongoose.Schema(
	{
		district: {
			type: String,
			required: true,
			trim: true,
		},
		charge: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ _id: false }
);

const ShippingCostSchema = new mongoose.Schema(
	{
		districtRates: {
			type: [DistrictRateSchema],
			default: null,
		},

		defaultCharge: {
			type: Number,
			default: 150,
			min: 0,
		},

		freeDeliveryEnabled: {
			type: Boolean,
			default: false,
		},

		freeDeliveryMinimum: {
			type: Number,
			default: 2500,
			min: 0,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.ShippingCost ||
	mongoose.model('ShippingCost', ShippingCostSchema);

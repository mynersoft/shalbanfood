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

const ShippingSettingSchema = new mongoose.Schema(
	{
		districtRates: {
			type: [DistrictRateSchema],
			default: () => [
				{ district: 'ঢাকা', charge: 70 },
				{ district: 'টাঙ্গাইল', charge: 100 },
				{ district: 'রাজশাহী', charge: 120 },
			],
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

export default mongoose.models.ShippingSetting ||
	mongoose.model('ShippingSetting', ShippingSettingSchema);

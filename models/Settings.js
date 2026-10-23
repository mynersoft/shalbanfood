import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			default: 'main',
			unique: true,
			index: true,
		},

		store: {
			site_name: { type: String, default: '' },
			site_name_bn: { type: String, default: '' },
			tagline: {
				type: String,
				default: '',
			},
			phone: { type: String, default: '' },
			whatsapp: { type: String, default: '' },
			email: { type: String, default: '' },
			address: { type: String, default: '' },
			website: {
				type: String,
				default: '',
			},
			logo: { type: String, default: '' },
			favicon: { type: String, default: '' },
			facebook: { type: String, default: '' },
			instagram: { type: String, default: '' },
			youtube: { type: String, default: '' },
			tiktok: { type: String, default: '' },
		},

		order: {
			enableOrders: { type: Boolean, default: true },
			minimumOrder: { type: Number, default: 0 },
			autoConfirmOrders: { type: Boolean, default: false },
			allowGuestCheckout: { type: Boolean, default: true },
			stockCheck: { type: Boolean, default: true },
			orderPrefix: { type: String, default: '' },
		},

		delivery: {
			enabled: { type: Boolean, default: true },
			freeDeliveryAbove: { type: Number, default: 0 },

			madhupur: {
				enabled: { type: Boolean, default: true },
				charge: { type: Number, default: 0 },
			},

			dhaka: {
				enabled: { type: Boolean, default: true },
				charge: { type: Number, default: 60 },
			},

			tangail: {
				enabled: { type: Boolean, default: true },
				charge: { type: Number, default: 80 },
			},

			outside: {
				enabled: { type: Boolean, default: true },
				charge: { type: Number, default: 120 },
			},

			estimatedDays: {
				type: String,
				default: '2-5 working days',
			},
		},

		payment: {
			currency: { type: String, default: 'BDT' },

			cod: {
				enabled: { type: Boolean, default: true },
			},

			bkash: {
				enabled: { type: Boolean, default: true },
				number: { type: String, default: '' },
				type: { type: String, default: 'Personal' },
			},

			nagad: {
				enabled: { type: Boolean, default: false },
				number: { type: String, default: '' },
				type: { type: String, default: 'Personal' },
			},
		},

		notification: {
			newOrder: { type: Boolean, default: true },
			orderStatus: { type: Boolean, default: true },
			newUser: { type: Boolean, default: true },
			lowStock: { type: Boolean, default: true },
			whatsappOrder: { type: Boolean, default: true },
		},

		customer: {
			registration: { type: Boolean, default: true },
			emailVerification: { type: Boolean, default: false },
			phoneVerification: { type: Boolean, default: false },
			wishlist: { type: Boolean, default: true },
			reviews: { type: Boolean, default: true },
			reviewApproval: { type: Boolean, default: true },
		},

		invoice: {
			enabled: { type: Boolean, default: true },
			showLogo: { type: Boolean, default: true },
			showPhone: { type: Boolean, default: true },
			showAddress: { type: Boolean, default: true },
			footerText: {
				type: String,
				default: '',
			},
		},

		seo: {
			title: {
				type: String,
				default: '',
			},
			description: {
				type: String,
				default: '',
			},
			keywords: {
				type: String,
				default: '',
			},
			ogImage: { type: String, default: '' },
			googleVerification: { type: String, default: '' },
		},

		appearance: {
			theme: {
				type: String,
				enum: ['light', 'dark', 'system'],
				default: 'dark',
			},
			primaryColor: { type: String, default: '#16a34a' },
			compactSidebar: { type: Boolean, default: false },
			reduceAnimations: { type: Boolean, default: false },
		},

		security: {
			adminTwoFactor: { type: Boolean, default: false },
			activityLogs: { type: Boolean, default: true },
			sessionTimeout: { type: Number, default: 30 },
		},

		system: {
			maintenanceMode: { type: Boolean, default: false },
			showMaintenanceMessage: {
				type: String,
				default: '',
			},
		},
	},
	{
		timestamps: true,
		minimize: false,
	}
);

export default mongoose.models.Setting ||
	mongoose.model('Setting', SettingSchema);

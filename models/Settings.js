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
      name: { type: String, default: 'Shalban Food' },
      tagline: {
        type: String,
        default: 'স্বাদের সাথে আস্থার বন্ধন।',
      },
      phone: { type: String, default: '01603816721' },
      whatsapp: { type: String, default: '01603816721' },
      email: { type: String, default: '' },
      address: { type: String, default: 'Madhupur, Tangail, Bangladesh' },
      website: {
        type: String,
        default: 'https://shalbanfood.vercel.app',
      },
      logo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      facebook: {
        type: String,
        default: 'https://facebook.com/shalbanfood',
      },
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
      orderPrefix: { type: String, default: 'SF' },
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
        number: { type: String, default: '01603816721' },
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
        default: 'ধন্যবাদ Shalban Food-এর সাথে থাকার জন্য।',
      },
    },

    seo: {
      title: {
        type: String,
        default: 'Shalban Food | খাঁটি মধু, ঘি ও প্রাকৃতিক খাবার',
      },
      description: {
        type: String,
        default:
          'Shalban Food থেকে খাঁটি মধু, গাওয়া ঘি, শুকনো খাবার ও প্রাকৃতিক খাদ্যপণ্য অর্ডার করুন।',
      },
      keywords: {
        type: String,
        default:
          'Shalban Food, খাঁটি মধু, লিচু ফুলের মধু, কালোজিরা মধু, সুন্দরবনের মধু, গাওয়া ঘি',
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
        default: 'আমাদের ওয়েবসাইট বর্তমানে maintenance mode-এ আছে।',
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
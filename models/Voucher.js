import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },
    type: {
      // all | single product
      type: String,
      enum: ['all-product', 'product-specific'],
      default: 'product-specific',
    },
    applicableProducts: { type: Array }, // for all it empty array

    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free-shipping'],
      default: 'percentage',
    },

    discountValue: {
      type: Number,
      required: true,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
    },

    usageLimit: {
      type: Number,
      default: null,
    },

    customerLimit: {
      type: Number,
      default: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Voucher ||
  mongoose.model('Voucher', VoucherSchema);

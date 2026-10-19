import mongoose from "mongoose";

const ShippingSettingSchema = new mongoose.Schema(
  {
    insideDhaka: {
      type: Number,
      default: 70,
      min: 0,
    },
    outsideDhaka: {
      type: Number,
      default: 130,
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
  mongoose.model("ShippingSetting", ShippingSettingSchema);
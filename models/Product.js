import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        subCategory: {
            type: String,
            trim: true,
            default: "",
        },

        brand: {
            type: String,
            trim: true,
            default: "",
        },

        // Product size
        size: {
            value: {
                type: Number,
                required: true,
                min: 0,
            },

            unit: {
                type: String,
                required: true,
                enum: [
                    "gram",
                    "kg",
                    "milliliter",
                    "litre",
                    "piece",
                ],
            },
        },

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        regularPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        sellPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        warranty: {
            type: String,
            default: "",
            trim: true,
        },

        dealerName: {
            type: String,
            default: "",
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        soldCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);
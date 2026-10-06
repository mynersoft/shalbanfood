import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        // ========================================
        // PRODUCT NAME
        // ========================================
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        // ========================================
        // PRODUCT SLUG
        // Example:
        // লিচু ফুলের মধু
        // =>
        // lichu-fuler-modhu
        // ========================================
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        // ========================================
        // CATEGORY SLUG
        // Example:
        // honey
        // dates
        // ghee
        // ========================================
        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        // ========================================
        // SUB CATEGORY SLUG
        // ========================================
        subCategory: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        // ========================================
        // BRAND
        // ========================================
        brand: {
            type: String,
            trim: true,
            default: "",
        },

        // ========================================
        // PRODUCT SIZE
        // ========================================
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

        // ========================================
        // STOCK
        // ========================================
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ========================================
        // REGULAR PRICE
        // ========================================
        regularPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // ========================================
        // SELL PRICE
        // ========================================
        sellPrice: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    return value <= this.regularPrice;
                },

                message:
                    "Sell price cannot be greater than regular price.",
            },
        },

        // ========================================
        // WARRANTY
        // ========================================
        warranty: {
            type: String,
            trim: true,
            default: "",
        },

        // ========================================
        // PRODUCT IMAGE
        // ========================================
        image: {
            type: String,
            trim: true,
            default: "",
        },

        // ========================================
        // SOLD COUNT
        // ========================================
        soldCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ========================================
        // ACTIVE / INACTIVE
        // ========================================
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // ========================================
        // FEATURED PRODUCT
        // ========================================
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
    },

    {
        timestamps: true,
    }
);

// ========================================
// INDEXES
// ========================================

ProductSchema.index({
    category: 1,
    isActive: 1,
});

ProductSchema.index({
    category: 1,
    createdAt: -1,
});

ProductSchema.index({
    category: 1,
    sellPrice: 1,
});

ProductSchema.index({
    isFeatured: 1,
    createdAt: -1,
});

// ========================================
// MODEL
// ========================================

export default mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);
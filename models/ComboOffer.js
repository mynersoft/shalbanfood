import mongoose from 'mongoose';

const ComboOfferSchema = new mongoose.Schema(
    {
        // ==========================================
        // BASIC INFORMATION
        // ==========================================
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        shortDescription: {
            type: String,
            trim: true,
            maxlength: 300,
        },

        // ==========================================
        // COMBO CONTENT
        // ==========================================
        items: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                quantity: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        // ==========================================
        // PRICE
        // ==========================================
        regularPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        offerPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // ==========================================
        // IMAGE
        // ==========================================
        featureImg: {
            type: String,
            required: true,
            trim: true,
        },

        images: {
            type: [String],
            default: [],
        },

        // ==========================================
        // STOCK
        // ==========================================
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        sold: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ==========================================
        // OFFER SCHEDULE
        // ==========================================
        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        // ==========================================
        // STATUS
        // ==========================================
        isActive: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        // ==========================================
        // SORTING
        // ==========================================
        priority: {
            type: Number,
            default: 0,
        },

        // ==========================================
        // SEO
        // ==========================================
        seoTitle: {
            type: String,
            trim: true,
            maxlength: 70,
        },

        seoDescription: {
            type: String,
            trim: true,
            maxlength: 170,
        },

        keywords: {
            type: [String],
            default: [],
        },
    },

    {
        timestamps: true,
    }
);


// ==========================================
// AUTOMATIC DISCOUNT
// ==========================================

ComboOfferSchema.virtual('discount').get(function () {
    if (this.regularPrice <= 0) return 0;

    return Math.round(
        ((this.regularPrice - this.offerPrice) /
            this.regularPrice) *
            100
    );
});


// ==========================================
// AUTOMATIC OFFER STATUS
// ==========================================

ComboOfferSchema.virtual('offerStatus').get(function () {
    const now = new Date();

    if (!this.isActive) {
        return 'inactive';
    }

    if (now < this.startDate) {
        return 'upcoming';
    }

    if (now > this.endDate) {
        return 'expired';
    }

    return 'active';
});


// ==========================================
// VALIDATION
// ==========================================


export default mongoose.models.ComboOffer ||
    mongoose.model('ComboOffer', ComboOfferSchema);
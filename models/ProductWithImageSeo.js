
import mongoose from 'mongoose';

const { Schema } = mongoose;

/* =========================
   Product Image SEO Schema
========================= */

const ImageSchema = new Schema(
    {
        url: {
            type: String,
            required: [true, 'Image URL is required'],
            trim: true,
        },

        publicId: {
            type: String,
            default: '',
            trim: true,
        },

        alt: {
            type: String,
            required: [true, 'Image alt text is required'],
            trim: true,
            maxlength: [250, 'Alt text cannot exceed 250 characters'],
        },

        title: {
            type: String,
            default: '',
            trim: true,
            maxlength: [150, 'Image title cannot exceed 150 characters'],
        },

        caption: {
            type: String,
            default: '',
            trim: true,
            maxlength: [300, 'Image caption cannot exceed 300 characters'],
        },

        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Image description cannot exceed 500 characters'],
        },

        keywords: {
            type: [String],
            default: [],
            set: (keywords) =>
                Array.isArray(keywords)
                    ? [
                          ...new Set(
                              keywords
                                  .map((keyword) =>
                                      String(keyword).trim()
                                  )
                                  .filter(Boolean)
                          ),
                      ]
                    : [],
        },

        isPrimary: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

/* =========================
   Product Variant Schema
========================= */

const VariantSchema = new Schema(
    {
        value: {
            type: Number,
            required: [true, 'Variant value is required'],
            min: [0, 'Variant value cannot be negative'],
        },

        unit: {
            type: String,
            required: [true, 'Variant unit is required'],
            enum: {
                values: ['gram', 'kg', 'milliliter', 'litre', 'piece'],
                message: 'Invalid variant unit',
            },
        },

        regularPrice: {
            type: Number,
            required: [true, 'Regular price is required'],
            min: [0, 'Regular price cannot be negative'],
        },

        sellPrice: {
            type: Number,
            required: [true, 'Selling price is required'],
            min: [0, 'Selling price cannot be negative'],
        },

        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },

        soldCount: {
            type: Number,
            default: 0,
            min: [0, 'Sold count cannot be negative'],
        },

        sku: {
            type: String,
            trim: true,
            uppercase: true,
            default: '',
        },
    },
    {
        _id: true,
    }
);

/* =========================
   Main Product Schema
========================= */

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },

        slug: {
            type: String,
            required: [true, 'Product slug is required'],
            trim: true,
            lowercase: true,
            unique: true,
        },

        category: {
            type: String,
            required: [true, 'Product category is required'],
            trim: true,
            index: true,
        },

        subCategory: {
            type: String,
            default: '',
            trim: true,
        },

        brand: {
            type: String,
            default: 'Shalban Food',
            trim: true,
        },

        warranty: {
            type: String,
            default: '',
            trim: true,
        },

        shortDescription: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Short description cannot exceed 500 characters'],
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },

        /*
         * Legacy image field.
         * Keeps old products compatible.
         */
        image: {
            type: String,
            default: '',
            trim: true,
        },

        /*
         * New image array with SEO metadata.
         */
        images: {
            type: [ImageSchema],
            default: [],
            validate: {
                validator: (images) => images.length <= 10,
                message: 'A product can have a maximum of 10 images',
            },
        },

        variants: {
            type: [VariantSchema],
            required: [true, 'At least one variant is required'],
            validate: [
                {
                    validator: (variants) =>
                        variants.length >= 1 && variants.length <= 4,
                    message: 'A product must have 1 to 4 variants',
                },
            ],
        },

        sku: {
            type: String,
            trim: true,
            uppercase: true,
            default: '',
        },

        seoTitle: {
            type: String,
            default: '',
            trim: true,
            maxlength: [70, 'SEO title cannot exceed 70 characters'],
        },

        seoDescription: {
            type: String,
            default: '',
            trim: true,
            maxlength: [160, 'SEO description cannot exceed 160 characters'],
        },

        keywords: {
            type: [String],
            default: [],
        },

        canonicalUrl: {
            type: String,
            default: '',
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

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

/* =========================
   Validation
========================= */

ProductSchema.pre('validate', function () {
    // Validate variant prices.
    for (const variant of this.variants || []) {
        if (
            typeof variant.regularPrice === 'number' &&
            typeof variant.sellPrice === 'number' &&
            variant.sellPrice > variant.regularPrice
        ) {
            this.invalidate(
                'variants',
                'Selling price cannot exceed regular price'
            );
            break;
        }
    }

    // Only one image can be primary.
    const primaryImages = (this.images || []).filter(
        (image) => image.isPrimary
    );

    if (primaryImages.length > 1) {
        this.invalidate(
            'images',
            'Only one product image can be primary'
        );
    }
});

/* =========================
   Indexes
========================= */

ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ subCategory: 1, isActive: 1 });
ProductSchema.index({ 'variants.sellPrice': 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
ProductSchema.index({ createdAt: -1 });

/* =========================
   Model Export
========================= */

const Product =
    mongoose.models.Product ||
    mongoose.model('Product', ProductSchema);

export default Product;

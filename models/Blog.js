
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 180,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        excerpt: {
            type: String,
            default: "",
            trim: true,
            maxlength: 320,
        },

        content: {
            type: String,
            required: true,
            default: "",
        },

        featuredImage: {
            type: String,
            default: "",
            trim: true,
        },

        featuredImagePublicId: {
            type: String,
            default: "",
        },

        featuredImageAlt: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },

        category: {
            type: String,
            default: "Food & Nutrition",
            trim: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        author: {
            type: String,
            default: "Shalban Food",
            trim: true,
        },

        seoTitle: {
            type: String,
            default: "",
            trim: true,
            maxlength: 70,
        },

        seoDescription: {
            type: String,
            default: "",
            trim: true,
            maxlength: 170,
        },

        keywords: {
            type: [String],
            default: [],
        },

        canonicalUrl: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

BlogSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.models.Blog ||
    mongoose.model("Blog", BlogSchema);

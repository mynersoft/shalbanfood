import { NextResponse } from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/dbConnect";
import ComboOffer from "@/models/ComboOffer";

/* =========================
   GET SINGLE OFFER
========================= */

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid offer ID",
                },
                { status: 400 }
            );
        }

        const offer = await ComboOffer.findById(id);

        if (!offer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Offer not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                offer,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET SINGLE OFFER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch offer",
            },
            { status: 500 }
        );
    }
}

/* =========================
   UPDATE OFFER
========================= */

export async function PUT(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid offer ID",
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        const existingOffer =
            await ComboOffer.findById(id);

        if (!existingOffer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Offer not found",
                },
                { status: 404 }
            );
        }

        const {
            name,
            slug,
            shortDescription,
            description,
            items,
            regularPrice,
            offerPrice,
            featureImg,
            images,
            stock,
            startDate,
            endDate,
            isActive,
            isFeatured,
            priority,
            seoTitle,
            seoDescription,
            keywords,
        } = body;

        if (
            regularPrice !== undefined &&
            offerPrice !== undefined &&
            Number(offerPrice) >
                Number(regularPrice)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Offer price cannot be greater than regular price",
                },
                { status: 400 }
            );
        }

        if (
            startDate &&
            endDate &&
            new Date(endDate) <=
                new Date(startDate)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "End date must be greater than start date",
                },
                { status: 400 }
            );
        }

        if (slug) {
            const duplicate =
                await ComboOffer.findOne({
                    slug: slug.toLowerCase().trim(),
                    _id: { $ne: id },
                });

            if (duplicate) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "This slug already exists",
                    },
                    { status: 409 }
                );
            }
        }

        if (
            items !== undefined &&
            (!Array.isArray(items) ||
                items.length < 2)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least 2 combo items are required",
                },
                { status: 400 }
            );
        }

        const updateData = {};

        if (name !== undefined)
            updateData.name = name;

        if (slug !== undefined)
            updateData.slug =
                slug.toLowerCase().trim();

        if (shortDescription !== undefined)
            updateData.shortDescription =
                shortDescription;

        if (description !== undefined)
            updateData.description = description;

        if (items !== undefined)
            updateData.items = items;

        if (regularPrice !== undefined)
            updateData.regularPrice =
                Number(regularPrice);

        if (offerPrice !== undefined)
            updateData.offerPrice =
                Number(offerPrice);

        if (featureImg !== undefined)
            updateData.featureImg = featureImg;

        if (images !== undefined)
            updateData.images = images;

        if (stock !== undefined)
            updateData.stock = Number(stock);

        if (startDate !== undefined)
            updateData.startDate =
                new Date(startDate);

        if (endDate !== undefined)
            updateData.endDate =
                new Date(endDate);

        if (isActive !== undefined)
            updateData.isActive =
                Boolean(isActive);

        if (isFeatured !== undefined)
            updateData.isFeatured =
                Boolean(isFeatured);

        if (priority !== undefined)
            updateData.priority =
                Number(priority);

        if (seoTitle !== undefined)
            updateData.seoTitle = seoTitle;

        if (seoDescription !== undefined)
            updateData.seoDescription =
                seoDescription;

        if (keywords !== undefined)
            updateData.keywords =
                Array.isArray(keywords)
                    ? keywords
                    : [];

        const updatedOffer =
            await ComboOffer.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Combo offer updated successfully",
                offer: updatedOffer,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("UPDATE OFFER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to update offer",
            },
            { status: 500 }
        );
    }
}

/* =========================
   DELETE OFFER
========================= */

export async function DELETE(
    request,
    { params }
) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid offer ID",
                },
                { status: 400 }
            );
        }

        const offer =
            await ComboOffer.findById(id);

        if (!offer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Offer not found",
                },
                { status: 404 }
            );
        }

        await ComboOffer.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message:
                    "Combo offer deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE OFFER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete offer",
            },
            { status: 500 }
        );
    }
}
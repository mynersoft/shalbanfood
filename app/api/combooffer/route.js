import { NextResponse } from "next/server";
import {connectDB} from "@/lib/dbConnect";
import ComboOffer from "@/models/ComboOffer";

/* =========================
   GET ALL OFFERS
========================= */

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const admin = searchParams.get("admin");
        const featured = searchParams.get("featured");

        const filter = {};

        /* Public API */
        if (admin !== "true") {
            const now = new Date();

            filter.isActive = true;
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
            filter.stock = { $gt: 0 };
        }

        if (featured === "true") {
            filter.isFeatured = true;
        }

        const offers = await ComboOffer.find(filter)
            .sort({
                priority: -1,
                createdAt: -1,
            })
            .lean();

        return NextResponse.json(
            {
                success: true,
                count: offers.length,
                offers,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET OFFERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch offers",
            },
            { status: 500 }
        );
    }
}

/* =========================
   CREATE OFFER
========================= */

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

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

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Offer name is required",
                },
                { status: 400 }
            );
        }

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Slug is required",
                },
                { status: 400 }
            );
        }

        if (!items || !Array.isArray(items) || items.length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least 2 combo items are required",
                },
                { status: 400 }
            );
        }

        if (
            regularPrice === undefined ||
            offerPrice === undefined
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Prices are required",
                },
                { status: 400 }
            );
        }

        if (Number(offerPrice) > Number(regularPrice)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Offer price cannot be greater than regular price",
                },
                { status: 400 }
            );
        }

        if (!featureImg) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Feature image is required",
                },
                { status: 400 }
            );
        }

        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Start date and end date are required",
                },
                { status: 400 }
            );
        }

        if (
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

        const existing = await ComboOffer.findOne({
            slug: slug.toLowerCase().trim(),
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This slug already exists",
                },
                { status: 409 }
            );
        }

        const offer = await ComboOffer.create({
            name,
            slug: slug.toLowerCase().trim(),
            shortDescription,
            description,
            items,

            regularPrice: Number(regularPrice),
            offerPrice: Number(offerPrice),

            featureImg,
            images: Array.isArray(images)
                ? images
                : [],

            stock: Number(stock || 0),
            sold: 0,

            startDate: new Date(startDate),
            endDate: new Date(endDate),

            isActive:
                isActive !== undefined
                    ? Boolean(isActive)
                    : true,

            isFeatured:
                isFeatured !== undefined
                    ? Boolean(isFeatured)
                    : false,

            priority: Number(priority || 0),

            seoTitle,
            seoDescription,

            keywords: Array.isArray(keywords)
                ? keywords
                : [],
        });

        return NextResponse.json(
            {
                success: true,
                message: "Combo offer created successfully",
                offer,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE OFFER ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to create offer",
            },
            { status: 500 }
        );
    }
}
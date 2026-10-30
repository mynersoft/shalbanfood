import { NextResponse } from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/dbConnect";
import ComboOffer from "@/models/ComboOffer";

/* =========================
   GET SINGLE OFFER
========================= */


export async function GET(request, { params }) {
	try {
		const { id } = await params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid offer ID',
				},
				{ status: 400 }
			);
		}

		const { isAdmin } = await checkAuthRole();

		await connectDB();

		const { searchParams } = new URL(request.url);
		const adminRequested = searchParams.get('admin') === 'true';

		// Only authenticated admin can see all offers
		const showAllOffers = adminRequested && isAdmin;

		const filter = showAllOffers
			? { _id: id }
			: { _id: id, isActive: true };

		const offer = await ComboOffer.findOne(filter).lean();

		if (!offer) {
			return NextResponse.json(
				{
					success: false,
					message: 'Offer not found',
				},
				{ status: 404 }
			);
		}

		const now = new Date();

		const formattedOffer = {
			...offer,
			discount: getDiscount(offer),
			offerStatus: getOfferStatus(offer, now),
		};

		// Public users can only see currently active offers
		if (!showAllOffers && formattedOffer.offerStatus !== 'active') {
			return NextResponse.json(
				{
					success: false,
					message: 'Offer is not available',
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				offer: formattedOffer,
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'no-store, max-age=0',
				},
			}
		);
	} catch (error) {
		console.error('GET SINGLE OFFER ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch offer',
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
				{ success: false, message: 'Invalid offer ID' },
				{ status: 400 }
			);
		}

		const body = await request.json();

		const existingOffer = await ComboOffer.findById(id);

		if (!existingOffer) {
			return NextResponse.json(
				{ success: false, message: 'Offer not found' },
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

		// Validate prices using existing values as fallback
		const nextRegularPrice =
			regularPrice !== undefined
				? Number(regularPrice)
				: Number(existingOffer.regularPrice);

		const nextOfferPrice =
			offerPrice !== undefined
				? Number(offerPrice)
				: Number(existingOffer.offerPrice);

		if (
			!Number.isFinite(nextRegularPrice) ||
			!Number.isFinite(nextOfferPrice) ||
			nextRegularPrice <= 0 ||
			nextOfferPrice < 0
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'সঠিক নিয়মিত মূল্য ও অফার মূল্য দিন',
				},
				{ status: 400 }
			);
		}

		if (nextOfferPrice > nextRegularPrice) {
			return NextResponse.json(
				{
					success: false,
					message: 'অফার মূল্য নিয়মিত মূল্যের চেয়ে বেশি হতে পারবে না',
				},
				{ status: 400 }
			);
		}

		// Validate dates
		const nextStartDate =
			startDate !== undefined
				? new Date(startDate)
				: existingOffer.startDate;

		const nextEndDate =
			endDate !== undefined ? new Date(endDate) : existingOffer.endDate;

		if (
			Number.isNaN(new Date(nextStartDate).getTime()) ||
			Number.isNaN(new Date(nextEndDate).getTime()) ||
			new Date(nextEndDate) <= new Date(nextStartDate)
		) {
			return NextResponse.json(
				{
					success: false,
					message: 'End date must be after start date',
				},
				{ status: 400 }
			);
		}

		// Validate slug
		if (slug !== undefined) {
			const cleanSlug = slug.toLowerCase().trim();

			const duplicate = await ComboOffer.findOne({
				slug: cleanSlug,
				_id: { $ne: id },
			});

			if (duplicate) {
				return NextResponse.json(
					{
						success: false,
						message: 'This slug already exists',
					},
					{ status: 409 }
				);
			}
		}

		// Validate items
		if (items !== undefined) {
			if (
				!Array.isArray(items) ||
				items.length < 2 ||
				items.some(
					(item) => !item.name?.trim() || !item.quantity?.trim()
				)
			) {
				return NextResponse.json(
					{
						success: false,
						message: 'At least 2 complete combo items are required',
					},
					{ status: 400 }
				);
			}
		}

		// Prepare update data
		const updateData = {};

		if (name !== undefined) updateData.name = name;
		if (slug !== undefined) updateData.slug = slug.toLowerCase().trim();

		if (shortDescription !== undefined)
			updateData.shortDescription = shortDescription;

		if (description !== undefined) updateData.description = description;

		if (items !== undefined) updateData.items = items;

		updateData.regularPrice = nextRegularPrice;
		updateData.offerPrice = nextOfferPrice;

		if (featureImg !== undefined) updateData.featureImg = featureImg;

		if (images !== undefined) updateData.images = images;

		if (stock !== undefined) updateData.stock = Number(stock);

		updateData.startDate = nextStartDate;
		updateData.endDate = nextEndDate;

		if (isActive !== undefined) updateData.isActive = isActive;

		if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

		if (priority !== undefined) updateData.priority = Number(priority);

		if (seoTitle !== undefined) updateData.seoTitle = seoTitle;

		if (seoDescription !== undefined)
			updateData.seoDescription = seoDescription;

		if (keywords !== undefined) {
			updateData.keywords = Array.isArray(keywords) ? keywords : [];
		}

		// Update document and run document validators
		existingOffer.set(updateData);

		const updatedOffer = await existingOffer.save();

		return NextResponse.json(
			{
				success: true,
				message: 'Combo offer updated successfully',
				offer: updatedOffer,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('UPDATE OFFER ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Failed to update offer',
			},
			{
				status: error.name === 'ValidationError' ? 400 : 500,
			}
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
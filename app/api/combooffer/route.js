import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/dbConnect';
import ComboOffer from '@/models/ComboOffer';


async function requireAdmin() {
	// Integrate your project's NextAuth/session-based admin check.
	// Return the authenticated admin when authorized.
	// Otherwise throw an error or return an unauthorized response.
	throw new Error('Server-side admin authorization is not configured');
}

function errorResponse(message, status = 400) {
	return NextResponse.json({ success: false, message }, { status });
}

function validateOffer(body) {
	const {
		name,
		slug,
		items,
		regularPrice,
		offerPrice,
		featureImg,
		startDate,
		endDate,
		stock,
		priority,
	} = body;

	if (typeof name !== 'string' || !name.trim()) {
		return 'Offer name is required';
	}

	if (typeof slug !== 'string' || !slug.trim()) {
		return 'Slug is required';
	}

	if (
		!Array.isArray(items) ||
		items.length < 2 ||
		items.some(
			(item) =>
				!item ||
				typeof item.name !== 'string' ||
				!item.name.trim() ||
				typeof item.quantity !== 'string' ||
				!item.quantity.trim()
		)
	) {
		return 'At least 2 complete combo items are required';
	}

	if (
		regularPrice === '' ||
		regularPrice === null ||
		regularPrice === undefined ||
		!Number.isFinite(Number(regularPrice)) ||
		Number(regularPrice) <= 0
	) {
		return 'Regular price must be greater than zero';
	}

	if (
		offerPrice === '' ||
		offerPrice === null ||
		offerPrice === undefined ||
		!Number.isFinite(Number(offerPrice)) ||
		Number(offerPrice) < 0
	) {
		return 'Enter a valid offer price';
	}

	if (Number(offerPrice) > Number(regularPrice)) {
		return 'Offer price cannot exceed regular price';
	}

	if (typeof featureImg !== 'string' || !featureImg.trim()) {
		return 'Feature image is required';
	}

	if (!startDate || !endDate) {
		return 'Start date and end date are required';
	}

	const start = new Date(startDate);
	const end = new Date(endDate);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return 'Invalid offer dates';
	}

	if (end <= start) {
		return 'End date must be after start date';
	}

	if (
		stock !== undefined &&
		(!Number.isInteger(Number(stock)) || Number(stock) < 0)
	) {
		return 'Stock must be a non-negative whole number';
	}

	if (priority !== undefined && !Number.isInteger(Number(priority))) {
		return 'Priority must be a whole number';
	}

	return null;
}

function normalizeOffer(body) {
	return {
		name: body.name.trim(),
		slug: body.slug.trim().toLowerCase(),
		shortDescription: body.shortDescription || '',
		description: body.description || '',

		items: body.items.map((item) => ({
			name: item.name.trim(),
			quantity: item.quantity.trim(),
		})),

		regularPrice: Number(body.regularPrice),
		offerPrice: Number(body.offerPrice),

		featureImg: body.featureImg.trim(),
		images: Array.isArray(body.images)
			? body.images.filter((image) => typeof image === 'string')
			: [],

		stock: Number(body.stock ?? 0),

		startDate: new Date(body.startDate),
		endDate: new Date(body.endDate),

		isActive: body.isActive ?? true,
		isFeatured: body.isFeatured ?? false,
		priority: Number(body.priority ?? 0),

		seoTitle: body.seoTitle || '',
		seoDescription: body.seoDescription || '',

		keywords: Array.isArray(body.keywords)
			? body.keywords
					.filter((keyword) => typeof keyword === 'string')
					.map((keyword) => keyword.trim())
					.filter(Boolean)
			: [],
	};
}

// GET /api/offers
// GET /api/offers?featured=true
// GET /api/offers?admin=true (admin only)
export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		
		const featured = searchParams.get('featured') === 'true';
		
		const filter = {};


		if (featured) {
			filter.isFeatured = true;
		}

		const offers = await ComboOffer.find(filter)
			.sort({ priority: -1, createdAt: -1 })
			.lean();

		return NextResponse.json({
			success: true,
			count: offers.length,
			offers,
		});
	} catch (error) {
		console.error('GET OFFERS ERROR:', error);

		if (
			error.message ===
			'Server-side admin authorization is not configured'
		) {
			return errorResponse('Admin authorization must be configured', 500);
		}

		return errorResponse('Failed to fetch offers', 500);
	}
}

// POST /api/offers
export async function POST(request) {
	try {
		
		await connectDB();

		let body;

		try {
			body = await request.json();
		} catch {
			return errorResponse('Invalid JSON request body');
		}

		const validationError = validateOffer(body);

		if (validationError) {
			return errorResponse(validationError);
		}

		const payload = normalizeOffer(body);

		const existing = await ComboOffer.findOne({
			slug: payload.slug,
		});

		if (existing) {
			return errorResponse('This slug already exists', 409);
		}

		const offer = await ComboOffer.create(payload);

		return NextResponse.json(
			{
				success: true,
				message: 'Combo offer created successfully',
				offer,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('CREATE OFFER ERROR:', error.message);

		if (
			error.message ===
			'Server-side admin authorization is not configured'
		) {
			return errorResponse('Admin authorization must be configured', 500);
		}

		if (error.code === 11000) {
			return errorResponse('This slug already exists', 409);
		}

		if (error.name === 'ValidationError') {
			return errorResponse(error.message);
		}

		return errorResponse('Failed to create offer', 500);
	}
}

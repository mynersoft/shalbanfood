import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ShippingCost from '@/models/ShippingCost';
import { checkAuthRole } from '@/lib/checkAuthRole';

async function authorize() {
	const { authenticated, isAdmin } = await checkAuthRole();

	if (!authenticated) {
		return NextResponse.json(
			{ success: false, message: 'Unauthorized' },
			{ status: 401 }
		);
	}

	if (!isAdmin) {
		return NextResponse.json(
			{ success: false, message: 'Forbidden' },
			{ status: 403 }
		);
	}

	return null;
}


function validateSettings(body) {
	if (
		!Array.isArray(body.districtRates) ||
		!Number.isInteger(Number(body.defaultCharge)) ||
		Number(body.defaultCharge) < 0 ||
		!Number.isInteger(Number(body.freeDeliveryMinimum)) ||
		Number(body.freeDeliveryMinimum) < 0 ||
		typeof body.freeDeliveryEnabled !== 'boolean'
	) {
		return false;
	}

	const districts = new Set();

	for (const rate of body.districtRates) {
		const district = String(rate.district || '').trim();
		const key = district.toLocaleLowerCase('bn-BD').replace(/\s+/g, '');
		const charge = Number(rate.charge);

		if (
			!district ||
			!Number.isInteger(charge) ||
			charge < 0 ||
			charge > 1000000 ||
			districts.has(key)
		) {
			return false;
		}

		districts.add(key);
	}

	return true;
}






export async function GET() {
	try {
		const denied = await authorize();
		if (denied) return denied;

		await connectDB();

		const data = await ShippingCost.findOne().lean();

		return NextResponse.json({
			success: true,
			data,
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Failed to load shipping settings' },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const denied = await authorize();
		if (denied) return denied;

		await connectDB();

		const body = await request.json();

		if (!validateSettings(body)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid shipping settings' },
				{ status: 400 }
			);
		}

		const existing = await ShippingCost.findOne();

		if (existing) {
			return NextResponse.json(
				{ success: false, message: 'Shipping settings already exist' },
				{ status: 409 }
			);
		}

		const settings = await ShippingCost.create({
			districtRates: body.districtRates,
			defaultCharge: Number(body.defaultCharge),
			freeDeliveryEnabled: body.freeDeliveryEnabled,
			freeDeliveryMinimum: Number(body.freeDeliveryMinimum),
		});

		return NextResponse.json({ success: true, settings }, { status: 201 });
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Failed to create shipping settings' },
			{ status: 500 }
		);
	}
}

export async function PATCH(request) {
	try {
		const denied = await authorize();
		if (denied) return denied;

		await connectDB();

		const body = await request.json();

		if (!validateSettings(body)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid shipping settings' },
				{ status: 400 }
			);
		}

		const settings = await ShippingCost.findOneAndUpdate(
			{},
			{
				$set: {
					districtRates: body.districtRates,
					defaultCharge: Number(body.defaultCharge),
					freeDeliveryEnabled: body.freeDeliveryEnabled,
					freeDeliveryMinimum: Number(body.freeDeliveryMinimum),
				},
			},
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		);

		return NextResponse.json({
			success: true,
			settings,
			message: 'Shipping settings updated',
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Failed to update shipping settings' },
			{ status: 500 }
		);
	}
}

export async function DELETE() {
	try {
		const denied = await authorize();
		if (denied) return denied;

		await connectDB();

		await ShippingCost.deleteMany({});

		return NextResponse.json({
			success: true,
			message: 'Shipping settings deleted',
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Failed to delete shipping settings' },
			{ status: 500 }
		);
	}
}

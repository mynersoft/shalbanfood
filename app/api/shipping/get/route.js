import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ShippingCost from '@/models/ShippingCost';

// get single charge

export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const district = searchParams.get('district')?.trim();

		const settings = await ShippingCost.findOne().lean();

		if (!settings) {
			return NextResponse.json(
				{
					success: false,
					message: 'Shipping settings not found',
				},
				{ status: 404 }
			);
		}

		// District অনুযায়ী charge খোঁজা
		if (district) {
			const normalizedDistrict = district
				.toLocaleLowerCase('en-US')
				.replace(/\s+/g, '');

			const districtRate = settings.districtRates.find(
				(item) =>
					String(item.district)
						.toLocaleLowerCase('en-US')
						.replace(/\s+/g, '') === normalizedDistrict
			);

			const charge = districtRate
				? Number(districtRate.charge)
				: Number(settings.defaultCharge);

			// Free delivery condition
			const subtotal = Number(searchParams.get('subtotal') || 0);

			const freeDelivery =
				settings.freeDeliveryEnabled &&
				subtotal >= Number(settings.freeDeliveryMinimum);

			return NextResponse.json({
				success: true,
				district,
				charge: freeDelivery ? 0 : charge,
				defaultCharge: Number(settings.defaultCharge),
				districtFound: Boolean(districtRate),
				freeDeliveryEnabled: settings.freeDeliveryEnabled,
				freeDeliveryMinimum: Number(settings.freeDeliveryMinimum),
				freeDelivery,
			});
		}

		// District না দিলে সব shipping settings ফেরত দেবে
		return NextResponse.json({
			success: true,
			settings,
		});
	} catch (error) {
		console.error('Shipping GET error:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to load shipping settings',
			},
			{ status: 500 }
		);
	}
}


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/dbConnect';
import ShippingSetting from '@/models/ShippingSetting';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
    districtRates: [
        { district: 'Dhaka', charge: 70 },
        { district: 'Tangail', charge: 100 },
        { district: 'রাজশাহী', charge: 120 },
    ],
    defaultCharge: 140,
    freeDeliveryEnabled: false,
    freeDeliveryMinimum: 2500,
};

function normalizeDistrict(value = '') {
    return String(value)
        .trim()
        .toLocaleLowerCase('bn-BD')
        .replace(/\s+/g, '');
}

function isValidAmount(value) {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 1000000
    );
}

async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'লগইন করুন' },
                { status: 401 }
            ),
        };
    }

    if (session.user.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return { authorized: true };
}

// GET: Read shipping settings
export async function GET() {
    try {
        const auth = await requireAdmin();

        if (!auth.authorized) {
            return auth.response;
        }

        await connectDB();

        let settings = await ShippingSetting.findOne().lean();

        if (!settings) {
            settings = await ShippingSetting.create(DEFAULT_SETTINGS);
            settings = settings.toObject();
        }

        return NextResponse.json({
            success: true,
            settings: {
                ...settings,
                districtRates:
                    settings.districtRates?.length
                        ? settings.districtRates
                        : DEFAULT_SETTINGS.districtRates,
            },
        });
    } catch (error) {
        console.error('Shipping settings GET error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Shipping settings লোড করা যায়নি',
            },
            { status: 500 }
        );
    }
}

// PATCH: Update shipping settings
export async function PATCH(request) {
    try {
        const auth = await requireAdmin();

        if (!auth.authorized) {
            return auth.response;
        }

        const body = await request.json();

        const {
            districtRates,
            defaultCharge,
            freeDeliveryEnabled,
            freeDeliveryMinimum,
        } = body;

        if (!Array.isArray(districtRates)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'districtRates অবশ্যই একটি array হতে হবে',
                },
                { status: 400 }
            );
        }

        if (districtRates.length > 64) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'সর্বোচ্চ ৬৪টি জেলার চার্জ যোগ করা যাবে',
                },
                { status: 400 }
            );
        }

        if (!isValidAmount(defaultCharge)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'সঠিক default delivery charge দিন',
                },
                { status: 400 }
            );
        }

        if (typeof freeDeliveryEnabled !== 'boolean') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'freeDeliveryEnabled true অথবা false হতে হবে',
                },
                { status: 400 }
            );
        }

        if (!isValidAmount(freeDeliveryMinimum)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'সঠিক free delivery minimum amount দিন',
                },
                { status: 400 }
            );
        }

        const seenDistricts = new Set();
        const sanitizedRates = [];

        for (const rate of districtRates) {
            if (
                !rate ||
                typeof rate.district !== 'string' ||
                !rate.district.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'প্রতিটি রেটের জন্য জেলা নির্বাচন করুন',
                    },
                    { status: 400 }
                );
            }

            if (!isValidAmount(rate.charge)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `${rate.district}: সঠিক delivery charge দিন`,
                    },
                    { status: 400 }
                );
            }

            const district = rate.district.trim();
            const key = normalizeDistrict(district);

            if (seenDistricts.has(key)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `${district} জেলার চার্জ একাধিকবার দেওয়া হয়েছে`,
                    },
                    { status: 400 }
                );
            }

            seenDistricts.add(key);

            sanitizedRates.push({
                district,
                charge: rate.charge,
            });
        }

        await connectDB();

        // Keep a single settings document for shipping configuration.
        let settings = await ShippingSetting.findOne();

        if (!settings) {
            settings = new ShippingSetting({
                ...DEFAULT_SETTINGS,
                districtRates: sanitizedRates,
                defaultCharge,
                freeDeliveryEnabled,
                freeDeliveryMinimum,
            });
        } else {
            settings.districtRates = sanitizedRates;
            settings.defaultCharge = defaultCharge;
            settings.freeDeliveryEnabled = freeDeliveryEnabled;
            settings.freeDeliveryMinimum = freeDeliveryMinimum;
        }

        await settings.save();

        return NextResponse.json({
            success: true,
            message: 'Shipping settings সফলভাবে আপডেট হয়েছে',
            settings: {
                _id: settings._id,
                districtRates: settings.districtRates,
                defaultCharge: settings.defaultCharge,
                freeDeliveryEnabled: settings.freeDeliveryEnabled,
                freeDeliveryMinimum: settings.freeDeliveryMinimum,
                updatedAt: settings.updatedAt,
            },
        });
    } catch (error) {
        console.error('Shipping settings PATCH error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Shipping settings আপডেট করা যায়নি',
            },
            { status: 500 }
        );
    }
}
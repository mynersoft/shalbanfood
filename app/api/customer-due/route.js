
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import CustomerDue from '@/models/CustomerDue';
import { checkAuthRole } from '@/lib/checkAuthRole';

async function authorizeAdmin() {
    const auth = await checkAuthRole();
    return Boolean(auth);
}

export async function GET() {
    try {
        if (!(await authorizeAdmin())) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const dues = await CustomerDue.find({})
            .sort({ updatedAt: -1 })
            .lean();

        const totalDue = dues.reduce(
            (sum, item) => sum + Number(item.totalDue || 0),
            0
        );

        return NextResponse.json({
            success: true,
            dues: dues.map((item) => ({
                _id: item._id.toString(),
                customerId: item.customerId
                    ? item.customerId.toString()
                    : null,
                customerName: item.customerName,
                totalDue: Number(item.totalDue || 0),
                isManual: !item.customerId,
                updatedAt: item.updatedAt,
            })),
            totalDue,
        });
    } catch (error) {
        console.error('Get customer dues error:', error);

        return NextResponse.json(
            { success: false, message: 'বকেয়ার তালিকা লোড করা যায়নি।' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        if (!(await authorizeAdmin())) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const rawId =
            typeof body.customerId === 'string'
                ? body.customerId.trim()
                : '';

        const requestedName =
            typeof body.customerName === 'string'
                ? body.customerName.trim()
                : '';

        const amount = Number(body.totalDue);

        if (!requestedName) {
            return NextResponse.json(
                { success: false, message: 'কাস্টমারের নাম লিখুন।' },
                { status: 400 }
            );
        }

        if (
            body.totalDue === '' ||
            body.totalDue === null ||
            body.totalDue === undefined ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return NextResponse.json(
                { success: false, message: 'সঠিক বকেয়ার পরিমাণ দিন।' },
                { status: 400 }
            );
        }

        let due;

        // Registered User selected হলে তার ID দিয়ে save/update হবে
        if (rawId) {
            if (!mongoose.Types.ObjectId.isValid(rawId)) {
                return NextResponse.json(
                    { success: false, message: 'Customer ID সঠিক নয়।' },
                    { status: 400 }
                );
            }

            const user = await User.findById(rawId)
                .select('_id name')
                .lean();

            if (!user) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'কাস্টমার পাওয়া যায়নি। আবার সার্চ করে নামটি ম্যানুয়ালি যোগ করুন।',
                    },
                    { status: 404 }
                );
            }

            due = await CustomerDue.findOneAndUpdate(
                { customerId: user._id },
                {
                    $set: {
                        customerId: user._id,
                        customerName: user.name?.trim() || requestedName,
                        manualKey: null,
                        totalDue: amount,
                    },
                },
                { new: true, upsert: true, runValidators: true }
            );
        } else {
            // User পাওয়া না গেলে সার্চ বক্সের নামই manual customer হবে
            const manualName = requestedName;
            const manualKey = manualName.toLocaleLowerCase('en-US');

            due = await CustomerDue.findOneAndUpdate(
                { manualKey },
                {
                    $set: {
                        customerId: null,
                        customerName: manualName,
                        manualKey,
                        totalDue: amount,
                    },
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'কাস্টমারের বকেয়া সংরক্ষণ হয়েছে।',
            due: {
                _id: due._id.toString(),
                customerId: due.customerId
                    ? due.customerId.toString()
                    : null,
                customerName: due.customerName,
                totalDue: due.totalDue,
                isManual: !due.customerId,
            },
        });
    } catch (error) {
        console.error('Save customer due error:', error);

        // Concurrent requests / existing duplicate index
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'একই কাস্টমারের রেকর্ড একসঙ্গে পরিবর্তন হয়েছে। তালিকা রিফ্রেশ করে আবার চেষ্টা করুন।',
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'বকেয়া সংরক্ষণ করা যায়নি।' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Brand from '@/models/Brand';

// ===============================
// GET ALL BRANDS
// ===============================
export async function GET() {
    try {
        await connectDB();

        const brands = await Brand.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            brands,
        });
    } catch (error) {
        console.error('GET BRANDS ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch brands',
            },
            { status: 500 }
        );
    }
}

// ===============================
// CREATE BRAND
// ===============================
export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        const name = body?.name?.trim();

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Brand name is required',
                },
                { status: 400 }
            );
        }

        // Check duplicate
        const existingBrand = await Brand.findOne({
            name: { $regex: `^${name}$`, $options: 'i' },
        });

        if (existingBrand) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Brand already exists',
                },
                { status: 409 }
            );
        }

        const brand = await Brand.create({
            name,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Brand created successfully',
                brand,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST BRAND ERROR:', error);

        // Mongo duplicate key
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Brand already exists',
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create brand',
            },
            { status: 500 }
        );
    }
}
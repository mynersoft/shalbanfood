import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConnect';
import Brand from '@/models/Brand';

// ===============================
// PUT - UPDATE BRAND
// ===============================
export async function PUT(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid brand ID',
                },
                { status: 400 }
            );
        }

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

        // Check duplicate except current brand
        const existingBrand = await Brand.findOne({
            _id: { $ne: id },
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

        const brand = await Brand.findByIdAndUpdate(
            id,
            { name },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!brand) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Brand not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Brand updated successfully',
            brand,
        });
    } catch (error) {
        console.error('PUT BRAND ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update brand',
            },
            { status: 500 }
        );
    }
}

// ===============================
// DELETE BRAND
// ===============================
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid brand ID',
                },
                { status: 400 }
            );
        }

        const brand = await Brand.findByIdAndDelete(id);

        if (!brand) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Brand not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Brand deleted successfully',
            brand,
        });
    } catch (error) {
        console.error('DELETE BRAND ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete brand',
            },
            { status: 500 }
        );
    }
}
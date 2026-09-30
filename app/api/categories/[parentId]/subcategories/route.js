import { NextResponse } from 'next/server';

import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';

import Category from '@/models/Category';

// ========================================
// ADD SUBCATEGORY
// ========================================
export async function POST(
    req,
    { params }
) {
    try {
        await connectDB();

        const { parentId } = await params;

        if (
            !mongoose.Types.ObjectId.isValid(
                parentId
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Invalid parent category ID',
                },
                { status: 400 }
            );
        }

        const body =
            await req.json();

        const name =
            body?.name?.trim();

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Subcategory name is required',
                },
                { status: 400 }
            );
        }

        const category =
            await Category.findById(
                parentId
            );

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Parent category not found',
                },
                { status: 404 }
            );
        }

        const exists =
            category.subCategories.some(
                (item) =>
                    item.toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Subcategory already exists',
                },
                { status: 409 }
            );
        }

        category.subCategories.push(
            name
        );

        await category.save();

        return NextResponse.json({
            success: true,
            message:
                'Subcategory added successfully',
            category,
        });
    } catch (error) {
        console.error(
            'ADD SUBCATEGORY ERROR:',
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    'Failed to add subcategory',
            },
            { status: 500 }
        );
    }
}
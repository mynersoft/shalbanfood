import { NextResponse } from 'next/server';

import mongoose from 'mongoose';

import { connectDB } from '@/lib/dbConnect';

import Category from '@/models/Category';

// ========================================
// UPDATE CATEGORY
// ========================================
export async function PUT(
    req,
    { params }
) {
    try {
        await connectDB();

        const { id } = await params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Invalid category ID',
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
                        'Category name is required',
                },
                { status: 400 }
            );
        }

        const duplicate =
            await Category.findOne({
                _id: { $ne: id },
                name: {
                    $regex: `^${name}$`,
                    $options: 'i',
                },
            });

        if (duplicate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Category already exists',
                },
                { status: 409 }
            );
        }

        const category =
            await Category.findByIdAndUpdate(
                id,
                { name },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Category not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                'Category updated successfully',
            category,
        });
    } catch (error) {
        console.error(
            'UPDATE CATEGORY ERROR:',
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    'Failed to update category',
            },
            { status: 500 }
        );
    }
}

// ========================================
// DELETE CATEGORY
// ========================================
export async function DELETE(
    req,
    { params }
) {
    try {
        await connectDB();

        const { id } = await params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Invalid category ID',
                },
                { status: 400 }
            );
        }

        const category =
            await Category.findByIdAndDelete(
                id
            );

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Category not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                'Category deleted successfully',
            category,
        });
    } catch (error) {
        console.error(
            'DELETE CATEGORY ERROR:',
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    'Failed to delete category',
            },
            { status: 500 }
        );
    }
}
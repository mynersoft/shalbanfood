import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/dbConnect';

import Category from '@/models/Category';

// ========================================
// DELETE SUBCATEGORY
// ========================================
export async function DELETE(
    req,
    { params }
) {
    try {
        await connectDB();

        const { slug } = await params;

        const subCategory = decodeURIComponent(
            slug
        );

        if (!subCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Subcategory is required',
                },
                { status: 400 }
            );
        }

        const category =
            await Category.findOne({
                subCategories: subCategory,
            });

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Subcategory not found',
                },
                { status: 404 }
            );
        }

        category.subCategories =
            category.subCategories.filter(
                (item) =>
                    item !== subCategory
            );

        await category.save();

        return NextResponse.json({
            success: true,
            message:
                'Subcategory deleted successfully',
            category,
        });
    } catch (error) {
        console.error(
            'DELETE SUBCATEGORY ERROR:',
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    'Failed to delete subcategory',
            },
            { status: 500 }
        );
    }
}
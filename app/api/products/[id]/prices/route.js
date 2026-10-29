import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import { authOptions } from '@/lib/auth';

import Product from '@/models/Product';
import { connectDB } from '@/lib/dbConnect';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'admin') {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const body = await request.json();

        const { variantId } = body;

        if (!mongoose.isValidObjectId(variantId)) {
            return NextResponse.json(
                { message: 'Invalid variant ID' },
                { status: 400 }
            );
        }

        const prices = [
            body.buyPrice,
            body.regularPrice,
            body.sellPrice,
        ];

        if (
            prices.some(
                (price) =>
                    price === '' ||
                    price === null ||
                    price === undefined ||
                    !Number.isFinite(Number(price)) ||
                    Number(price) < 0
            )
        ) {
            return NextResponse.json(
                { message: 'সঠিক দাম লিখুন।' },
                { status: 400 }
            );
        }

        const buyPrice = Number(body.buyPrice);
        const regularPrice = Number(body.regularPrice);
        const sellPrice = Number(body.sellPrice);

        if (sellPrice > regularPrice) {
            return NextResponse.json(
                {
                    message:
                        'Sell Price, Regular Price-এর চেয়ে বেশি হতে পারবে না।',
                },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json(
                { message: 'Product পাওয়া যায়নি।' },
                { status: 404 }
            );
        }

        const variant = product.variants.id(variantId);

        if (!variant) {
            return NextResponse.json(
                { message: 'Variant পাওয়া যায়নি।' },
                { status: 404 }
            );
        }

        variant.buyPrice = buyPrice;
        variant.regularPrice = regularPrice;
        variant.sellPrice = sellPrice;

        await product.save();

        return NextResponse.json({
            message: 'দাম সফলভাবে Update হয়েছে।',
            variant: {
                _id: String(variant._id),
                buyPrice: variant.buyPrice,
                regularPrice: variant.regularPrice,
                sellPrice: variant.sellPrice,
                discount: Math.max(
                    0,
                    variant.regularPrice - variant.sellPrice
                ),
                discountPercentage:
                    variant.regularPrice > 0
                        ? Math.round(
                            ((variant.regularPrice -
                                variant.sellPrice) /
                                variant.regularPrice) *
                                100
                        )
                        : 0,
                profit: variant.sellPrice - variant.buyPrice,
            },
        });
    } catch (error) {
        console.error('Admin price update error:', error);

        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { message: 'দামের তথ্য যাচাই করা যায়নি।' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'দাম Update করা যায়নি।' },
            { status: 500 }
        );
    }
}
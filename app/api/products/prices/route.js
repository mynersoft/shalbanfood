
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/dbConnect';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

async function isAdmin() {
    const session = await getServerSession(authOptions);

    return session?.user?.role === 'admin';
}

export async function GET(request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);

        const search = searchParams.get('search')?.trim() || '';
        const page = Math.max(
            1,
            Number.parseInt(searchParams.get('page') || '1', 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(
                1,
                Number.parseInt(searchParams.get('limit') || '10', 10) || 10
            )
        );

        const filter = search
            ? {
                name: {
                    $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                    $options: 'i',
                },
            }
            : {};

        const [products, total] = await Promise.all([
            Product.find(filter)
                .select('name variants.value variants.unit variants.buyPrice variants.regularPrice variants.sellPrice')
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        return NextResponse.json({
            products: products.map((product) => ({
                _id: String(product._id),
                name: product.name,
                variants: (product.variants || []).map((variant) => ({
                    _id: String(variant._id),
                    value: variant.value,
                    unit: variant.unit,
                    buyPrice: variant.buyPrice ?? 0,
                    regularPrice: variant.regularPrice,
                    sellPrice: variant.sellPrice,
                })),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin price list error:', error);

        return NextResponse.json(
            { message: 'পণ্যের তালিকা লোড করা যায়নি।' },
            { status: 500 }
        );
    }
}

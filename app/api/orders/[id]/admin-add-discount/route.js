import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import { checkAuthRole } from '@/lib/checkAuthRole';
import { connectDB } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

// PATCH: Update admin discount
export async function PATCH(request, { params }) {
    try {
       
        const { isAdmin } = await checkAuthRole();

        // Admin authorization
        if (!isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid order ID' },
                { status: 400 }
            );
        }

        const body = await request.json();

        const adminDiscount = Number(body.adminDiscount);

        const adminDiscountNote = String(
            body.adminDiscountNote || ''
        ).trim();

        if (
            !Number.isFinite(adminDiscount) ||
            adminDiscount < 0
        ) {
            return NextResponse.json(
                { success: false, message: 'Invalid discount amount' },
                { status: 400 }
            );
        }

        if (adminDiscountNote.length > 300) {
            return NextResponse.json(
                { success: false, message: 'Note is too long' },
                { status: 400 }
            );
        }
        

        await connectDB();

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Do not modify paid orders without refund/payment adjustment
        if (order.payment?.status === 'paid') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Paid order cannot be modified directly.',
                },
                { status: 400 }
            );
        }

        if (['cancelled', 'return'].includes(order.status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cannot modify cancelled or returned order.',
                },
                { status: 400 }
            );
        }

        // Maximum available discount
        const maxDiscount = Math.max(
            0,
            Number(order.subtotal) -
            Number(order.discount || 0) +
            Number(order.shippingFee || 0)
        );

        if (adminDiscount > maxDiscount) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Maximum discount is ৳${maxDiscount}`,
                },
                { status: 400 }
            );
        }

        // Final calculation
        const finalTotal = Math.max(
            0,
            Number(order.subtotal) -
            Number(order.discount || 0) +
            Number(order.shippingFee || 0) -
            adminDiscount
        );

        // Update order
        order.adminDiscount = adminDiscount;
        order.adminDiscountNote = adminDiscountNote;
        order.adminDiscountUpdatedAt = new Date();
        order.total = finalTotal;

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Admin discount updated successfully',
            order: {
                _id: order._id,
                subtotal: order.subtotal,
                discount: order.discount,
                adminDiscount: order.adminDiscount,
                adminDiscountNote: order.adminDiscountNote,
                shippingFee: order.shippingFee,
                total: order.total,
                adminDiscountUpdatedAt: order.adminDiscountUpdatedAt,
            },
        });

    } catch (error) {
        console.error('Admin Discount Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong',
            },
            { status: 500 }
        );
    }
}
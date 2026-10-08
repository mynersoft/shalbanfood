import { NextResponse } from "next/server";

import mongoose from "mongoose";

import {connectDB} from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // --------------------------------
        // Validate ID
        // --------------------------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid customer ID",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------
        // Find customer
        // --------------------------------
        const customer = await User.findOne({
            _id: id,
            role: "user",
        })
            .select(
                "_id name email phone role createdAt updatedAt"
            )
            .lean();

        if (!customer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer not found",
                },
                {
                    status: 404,
                }
            );
        }

        // --------------------------------
        // Get customer orders
        // --------------------------------
        const orders = await Order.find({
            userId: id,
        })
            .select(
                "invoiceNo subtotal total shippingFee discount status payment shippingAddress orderItems createdAt updatedAt"
            )
            .sort({
                createdAt: -1,
            })
            .lean();

        // --------------------------------
        // Exclude cancelled orders
        // --------------------------------
        const validOrders = orders.filter(
            (order) => order.status !== "cancelled"
        );

        // --------------------------------
        // Calculate statistics
        // --------------------------------
        const totalOrders = validOrders.length;

        const totalSpent = validOrders.reduce(
            (sum, order) =>
                sum + Number(order.total || 0),
            0
        );

        const lastOrder =
            validOrders.length > 0
                ? validOrders[0].createdAt
                : null;

        return NextResponse.json({
            success: true,

            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone || "",
                role: customer.role,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,

                totalOrders,

                totalSpent,

                lastOrder,

                status:
                    totalOrders > 0
                        ? "active"
                        : "new",
            },

            orders,
        });
    } catch (error) {
        console.error(
            "GET /api/customers/[id] error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch customer",
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
import { NextResponse } from "next/server";

import {connectDB} from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() || "";

        const page = Math.max(
            Number(searchParams.get("page")) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(searchParams.get("limit")) || 10,
                1
            ),
            100
        );

        const skip = (page - 1) * limit;

        // --------------------------------
        // Customer filter
        // --------------------------------
        const userFilter = {
            role: "user",
        };

        if (search) {
            const regex = new RegExp(search, "i");

            userFilter.$or = [
                { name: regex },
                { email: regex },
                { phone: regex },
            ];
        }

        // --------------------------------
        // Get users
        // --------------------------------
        const [users, totalCustomers] = await Promise.all([
            User.find(userFilter)
                .select("_id name email phone role createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            User.countDocuments(userFilter),
        ]);

        // --------------------------------
        // User IDs
        // --------------------------------
        const userIds = users.map((user) => user._id);

        // --------------------------------
        // Order statistics
        // --------------------------------
        const orderStats = await Order.aggregate([
            {
                $match: {
                    userId: {
                        $in: userIds,
                    },

                    // Cancelled order বাদ
                    status: {
                        $ne: "cancelled",
                    },
                },
            },

            {
                $group: {
                    _id: "$userId",

                    totalOrders: {
                        $sum: 1,
                    },

                    totalSpent: {
                        $sum: "$total",
                    },

                    lastOrder: {
                        $max: "$createdAt",
                    },
                },
            },
        ]);

        // --------------------------------
        // Create Map
        // --------------------------------
        const statsMap = new Map();

        orderStats.forEach((item) => {
            statsMap.set(item._id.toString(), item);
        });

        // --------------------------------
        // Combine User + Order data
        // --------------------------------
        const customers = users.map((user) => {
            const stats = statsMap.get(
                user._id.toString()
            );

            return {
                _id: user._id.toString(),

                name: user.name || "N/A",

                phone: user.phone || "",

                email: user.email || "",

                role: user.role,

                totalOrders: stats?.totalOrders || 0,

                totalSpent: stats?.totalSpent || 0,

                lastOrder: stats?.lastOrder || null,

                createdAt: user.createdAt,

                // আপনার User schema-তে status নেই
                // তাই order/customer activity থেকে status দেখানো হচ্ছে
                status:
                    stats?.totalOrders > 0
                        ? "active"
                        : "new",
            };
        });

        return NextResponse.json({
            success: true,

            customers,

            pagination: {
                page,
                limit,
                totalCustomers,

                totalPages: Math.ceil(
                    totalCustomers / limit
                ),
            },
        });
    } catch (error) {
        console.error(
            "GET /api/customers error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch customers",
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
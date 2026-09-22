// app/api/service/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import ServiceRecords from "@/models/ServiceRecords";

/**
 * GET /api/service?type=daily|weekly|monthly&page=1&limit=20
 */


export async function GET(req) {
    await connectDB();

    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "daily";
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        const now = new Date();
        let start, end;

        // --------- DAILY ----------
        if (type === "daily") {
            start = new Date(now);
            start.setHours(0, 0, 0, 0);

            end = new Date(now);
            end.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: start, $lte: end };
        }

        // --------- WEEKLY ----------
        else if (type === "weekly") {
            const day = now.getDay();
            start = new Date(now);
            start.setDate(now.getDate() - day);
            start.setHours(0, 0, 0, 0);

            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: start, $lte: end };
        }

        // --------- MONTHLY ----------
        else if (type === "monthly") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );

            filter.createdAt = { $gte: start, $lte: end };
        }

        // ====================================================
        //  🚀 FETCH PAGINATED DATA + TOTAL COUNT
        // ====================================================
        const [records, total] = await Promise.all([
            ServiceRecords.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            ServiceRecords.countDocuments(filter),
        ]);

        // ====================================================
        // 🚀 CURRENT MONTH STATS
        // ====================================================
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        const currentMonthFilter = {
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        };

        const [currentMonthTotal, currentMonthBillSum] = await Promise.all([
            ServiceRecords.countDocuments(currentMonthFilter),
            ServiceRecords.aggregate([
                { $match: currentMonthFilter },
                { $group: { _id: null, totalBill: { $sum: "$billAmount" } } },
            ]),
        ]);

        const currentMonthBill = currentMonthBillSum[0]?.totalBill || 0;

        // ====================================================
        // 🚀 LAST MONTH STATS
        // ====================================================
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999
        );

        const lastMonthFilter = {
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        };

        const [lastMonthTotal, lastMonthBillSum] = await Promise.all([
            ServiceRecords.countDocuments(lastMonthFilter),
            ServiceRecords.aggregate([
                { $match: lastMonthFilter },
                { $group: { _id: null, totalBill: { $sum: "$billAmount" } } },
            ]),
        ]);

        const lastMonthBill = lastMonthBillSum[0]?.totalBill || 0;

        // ====================================================
        // 🚀 FINAL RESPONSE (As you requested)
        // ====================================================

        return NextResponse.json(
            {
                success: true,
                list: records,

                // NEW
                totalServices: currentMonthTotal,
                totalBill: currentMonthBill,

                lastMonth: {
                    totalServices: lastMonthTotal,
                    totalBill: lastMonthBill,
                    dateRange: {
                        start: lastMonthStart,
                        end: lastMonthEnd,
                    },
                },

                page,
                limit,
                total,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("GET /api/service error:", err);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
	await connectDB();
	try {
		const body = await req.json();
		const {
			servicingeDevice,
			customerName,
			phone,
			billAmount,
			warranty,
			notes,
		} = body;

		if (!servicingeDevice) {
			return NextResponse.json(
				{ success: false, message: "servicingeDevice is required" },
				{ status: 400 }
			);
		}

		const rec = await ServiceRecords.create({
			customerName,
			phone,
			servicingeDevice,
			billAmount: Number(billAmount) || 0,
			warranty: warranty || { hasWarranty: false, warrantyMonths: 0 },
			notes: notes || "",
		});

		return NextResponse.json(
			{ success: true, record: rec },
			{ status: 201 }
		);
	} catch (err) {
		console.error("POST /api/service error:", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}

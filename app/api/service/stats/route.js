// app/api/service/stats/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import ServiceRecords from "@/models/ServiceRecords";

function getMonthRange(year, month0) {
	// month0: 0-11
	const start = new Date(year, month0, 1, 0, 0, 0, 0);
	const end = new Date(year, month0 + 1, 0, 23, 59, 59, 999);
	return { start, end };
}

export async function GET(req) {
	try {
		if (mongoose.connection.readyState === 0) await connectDB();

		const url = new URL(req.url);
		const type = url.searchParams.get("type") || "daily"; // daily | monthly | monthlyBreakdown
		if (type === "daily") {
			const dateParam = url.searchParams.get("date"); // YYYY-MM-DD
			const date = dateParam ? new Date(dateParam) : new Date();
			const start = new Date(date);
			start.setHours(0, 0, 0, 0);
			const end = new Date(date);
			end.setHours(23, 59, 59, 999);

			const agg = await ServiceRecords.aggregate([
				{ $match: { createdAt: { $gte: start, $lte: end } } },
				{
					$group: {
						_id: null,
						totalCount: { $sum: 1 },
						totalBills: { $sum: "$billAmount" },
					},
				},
			]);

			const res = agg[0] || { totalCount: 0, totalBills: 0 };
			return NextResponse.json({
				success: true,
				type: "daily",
				date: start.toISOString(),
				totalCount: res.totalCount,
				totalBills: res.totalBills,
			});
		} else if (type === "weekly") {
			const now = new Date();

			// সপ্তাহের শুরু (Saturday অথবা Sunday ধরতে চাইলে adjust করতে পারেন)
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1);
			const start = new Date(now.setDate(diff));
			start.setHours(0, 0, 0, 0);

			const end = new Date(start);
			end.setDate(start.getDate() + 6);
			end.setHours(23, 59, 59, 999);

			const agg = await ServiceRecords.aggregate([
				{ $match: { createdAt: { $gte: start, $lte: end } } },
				{
					$group: {
						_id: null,
						totalCount: { $sum: 1 },
						totalBills: { $sum: "$billAmount" },
					},
				},
			]);

			const res = agg[0] || { totalCount: 0, totalBills: 0 };

			return NextResponse.json({
				success: true,
				type: "weekly",
				weekStart: start.toISOString(),
				weekEnd: end.toISOString(),
				totalCount: res.totalCount,
				totalBills: res.totalBills,
			});
		} else if (type === "monthly") {
			const yearParam = Number(url.searchParams.get("year"));
			const monthParam = Number(url.searchParams.get("month")); // 1-12
			const now = new Date();
			const year = !isNaN(yearParam) ? yearParam : now.getFullYear();
			const month0 = !isNaN(monthParam) ? monthParam - 1 : now.getMonth();

			const { start, end } = getMonthRange(year, month0);

			const agg = await ServiceRecords.aggregate([
				{ $match: { createdAt: { $gte: start, $lte: end } } },
				{
					$group: {
						_id: null,
						totalCount: { $sum: 1 },
						totalBills: { $sum: "$billAmount" },
					},
				},
			]);

			const res = agg[0] || { totalCount: 0, totalBills: 0 };
			return NextResponse.json({
				success: true,
				type: "monthly",
				year,
				month: month0 + 1,
				totalCount: res.totalCount,
				totalBills: res.totalBills,
			});
		} else if (type === "monthlyBreakdown") {
			const yearParam = Number(url.searchParams.get("year"));
			const monthParam = Number(url.searchParams.get("month")); // 1-12
			const now = new Date();
			const year = !isNaN(yearParam) ? yearParam : now.getFullYear();
			const month0 = !isNaN(monthParam) ? monthParam - 1 : now.getMonth();

			const { start, end } = getMonthRange(year, month0);

			const agg = await ServiceRecords.aggregate([
				{ $match: { createdAt: { $gte: start, $lte: end } } },
				{
					$group: {
						_id: { day: { $dayOfMonth: "$createdAt" } },
						count: { $sum: 1 },
						totalBills: { $sum: "$billAmount" },
					},
				},
				{ $sort: { "_id.day": 1 } },
			]);

			// map to days
			const daysInMonth = end.getDate();
			const map = new Map();
			agg.forEach((r) =>
				map.set(r._id.day, {
					day: r._id.day,
					count: r.count,
					totalBills: r.totalBills,
				})
			);
			const breakdown = [];
			for (let d = 1; d <= daysInMonth; d++) {
				breakdown.push(
					map.get(d) || { day: d, count: 0, totalBills: 0 }
				);
			}

			return NextResponse.json({
				success: true,
				year,
				month: month0 + 1,
				breakdown,
			});
		}

		return NextResponse.json(
			{ success: false, message: "Invalid type" },
			{ status: 400 }
		);
	} catch (err) {
		console.error("GET /api/service/stats error:", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}

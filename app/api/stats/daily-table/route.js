// app/api/stats/daily-table/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import SaleProfit from "@/models/SaleProfit";
import ServiceRecords from "@/models/ServiceRecords";

export async function GET(req) {
	await connectDB();
	try {
		const url = new URL(req.url);
		const type = url.searchParams.get("type") || "monthly"; // daily | weekly | monthly
		const year =
			parseInt(url.searchParams.get("year")) || new Date().getFullYear();
		const month =
			parseInt(url.searchParams.get("month")) ||
			new Date().getMonth() + 1;

		let start, end;

		if (type === "daily" || type === "monthly") {
			start = new Date(year, month - 1, 1, 0, 0, 0, 0);
			end = new Date(year, month, 0, 23, 59, 59, 999);
		} else if (type === "weekly") {
			const now = new Date();
			const day = now.getDay();
			start = new Date(now);
			start.setDate(now.getDate() - day); // Sunday
			start.setHours(0, 0, 0, 0);
			end = new Date(start);
			end.setDate(start.getDate() + 6); // Saturday
			end.setHours(23, 59, 59, 999);
		}

		const daysInMonth = end.getDate();

		// 1) Sale aggregation
		const saleAgg = await SaleProfit.aggregate([
			{ $match: { createdAt: { $gte: start, $lte: end } } },
			{
				$group: {
					_id: { day: { $dayOfMonth: "$createdAt" } },
					totalSale: { $sum: "$totalSale" },
					totalProfit: { $sum: "$profit" },
				},
			},
		]);
		const saleMap = new Map();
		for (const s of saleAgg) {
			saleMap.set(s._id.day, {
				sale: s.totalSale,
				profit: s.totalProfit,
			});
		}

		// 2) Service aggregation
		const svcAgg = await ServiceRecords.aggregate([
			{ $match: { createdAt: { $gte: start, $lte: end } } },
			{
				$group: {
					_id: { day: { $dayOfMonth: "$createdAt" } },
					totalBill: { $sum: "$billAmount" },
				},
			},
		]);
		const svcMap = new Map();
		for (const s of svcAgg) svcMap.set(s._id.day, s.totalBill);

		// 3) Build table
		const table = [];
		for (let d = 1; d <= daysInMonth; d++) {
			table.push({
				day: d,
				sale: saleMap.get(d)?.sale || 0,
				profit: saleMap.get(d)?.profit || 0,
				serviceBill: svcMap.get(d) || 0,
			});
		}

		return NextResponse.json({ success: true, year, month, table });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}

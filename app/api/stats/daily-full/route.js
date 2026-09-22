// app/api/stats/daily-full/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import SaleProfit from "@/models/SaleProfit";
import ServiceRecords from "@/models/ServiceRecords";

export async function GET(req) {
	try {
		await connectDB();

		const url = new URL(req.url);
		const year =
			Number(url.searchParams.get("year")) || new Date().getFullYear();
		const month =
			(Number(url.searchParams.get("month")) ||
				new Date().getMonth() + 1) - 1;

		const start = new Date(year, month, 1, 0, 0, 0, 0);
		const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
		const daysInMonth = end.getDate();

		// --------------------------
		// 1) SALE + PROFIT BREAKDOWN
		// --------------------------
		const saleAgg = await SaleProfit.aggregate([
			{
				$match: { createdAt: { $gte: start, $lte: end } },
			},
			{
				$group: {
					_id: { day: { $dayOfMonth: "$createdAt" } },
					sale: { $sum: "$totalSale" },
					profit: { $sum: "$profit" },
				},
			},
		]);

		const saleMap = new Map();
		for (const row of saleAgg) {
			saleMap.set(row._id.day, {
				sale: row.sale,
				profit: row.profit,
			});
		}

		// --------------------------
		// 2) SERVICE BILL BREAKDOWN
		// --------------------------
		const serviceAgg = await ServiceRecords.aggregate([
			{
				$match: { createdAt: { $gte: start, $lte: end } },
			},
			{
				$group: {
					_id: { day: { $dayOfMonth: "$createdAt" } },
					serviceBill: { $sum: "$billAmount" },
				},
			},
		]);

		const serviceMap = new Map();
		for (const row of serviceAgg) {
			serviceMap.set(row._id.day, {
				serviceBill: row.serviceBill,
			});
		}

		// --------------------------
		// 3) MERGE & FILL DAYS 1–31
		// --------------------------
		const final = [];
		for (let d = 1; d <= daysInMonth; d++) {
			final.push({
				day: d,
				sale: saleMap.get(d)?.sale || 0,
				profit: saleMap.get(d)?.profit || 0,
				serviceBill: serviceMap.get(d)?.serviceBill || 0,
			});
		}

		return NextResponse.json({
			success: true,
			year,
			month: month + 1,
			days: final,
		});
	} catch (err) {
		console.error("FULL DAILY ERROR:", err);
		return NextResponse.json(
			{ success: false, message: "Server Error" },
			{ status: 500 }
		);
	}
}

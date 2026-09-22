// app/api/stats/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import SaleProfit from "@/models/SaleProfit";


function dayRange(date = new Date()) {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const end = new Date(date);
	end.setHours(23, 59, 59, 999);
	return { start, end };
}

/**
 * GET /api/saleprofit?type=daily
 * GET /api/saleprofit?type=monthly
 **/
export async function GET(req) {
	try {
		await connectDB();

		const url = new URL(req.url);
		const type = url.searchParams.get("type") || "daily";

		if (type === "daily") {
			// optional date param (YYYY-MM-DD)
			const dateParam = url.searchParams.get("date");
			const date = dateParam ? new Date(dateParam) : new Date();
			const { start, end } = dayRange(date);

			// aggregate totalSale and totalProfit for that day
			const agg = await SaleProfit.aggregate([
				{
					$match: {
						createdAt: { $gte: start, $lte: end },
					},
				},
				{
					$group: {
						_id: null,
						totalSale: { $sum: "$totalSale" },
						totalProfit: { $sum: "$profit" },
						totalQty: { $sum: "$qty" },
					},
				},
			]);

			const result = agg[0] || {
				totalSale: 0,
				totalProfit: 0,
				totalQty: 0,
			};

			return NextResponse.json({
				success: true,
				type: "daily",
				date: start.toISOString(),
				totalSale: result.totalSale,
				totalProfit: result.totalProfit,
				totalQty: result.totalQty,
			});
		} else if (type === "monthly") {
			// optional year & month (month 1-12). Defaults to current year/month
			const yearParam = Number(url.searchParams.get("year"));
			const monthParam = Number(url.searchParams.get("month")); // 1-12
			const now = new Date();
			const year = !isNaN(yearParam) ? yearParam : now.getFullYear();
			const month = !isNaN(monthParam) ? monthParam - 1 : now.getMonth(); // Date month is 0-index

			const start = new Date(year, month, 1, 0, 0, 0, 0);
			const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month

			// simple totals for the month
			const agg = await SaleProfit.aggregate([
				{
					$match: {
						createdAt: { $gte: start, $lte: end },
					},
				},
				{
					$group: {
						_id: null,
						totalSale: { $sum: "$totalSale" },
						totalProfit: { $sum: "$profit" },
						totalQty: { $sum: "$qty" },
					},
				},
			]);

			const result = agg[0] || {
				totalSale: 0,
				totalProfit: 0,
				totalQty: 0,
			};

			return NextResponse.json({
				success: true,
				type: "monthly",
				year,
				month: month + 1,
				totalSale: result.totalSale,
				totalProfit: result.totalProfit,
				totalQty: result.totalQty,
			});
		} else if (type === "monthlyBreakdown") {
			// returns per-day totals for a month (useful for charts)
			const yearParam = Number(url.searchParams.get("year"));
			const monthParam = Number(url.searchParams.get("month")); // 1-12
			const now = new Date();
			const year = !isNaN(yearParam) ? yearParam : now.getFullYear();
			const month = !isNaN(monthParam) ? monthParam - 1 : now.getMonth();

			const start = new Date(year, month, 1, 0, 0, 0, 0);
			const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

			// group by day (server-local day)
			const agg = await SaleProfit.aggregate([
				{
					$match: {
						createdAt: { $gte: start, $lte: end },
					},
				},
				{
					$group: {
						_id: {
							year: { $year: "$createdAt" },
							month: { $month: "$createdAt" },
							day: { $dayOfMonth: "$createdAt" },
						},
						totalSale: { $sum: "$totalSale" },
						totalProfit: { $sum: "$profit" },
					},
				},
				{
					$sort: { "_id.day": 1 },
				},
			]);

			// map to array of days in month with zeros for missing days
			const daysInMonth = end.getDate();
			const map = new Map();
			for (const row of agg) {
				map.set(row._id.day, {
					day: row._id.day,
					totalSale: row.totalSale,
					totalProfit: row.totalProfit,
				});
			}
			const breakdown = [];
			for (let d = 1; d <= daysInMonth; d++) {
				if (map.has(d)) breakdown.push(map.get(d));
				else breakdown.push({ day: d, totalSale: 0, totalProfit: 0 });
			}

			return NextResponse.json({
				success: true,
				year,
				month: month + 1,
				breakdown,
			});
		}

		return NextResponse.json(
			{ success: false, message: "Invalid type" },
			{ status: 400 }
		);
	} catch (err) {
		console.error("STATS ERROR:", err);
		return NextResponse.json(
			{ success: false, message: "Server error" },
			{ status: 500 }
		);
	}
}

// app/api/stats/monthly/route.js
import { connectDB } from "@/lib/dbConnect";
import SaleProfit from "@/models/SaleProfit";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();

		const now = new Date();

		// === Current Month Range ===
		const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const currentEnd = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59
		);

		// === Previous Month Range ===
		const prevMonth = now.getMonth() - 1;
		const prevYear =
			prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
		const correctedPrevMonth = (prevMonth + 12) % 12;

		const prevStart = new Date(prevYear, correctedPrevMonth, 1);
		const prevEnd = new Date(
			prevYear,
			correctedPrevMonth + 1,
			0,
			23,
			59,
			59
		);

		// === Fetch Data ===
		const currentSales = await SaleProfit.find({
			createdAt: { $gte: currentStart, $lte: currentEnd },
		});

		const previousSales = await SaleProfit.find({
			createdAt: { $gte: prevStart, $lte: prevEnd },
		});

		// === Current Month Stats ===
		const monthlySale = currentSales.reduce(
			(sum, s) => sum + s.totalSale,
			0
		);
		const monthlyProfit = currentSales.reduce(
			(sum, s) => sum + s.profit,
			0
		);

		// === Previous Month Stats ===
		const prevMonthlySale = previousSales.reduce(
			(sum, s) => sum + s.totalSale,
			0
		);
		const prevMonthlyProfit = previousSales.reduce(
			(sum, s) => sum + s.profit,
			0
		);

		return NextResponse.json({
			success: true,
			monthlySale,
			monthlyProfit,
			prevMonthlySale,
			prevMonthlyProfit,
		});
	} catch (err) {
		console.log(err);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}

// // app/api/stats/daily/route.js
// import { connectDB } from "@/lib/dbConnect";
// import SaleProfit from "@/models/SaleProfit";
// import { NextResponse } from "next/server";

// export async function GET() {
// 	try {
// 		await connectDB();

// 		const start = new Date();
// 		start.setHours(0, 0, 0, 0);

// 		const end = new Date();
// 		end.setHours(23, 59, 59, 999);

// 		const sales = await SaleProfit.find({
// 			createdAt: { $gte: start, $lte: end },
// 		});

// 		const dailySale = sales.reduce((sum, s) => sum + s.totalSale, 0);
// 		const dailyProfit = sales.reduce((sum, s) => sum + s.profit, 0);

// 		return NextResponse.json({
// 			success: true,
// 			dailySale,
// 			dailyProfit,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 		return NextResponse.json({ success: false }, { status: 500 });
// 	}
// }



import { connectDB } from "@/lib/dbConnect";
import SaleProfit from "@/models/SaleProfit";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();

		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();

		const start = new Date(year, month, 1);
		const end = new Date(year, month + 1, 0, 23, 59, 59);

		const sales = await SaleProfit.find({
			createdAt: { $gte: start, $lte: end },
		});

		// Total days in current month
		const totalDays = new Date(year, month + 1, 0).getDate();

		// Initialize array: 1-31
		const dailyData = Array.from({ length: totalDays }, (_, i) => ({
			day: i + 1,
			sale: 0,
			profit: 0,
		}));

		// Group sales by date
		sales.forEach((entry) => {
			const day = new Date(entry.createdAt).getDate();
			dailyData[day - 1].sale += entry.totalSale;
			dailyData[day - 1].profit += entry.profit;
		});

		return NextResponse.json({
			success: true,
			data: dailyData,
		});
	} catch (err) {
		console.log("DAILY STATS ERROR:", err);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}

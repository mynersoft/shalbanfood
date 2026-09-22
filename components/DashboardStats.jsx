"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchDailyStats,
	fetchMonthlyStats,
	fetchMonthlyBreakdown,
} from "@/redux/saleprofitSlice";

export default function DashboardStats({ year, month }) {
	const dispatch = useDispatch();
	const { daily, monthly, breakdown, loading } = useSelector(
		(state) => state.saleprofit
	);

	useEffect(() => {
		dispatch(fetchDailyStats());
		dispatch(fetchMonthlyStats({ year, month }));
		dispatch(fetchMonthlyBreakdown({ year, month }));
	}, [dispatch, year, month]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
			<div className="bg-gray-800 p-4 rounded">
				<h3 className="text-sm text-gray-300">Daily Sale</h3>
				<p className="text-2xl font-bold">{daily.totalSale || 0} Tk</p>
				<h4 className="mt-3 text-sm text-gray-300">Daily Profit</h4>
				<p className="text-xl">{daily.totalProfit || 0} Tk</p>
			</div>

			<div className="bg-gray-800 p-4 rounded">
				<h3 className="text-sm text-gray-300">Monthly Sale</h3>
				<p className="text-2xl font-bold">
					{monthly.totalSale || 0} Tk
				</p>
				<h4 className="mt-3 text-sm text-gray-300">Monthly Profit</h4>
				<p className="text-xl">{monthly.totalProfit || 0} Tk</p>
			</div>

			{/* For charting, pass breakdown.data to your chart lib (Recharts / Chart.js) */}
			<div className="col-span-full mt-4">
				<h4 className="text-sm text-gray-300">
					Monthly Breakdown (per day)
				</h4>
				<pre className="text-xs bg-black/40 p-2 rounded">
					{JSON.stringify(breakdown.data, null, 2)}
				</pre>
			</div>
		</div>
	);
}

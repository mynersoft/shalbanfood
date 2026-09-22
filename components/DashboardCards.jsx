"use client";
import React from "react";

export default function DashboardCards({ data }) {
	// data: { todaySell, todayProfit, totalProducts }
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<div className="p-4 bg-white rounded shadow">
				<div className="text-sm">Today's Sales</div>
				<div className="text-2xl font-bold">
					{data.todaySell.toFixed(2)}
				</div>
			</div>
			<div className="p-4 bg-white rounded shadow">
				<div className="text-sm">Today's Profit</div>
				<div className="text-2xl font-bold">
					{data.todayProfit.toFixed(2)}
				</div>
			</div>
			<div className="p-4 bg-white rounded shadow">
				<div className="text-sm">Total Products</div>
				<div className="text-2xl font-bold">{data.totalProducts}</div>
			</div>
		</div>
	);
}

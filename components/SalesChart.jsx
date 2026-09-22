"use client";

import React from "react";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	Legend,
} from "recharts";

export default function SalesChart({ data }) {
	// data = [{ date: '2025-10-01', sales: 300, profit: 100 }, ...]
	const chartData = data.map((item) => ({
		name: item.date,
		Sales: item.sales,
		Profit: item.profit,
	}));

	return (
		<div className="w-full h-72">
			<ResponsiveContainer>
				<BarChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="Sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
					<Bar
						dataKey="Profit"
						fill="#10b981"
						radius={[6, 6, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

"use client";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";

export default function Chart({ data }) {
	return (
		<div className="p-4 bg-white rounded shadow">
			<h3 className="mb-2 font-semibold">Monthly Sell & Profit</h3>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={data}>
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Line type="monotone" dataKey="sales" />
						<Line type="monotone" dataKey="profit" />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

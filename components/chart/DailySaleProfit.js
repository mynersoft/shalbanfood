import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	BarChart,
} from "recharts";

export default function DailySaleProfit({ data }) {
	return (
		<BarChart width={600} height={300} data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="day" />
			<YAxis />
			<Tooltip />
			<Line type="monotone" dataKey="sale" stroke="#8884d8" />
			<Line type="monotone" dataKey="profit" stroke="#82ca9d" />
		</BarChart>
	);
}

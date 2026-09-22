"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DailyStatsTable() {
	const now = new Date();
	const [rows, setRows] = useState([]);
	const [year, setYear] = useState(now.getFullYear());
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [totals, setTotals] = useState({
		sale: 0,
		profit: 0,
		serviceBill: 0,
	});

	const fetchData = async () => {
		try {
			const res = await fetch(
				`/api/stats/daily-table?type=monthly&year=${year}&month=${month}`
			);
			const data = await res.json();

			if (data.success) {
				setRows(data.table || []);

				// calculate totals
				const totalSale = data.table.reduce((a, b) => a + b.sale, 0);
				const totalProfit = data.table.reduce(
					(a, b) => a + b.profit,
					0
				);
				const totalBill = data.table.reduce(
					(a, b) => a + b.serviceBill,
					0
				);

				setTotals({
					sale: totalSale,
					profit: totalProfit,
					serviceBill: totalBill,
				});
			} else setRows([]);
		} catch (err) {
			console.error(err);
			setRows([]);
		}
	};

	useEffect(() => {
		fetchData();
	}, [year, month]);

	const downloadPDF = () => {
		const doc = new jsPDF("p", "pt", "a4"); // portrait, points, A4

		// Title
		doc.setFontSize(16);
		doc.text(`Daily Sale Profit Report - ${month}/${year}`, 40, 40);

		// Totals
		doc.setFontSize(12);
		doc.text(`Total Sale: ${totals.sale}`, 40, 60);
		doc.text(`Total Profit: ${totals.profit}`, 40, 80);
		doc.text(`Total Service Bill: ${totals.serviceBill}`, 40, 100);

		// Table
		autoTable(doc, {
			startY: 120,
			head: [["Day", "Sale", "Profit", "Service Bill"]],
			body: rows.map((r) => [r.day, r.sale, r.profit, r.serviceBill]),
			theme: "grid",
			headStyles: { fillColor: [55, 65, 81], textColor: 255 },
			bodyStyles: { textColor: 0 },
			margin: { left: 40, right: 40 },
			styles: { cellPadding: 6, fontSize: 10 },
		});

		doc.save(`Daily_Report_${month}_${year}.pdf`);
	};

	return (
		<div className="p-4 bg-gray-900 text-white rounded">
			<h2 className="text-lg mb-3 font-bold">Daily Report</h2>

			{/* Month & Year Selector */}
			<div className="flex gap-3 mb-4 items-center">
				<select
					value={month}
					onChange={(e) => setMonth(Number(e.target.value))}
					className="p-2 rounded bg-gray-800">
					{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
						<option key={m} value={m}>
							{new Date(year, m - 1).toLocaleString("default", {
								month: "long",
							})}
						</option>
					))}
				</select>

				<select
					value={year}
					onChange={(e) => setYear(Number(e.target.value))}
					className="p-2 rounded bg-gray-800">
					{Array.from(
						{ length: 6 },
						(_, i) => now.getFullYear() - i
					).map((y) => (
						<option key={y} value={y}>
							{y}
						</option>
					))}
				</select>

				<button
					onClick={downloadPDF}
					className="ml-auto px-4 py-2 bg-green-600 rounded hover:bg-green-700">
					Download PDF
				</button>
			</div>

			{/* Totals Cards */}
			<div className="flex gap-4 mb-4">
				<div className="bg-gray-800 p-4 rounded shadow min-w-[120px]">
					<div className="text-sm text-gray-400">Total Sale</div>
					<div className="text-2xl font-bold">{totals.sale} tk</div>
				</div>
				<div className="bg-gray-800 p-4 rounded shadow min-w-[120px]">
					<div className="text-sm text-gray-400">Total Profit</div>
					<div className="text-2xl font-bold">{totals.profit} tk</div>
				</div>
				<div className="bg-gray-800 p-4 rounded shadow min-w-[120px]">
					<div className="text-sm text-gray-400">
						Total Service Bill
					</div>
					<div className="text-2xl font-bold">
						{totals.serviceBill} tk
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm bg-gray-800">
					<thead className="bg-gray-700">
						<tr>
							<th className="p-2 border">Day</th>
							<th className="p-2 border">Sale</th>
							<th className="p-2 border">Profit</th>
							<th className="p-2 border">Service Bill</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="text-center p-4 text-gray-400">
									No data found
								</td>
							</tr>
						) : (
							rows.map((r) => (
								<tr
									key={r.day}
									className="border-b border-gray-700">
									<td className="p-2">{r.day}</td>
									<td className="p-2">{r.sale}</td>
									<td className="p-2">{r.profit}</td>
									<td className="p-2">{r.serviceBill}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

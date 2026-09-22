"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import { useSelector } from "react-redux";
import { getTopProducts, getStockOutProducts } from "@/lib/dashboardUtils";

export default function DashboardPage() {
	const router = useRouter();

	const bestSelling = useSelector((state) => state.dashboard.bestSelling);

	const products = useSelector((state) => state?.products?.items || []);
	const dues = useSelector((state) => state?.dues?.items || []);
	const { daily, monthly, prevMonthly } = useSelector(
		(state) => state.saleprofit
	);

	const { list, stats, lastMonth } = useSelector((s) => s.service);
	const { toolsAmount } = useSelector((state) => state.invest);
	const { totalAmount } = useSelector((state) => state.products);

	const stockOutProducts = products.filter((p) => p.stock == 0);

	const [topProducts, setTopProducts] = useState([]);
	const [stockOut, setStockOut] = useState([]);
	const [totalDue, setTotalDue] = useState(0);
	const [totalAmountProducts, setTotalAmountProducts] = useState(0);

	// services bills
	const totalBill = stats?.totalBills ?? 0;

	const [salesData] = useState([
		{ date: "2025-10-01", sales: 300, profit: 100 },
		{ date: "2025-10-02", sales: 450, profit: 150 },
		{ date: "2025-10-03", sales: 500, profit: 200 },
		{ date: "2025-10-04", sales: 200, profit: 80 },
	]);

	useEffect(() => {
		setTopProducts(getTopProducts(products));
		setStockOut(getStockOutProducts(products));

		const dueSum = Array.isArray(dues)
			? dues.reduce((sum, d) => sum + Number(d.amount || 0), 0)
			: 0;

		setTotalDue(dueSum);
		setTotalAmountProducts(totalAmount);
	}, [salesData, products, dues, totalAmount]);

	return (
		<div className="p-6 space-y-6 bg-gray-800 text-white">
			<div className="">
				{/* Stat Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-gray-200">
					<StatCard
						title="Daily Sale"
						value={`${daily.totalSale || 0} tk`}
						color="red"
					/>
					<StatCard
						title="Daily Profit"
						value={`${daily.totalProfit || 0} tk`}
						color="red"
					/>

					<StatCard
						title="Monthly Sale"
						value={
							<>
								<span className="!text-red-500">
									{prevMonthly.totalSale || 0}
								</span>
								{" / "}
								<span>{monthly.totalSale || 0} tk</span>
							</>
						}
						color="red"
					/>

					<StatCard
						title="Monthly Profit"
						value={
							<>
								<span className="!text-red-500">
									{prevMonthly.totalProfit || 0}
								</span>
								{" / "}
								<span>{monthly.totalProfit || 0} tk</span>
							</>
						}
						color="red"
					/>

					<StatCard
						title="Monthly Service"
						value={
							<>
								<span className="!text-red-500">
									{lastMonth?.totalBill || 0}
								</span>
								{" / "}
								<span>{totalBill || 0} tk</span>
							</>
						}
						color="red"
					/>

					<StatCard
						title="Total Due"
						value={`${totalDue} tk`}
						color="red"
					/>
					<StatCard
						title="Total Amount of Products"
						value={`${totalAmountProducts} tk`}
						color="green"
					/>
					<StatCard
						title="Invest for tools"
						value={`${toolsAmount || 0} tk`}
						color="green"
					/>
				</div>

				{/* Best Selling Product */}
				{bestSelling?.soldCount > 0 && (
					<div className="p-4 bg-gray-800 rounded-lg text-white">
						<h2 className="text-xl font-bold mb-3">
							🔥 Best Selling Product
						</h2>

						<table className="w-full border border-gray-700 text-left">
							<thead>
								<tr className="bg-gray-700">
									<th className="p-2 border border-gray-600">
										Image
									</th>
									<th className="p-2 border border-gray-600">
										Name
									</th>
									<th className="p-2 border border-gray-600">
										Brand
									</th>
									<th className="p-2 border border-gray-600">
										Sold
									</th>
								</tr>
							</thead>

							<tbody>
								<tr>
									<td className="p-2 border border-gray-700">
										{bestSelling.image ? (
											<Image
												src={bestSelling.image}
												alt={bestSelling.name}
												width={60}
												height={60}
												className="rounded object-cover"
											/>
										) : (
											"N/A"
										)}
									</td>
									<td className="p-2 border border-gray-700">
										{bestSelling.name}
									</td>
									<td className="p-2 border border-gray-700">
										{bestSelling.brand}
									</td>
									<td className="p-2 border border-gray-700 text-green-400 font-bold">
										{bestSelling.soldCount} pcs
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				{/* Stock Out Products */}
				<div className="bg-gray-900 rounded-2xl shadow p-6 text-red-500">
					<h2 className="text-xl font-semibold mb-4 text-red-400">
						⚠️ Stock Out Products
					</h2>

					<div className="overflow-x-auto">
						<table className="min-w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700">
							<thead>
								<tr className="bg-gray-800 text-gray-200">
									<th className="p-3 text-left">
										Product Name
									</th>

									<th className="p-3 text-center">Action</th>
								</tr>
							</thead>

							<tbody>
								{stockOutProducts?.map((p) => (
									<tr
										key={p._id}
										className="border-b border-gray-700 hover:bg-gray-800 transition">
										<td className="p-3">{p.name}</td>

										<td className="p-3 text-center">
											<button
												onClick={() =>
													router.push(
														`/products?${p.name}`
													)
												}
												className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">
												✏️ Edit
											</button>
										</td>
									</tr>
								))}

								{!stockOutProducts?.length && (
									<tr>
										<td
											colSpan="3"
											className="text-center text-gray-400 p-4">
											No stock-out products found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSale, deleteSale } from "@/redux/saleSlice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { showDeleteConfirm } from "@/components/sweetalert/DeleteConfirm";

export default function SaleList() {
	const dispatch = useDispatch();
	const { items, loading } = useSelector((state) => state.sales);

	useEffect(() => {
		dispatch(fetchSale());
	}, [dispatch]);

	const handleDelete = (id) => {
		showDeleteConfirm("sale", () => dispatch(deleteSale(id)));
	};

	if (loading)
		return (
			<p className="p-5 text-center text-gray-400">Loading sales...</p>
		);

	return (
		<div className="min-h-screen bg-gray-950 text-gray-100 p-6">
			<div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold tracking-wide">
						🧾 All Sales Record
					</h1>
					<Link href="/sale/add">
						<Button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold">
							➕ Add Sale
						</Button>
					</Link>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full border border-gray-800 rounded-lg overflow-hidden">
						<thead className="bg-gray-800 text-gray-200 text-sm uppercase">
							<tr>
								<th className="border border-gray-700 p-3 text-left">
									Invoice
								</th>
								<th className="border border-gray-700 p-3 text-left">
									Customer
								</th>
								<th className="border border-gray-700 p-3 text-left">
									Phone
								</th>
								<th className="border border-gray-700 p-3 text-right">
									Amount (Tk)
								</th>
								<th className="border border-gray-700 p-3 text-center">
									Action
								</th>
							</tr>
						</thead>

						<tbody>
							{items.length > 0 ? (
								items.map((sale) => (
									<tr
										key={sale._id}
										className="hover:bg-gray-800 transition">
										<td className="border border-gray-800 p-3">
											{sale.invoice}
										</td>
										<td className="border border-gray-800 p-3">
											{sale.customer.name}
										</td>
										<td className="border border-gray-800 p-3">
											{sale.customer.phone}
										</td>
										<td className="border border-gray-800 p-3 text-right">
											{sale.total} Tk
										</td>
										<td className="border border-gray-800 p-3 text-center space-x-2">
											<Link
												href={`/sale/${sale._id}`}
												className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
												View PDF
											</Link>
											<button
												onClick={() =>
													handleDelete(sale._id)
												}
												className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">
												Delete
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="5"
										className="text-center p-4 text-gray-400">
										No sales found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

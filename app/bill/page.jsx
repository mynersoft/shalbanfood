"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBills, addBill, updateBill, deleteBill } from "@/redux/billSlice";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";

export default function BillPage() {
	const dispatch = useDispatch();
	const { list = [], actionLoading = false } =
		useSelector((state) => state.bills) || {};

	// UI states
	const [openModal, setOpenModal] = useState(false);
	const [form, setForm] = useState({
		name: "",
		amount: "",
		isLastMonthUpdate: false,
	});
	const [editId, setEditId] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState(
		dayjs().format("YYYY-MM")
	);

	// Fetch bills
	useEffect(() => {
		dispatch(fetchBills())
			.unwrap()
			.catch((err) => toast.error("Failed to fetch bills"));
	}, [dispatch]);

	// Month options (last 12 months)
	const monthOptions = useMemo(() => {
		const arr = [];
		for (let i = 0; i < 12; i++) {
			arr.push(dayjs().subtract(i, "month").format("YYYY-MM"));
		}
		return arr;
	}, []);

	// Filtered list by selectedMonth
	const filteredList = useMemo(
		() => list.filter((b) => b.month === selectedMonth),
		[list, selectedMonth]
	);

	// Summary
	const summary = useMemo(() => {
		const names = ["Dukan vara", "WiFi", "Biddut (Electricity)"];
		const paidThisMonth = filteredList.reduce(
			(s, b) => s + Number(b.amount || 0),
			0
		);
		const unpaidCount = names.reduce(
			(cnt, name) =>
				filteredList.find((b) => b.name === name) ? cnt : cnt + 1,
			0
		);

		const lastMonth = dayjs(selectedMonth + "-01")
			.subtract(1, "month")
			.format("YYYY-MM");
		const lastList = list.filter((b) => b.month === lastMonth);
		const lastPaid = lastList.reduce(
			(s, b) => s + Number(b.amount || 0),
			0
		);
		const lastUnpaidCount = names.reduce(
			(cnt, name) =>
				lastList.find((b) => b.name === name) ? cnt : cnt + 1,
			0
		);

		return {
			paidThisMonth,
			unpaidCount,
			lastPaid,
			lastUnpaidCount,
			totalBills: list.length,
		};
	}, [filteredList, list, selectedMonth]);

	// Bills table
	const billsWithStatus = useMemo(() => {
		const names = ["Dukan vara", "WiFi", "Biddut (Electricity)"];
		const lastMonth = dayjs(selectedMonth + "-01")
			.subtract(1, "month")
			.format("YYYY-MM");

		return names.map((name) => {
			const current = list.find(
				(b) => b.name === name && b.month === selectedMonth
			);
			const last = list.find(
				(b) => b.name === name && b.month === lastMonth
			);
			return {
				name,
				current: {
					paid: !!current,
					amount: current?.amount || 0,
					_id: current?._id || null,
				},
				last: {
					paid: !!last,
					amount: last?.amount || 0,
					_id: last?._id || null,
				},
			};
		});
	}, [list, selectedMonth]);

	// Submit bill
	const submitBill = async () => {
		if (!form.name || !form.amount) return toast.error("Fill all fields");

		const targetMonth = form.isLastMonthUpdate
			? dayjs(selectedMonth + "-01")
					.subtract(1, "month")
					.format("YYYY-MM")
			: selectedMonth;

		const payload = {
			name: form.name,
			amount: Number(form.amount),
			month: targetMonth,
		};

		const exists = list.find(
			(b) => b.name === payload.name && b.month === targetMonth
		);
		if (!editId && exists)
			return toast.error("Already paid for this month ");

		try {
			if (editId)
				await dispatch(
					updateBill({ ...payload, _id: editId })
				).unwrap();
			else await dispatch(addBill(payload)).unwrap();

			toast.success("Saved successfully!");
			setForm({ name: "", amount: "", isLastMonthUpdate: false });
			setEditId(null);
			setOpenModal(false);
			dispatch(fetchBills());
		} catch (err) {
			console.error(err);
			toast.error("Operation failed");
		}
	};

	const startEdit = (item) => {
		setEditId(item._id);
		setForm({
			name: item.name,
			amount: item.amount,
			isLastMonthUpdate: false,
		});
		setOpenModal(true);
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this bill?")) return;
		try {
			await dispatch(deleteBill(id)).unwrap();
			toast.success("Deleted");
		} catch {
			toast.error("Delete failed");
		}
	};

	return (
		<div className="min-h-screen p-6 bg-[#0D0D10] text-gray-200 max-w-6xl mx-auto">
			<Toaster position="top-right" />

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<h2 className="text-3xl font-extrabold tracking-wide">
						💰 Monthly Bills
					</h2>
				</div>

				<div className="flex items-center gap-3">
					<label className="text-sm text-gray-400">Month:</label>
					<select
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
						className="bg-[#0f0f14] border border-gray-700 p-2 rounded">
						{monthOptions.map((m) => (
							<option key={m} value={m}>
								{dayjs(m + "-01").format("MMMM YYYY")}
							</option>
						))}
					</select>

					<button
						onClick={() => {
							setForm({
								name: "",
								amount: "",
								isLastMonthUpdate: false,
							});
							setEditId(null);
							setOpenModal(true);
						}}
						className="bg-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-700">
						+ Add Bill
					</button>
				</div>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
				<div className="bg-[#121217] p-4 rounded-lg shadow border border-gray-800">
					<div className="text-sm text-gray-400">🟢 Paid</div>
					<div className="text-2xl font-bold mt-2">
						{summary.paidThisMonth} Tk
					</div>
				</div>

				<div className="bg-[#121217] p-4 rounded-lg shadow border border-gray-800">
					<div className="text-sm text-gray-400">
						🟡 Last Month Paid
					</div>
					<div className="text-2xl font-bold mt-2">
						{summary.lastPaid} Tk
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto shadow-lg rounded-xl border border-gray-800">
				<table className="w-full table-auto rounded-xl overflow-hidden">
					<thead>
						<tr className="bg-[#1a1a22] text-gray-300 text-sm uppercase">
							<th className="p-3 border-b border-gray-800 text-left">
								Bill Name
							</th>
							<th className="p-3 border-b border-gray-800 text-left">
								Current Month
							</th>
							<th className="p-3 border-b border-gray-800 text-left">
								Last Month
							</th>
							<th className="p-3 border-b border-gray-800 w-40 text-center">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{billsWithStatus.map((bill, idx) => (
							<tr
								key={idx}
								className="hover:bg-[#1b1b25] transition-all border-b border-gray-800">
								<td className="p-3 font-medium">{bill.name}</td>
								<td
									className={`p-3 font-semibold ${
										bill.current.paid
											? "text-green-400"
											: "text-red-400"
									}`}>
									{bill.current.paid
										? `${bill.current.amount} Tk`
										: "unpaid"}
								</td>
								<td className="p-3">
									{bill.last.paid ? (
										<span className="text-green-400 font-semibold">
											✔ Paid ({bill.last.amount} Tk)
										</span>
									) : (
										<button
											className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600"
											onClick={() => {
												setForm({
													name: bill.name,
													amount: "",
													isLastMonthUpdate: true,
												});
												setOpenModal(true);
												toast("Update last month due", {
													icon: "🕒",
												});
											}}>
											pay
										</button>
									)}
								</td>
								<td className="p-3 text-center flex justify-center gap-2">
									{bill.current._id && (
										<>
											<button
												onClick={() =>
													startEdit({
														_id: bill.current._id,
														name: bill.name,
														amount: bill.current
															.amount,
													})
												}
												className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700">
												Edit
											</button>
											<button
												onClick={() =>
													handleDelete(
														bill.current._id
													)
												}
												className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700">
												Delete
											</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Modal */}
			{openModal && (
				<div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
					<div className="bg-[#1a1a22] p-6 rounded-xl w-96 shadow-2xl border border-gray-700">
						<div className="flex space-between ">
							<h3 className="text-xl font-bold mb-4">
								{editId
									? "Update Bill"
									: form.isLastMonthUpdate
									? "Add Last Month Due"
									: "Add Bill"}
							</h3>
							
						</div>
						<select
							value={form.name}
							onChange={(e) =>
								setForm({ ...form, name: e.target.value })
							}
							className="bg-[#0f0f14] border border-gray-700 p-3 rounded-lg w-full mb-3">
							<option value="">Select Bill</option>
							<option value="Dukan vara">Dukan vara</option>
							<option value="WiFi">WiFi</option>
							<option value="Biddut (Electricity)">
								Biddut (Electricity)
							</option>
						</select>
						<input
							type="number"
							placeholder="Amount"
							value={form.amount}
							onChange={(e) =>
								setForm({ ...form, amount: e.target.value })
							}
							className="bg-[#0f0f14] border border-gray-700 p-3 rounded-lg w-full mb-4"
						/>

						<div className="flex justify-end gap-3">
							<button
								onClick={() => {
									setOpenModal(false);
									setEditId(null);
									setForm({
										name: "",
										amount: "",
										isLastMonthUpdate: false,
									});
								}}
								className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
								Cancel
							</button>
							<button
								onClick={submitBill}
								className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
								{actionLoading
									? "Saving…"
									: editId
									? "Update"
									: "Add"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

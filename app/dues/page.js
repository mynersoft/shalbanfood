"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDues, addDue, payDue, deleteDue } from "@/redux/duesSlice";

export default function DuesPage() {
	const dispatch = useDispatch();
	const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
	const { items: dues, loading } = useSelector((state) => state.dues);

	const [openModal, setOpenModal] = useState(false);
	const [payModal, setPayModal] = useState({ open: false, id: null });
	const [form, setForm] = useState({
		name: "",
		phone: "",
		amount: "",
		note: "",
	});
	const [payAmount, setPayAmount] = useState("");

	const handleAdd = async (e) => {
		e.preventDefault();
		if (!form.name || !form.amount) return;

		const result = await dispatch(
			addDue({
				name: form.name,
				phone: form.phone,
				amount: Number(form.amount),
				note: form.note,
			})
		);

		if (addDue.fulfilled.match(result)) {
			setForm({ name: "", phone: "", amount: "", note: "" });
			setOpenModal(false);
		} else {
			alert("Failed to add due. Try again.");
		}
	};

	const openPayModal = (id, currentAmount) => {
		setPayModal({ open: true, id });
		setPayAmount(currentAmount);
	};

	const handlePay = async () => {
		if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
			alert("Enter a valid amount");
			return;
		}

		await dispatch(payDue({ id: payModal.id, amount: Number(payAmount) }));
		setPayModal({ open: false, id: null });
		setPayAmount("");
	};

const confirmDelete = (id) => {
	setDeleteModal({ open: true, id });
};

const handleDeleteConfirmed = async () => {
	if (deleteModal.id) {
		 dispatch(deleteDue(deleteModal.id));
		setDeleteModal({ open: false, id: null });
	}
};
	const totalDue = dues.reduce((sum, d) => sum + d.amount, 0);

	useEffect(() => {
		dispatch(fetchDues());
	}, [dispatch]);

	return (
		<div className="p-6 bg-gray-900 text-gray-600 dark:text-gray-300">
			<h1 className="text-3xl text-gray-400 font-bold mb-4">
				💰Customers due
			</h1>

			{/* Total Card */}
			<div className="bg-gray-800 text-white p-4 rounded-lg mb-6 flex justify-between">
				<p>
					Total Due:{" "}
					<span className="text-yellow-400">৳{totalDue}</span>
				</p>
				<button
					onClick={() => setOpenModal(true)}
					className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded">
					➕ Add Due
				</button>
			</div>

			{/* Add Due Modal */}
			{openModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
					<div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg border border-gray-700 shadow-lg">
						<h2 className="text-xl font-bold mb-4 text-white">
							Add Due
						</h2>
						<form
							onSubmit={handleAdd}
							className="flex flex-col gap-3">
							<input
								type="text"
								placeholder="Customer Name"
								value={form.name}
								onChange={(e) =>
									setForm({ ...form, name: e.target.value })
								}
								className="p-2 rounded bg-gray-700 text-white border border-gray-600"
								required
							/>
							<input
								type="text"
								placeholder="Phone"
								value={form.phone}
								onChange={(e) =>
									setForm({ ...form, phone: e.target.value })
								}
								className="p-2 rounded bg-gray-700 text-white border border-gray-600"
							/>
							<input
								type="number"
								placeholder="Due Amount"
								value={form.amount}
								onChange={(e) =>
									setForm({ ...form, amount: e.target.value })
								}
								className="p-2 rounded bg-gray-700 text-white border border-gray-600"
								required
							/>
							<input
								type="text"
								placeholder="Note"
								value={form.note}
								onChange={(e) =>
									setForm({ ...form, note: e.target.value })
								}
								className="p-2 rounded bg-gray-700 text-white border border-gray-600"
							/>
							<div className="flex justify-end gap-3 mt-3">
								<button
									type="button"
									onClick={() => setOpenModal(false)}
									className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white">
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white">
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Pay Modal */}
			{payModal.open && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
					<div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm border border-gray-700 shadow-lg">
						<h2 className="text-xl font-bold mb-4 text-white">
							Pay Due
						</h2>
						<input
							type="number"
							value={payAmount}
							onChange={(e) => setPayAmount(e.target.value)}
							className="p-2 rounded bg-gray-700 text-white border border-gray-600 w-full mb-4"
							placeholder="Enter payment amount"
						/>
						<div className="flex justify-end gap-3">
							<button
								className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
								onClick={() =>
									setPayModal({ open: false, id: null })
								}>
								Cancel
							</button>
							<button
								className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
								onClick={handlePay}>
								Pay
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			{loading ? (
				<p className="text-gray-400">Loading...</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-gray-900 text-white rounded-lg">
						<thead>
							<tr className="bg-gray-800">
								<th className="p-3 text-left">Customer</th>
								<th className="p-3 text-left">Phone</th>
								<th className="p-3 text-left">Amount</th>
								<th className="p-3 text-left">Status</th>
								<th className="p-3 text-left">Date</th>
								<th className="p-3 text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{dues.map((d) => (
								<tr
									key={d._id}
									className="border-b border-gray-700 hover:bg-gray-800">
									<td className="p-3">{d.name}</td>
									<td className="p-3">{d.phone}</td>
									<td className="p-3 text-yellow-400">
										৳{d.amount}
									</td>
									<td className="p-3">{d.status}</td>
									<td className="p-3">
										{new Date(d.date).toLocaleDateString()}
									</td>
									<td className="p-3 flex gap-2 justify-center">
										{d.status === "due" && (
											<button
												onClick={() =>
													openPayModal(
														d._id,
														d.amount
													)
												}
												className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500">
												💸 Pay
											</button>
										)}
										<button
											onClick={() => confirmDelete(d._id)}
											className="bg-red-600 px-3 py-1 rounded hover:bg-red-500">
											❌ Delete
										</button>
									</td>
								</tr>
							))}
							{!dues.length && (
								<tr>
									<td
										colSpan="6"
										className="text-center p-4 text-gray-400">
										No due records found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
			{/* Delete Confirmation Modal */}
			{deleteModal.open && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
					<div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm border border-gray-700 shadow-lg">
						<h2 className="text-xl font-bold mb-4 text-white">
							Confirm Delete
						</h2>
						<p className="text-gray-300 mb-4">
							Are you sure you want to delete this due record?
							This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<button
								onClick={() =>
									setDeleteModal({ open: false, id: null })
								}
								className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white">
								Cancel
							</button>
							<button
								onClick={handleDeleteConfirmed}
								className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white">
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

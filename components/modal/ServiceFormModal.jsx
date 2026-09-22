"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addService, updateService } from "@/redux/serviceSlice";
import toast from "react-hot-toast";

export default function ServiceFormModal({
	open,
	onClose,
	mode,
	currentRecord,
}) {
	if (!open) return null;

	const dispatch = useDispatch();

	const [form, setForm] = useState({
		customerName: "",
		phone: "",
		servicingeDevice: "",
		billAmount: "",
		notes: "",
		warrantyMonths: "",
		hasWarranty: false,
	});

	useEffect(() => {
		if (mode === "edit" && currentRecord) {
			setForm({
				customerName: currentRecord.customerName || "",
				phone: currentRecord.phone || "",
				servicingeDevice: currentRecord.servicingeDevice || "",
				billAmount: currentRecord.billAmount || "",
				notes: currentRecord.notes || "",
				warrantyMonths: currentRecord?.warranty?.warrantyMonths || "",
				hasWarranty: currentRecord?.warranty?.hasWarranty || false,
			});
		}
	}, [mode, currentRecord]);

	const handleSubmit = (e) => {
		e.preventDefault();

		const payload = {
			customerName: form.customerName,
			phone: form.phone,
			servicingeDevice: form.servicingeDevice,
			billAmount: Number(form.billAmount),
			notes: form.notes,
			warranty: {
				hasWarranty: form.hasWarranty,
				warrantyMonths: Number(form.warrantyMonths) || 0,
			},
		};

		try {
			if (mode === "edit") {
				dispatch(updateService({ id: currentRecord._id, payload }));
				toast.success("Service Updated Successfully");
			} else {
				dispatch(addService(payload));
				toast.success("Service Added Successfully");
			}

			onClose();
		} catch (error) {
			toast.error("Something went wrong!");
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
			<div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg text-gray-200">
				<h2 className="text-xl font-semibold mb-4">
					{mode === "edit" ? "Edit Service" : "Add Service"}
				</h2>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<input
						type="text"
						placeholder="Customer Name"
						className="p-2 rounded bg-gray-700 text-white"
						value={form.customerName}
						onChange={(e) =>
							setForm({ ...form, customerName: e.target.value })
						}
						required
					/>

					<input
						type="text"
						placeholder="Phone"
						className="p-2 rounded bg-gray-700 text-white"
						value={form.phone}
						onChange={(e) =>
							setForm({ ...form, phone: e.target.value })
						}
						required
					/>

					<select
						value={form.servicingeDevice}
						onChange={(e) =>
							setForm({
								...form,
								servicingeDevice: e.target.value,
							})
						}
						className="p-2 rounded bg-gray-700 text-white"
						required>
						<option value="">Select Service</option>
						<option value="Charging port">Charging port</option>
						<option value="Keypad clean">Keypad clean</option>
						<option value="Charging error">Charging error</option>
						<option value="Half short">Half short</option>
						<option value="Full short">Full short</option>
						<option value="Display change">Display change</option>
						<option value="Gorila change">Gorila change</option>
						<option value="Torch light">Torch light</option>
						<option value="Port ceiling">Port ceiling</option>
						<option value="Full coil">Full coil</option>
						<option value="Single coil">Single coil</option>
					</select>

					<input
						type="number"
						placeholder="Bill Amount"
						className="p-2 rounded bg-gray-700 text-white"
						value={form.billAmount}
						onChange={(e) =>
							setForm({ ...form, billAmount: e.target.value })
						}
						required
					/>

					<div className="flex items-center gap-2 mt-2">
						<input
							type="checkbox"
							checked={form.hasWarranty}
							onChange={(e) =>
								setForm({
									...form,
									hasWarranty: e.target.checked,
								})
							}
						/>
						<label>Has Warranty?</label>
					</div>

					{form.hasWarranty && (
						<input
							type="number"
							placeholder="Warranty Months"
							className="p-2 rounded bg-gray-700 text-white"
							value={form.warrantyMonths}
							onChange={(e) =>
								setForm({
									...form,
									warrantyMonths: e.target.value,
								})
							}
						/>
					)}

					<textarea
						placeholder="Notes"
						className="p-2 rounded bg-gray-700 text-white"
						value={form.notes}
						onChange={(e) =>
							setForm({ ...form, notes: e.target.value })
						}
					/>

					<button className="bg-green-600 py-2 rounded">Save</button>
					<button
						type="button"
						onClick={onClose}
						className="bg-red-600 py-2 rounded">
						Close
					</button>
				</form>
			</div>
		</div>
	);
}

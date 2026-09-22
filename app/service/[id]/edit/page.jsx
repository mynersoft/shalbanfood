"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateService } from "@/redux/serviceSlice";
import { useParams, useRouter } from "next/navigation";
import { showAddConfirm } from "@/components/sweetalert/AddConfirm"; // reuse as confirm "update"

export default function EditService() {
	const dispatch = useDispatch();
	const router = useRouter();
	const { id } = useParams();
	const { current } = useSelector((s) => s.service);
	const [form, setForm] = useState(null);

	

	useEffect(() => {
		if (current)
			setForm({
				customerName: current.customerName || "",
				phone: current.phone || "",
				servicingeDevice: current.servicingeDevice || "",
				billAmount: current.billAmount || 0,
				warranty: current.warranty || {
					hasWarranty: false,
					warrantyMonths: 0,
				},
				notes: current.notes || "",
			});
	}, [current]);

	if (!form) return <div className="p-4">Loading form...</div>;

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "hasWarranty")
			setForm((f) => ({
				...f,
				warranty: { ...f.warranty, hasWarranty: checked },
			}));
		else if (name === "warrantyMonths")
			setForm((f) => ({
				...f,
				warranty: { ...f.warranty, warrantyMonths: Number(value) },
			}));
		else if (name === "billAmount")
			setForm((f) => ({ ...f, billAmount: Number(value) }));
		else setForm((f) => ({ ...f, [name]: value }));
	};

	const submit = () => {
		dispatch(updateService({ id, payload: form }))
			.unwrap()
			.then(() => router.push("/service"))
			.catch((err) =>
				alert("Update failed: " + (err.message || JSON.stringify(err)))
			);
	};

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h2 className="text-xl font-bold mb-4">Edit Service</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					showAddConfirm("service record (update)", submit);
				}}
				className="space-y-3 bg-gray-900 p-4 rounded">
				<input
					name="customerName"
					value={form.customerName}
					onChange={handleChange}
					placeholder="Customer name"
					className="w-full p-2 bg-gray-800 rounded"
				/>
				<input
					name="phone"
					value={form.phone}
					onChange={handleChange}
					placeholder="Phone"
					className="w-full p-2 bg-gray-800 rounded"
				/>
				<input
					name="servicingeDevice"
					value={form.servicingeDevice}
					onChange={handleChange}
					placeholder="Device"
					required
					className="w-full p-2 bg-gray-800 rounded"
				/>
				<input
					name="billAmount"
					value={form.billAmount}
					onChange={handleChange}
					type="number"
					placeholder="Bill amount"
					className="w-full p-2 bg-gray-800 rounded"
				/>
				<div className="flex items-center gap-2">
					<input
						id="w1"
						name="hasWarranty"
						type="checkbox"
						checked={form.warranty.hasWarranty}
						onChange={handleChange}
					/>
					<label htmlFor="w1">Has warranty</label>
					{form.warranty.hasWarranty && (
						<input
							name="warrantyMonths"
							type="number"
							value={form.warranty.warrantyMonths}
							onChange={handleChange}
							className="w-24 p-1 bg-gray-800 rounded"
							placeholder="months"
						/>
					)}
				</div>
				<textarea
					name="notes"
					value={form.notes}
					onChange={handleChange}
					placeholder="Notes"
					className="w-full p-2 bg-gray-800 rounded"
				/>
				<div className="flex gap-2">
					<button
						type="submit"
						className="px-4 py-2 bg-green-600 rounded">
						Update
					</button>
					<button
						type="button"
						onClick={() => router.back()}
						className="px-4 py-2 bg-gray-700 rounded">
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}

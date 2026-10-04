'use client';

import { useShipping } from '@/hooks/useShipping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function ShippingAdminPage() {
  const queryClient = useQueryClient();
  const { isLoading, isError } = useShipping();

  const  data  = useSelector(state => state.shipping); 
  
  console.log(data);
  
  
	const [form, setForm] = useState({
		district: '',
		cost: 0,
		isDefault: false,
	});

	// // GET SHIPPING LIST
	// const { data, isLoading } = useQuery({
	// 	queryKey: ['shipping'],
	// 	queryFn: async () => {
	// 		const res = await fetch('/api/shipping');
	// 		return res.json();
	// 	},
	// });

	// CREATE SHIPPING
	const mutation = useMutation({
		mutationFn: async (newShipping) => {
			const res = await fetch('/api/shipping', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newShipping),
			});
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shipping'] });
			setForm({ district: '', cost: 0, isDefault: false });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		mutation.mutate(form);
	};

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Shipping Management</h1>

			{/* ADD FORM */}
			<form
				onSubmit={handleSubmit}
				className=" p-6 rounded-xl shadow space-y-4">
				<input
					type="text"
					placeholder="District Name"
					value={form.district}
					onChange={(e) =>
						setForm({ ...form, district: e.target.value })
					}
					className="w-full border p-2 rounded"
					required
				/>

				<input
					type="number"
					placeholder="Cost"
					value={form.cost}
					onChange={(e) =>
						setForm({ ...form, cost: Number(e.target.value) })
					}
					className="w-full border p-2 rounded"
					required
				/>

				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={form.isDefault}
						onChange={(e) =>
							setForm({ ...form, isDefault: e.target.checked })
						}
					/>
					Set as Default (Others)
				</label>

				<button
					type="submit"
					className="bg-black text-white px-4 py-2 rounded">
					Add Shipping
				</button>
			</form>

			{/* SHIPPING LIST */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">All Shipping</h2>

				{isLoading ? (
					<p>Loading...</p>
				) : (
					<div className="space-y-3">
						{data?.map((item) => (
							<div
								key={item._id}
								className="border p-3 rounded flex justify-between">
								<div>
									<p className="font-medium">
										{item.district}
									</p>
									<p>৳ {item.cost}</p>
									{item.isDefault && (
										<span className="text-sm text-green-600">
											Default
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

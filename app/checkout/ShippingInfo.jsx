'use client';

import { DISTRICTS } from '@/constants';
import { Building, MapPin, Truck } from 'lucide-react';



export default function ShippingInfo({
	orderData,
	handleChange,
	shippingCharge = 0,
}) {
	const address = orderData?.address ?? {};

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
			<div className="mb-6 flex items-center gap-3">
				<div className="rounded-lg bg-blue-100 p-2">
					<MapPin className="text-blue-600" size={20} />
				</div>

				<div>
					<h2 className="text-xl font-bold text-gray-900">
						Shipping Information
					</h2>

					<p className="mt-1 text-xs text-gray-500">
						Enter your delivery address
					</p>
				</div>
			</div>

			<div className="space-y-4">
				{/* Area / Full address */}
				<div>
					<label
						htmlFor="shipping-area"
						className="mb-2 block text-sm font-medium text-gray-700">
						<span className="flex items-center gap-2">
							<Building size={16} />
							Area / Full Address
						</span>
					</label>

					<input
						id="shipping-area"
						type="text"
						name="address.area"
						value={address.area ?? ''}
						onChange={handleChange}
						placeholder="House, road, village or area"
						autoComplete="street-address"
						required
						className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
				</div>

				{/* Thana */}
				<div>
					<label
						htmlFor="shipping-thana"
						className="mb-2 block text-sm font-medium text-gray-700">
						<span className="flex items-center gap-2">
							<MapPin size={16} />
							Thana / Upazila
						</span>
					</label>

					<input
						id="shipping-thana"
						type="text"
						name="address.thana"
						value={address.thana ?? ''}
						onChange={handleChange}
						placeholder="Enter your thana or upazila"
						required
						className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
				</div>

				{/* District */}
				<div>
					<label
						htmlFor="shipping-district"
						className="mb-2 block text-sm font-medium text-gray-700">
						<span className="flex items-center gap-2">
							<MapPin size={16} />
							District
						</span>
					</label>

					<select
						id="shipping-district"
						name="address.city"
						value={address.city ?? ''}
						onChange={handleChange}
						required
						className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
						<option value="">Select your district</option>

						{DISTRICTS.map((district) => (
							<option key={district} value={district}>
								{district}
							</option>
						))}
					</select>
				</div>

				{/* Dynamic delivery charge */}
				{address.city ? (
					<div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-white p-2">
								<Truck size={19} className="text-green-700" />
							</div>

							<div>
								<p className="text-sm font-semibold text-gray-900">
									Delivery Charge
								</p>

								<p className="mt-1 text-xs text-gray-600">
									District: {address.city}
								</p>
							</div>
						</div>

						<p className="shrink-0 text-lg font-extrabold text-green-700">
							৳
							{Number(shippingCharge || 0).toLocaleString(
								'en-BD'
							)}
						</p>
					</div>
				) : (
					<p className="rounded-lg bg-gray-50 px-3 py-3 text-xs text-gray-500">
						Select your district to see the delivery charge.
					</p>
				)}
			</div>
		</div>
	);
}

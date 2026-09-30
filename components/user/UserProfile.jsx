"use client";

import { HiUser, HiShoppingBag, HiTruck, HiInbox, HiX } from "react-icons/hi";

const orders = [
	{ name: "Placed", icon: HiShoppingBag },
	{ name: "To Ship", icon: HiTruck },
	{ name: "Received", icon: HiInbox },
	{ name: "Cancelled", icon: HiX },
	{ name: "All Orders", icon: HiUser },
];

export default function UserProfile({ user }) {
	return (
		<div className="max-w-5xl mx-auto space-y-6">
			{/* Profile Card */}
			<div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow">
				<img
					src={user?.image || "/default-avatar.png"}
					className="w-16 h-16 rounded-full"
					alt={user?.name}
				/>

				<div className="flex-1">
					<h2 className="text-lg font-semibold">{user?.name}</h2>
					<p className="text-sm text-gray-500">{user?.phone}</p>
				</div>

				<button className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg">
					Edit Profile
				</button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<Stat title="Orders" value="12" />
				<Stat title="Pending" value="3" />
				<Stat title="Delivered" value="8" />
				<Stat title="Cancelled" value="1" />
			</div>

			{/* Orders */}
			<div className="bg-white p-6 rounded-xl shadow">
				<h3 className="font-semibold mb-4">My Orders</h3>

				<div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
					{orders.map((order) => (
						<div
							key={order.name}
							className="flex flex-col items-center p-3 rounded-lg hover:bg-pink-50 transition">
							<order.icon className="w-6 h-6 text-pink-500" />
							<span className="text-xs mt-1">{order.name}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function Stat({ title, value }) {
	return (
		<div className="bg-white p-4 rounded-xl shadow text-center">
			<p className="text-sm text-gray-500">{title}</p>
			<p className="text-xl font-bold">{value}</p>
		</div>
	);
}

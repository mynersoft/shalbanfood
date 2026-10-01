import { Clock, DollarSign, Package, Truck } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";

const StatsCard = ({ orders }) => { 
	const user = useSelector((state) => state.user.user);

	
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-600">Total Orders</p>
						<p className="text-2xl font-bold">
							{orders.length || 0}
						</p>
					</div>
					<div className="p-3 bg-blue-50 rounded-lg">
						<Package className="w-6 h-6 text-blue-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-600">Pending</p>
						<p className="text-2xl font-bold">
							{(orders.length > 0 &&
								orders?.filter((o) => o.status === "pending")
									.length) ||
								0}
						</p>
					</div>
					<div className="p-3 bg-yellow-50 rounded-lg">
						<Clock className="w-6 h-6 text-yellow-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-600">Processing</p>
						<p className="text-2xl font-bold">
							{(orders.length > 0 &&
								orders.filter((o) => o.status === "processing")
									.length) ||
								0}
						</p>
					</div>
					<div className="p-3 bg-purple-50 rounded-lg">
						<Package className="w-6 h-6 text-purple-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-600">Shipped</p>
						<p className="text-2xl font-bold">
							{(orders.length > 0 &&
								orders.filter((o) => o.status === "shipped")
									.length) ||
								0}
						</p>
					</div>
					<div className="p-3 bg-indigo-50 rounded-lg">
						<Truck className="w-6 h-6 text-indigo-600" />
					</div>
				</div>
			</div>

			{user &&  user.role === "user" ? (
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Revenue</p>
							<p className="text-2xl font-bold">
								{formatCurrency(
									orders.length > 0 &&
										orders.reduce(
											(sum, order) => sum + order.total,
											0
										)
								)}
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>
			) : (
				""
			)}
		</div>
	);
};

export default StatsCard;
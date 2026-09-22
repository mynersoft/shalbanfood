import {
	Package,
	ShoppingCart,
	Users,
	DollarSign,
	TrendingUp,
} from 'lucide-react';

const stats = [
	{
		title: 'Total Sales',
		value: '৳125,500',
		icon: DollarSign,
		change: '+12.5%',
	},
	{
		title: 'Orders',
		value: '248',
		icon: ShoppingCart,
		change: '+8.2%',
	},
	{
		title: 'Products',
		value: '86',
		icon: Package,
		change: '+4.6%',
	},
	{
		title: 'Customers',
		value: '1,240',
		icon: Users,
		change: '+15.4%',
	},
];

export default function DashboardPage() {
	return (
		<div>
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>

				<p className="mt-1 text-sm text-gray-400">
					Welcome back! Here's what's happening with your store.
				</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;

					return (
						<div
							key={stat.title}
							className="rounded-2xl border border-white/10 bg-[#151821] p-5">
							<div className="flex items-center justify-between">
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
									<Icon size={22} />
								</div>

								<span className="flex items-center gap-1 text-xs font-medium text-green-400">
									<TrendingUp size={14} />
									{stat.change}
								</span>
							</div>

							<p className="mt-5 text-sm text-gray-400">
								{stat.title}
							</p>

							<h2 className="mt-1 text-2xl font-bold">
								{stat.value}
							</h2>
						</div>
					);
				})}
			</div>

			{/* Content */}
			<div className="mt-6 grid gap-6 lg:grid-cols-2">
				{/* Recent Orders */}
				<div className="rounded-2xl border border-white/10 bg-[#151821]">
					<div className="flex items-center justify-between border-b border-white/10 p-5">
						<div>
							<h2 className="font-semibold">Recent Orders</h2>
							<p className="mt-1 text-xs text-gray-500">
								Latest customer orders
							</p>
						</div>

						<button className="text-sm text-blue-500 hover:text-blue-400">
							View All
						</button>
					</div>

					<div className="divide-y divide-white/5">
						{[
							['#ORD-1001', 'Rahim', '৳2,450'],
							['#ORD-1002', 'Karim', '৳1,850'],
							['#ORD-1003', 'Hasan', '৳3,200'],
							['#ORD-1004', 'Nadia', '৳950'],
						].map(([id, name, amount]) => (
							<div
								key={id}
								className="flex items-center justify-between p-4">
								<div>
									<p className="text-sm font-medium">{id}</p>
									<p className="mt-1 text-xs text-gray-500">
										{name}
									</p>
								</div>

								<span className="font-medium">{amount}</span>
							</div>
						))}
					</div>
				</div>

				{/* Overview */}
				<div className="rounded-2xl border border-white/10 bg-[#151821] p-5">
					<h2 className="font-semibold">Store Overview</h2>

					<div className="mt-6 space-y-5">
						<div>
							<div className="mb-2 flex justify-between text-sm">
								<span className="text-gray-400">
									Products Sold
								</span>
								<span>72%</span>
							</div>

							<div className="h-2 overflow-hidden rounded-full bg-white/10">
								<div className="h-full w-[72%] rounded-full bg-blue-600" />
							</div>
						</div>

						<div>
							<div className="mb-2 flex justify-between text-sm">
								<span className="text-gray-400">
									Orders Completed
								</span>
								<span>84%</span>
							</div>

							<div className="h-2 overflow-hidden rounded-full bg-white/10">
								<div className="h-full w-[84%] rounded-full bg-green-500" />
							</div>
						</div>

						<div>
							<div className="mb-2 flex justify-between text-sm">
								<span className="text-gray-400">
									Customer Satisfaction
								</span>
								<span>91%</span>
							</div>

							<div className="h-2 overflow-hidden rounded-full bg-white/10">
								<div className="h-full w-[91%] rounded-full bg-purple-500" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

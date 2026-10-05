import { motion } from 'framer-motion';

const StatsCard = ({ statCards }) => {
	return (
		<div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
			{statCards.map((c, i) => (
				<motion.div
					key={c.label}
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: i * 0.05 }}
					className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between gap-2">
						<div className="min-w-0">
							<p className="text-xs text-gray-500">{c.label}</p>
							<p className="truncate text-xl font-bold text-gray-900">
								{c.value}
							</p>
						</div>
						<c.icon
							className={`h-10 w-10 shrink-0 rounded-lg p-2 ${c.color}`}
						/>
					</div>
				</motion.div>
			))}
		</div>
	);
};

export default StatsCard;

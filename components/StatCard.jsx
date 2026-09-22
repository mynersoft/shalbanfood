import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
	title,
	value,
	color = "blue",
	trend = "up",
}) {
	const colorMap = {
		blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
		green: "text-green-500 bg-green-50 dark:bg-green-900/20",
		orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
		purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
		red: "text-red-500 bg-red-50 dark:bg-red-900/20",
	};

	return (
		<div className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl shadow hover:shadow-md transition-all">
			<div>
				<h3 className="text-gray-300 text-[16px] text-sm ">{title}</h3>
				<p className="text-2xl text-gray-400  mt-1">{value}</p>
			</div>
			<div
				className={cn(
					"flex items-center justify-center w-10 h-10 rounded-full",
					colorMap[color]
				)}>
				{trend === "up" ? (
					<ArrowUpRight
						className={cn("w-5 h-5", colorMap[color].split(" ")[0])}
					/>
				) : (
					<ArrowDownRight
						className={cn("w-5 h-5", colorMap[color].split(" ")[0])}
					/>
				)}
			</div>
		</div>
	);
}

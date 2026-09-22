"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Button({
	children,
	className = "",
	variant = "default",
	size = "md",
	...props
}) {
	const base =
		"inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variants = {
		default: "bg-blue-500 text-white hover:bg-blue-600",
		outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
		destructive: "bg-red-500 text-white hover:bg-red-600",
	};

	const sizes = {
		sm: "px-2 py-1 text-sm",
		md: "px-4 py-2 text-md",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<button
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}>
			{children}
		</button>
	);
}

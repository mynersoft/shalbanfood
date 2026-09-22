"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const navItems = [
		{ name: "Dashboard", path: "/" },
		{ name: "Products", path: "/products" },
		{ name: "Sale", path: "/sale" },
		{ name: "Service", path: "/service" },
		{ name: "Stats", path: "/stats" },
		{ name: "Invest for Shop", path: "/invest" },
{name: "AyBay",  path: "/aybay"},
		{ name: "Bill", path: "/bill" },
		{ name: "Dues", path: "/dues" },
		{ name: "Category", path: "/categories" },
	];

	return (
		<header className="w-full hide-on-print bg-gray-900 text-white shadow-md sticky top-0 z-50">
			<div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
				{/* Logo */}
				<Link href="/" className="text-2xl font-bold text-green-400">
					Tomart
				</Link>

				{/* Desktop Menu */}
				<nav className="hidden md:flex space-x-6">
					{navItems.map((item) => (
						<Link
							key={item.path}
							href={item.path}
							className={`hover:text-green-400 transition ${
								pathname === item.path
									? "text-green-400"
									: "text-gray-300"
							}`}>
							{item.name}
						</Link>
					))}
				</nav>

				{/* Mobile Menu Button */}
				<button
					className="md:hidden text-gray-300"
					onClick={() => setOpen(!open)}>
					{open ? <X size={26} /> : <Menu size={26} />}
				</button>
			</div>

			{/* Mobile Dropdown Menu */}
			{open && (
				<div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3 space-y-3">
					{navItems.map((item) => (
						<Link
							key={item.path}
							href={item.path}
							onClick={() => setOpen(false)}
							className={`block ${
								pathname === item.path
									? "text-green-400"
									: "text-gray-300"
							} hover:text-green-400`}>
							{item.name}
						</Link>
					))}
				</div>
			)}
		</header>
	);
}

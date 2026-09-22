"use client";

export default function AddCategoryButton({ onClick }) {
	return (
		<button
			onClick={onClick}
			className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-90 transition-all shadow-lg"
		>
			+ Add Category
		</button>
	);
}
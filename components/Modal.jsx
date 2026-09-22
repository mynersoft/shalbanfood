"use client";

export default function Modal({ show, onClose, children }) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
			<div className="bg-[#1a1a1f] border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">

				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
				>
					×
				</button>

				{children}
			</div>
		</div>
	);
}
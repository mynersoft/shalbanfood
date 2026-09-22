export default function Modal({ open, onClose, title, children }) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
			<div className="bg-gray-900 text-gray-100 rounded-xl w-full max-w-2xl p-5 shadow-2xl animate-fadeIn">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">{title}</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-100 text-xl">
						✕
					</button>
				</div>

				{children}
			</div>
		</div>
	);
}

"use client";
export default function LowStockNotice({ products, threshold = 5 }) {
	const low = products.filter((p) => p.stock <= threshold);
	if (!low.length) return null;
	return (
		<div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
			<h4 className="font-semibold">Low stock items</h4>
			<ul className="mt-2">
				{low.map((p) => (
					<li key={p._id}>
						{p.name} — {p.stock} left
					</li>
				))}
			</ul>
		</div>
	);
}

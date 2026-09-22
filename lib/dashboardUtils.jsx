// =====================================
// Get Top Products by sold quantity
// =====================================
export function getTopProducts(products, top = 5) {
	if (!products || products.length === 0) return [];
	// Sort products by sold count descending
	const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
	return sorted.slice(0, top);
}

// =====================================
// Get Products that are out of stock
// =====================================
export function getStockOutProducts(products) {
	if (!products || products.length === 0) return [];
	return products.filter((p) => (p.stock || 0) <= 0);
}

// =====================================
// Calculate Daily Sell & Profit
// sales = [{ date, total, profit }]
// =====================================
export function calculateDailySales(sales, date) {
	const filtered = sales.filter((s) => s.date === date);
	const total = filtered.reduce((acc, cur) => acc + (cur.total || 0), 0);
	const profit = filtered.reduce((acc, cur) => acc + (cur.profit || 0), 0);
	return { total, profit };
}

// =====================================
// Calculate Monthly Sell & Profit
// sales = [{ date, total, profit }]
// =====================================
export function calculateMonthlySales(sales, month) {
	// month: 0=Jan, 1=Feb,...
	const filtered = sales.filter((s) => new Date(s.date).getMonth() === month);
	const total = filtered.reduce((acc, cur) => acc + (cur.total || 0), 0);
	const profit = filtered.reduce((acc, cur) => acc + (cur.profit || 0), 0);
	return { total, profit };
}

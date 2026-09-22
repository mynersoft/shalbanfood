// Generate an invoice number (timestamp-based)
export function generateInvoiceNumber() {
	const now = new Date();
	const yy = now.getFullYear().toString().slice(-2); // last 2 digits of year
	const mm = String(now.getMonth() + 1).padStart(2, "0"); // month 01-12
	const dd = String(now.getDate()).padStart(2, "0"); // day 01-31
	const ss = String(now.getSeconds()).padStart(2, "0"); // second 00-59

	// Format: INV-YYMMDD-HHMMSS
	return `BTS${yy}${mm}${dd}${Number(ss) + 12}`;
}

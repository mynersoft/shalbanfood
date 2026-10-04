import crypto from 'crypto';

// ✅ Secure unique invoice
export function generateInvoiceID() {
	return 'Shalban-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

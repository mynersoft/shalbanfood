export const getOrderPaymentInfo = (order) => {
	const total = Number(order?.total || 0);
	const paidAmount = Number(order?.payment?.paidAmount || 0);

	return {
		total,
		paidAmount,
		dueAmount: Math.max(0, total - paidAmount),
	};
};

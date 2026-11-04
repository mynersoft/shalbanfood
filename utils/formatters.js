export const formatCurrency = (amount) => {
	const value = Number(amount ?? 0);

	if (!Number.isFinite(value)) {
		return '৳0.00';
	}

	return `৳${value.toLocaleString('en-BD', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
};

export const formatDate = (value) => {
	if (!value) return 'Date unavailable';

	const date = new Date(value);
	return new Intl.DateTimeFormat('en-BD', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

export const formatNumber = (number) => {
	if (number >= 1000000) {
		return (number / 1000000).toFixed(1) + 'M';
	}
	if (number >= 1000) {
		return (number / 1000).toFixed(1) + 'K';
	}
	return number.toString();
};

export const formatUnit = (value, unit) => {
	const units = {
		gram: 'গ্রাম',
		kg: 'কেজি',
		milliliter: 'মিলি',
		litre: 'লিটার',
		piece: 'পিস',
	};

	return `${value} ${units[unit] || unit || ''}`.trim();
};

export const getStatusColor = (status) => {
	const colors = {
		active: 'green',
		pending: 'yellow',
		processing: 'blue',
		shipped: 'purple',
		delivered: 'green',
		cancelled: 'red',
		returned: 'orange',
		inactive: 'gray',
		out_of_stock: 'red',
		in_stock: 'green',
		low_stock: 'yellow',
	};
	return colors[status] || 'gray';
};

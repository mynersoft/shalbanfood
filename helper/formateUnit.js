

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

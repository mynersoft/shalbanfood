const DEFAULT_DISTRICT_RATES = [
	{ district: 'Dhaka', charge: 70 },
	{ district: 'Tangail', charge: 100 },
	{ district: 'Rajsahi', charge: 120 },
];

const normalizeDistrict = (value = '') =>
	String(value).trim().toLocaleLowerCase('bn-BD').replace(/\s+/g, '');

export function calculateShippingFee({
	subtotal = 0,
	district = '',
	settings = null,
} = {}) {
	const amount = Math.max(Number(subtotal) || 0, 0);

	const districtRates =
		Array.isArray(settings?.districtRates) &&
		settings.districtRates.length > 0
			? settings.districtRates
			: DEFAULT_DISTRICT_RATES;

	const defaultCharge = Number.isFinite(Number(settings?.defaultCharge))
		? Math.max(Number(settings.defaultCharge), 0)
		: 150;

	const freeDeliveryEnabled = settings?.freeDeliveryEnabled === true;

	const freeDeliveryMinimum = Math.max(
		Number(settings?.freeDeliveryMinimum) || 0,
		0
	);

	if (freeDeliveryEnabled && amount >= freeDeliveryMinimum) {
		return 0;
	}

	if (!district) {
		return 0;
	}

	const normalizedDistrict = normalizeDistrict(district);

	const matchedRate = districtRates.find(
		(rate) => normalizeDistrict(rate.district) === normalizedDistrict
	);

	return matchedRate
		? Math.max(Number(matchedRate.charge) || 0, 0)
		: defaultCharge;
}

export function getOrderWhatsAppUrl(order) {
	const phone = String(order?.customer?.phone || order?.phone || '').replace(
		/\D/g,
		''
	);

	if (!phone) return null;

	// Bangladesh number normalization
	let whatsappPhone = phone;

	if (whatsappPhone.startsWith('0')) {
		whatsappPhone = `88${whatsappPhone}`;
	} else if (
		whatsappPhone.length === 10 &&
		!whatsappPhone.startsWith('880')
	) {
		whatsappPhone = `880${whatsappPhone}`;
	}

	const orderId = order?.invoiceNo || order?._id || 'N/A';

	const customerName = order?.customer?.name || order?.name || 'Customer';

	const status = order?.status || 'pending';

	const total = Number(order?.totalAmount ?? order?.total ?? 0);

	const message = [
		`Assalamu Alaikum ${customerName},`,
		'',
		`শালবন ফুডে অর্ডার করার জন্য ধন্যবাদ। আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে`,
		// `প্রোডাক্টের নাম: ${order?.product?.name || 'N/A'}`,
		`অর্ডার নম্বর: ${orderId}`,
		`অর্ডারের স্ট্যাটাস: ${status}`,
		`অর্ডারের মোট মূল্য: ৳${total.toLocaleString('en-BD')}`,
		'',
		'ধন্যবাদ,',
		'Shalban Food',
	].join('\n');

	return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}

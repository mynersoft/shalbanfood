export async function getSingleProduct(slug) {
	try {
		const res = await fetch(
			`${process.env.API_URL}/products/slug/${slug}`,
			{
				cache: 'no-store',
				next: { revalidate: 0 },
			}
		);

		if (!res.ok) return null;

		const data = await res.json();
		return data.product ?? data;
	} catch (error) {
		console.error('getProduct error:', error);
		return null;
	}
}

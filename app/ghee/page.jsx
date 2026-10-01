import GheeLandingPage from '@/components/products/GheeLandingPage';

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || 'https://shalbanfood.vercel.app';

const GHEE_IMAGE =
	'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/shalbanfood/ghee-250g.jpg';

export const metadata = {
	title: 'গাওয়া ঘি | ২৫০ গ্রাম, ৫০০ গ্রাম ও ১ কেজি | Shalban Food',

	description:
		'শালবন ফুডের গাওয়া ঘি কিনুন ২৫০ গ্রাম ৳৩৫০, ৫০০ গ্রাম ৳৬৫০ ও ১ কেজি ৳১,৩০০ দামে। খিচুড়ি, পোলাও, রুটি, পরোটা ও বিভিন্ন রান্নায় ব্যবহারযোগ্য।',

	keywords: [
		'গাওয়া ঘি',
		'গাওয়া ঘি দাম',
		'গাওয়া ঘি বাংলাদেশ',
		'গাওয়া ঘি ২৫০ গ্রাম',
		'গাওয়া ঘি ৫০০ গ্রাম',
		'গাওয়া ঘি ১ কেজি',
		'ঘি কিনুন',
		'অনলাইনে ঘি কিনুন',
		'গাওয়া ঘি',
		'গাওয়া ঘি অনলাইন',
		'Shalban Food Ghee',
		'Shalban Food',
	],

	alternates: {
		canonical: `${SITE_URL}/product/gawa-ghee`,
	},

	openGraph: {
		title: 'শালবন ফুড গাওয়া ঘি | ২৫০g, ৫০০g ও ১kg',

		description:
			'শালবন ফুডের গাওয়া ঘি — ২৫০ গ্রাম ৳৩৫০, ৫০০ গ্রাম ৳৬৫০ এবং ১ কেজি ৳১,৩০০। অনলাইনে অর্ডার করুন।',

		url: `${SITE_URL}/product/gawa-ghee`,

		siteName: 'Shalban Food',

		type: 'website',

		locale: 'bn_BD',

		images: [
			{
				url: GHEE_IMAGE,
				width: 1200,
				height: 1200,
				alt: 'শালবন ফুড গাওয়া ঘি',
			},
		],
	},

	twitter: {
		card: 'summary_large_image',

		title: 'শালবন ফুড গাওয়া ঘি',

		description: '২৫০g, ৫০০g ও ১kg গাওয়া ঘি — Shalban Food',

		images: [GHEE_IMAGE],
	},

	robots: {
		index: true,
		follow: true,

		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
	},
};

export default function Page() {
	return <GheeLandingPage />;
}

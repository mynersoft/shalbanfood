import './globals.css';

import InternetStatus from '@/components/InternetStatus';
import { GlobalInitializer } from '@/components/fetch/GlobalInitializer';

import { Toaster } from 'react-hot-toast';

import Providers from './providers';

import InitialLoader from '@/components/InitialLoader';
import InitData from '@/components/InitData';
import ConditionalMainLayout from '@/components/layout/ConditionalMainLayout';

/* =============sggs============================================
   SITE CONFIGURATION
========================================================= */

const BASE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || 'https://shalbanfood.vercel.app';

const SITE_NAME = 'Shalban Food';

const SITE_NAME_BN = 'শালবন ফুড';

const SITE_DESCRIPTION_EN =
	'Shalban Food is a Bangladeshi online food store offering quality honey, ghee, dry fruits, mustard oil and natural food products with delivery across Bangladesh.';

const SITE_DESCRIPTION_BN =
	'শালবন ফুড থেকে সংগ্রহ করুন মধু, গাওয়া ঘি, ড্রাই ফ্রুটস, সরিষার তেল ও মানসম্মত প্রাকৃতিক খাবার। বাংলাদেশজুড়ে ডেলিভারি সুবিধা।';

const SITE_DESCRIPTION =
	'Shalban Food | শালবন ফুড — মধু, ঘি, ড্রাই ফ্রুটস, সরিষার তেল ও মানসম্মত প্রাকৃতিক খাবারের অনলাইন স্টোর। বাংলাদেশজুড়ে ডেলিভারি।';

const OG_IMAGE = '/og-image.png';

const LOGO_URL = `${BASE_URL}/logo.png`;

const FACEBOOK_URL = 'https://www.facebook.com/shalbanfood';

/* =========================================================
   SEO METADATA
========================================================= */

export const metadata = {
	metadataBase: new URL(BASE_URL),

	/* -------------------------------------------------------
	   TITLE
	------------------------------------------------------- */

	title: {
		default:
			'Shalban Food | শালবন ফুড – Honey, Ghee & Natural Food in Bangladesh',

		template: '%s | Shalban Food – শালবন ফুড',
	},

	/* -------------------------------------------------------
	   DESCRIPTION
	------------------------------------------------------- */

	description: SITE_DESCRIPTION,

	/* -------------------------------------------------------
	   KEYWORDS
	------------------------------------------------------- */

	keywords: [
		/* Brand */
		'Shalban Food',
		'Shalban',
		'Shalban Food Bangladesh',
		'Shalban Food Tangail',
		'শালবন ফুড',
		'শালবন',
		'শালবন ফুড বাংলাদেশ',

		/* Honey - English */
		'pure honey Bangladesh',
		'natural honey Bangladesh',
		'honey online Bangladesh',
		'buy honey online Bangladesh',
		'best honey Bangladesh',
		'Sundarban honey',
		'Sundarban honey Bangladesh',
		'litchi flower honey',
		'litchi flower honey Bangladesh',
		'black seed honey',
		'kalojira flower honey',
		'raw honey Bangladesh',
		'organic honey Bangladesh',

		/* Honey - Bangla */
		'খাঁটি মধু',
		'মধু',
		'বাংলাদেশের খাঁটি মধু',
		'সুন্দরবনের মধু',
		'সুন্দরবনের খলিশা মধু',
		'লিচু ফুলের মধু',
		'কালোজিরা ফুলের মধু',
		'কালোজিরা মধু',
		'অনলাইনে মধু',
		'মধু কিনুন',

		/* Ghee - English */
		'pure ghee Bangladesh',
		'ghee Bangladesh',
		'desi ghee Bangladesh',
		'cow ghee Bangladesh',
		'buy ghee online Bangladesh',
		'ghee online Bangladesh',
		'premium ghee Bangladesh',

		/* Ghee - Bangla */
		'খাঁটি ঘি',
		'গাওয়া ঘি',
		'গাওয়া ঘি',
		'দেশি ঘি',
		'গরুর ঘি',
		'খাঁটি গাওয়া ঘি',
		'অনলাইনে ঘি',
		'ঘি কিনুন',

		/* Dry Food - English */
		'dry fruits Bangladesh',
		'dry fruits online Bangladesh',
		'nuts Bangladesh',
		'mixed nuts Bangladesh',
		'healthy snacks Bangladesh',
		'natural snacks Bangladesh',

		/* Dry Food - Bangla */
		'ড্রাই ফ্রুটস',
		'ড্রাই ফুড',
		'নাটমিক্স',
		'বাদাম',
		'মিশ্র বাদাম',
		'স্বাস্থ্যকর খাবার',
		'প্রাকৃতিক খাবার',

		/* Mustard Oil */
		'mustard oil Bangladesh',
		'pure mustard oil Bangladesh',
		'সরিষার তেল',
		'খাঁটি সরিষার তেল',

		/* General */
		'natural food Bangladesh',
		'natural food products Bangladesh',
		'quality food Bangladesh',
		'online food shop Bangladesh',
		'online grocery Bangladesh',
		'food store Bangladesh',
		'healthy food Bangladesh',
		'প্রাকৃতিক খাবার',
		'মানসম্মত খাবার',
		'অনলাইন ফুড শপ',
		'অনলাইন খাবারের দোকান',
	],

	/* -------------------------------------------------------
	   AUTHOR / PUBLISHER
	------------------------------------------------------- */

	authors: [
		{
			name: SITE_NAME,
			url: BASE_URL,
		},
	],

	creator: SITE_NAME,

	publisher: SITE_NAME,

	applicationName: 'Shalban Food | শালবন ফুড',

	category: 'Food & Beverage',

	/* -------------------------------------------------------
	   CANONICAL
	------------------------------------------------------- */

	alternates: {
		canonical: '/',
		languages: {
			'bn-BD': '/',
			'en-BD': '/',
		},
	},

	/* -------------------------------------------------------
	   ROBOTS
	------------------------------------------------------- */

	robots: {
		index: true,
		follow: true,

		googleBot: {
			index: true,
			follow: true,

			'max-video-preview': -1,

			'max-image-preview': 'large',

			'max-snippet': -1,
		},
	},

	/* -------------------------------------------------------
	   OPEN GRAPH
	------------------------------------------------------- */

	openGraph: {
		type: 'website',

		locale: 'bn_BD',

		alternateLocale: ['en_US'],

		url: BASE_URL,

		siteName: 'Shalban Food | শালবন ফুড',

		title: 'Shalban Food | শালবন ফুড – Honey, Ghee & Natural Food',

		description: SITE_DESCRIPTION,

		images: [
			{
				url: OG_IMAGE,

				width: 1200,

				height: 630,

				alt: 'Shalban Food | শালবন ফুড – Honey, Ghee & Natural Food Products',

				type: 'image/png',
			},
		],
	},

	/* -------------------------------------------------------
	   TWITTER / X
	------------------------------------------------------- */

	twitter: {
		card: 'summary_large_image',

		title: 'Shalban Food | শালবন ফুড – Honey, Ghee & Natural Food',

		description: SITE_DESCRIPTION,

		images: [OG_IMAGE],
	},

	/* -------------------------------------------------------
	   ICONS
	------------------------------------------------------- */

	icons: {
		icon: [
			{
				url: '/favicon.ico',
			},

			{
				url: '/icon.png',
				type: 'image/png',
			},
		],

		apple: [
			{
				url: '/apple-icon.png',
			},
		],
	},

	manifest: '/manifest.webmanifest',
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({ children }) {
	/* =======================================================
	   ORGANIZATION SCHEMA
	======================================================= */

	const organizationSchema = {
		'@context': 'https://schema.org',

		'@type': 'Organization',

		'@id': `${BASE_URL}/#organization`,

		name: SITE_NAME,

		alternateName: SITE_NAME_BN,

		url: BASE_URL,

		logo: {
			'@type': 'ImageObject',

			url: LOGO_URL,

			width: 512,

			height: 512,
		},

		description: SITE_DESCRIPTION,

		sameAs: [FACEBOOK_URL],
	};

	/* =======================================================
	   WEBSITE SCHEMA
	======================================================= */

	const websiteSchema = {
		'@context': 'https://schema.org',

		'@type': 'WebSite',

		'@id': `${BASE_URL}/#website`,

		url: BASE_URL,

		name: SITE_NAME,

		alternateName: [
			SITE_NAME_BN,

			'Shalban Food Bangladesh',

			'শালবন ফুড বাংলাদেশ',
		],

		description: SITE_DESCRIPTION,

		publisher: {
			'@id': `${BASE_URL}/#organization`,
		},

		inLanguage: ['bn-BD', 'en-BD'],
	};

	/* =======================================================
	   WEBPAGE SCHEMA
	======================================================= */

	const webpageSchema = {
		'@context': 'https://schema.org',

		'@type': 'WebPage',

		'@id': `${BASE_URL}/#webpage`,

		url: BASE_URL,

		name: 'Shalban Food | শালবন ফুড',

		headline: 'Shalban Food | শালবন ফুড – Honey, Ghee & Natural Food',

		description: SITE_DESCRIPTION,

		isPartOf: {
			'@id': `${BASE_URL}/#website`,
		},

		about: {
			'@id': `${BASE_URL}/#organization`,
		},

		inLanguage: ['bn-BD', 'en-BD'],
	};

	/* =======================================================
	   RENDER
	======================================================= */

	return (
		<html lang="bn">
			<head>
				{/* =============================================
				    ORGANIZATION JSON-LD
				============================================= */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationSchema),
					}}
				/>

				{/* =============================================
				    WEBSITE JSON-LD
				============================================= */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>

				{/* =============================================
				    WEBPAGE JSON-LD
				============================================= */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(webpageSchema),
					}}
				/>

				<script src="https://cdn.jsdelivr.net/npm/eruda"></script>

				<script>eruda.init();</script>
			</head>

			<body className="bg-white text-gray-900">
				{/* <InitialLoader> */}
				<Toaster position="top-right" reverseOrder={false} />
				<InternetStatus />
				<Providers>
					<ConditionalMainLayout>
						<GlobalInitializer />
						{children}
					</ConditionalMainLayout>
				</Providers>
				{/* </InitialLoader> */}
			</body>
		</html>
	);
}

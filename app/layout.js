import "./globals.css";

import InternetStatus from "@/components/InternetStatus";
import { GlobalInitializer } from "@/components/fetch/GlobalInitializer";
import Header from "@/components/header/HeaderNew";
import InitialLoader from "@/components/InitialLoader";
import Footer from "@/components/footer/Footer";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";

/* Site Configuration */

const BASE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://shalbanfood.vercel.app";

const SITE_NAME = "Shalban Food";

const SITE_DESCRIPTION =
	"Shop pure honey, ghee, dry fruits, mustard oil and quality natural food products online at Shalban Food. Trusted products with delivery across Bangladesh.";

const OG_IMAGE = "/og-image.png";

/* SEO Metadata */

export const metadata = {
	metadataBase: new URL(BASE_URL),

	title: {
		default:
			"Shalban Food – Pure Honey, Ghee, Dry Fruits & Natural Foods in Bangladesh",
		template: "%s | Shalban Food",
	},

	description: SITE_DESCRIPTION,

	keywords: [
		"Shalban Food",
		"Shalban",
		"শালবন ফুড",
		"শালবন",
		"Pure Honey Bangladesh",
		"খাঁটি মধু",
		"Sundarban Honey",
		"Litchi Flower Honey",
		"Black Seed Honey",
		"Natural Honey Bangladesh",
		"Honey Online Bangladesh",
		"Buy Honey Bangladesh",
		"Ghee Bangladesh",
		"Pure Ghee Bangladesh",
		"Desi Ghee Bangladesh",
		"Dry Fruits Bangladesh",
		"Mustard Oil Bangladesh",
		"Pure Mustard Oil",
		"Natural Food Bangladesh",
		"Organic Food Bangladesh",
		"Healthy Food Bangladesh",
		"Natural Products Bangladesh",
		"Online Food Shop Bangladesh",
	],

	authors: [
		{
			name: SITE_NAME,
			url: BASE_URL,
		},
	],

	creator: SITE_NAME,
	publisher: SITE_NAME,

	category: "Food & Beverage",

	alternates: {
		canonical: "/",
	},

	robots: {
		index: true,
		follow: true,

		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	openGraph: {
		type: "website",
		locale: "en_BD",
		url: BASE_URL,
		siteName: SITE_NAME,

		title:
			"Shalban Food – Pure Honey, Ghee, Dry Fruits & Natural Foods",

		description: SITE_DESCRIPTION,

		images: [
			{
				url: OG_IMAGE,
				width: 1200,
				height: 630,
				alt:
					"Shalban Food – Pure Honey, Ghee, Dry Fruits & Natural Food Products",
				type: "image/png",
			},
		],
	},

	twitter: {
		card: "summary_large_image",

		title:
			"Shalban Food – Pure Honey, Ghee, Dry Fruits & Natural Foods",

		description: SITE_DESCRIPTION,

		images: [OG_IMAGE],
	},

	icons: {
		icon: [
			{
				url: "/favicon.ico",
			},
			{
				url: "/icon.png",
				type: "image/png",
			},
		],

		apple: [
			{
				url: "/apple-icon.png",
			},
		],
	},

	manifest: "/manifest.webmanifest",
};

/* Root Layout */

export default function RootLayout({ children }) {
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${BASE_URL}/#organization`,
		name: SITE_NAME,
		alternateName: "শালবন ফুড",
		url: BASE_URL,

		logo: {
			"@type": "ImageObject",
			url: `${BASE_URL}/logo.png`,
		},

		description:
			"Shalban Food is an online food brand in Bangladesh offering honey, ghee, dry fruits, mustard oil and quality natural food products.",

		sameAs: ["https://www.facebook.com/shalbanfood"],
	};

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${BASE_URL}/#website`,
		url: BASE_URL,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,

		publisher: {
			"@id": `${BASE_URL}/#organization`,
		},

		inLanguage: ["en-BD", "bn-BD"],
	};

	return (
		<html lang="en">
			<head>
				{/* Google Search Console Verification */}

				<meta
					name="google-site-verification"
					content="gJQMxjw8mMiztrmpVMv1SEi5hXqSI3LhvyGr5dFb9pY"
				/>

				{/* Organization Schema */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationSchema),
					}}
				/>

				{/* Website Schema */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>
			</head>

			<body className="dark bg-gray-900 text-gray-100">
				<InitialLoader>
					<Toaster
						position="top-right"
						reverseOrder={false}
					/>

					<InternetStatus />

					<Providers>
						<Header />

						<GlobalInitializer />

						{children}

						<Footer />
					</Providers>
				</InitialLoader>

				<Analytics />
			</body>
		</html>
	);
}
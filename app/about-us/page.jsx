import Link from 'next/link';
import {
	ArrowRight,
	Award,
	CheckCircle2,
	Heart,
	Leaf,
	MapPin,
	ShieldCheck,
	ShoppingBag,
	Truck,
	Users,
} from 'lucide-react';

const BASE_URL =
	process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shalbanfood.shop';

const BRAND = '#1f5d3b';

export const metadata = {
	metadataBase: new URL(BASE_URL),
	title: 'About Us | Shalban Food – প্রাকৃতিক খাদ্যপণ্যের বিশ্বস্ত ঠিকানা',
	description:
		'Shalban Food সম্পর্কে জানুন। খাঁটি মধু, গাওয়া ঘি, নাটমিক্স ও অন্যান্য প্রাকৃতিক খাদ্যপণ্য নিয়ে আমাদের যাত্রা, লক্ষ্য ও গ্রাহকের প্রতি প্রতিশ্রুতি।',
	keywords: [
		'Shalban Food',
		'শালবন ফুড',
		'খাঁটি মধু',
		'গাওয়া ঘি',
		'প্রাকৃতিক খাদ্য',
		'মধু বাংলাদেশ',
		'Natural Food Bangladesh',
	],
	authors: [{ name: 'Shalban Food', url: BASE_URL }],
	creator: 'Shalban Food',
	publisher: 'Shalban Food',
	alternates: {
		canonical: '/about-us',
	},
	openGraph: {
		title: 'About Us | Shalban Food',
		description:
			'খাঁটি মধু, গাওয়া ঘি ও প্রাকৃতিক খাদ্যপণ্য নিয়ে Shalban Food-এর গল্প, লক্ষ্য ও গ্রাহকের প্রতি আমাদের প্রতিশ্রুতি।',
		url: `${BASE_URL}/about-us`,
		siteName: 'Shalban Food',
		locale: 'bn_BD',
		type: 'website',
		images: [
			{
				url: '/images/shalban-food-og.jpg',
				width: 1200,
				height: 630,
				alt: 'Shalban Food',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'About Us | Shalban Food',
		description: 'Shalban Food – স্বাদের সাথে আস্থার বন্ধন।',
		images: ['/images/shalban-food-og.jpg'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
		},
	},
};

const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	'@id': `${BASE_URL}/#organization`,
	name: 'Shalban Food',
	url: BASE_URL,
	logo: `${BASE_URL}/logo.png`,
	description:
		'Shalban Food is a Bangladesh-based online food brand offering honey, ghee, nut mix and other natural food products.',
	telephone: '+8801603816721',
	areaServed: {
		'@type': 'Country',
		name: 'Bangladesh',
	},
	contactPoint: {
		'@type': 'ContactPoint',
		telephone: '+8801603816721',
		contactType: 'customer service',
		availableLanguage: ['Bengali', 'English'],
	},
};

const breadcrumbSchema = {
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: BASE_URL,
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: 'About Us',
			item: `${BASE_URL}/about-us`,
		},
	],
};

const products = [
	{
		icon: '🍯',
		title: 'প্রাকৃতিক মধু',
		description: 'বিভিন্ন ফুলের মধুসহ প্রাকৃতিক মধুর সংগ্রহ।',
	},
	{
		icon: '🧈',
		title: 'গাওয়া ঘি',
		description: 'দৈনন্দিন খাবারের জন্য মানসম্মত গাওয়া ঘি।',
	},
	{
		icon: '🌰',
		title: 'নাটমিক্স',
		description: 'বিভিন্ন বাদাম ও ড্রাই ফ্রুটসের সমন্বয়।',
	},
	{
		icon: '🌿',
		title: 'প্রাকৃতিক খাদ্যপণ্য',
		description: 'বাছাই করা আরও বিভিন্ন প্রয়োজনীয় খাদ্যপণ্য।',
	},
];

const values = [
	{
		icon: ShieldCheck,
		title: 'মানের প্রতি যত্ন',
		description:
			'পণ্য নির্বাচন থেকে প্যাকেজিং পর্যন্ত মান ও পরিচ্ছন্নতাকে গুরুত্ব দিই।',
	},
	{
		icon: Heart,
		title: 'গ্রাহকের আস্থা',
		description: 'দীর্ঘমেয়াদি গ্রাহক সম্পর্ক ও বিশ্বাসকে আমরা গুরুত্ব দিই।',
	},
	{
		icon: Truck,
		title: 'যত্নশীল ডেলিভারি',
		description:
			'অর্ডার করা পণ্য নিরাপদে ও যত্নের সঙ্গে পৌঁছে দেওয়ার চেষ্টা করি।',
	},
	{
		icon: Award,
		title: 'দায়িত্বশীল সেবা',
		description:
			'গ্রাহকের মতামতকে গুরুত্ব দিয়ে সেবা উন্নত করার চেষ্টা করি।',
	},
];

const commitments = [
	'মানসম্মত খাদ্যপণ্য নির্বাচন',
	'পরিচ্ছন্ন ও যত্নশীল প্যাকেজিং',
	'অর্ডার প্রসেসিংয়ে গুরুত্ব',
	'সারাদেশে ডেলিভারি সুবিধা',
	'গ্রাহকের সঙ্গে স্বচ্ছ যোগাযোগ',
	'বিক্রয়-পরবর্তী সহযোগিতা',
];

function SectionHeading({ eyebrow, title, description }) {
	return (
		<div className="mx-auto mb-10 max-w-2xl text-center">
			<p
				className="text-xs font-bold uppercase tracking-[0.18em]"
				style={{ color: BRAND }}>
				{eyebrow}
			</p>

			<h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
				{title}
			</h2>

			{description && (
				<p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
					{description}
				</p>
			)}
		</div>
	);
}

export default function AboutUsPage() {
	return (
		<main className="min-h-screen bg-white text-gray-800">
			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>

			{/* Breadcrumb */}
			<div className="border-b border-gray-100 bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-3">
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-2 text-xs sm:text-sm">
						<Link
							href="/"
							className="text-gray-500 hover:text-[#1f5d3b]">
							Home
						</Link>
						<span className="text-gray-300">/</span>
						<span className="font-medium text-gray-800">
							About Us
						</span>
					</nav>
				</div>
			</div>

			{/* Hero */}
			<section className="overflow-hidden bg-[#f3f7f2]">
				<div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
					<div>
						<span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#1f5d3b]">
							<Leaf size={15} />
							প্রাকৃতিক খাবারের বিশ্বস্ত ঠিকানা
						</span>

						<h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
							প্রকৃতির স্বাদ,
							<span className="mt-1 block text-[#1f5d3b]">
								আপনার পরিবারের জন্য
							</span>
						</h1>

						<p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
							Shalban Food একটি বাংলাদেশভিত্তিক অনলাইন ফুড
							ব্র্যান্ড। ভালো মানের মধু, গাওয়া ঘি, নাটমিক্স ও
							প্রাকৃতিক খাদ্যপণ্য মানুষের কাছে সহজে পৌঁছে দেওয়াই
							আমাদের লক্ষ্য।
						</p>

						<p className="mt-3 text-sm font-medium text-[#1f5d3b]">
							স্বাদের সাথে আস্থার বন্ধন
						</p>

						<div className="mt-7 flex flex-wrap gap-3">
							<Link
								href="/shop"
								className="inline-flex items-center gap-2 rounded-lg bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
								<ShoppingBag size={17} />
								পণ্য দেখুন
								<ArrowRight size={17} />
							</Link>

							<Link
								href="/contact-us"
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#1f5d3b] hover:text-[#1f5d3b]">
								যোগাযোগ করুন
							</Link>
						</div>
					</div>

					{/* Brand Visual */}
					<div className="mx-auto w-full max-w-md">
						<div className="rounded-2xl border border-white bg-white p-4 shadow-lg sm:p-5">
							<div className="flex aspect-[5/4] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-100 via-amber-50 to-orange-100">
								<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1f5d3b] shadow-md">
									<Leaf className="h-10 w-10 text-white" />
								</div>

								<h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
									Shalban{' '}
									<span className="text-[#1f5d3b]">Food</span>
								</h2>

								<p className="mt-2 text-xs font-medium tracking-wide text-gray-500">
									স্বাদের সাথে আস্থার বন্ধন
								</p>
							</div>
						</div>

						<div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
							<ShieldCheck size={16} className="text-[#1f5d3b]" />
							মান, আস্থা ও যত্নের প্রতিশ্রুতি
						</div>
					</div>
				</div>
			</section>

			{/* About */}
			<section className="py-14 sm:py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<SectionHeading
						eyebrow="About Shalban Food"
						title="আমাদের সম্পর্কে"
						description="ভালো মানের প্রাকৃতিক খাদ্যপণ্য মানুষের কাছে পৌঁছে দেওয়ার একটি আন্তরিক উদ্যোগ।"
					/>

					<div className="mx-auto max-w-3xl space-y-4 text-center text-sm leading-8 text-gray-600 sm:text-base">
						<p>
							Shalban Food একটি বাংলাদেশভিত্তিক অনলাইন খাদ্যপণ্যের
							ব্র্যান্ড। আমাদের উদ্দেশ্য হলো ভালো মানের প্রাকৃতিক
							খাদ্যপণ্য বেছে নিয়ে সেগুলো যত্নের সঙ্গে গ্রাহকের
							কাছে পৌঁছে দেওয়া।
						</p>

						<p>
							আমরা বিশ্বাস করি, খাবারের ক্ষেত্রে মান, পরিচ্ছন্নতা,
							স্বচ্ছতা এবং গ্রাহকের আস্থা অত্যন্ত গুরুত্বপূর্ণ।
							তাই প্রতিটি অর্ডারকে আমরা শুধু একটি বিক্রয় হিসেবে
							নয়, বরং একটি দীর্ঘমেয়াদি সম্পর্কের সুযোগ হিসেবে
							দেখি।
						</p>
					</div>
				</div>
			</section>

			{/* Products */}
			<section className="bg-gray-50 py-14 sm:py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<SectionHeading
						eyebrow="Our Products"
						title="আমাদের পণ্য"
						description="দৈনন্দিন জীবনের জন্য বিভিন্ন প্রাকৃতিক ও প্রয়োজনীয় খাদ্যপণ্য।"
					/>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
						{products.map((product) => (
							<div
								key={product.title}
								className="group rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-md sm:p-6">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-3xl transition group-hover:bg-green-100">
									{product.icon}
								</div>

								<h3 className="mt-4 text-sm font-bold text-gray-900 sm:text-base">
									{product.title}
								</h3>

								<p className="mt-2 text-xs leading-6 text-gray-500 sm:text-sm">
									{product.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Why Choose Us */}
			<section className="py-14 sm:py-16">
				<div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1f5d3b]">
							Why Shalban Food
						</p>

						<h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
							কেন Shalban Food?
						</h2>

						<p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
							ভালো খাবার নির্বাচন করা থেকে শুরু করে প্যাকেজিং এবং
							ডেলিভারি পর্যন্ত প্রতিটি ধাপে আমরা যত্নশীল থাকার
							চেষ্টা করি।
						</p>

						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							{commitments.map((item) => (
								<div
									key={item}
									className="flex items-start gap-2.5">
									<CheckCircle2
										size={18}
										className="mt-0.5 shrink-0 text-[#1f5d3b]"
									/>
									<span className="text-sm text-gray-700">
										{item}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 sm:gap-4">
						{values.map((value) => {
							const Icon = value.icon;

							return (
								<div
									key={value.title}
									className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#1f5d3b]">
										<Icon size={21} />
									</div>

									<h3 className="mt-4 text-sm font-bold text-gray-900 sm:text-base">
										{value.title}
									</h3>

									<p className="mt-2 text-xs leading-6 text-gray-500 sm:text-sm">
										{value.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Mission */}
			<section className="bg-[#1f5d3b] py-14 sm:py-16">
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
						<Leaf size={25} className="text-white" />
					</div>

					<h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
						আমাদের লক্ষ্য
					</h2>

					<p className="mt-4 text-sm leading-8 text-green-50 sm:text-base">
						বাংলাদেশের মানুষের কাছে ভালো মানের প্রাকৃতিক খাদ্যপণ্য
						সহজে পৌঁছে দেওয়া এবং একটি বিশ্বস্ত দেশীয় ফুড ব্র্যান্ড
						হিসেবে নিজেদের গড়ে তোলা— এটাই Shalban Food-এর মূল
						লক্ষ্য।
					</p>
				</div>
			</section>

			{/* Customer Promise */}
			<section className="py-14 sm:py-16">
				<div className="mx-auto max-w-4xl px-4 sm:px-6">
					<div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-10 text-center sm:px-10 sm:py-12">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-[#1f5d3b]">
							<Users size={24} />
						</div>

						<h2 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
							আপনার আস্থাই আমাদের শক্তি
						</h2>

						<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
							Shalban Food-এর সঙ্গে আপনার প্রতিটি অর্ডার আমাদের
							জন্য গুরুত্বপূর্ণ। আপনার প্রয়োজন, মতামত এবং
							অভিজ্ঞতাকে গুরুত্ব দিয়ে আমরা আমাদের পণ্য ও সেবা আরও
							ভালো করার চেষ্টা করি।
						</p>

						<div className="mt-7 flex flex-wrap justify-center gap-3">
							<a
								href="https://wa.me/8801603816721"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-lg bg-[#1f5d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17472d]">
								WhatsApp-এ যোগাযোগ করুন
								<ArrowRight size={17} />
							</a>

							<Link
								href="/shop"
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#1f5d3b] hover:text-[#1f5d3b]">
								<ShoppingBag size={17} />
								Shop Now
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Contact */}
			<section className="border-t border-gray-100 bg-white py-6">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 text-sm text-gray-500 sm:flex-row sm:gap-8 sm:px-6">
					<div className="flex items-center gap-2">
						<MapPin size={17} className="text-[#1f5d3b]" />
						Madhupur, Tangail, Bangladesh
					</div>

					<a
						href="tel:+8801603816721"
						className="flex items-center gap-2 transition hover:text-[#1f5d3b]">
						<Users size={17} className="text-[#1f5d3b]" />
						01603816721
					</a>

					<Link
						href="/contact-us"
						className="font-semibold text-[#1f5d3b] hover:underline">
						Contact Us →
					</Link>
				</div>
			</section>
		</main>
	);
}

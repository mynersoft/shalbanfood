export const metadata = {
	title: 'আমাদের সম্পর্কে | Tomartbd - বাংলাদেশের নির্ভরযোগ্য অনলাইন মার্কেট',
	description:
		'Tomartbd বাংলাদেশের একটি অনলাইন মার্কেটপ্লেস যেখানে আপনি ইলেকট্রনিক্স, ইলেকট্রিক্যাল ও হোম ইউটিলিটি পণ্য কিনতে পারেন। নিরাপদ শপিং, সহজ অর্ডার, নির্ভরযোগ্য সার্ভিস।',
	keywords: [
		'Tomartbd',
		'Bangladesh online store',
		'ইলেকট্রনিক্স পণ্য বাংলাদেশ',
		'হোম ইউটিলিটি',
		'অনলাইন শপিং বাংলাদেশ',
		'বাংলাদেশ ই-কমার্স',
		'কার্ট সিস্টেম',
		'উইশলিস্ট',
	],
	openGraph: {
		title: 'Tomartbd - বাংলাদেশের অনলাইন মার্কেট',
		description:
			'ইলেকট্রনিক্স, ইলেকট্রিক্যাল ও ঘরোয়া পণ্যের জন্য বাংলাদেশের বিশ্বস্ত অনলাইন স্টোর',
		url: 'https://tomartbd.com/about',
		siteName: 'Tomartbd',
		locale: 'bn_BD',
		type: 'website',
		images: [
			{
				url: '/og-about.png',
				width: 1200,
				height: 630,
				alt: 'Tomartbd - বাংলাদেশের অনলাইন মার্কেট',
			},
		],
	},
};

export default function AboutPage() {
	return (
		<section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
			{/* Hero Section */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
					Tomartbd সম্পর্কে
				</h1>
				<p className="text-xl text-gray-600 max-w-3xl mx-auto">
					বাংলাদেশের আস্থাভাজন অনলাইন মার্কেটপ্লেস, যেখানে প্রযুক্তি ও
					দৈনন্দিন প্রয়োজন মিলবে একসাথে
				</p>
			</div>

			{/* Brand Meaning */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
				<div className="flex items-center gap-4 mb-6">
					<div className="bg-blue-100 p-3 rounded-lg">
						<span className="text-2xl font-bold text-blue-600">
							To-Mart-BD
						</span>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							নামের অর্থ
						</h2>
						<p className="text-gray-700">
							To Mart → মার্কেট / স্টোর | BD → বাংলাদেশ
						</p>
					</div>
				</div>
				<p className="text-lg text-gray-800">
					<strong>সম্পূর্ণ অর্থ:</strong> বাংলাদেশের অনলাইন
					মার্কেটপ্লেস
				</p>
			</div>

			{/* About Content */}
			<div className="grid md:grid-cols-2 gap-12 mb-16">
				<div>
					<h2 className="text-3xl font-bold text-gray-900 mb-6">
						আমাদের পরিচয়
					</h2>
					<div className="space-y-4 text-gray-700">
						<p>
							<strong>Tomartbd</strong> একটি বাংলাদেশভিত্তিক
							অনলাইন স্টোর যেখানে আপনি খুঁজে পাবেন ইলেকট্রনিক্স,
							ইলেকট্রিক্যাল এবং হোম ইউটিলিটি টাইপের নানা রকম পণ্য।
						</p>
						<p>
							আমাদের প্ল্যাটফর্ম তৈরি করা হয়েছে এমনভাবে যাতে
							কাস্টমাররা সহজেই ওয়েবসাইটে প্রবেশ করে পণ্য ব্রাউজ
							করতে পারেন, কার্টে যোগ করতে পারেন এবং মাত্র কয়েক
							ক্লিকে অর্ডার সম্পন্ন করতে পারেন।
						</p>
						<p>
							আমরা শুধু পণ্য বিক্রি করি না, বরং গড়ে তুলছি একটি
							সম্পূর্ণ শপিং অভিজ্ঞতা যা হবে সহজ, নিরাপদ এবং
							সাশ্রয়ী।
						</p>
					</div>
				</div>

				<div>
					<h2 className="text-3xl font-bold text-gray-900 mb-6">
						প্রযুক্তিগত সক্ষমতা
					</h2>
					<div className="space-y-6">
						<div className="flex items-start gap-4">
							<div className="bg-green-100 p-3 rounded-lg">
								<span className="text-2xl">⚡</span>
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									আধুনিক প্রযুক্তি স্ট্যাক
								</h3>
								<ul className="space-y-2 text-gray-700">
									<li>
										• Next.js - দ্রুতগতি এবং SEO ফ্রেন্ডলি
									</li>
									<li>• Redux - উন্নত স্টেট ম্যানেজমেন্ট</li>
									<li>
										• MongoDB - নিরাপদ ডেটাবেজ ব্যবস্থাপনা
									</li>
								</ul>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="bg-purple-100 p-3 rounded-lg">
								<span className="text-2xl">✨</span>
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									মূল বৈশিষ্ট্য
								</h3>
								<ul className="space-y-2 text-gray-700">
									<li>• পণ্যের বিস্তারিত পৃষ্ঠা</li>
									<li>• কার্ট সিস্টেম</li>
									<li>• উইশলিস্ট ব্যবস্থাপনা</li>
									<li>• নিরাপদ অর্ডার সিস্টেম</li>
									<li>• এসইও বান্ধব কাঠামো</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Vision & Mission */}
			<div className="grid md:grid-cols-2 gap-8 mb-16">
				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-blue-600 text-white p-3 rounded-lg">
							<span className="text-2xl">🎯</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900">
							আমাদের লক্ষ্য
						</h3>
					</div>
					<p className="text-gray-700">
						বাংলাদেশের প্রতিটি ঘরে সহজে, দ্রুত এবং নির্ভরযোগ্য
						অনলাইন শপিং পৌঁছে দেওয়া। আমরা চাই প্রতিটি বাংলাদেশি
						প্রযুক্তি এবং দৈনন্দিন প্রয়োজনীয় পণ্য সহজে এবং
						নির্ভরযোগ্যভাবে অ্যাক্সেস করতে পারেন।
					</p>
				</div>

				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-green-600 text-white p-3 rounded-lg">
							<span className="text-2xl">🤝</span>
						</div>
						<h3 className="text-2xl font-bold text-gray-900">
							আমাদের প্রতিশ্রুতি
						</h3>
					</div>
					<ul className="space-y-3 text-gray-700">
						<li>• গুণগত মান নিশ্চিতকরণ</li>
						<li>• সহজ এবং ব্যবহারকারীবান্ধব ইন্টারফেস</li>
						<li>• নিরাপদ এবং সময়মতো ডেলিভারি</li>
						<li>• সাশ্রয়ী মূল্যে পণ্য</li>
					</ul>
				</div>
			</div>

			{/* Why Choose Us */}
			<div className="bg-gray-50 rounded-2xl p-8 md:p-12">
				<h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
					কেন Tomartbd বেছে নিবেন?
				</h2>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{[
						{
							icon: '🚀',
							title: 'দ্রুত সার্ভিস',
							desc: 'দ্রুত অর্ডার প্রসেসিং এবং ডেলিভারি',
						},
						{
							icon: '🛡️',
							title: 'নিরাপদ শপিং',
							desc: 'সুরক্ষিত পেমেন্ট গেটওয়ে',
						},
						{
							icon: '📱',
							title: 'মোবাইল ফ্রেন্ডলি',
							desc: 'সব ডিভাইসে অপটিমাইজড অভিজ্ঞতা',
						},
						{
							icon: '💎',
							title: 'গুণগত মান',
							desc: 'প্রতিটি পণ্যের গুণগত মান নিশ্চিত',
						},
					].map((item, index) => (
						<div
							key={index}
							className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
							<div className="text-3xl mb-4">{item.icon}</div>
							<h4 className="text-lg font-semibold text-gray-900 mb-2">
								{item.title}
							</h4>
							<p className="text-gray-600 text-sm">{item.desc}</p>
						</div>
					))}
				</div>
			</div>

			{/* Final CTA */}
			<div className="text-center mt-16">
				<h3 className="text-2xl font-bold text-gray-900 mb-4">
					একসাথে যাত্রা শুরু করি
				</h3>
				<p className="text-gray-600 max-w-2xl mx-auto mb-8">
					Tomartbd শুধু একটি অনলাইন স্টোর নয়, এটি বাংলাদেশের ডিজিটাল
					শপিং অভিজ্ঞতার একটি অংশ। আমাদের সাথে যুক্ত হয়ে বাংলাদেশের
					অনলাইন মার্কেটপ্লেসের উন্নয়নে অংশ নিন।
				</p>
				<div className="flex justify-center gap-4">
					<a
						href="/products"
						className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
						পণ্য ব্রাউজ করুন
					</a>
					<a
						href="/contact"
						className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
						যোগাযোগ করুন
					</a>
				</div>
			</div>
		</section>
	);
}

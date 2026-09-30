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
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://shalbanfood.vercel.app';

export const metadata = {
        metadataBase: new URL(BASE_URL),

        title: 'About Us | Shalban Food – প্রাকৃতিক খাদ্যপণ্যের বিশ্বস্ত ঠিকানা',

        description:
                'Shalban Food সম্পর্কে জানুন। খাঁটি মধু, ঘি, নাটমিক্স ও অন্যান্য প্রাকৃতিক খাদ্যপণ্য নিয়ে আমাদের যাত্রা, লক্ষ্য, মূল্যবোধ এবং গ্রাহকের প্রতি আমাদের প্রতিশ্রুতি।',

        keywords: [
                'Shalban Food',
                'Shalban Food Bangladesh',
                'শালবন ফুড',
                'খাঁটি মধু',
                'প্রাকৃতিক খাদ্য',
                'মধু',
                'ঘি',
                'নাটমিক্স',
                'natural food Bangladesh',
                'honey Bangladesh',
        ],

        authors: [
                {
                        name: 'Shalban Food',
                        url: BASE_URL,
                },
        ],

        creator: 'Shalban Food',
        publisher: 'Shalban Food',

        alternates: {
                canonical: '/about-us',
        },

        openGraph: {
                title: 'About Us | Shalban Food',
                description:
                        'খাঁটি মধু, ঘি, নাটমিক্স ও প্রাকৃতিক খাদ্যপণ্য নিয়ে Shalban Food-এর গল্প, লক্ষ্য ও গ্রাহকের প্রতি আমাদের প্রতিশ্রুতি।',
                url: `${BASE_URL}/about-us`,
                siteName: 'Shalban Food',
                locale: 'bn_BD',
                type: 'website',
                images: [
                        {
                                url: '/images/shalban-food-og.jpg',
                                width: 1200,
                                height: 630,
                                alt: 'Shalban Food - Natural Food Products',
                        },
                ],
        },

        twitter: {
                card: 'summary_large_image',
                title: 'About Us | Shalban Food',
                description:
                        'Shalban Food – প্রাকৃতিক খাদ্যপণ্যের বিশ্বস্ত ঠিকানা।',
                images: ['/images/shalban-food-og.jpg'],
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

// Organization structured data
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

// Breadcrumb structured data
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
                description:
                        'বিভিন্ন ফুলের মধুসহ প্রাকৃতিক মধুর সংগ্রহ।',
        },
        {
                icon: '🧈',
                title: 'খাঁটি ঘি',
                description:
                        'দৈনন্দিন খাবারে ব্যবহারের জন্য মানসম্মত ঘি।',
        },
        {
                icon: '🌰',
                title: 'নাটমিক্স',
                description:
                        'বিভিন্ন বাদাম ও ড্রাই ফ্রুটসের সুস্বাদু সমন্বয়।',
        },
        {
                icon: '🌿',
                title: 'প্রাকৃতিক খাদ্যপণ্য',
                description:
                        'প্রয়োজন অনুযায়ী আরও বিভিন্ন খাদ্যপণ্য।',
        },
];

const values = [
        {
                icon: ShieldCheck,
                title: 'মানের প্রতি যত্ন',
                description:
                        'পণ্য নির্বাচন থেকে প্যাকেজিং পর্যন্ত মান ও পরিচ্ছন্নতার বিষয়টি গুরুত্বের সঙ্গে বিবেচনা করি।',
                bg: 'bg-green-50',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
        },
        {
                icon: Heart,
                title: 'গ্রাহকের আস্থা',
                description:
                        'একবারের বিক্রির চেয়ে দীর্ঘমেয়াদি গ্রাহক সম্পর্ক ও আস্থাকে আমরা বেশি গুরুত্ব দিই।',
                bg: 'bg-red-50',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-500',
        },
        {
                icon: Truck,
                title: 'যত্নশীল ডেলিভারি',
                description:
                        'অর্ডার করা পণ্য নিরাপদে ও যত্নের সঙ্গে প্যাক করে পৌঁছে দেওয়ার চেষ্টা করি।',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
        },
        {
                icon: Award,
                title: 'দায়িত্বশীলতা',
                description:
                        'গ্রাহকের মতামতকে গুরুত্ব দিয়ে আমাদের পণ্য ও সেবা নিয়মিত উন্নত করার চেষ্টা করি।',
                bg: 'bg-yellow-50',
                iconBg: 'bg-yellow-100',
                iconColor: 'text-yellow-600',
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

export default function AboutUsPage() {
        return (
                <main className="min-h-screen bg-white text-gray-800">

                        {/* Structured Data */}
                        <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                        __html: JSON.stringify(
                                                organizationSchema
                                        ),
                                }}
                        />

                        <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                        __html: JSON.stringify(
                                                breadcrumbSchema
                                        ),
                                }}
                        />

                        {/* Breadcrumb */}
                        <div className="border-b border-gray-100 bg-white">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                                        <nav
                                                aria-label="Breadcrumb"
                                                className="py-4 text-sm"
                                        >
                                                <ol className="flex items-center gap-2 text-gray-500">
                                                        <li>
                                                                <Link
                                                                        href="/"
                                                                        className="hover:text-green-600"
                                                                >
                                                                        Home
                                                                </Link>
                                                        </li>

                                                        <li>/</li>

                                                        <li
                                                                className="font-medium text-gray-900"
                                                                aria-current="page"
                                                        >
                                                                About Us
                                                        </li>
                                                </ol>
                                        </nav>
                                </div>
                        </div>

                        {/* Hero */}
                        <section className="relative overflow-hidden bg-green-50">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

                                        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                                                <div>
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-white border border-green-100 px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
                                                                <Leaf className="w-4 h-4" />
                                                                প্রাকৃতিক খাবারের বিশ্বস্ত ঠিকানা
                                                        </span>

                                                        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                                                                প্রকৃতির স্বাদ,
                                                                <span className="block text-green-600">
                                                                        আপনার পরিবারের জন্য
                                                                </span>
                                                        </h1>

                                                        <p className="mt-6 max-w-xl text-base md:text-lg leading-8 text-gray-600">
                                                                Shalban Food একটি
                                                                বাংলাদেশভিত্তিক অনলাইন
                                                                ফুড ব্র্যান্ড। ভালো
                                                                মানের মধু, ঘি,
                                                                নাটমিক্স ও প্রাকৃতিক
                                                                খাদ্যপণ্য মানুষের
                                                                কাছে সহজে পৌঁছে
                                                                দেওয়াই আমাদের
                                                                লক্ষ্য।
                                                        </p>

                                                        <div className="mt-8 flex flex-wrap gap-4">
                                                                <Link
                                                                        href="/shop"
                                                                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700"
                                                                >
                                                                        <ShoppingBag className="w-5 h-5" />
                                                                        পণ্য দেখুন
                                                                        <ArrowRight className="w-5 h-5" />
                                                                </Link>

                                                                <Link
                                                                        href="/contact-us"
                                                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-600"
                                                                >
                                                                        যোগাযোগ করুন
                                                                </Link>
                                                        </div>
                                                </div>

                                                {/* Brand Card */}
                                                <div className="relative">
                                                        <div className="mx-auto max-w-lg rounded-3xl bg-white p-5 shadow-xl">
                                                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 flex items-center justify-center">

                                                                        <div className="text-center px-6">
                                                                                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-600 shadow-lg">
                                                                                        <Leaf className="h-12 w-12 text-white" />
                                                                                </div>

                                                                                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                                                                        Shalban
                                                                                        <span className="text-green-600">
                                                                                                Food
                                                                                        </span>
                                                                                </h2>

                                                                                <p className="mt-3 text-gray-600">
                                                                                        Pure • Natural • Trusted
                                                                                </p>
                                                                        </div>

                                                                </div>
                                                        </div>
                                                </div>

                                        </div>
                                </div>
                        </section>

                        {/* About */}
                        <section className="py-16 md:py-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-3xl text-center">

                                                <span className="text-sm font-bold uppercase tracking-wider text-green-600">
                                                        About Shalban Food
                                                </span>

                                                <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
                                                        Shalban Food সম্পর্কে
                                                </h2>

                                                <p className="mt-6 text-gray-600 text-base md:text-lg leading-8">
                                                        Shalban Food একটি
                                                        বাংলাদেশভিত্তিক অনলাইন
                                                        খাদ্যপণ্যের ব্র্যান্ড।
                                                        আমাদের উদ্দেশ্য হলো
                                                        ভালো মানের প্রাকৃতিক
                                                        খাদ্যপণ্য বেছে নিয়ে
                                                        সেগুলো যত্নের সঙ্গে
                                                        গ্রাহকের কাছে পৌঁছে
                                                        দেওয়া।
                                                </p>

                                                <p className="mt-5 text-gray-600 leading-8">
                                                        আমরা বিশ্বাস করি,
                                                        খাবারের ক্ষেত্রে
                                                        মান, পরিচ্ছন্নতা,
                                                        স্বচ্ছতা এবং গ্রাহকের
                                                        আস্থা অত্যন্ত গুরুত্বপূর্ণ।
                                                        তাই প্রতিটি অর্ডারকে
                                                        আমরা শুধু একটি বিক্রয়
                                                        হিসেবে নয়, বরং একজন
                                                        গ্রাহকের সঙ্গে একটি
                                                        দীর্ঘমেয়াদি সম্পর্কের
                                                        সুযোগ হিসেবে দেখি।
                                                </p>

                                        </div>
                                </div>
                        </section>

                        {/* Products */}
                        <section className="bg-gray-50 py-16 md:py-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-2xl text-center mb-12">
                                                <span className="text-sm font-bold uppercase tracking-wider text-green-600">
                                                        Our Products
                                                </span>

                                                <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
                                                        আমাদের পণ্য
                                                </h2>

                                                <p className="mt-4 text-gray-600 leading-7">
                                                        দৈনন্দিন জীবনের জন্য
                                                        বিভিন্ন প্রাকৃতিক ও
                                                        প্রয়োজনীয় খাদ্যপণ্য
                                                        নিয়ে আমাদের যাত্রা।
                                                </p>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                                                {products.map((product) => (
                                                        <div
                                                                key={product.title}
                                                                className="group rounded-2xl bg-white border border-gray-100 p-5 md:p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                                        >
                                                                <div className="text-4xl md:text-5xl mb-5">
                                                                        {product.icon}
                                                                </div>

                                                                <h3 className="font-bold text-gray-900 text-lg">
                                                                        {product.title}
                                                                </h3>

                                                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                                                        {product.description}
                                                                </p>
                                                        </div>
                                                ))}

                                        </div>
                                </div>
                        </section>

                        {/* Why Us */}
                        <section className="py-16 md:py-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                                                <div>
                                                        <span className="text-sm font-bold uppercase tracking-wider text-green-600">
                                                                Why Shalban Food
                                                        </span>

                                                        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
                                                                কেন Shalban Food?
                                                        </h2>

                                                        <p className="mt-5 text-gray-600 leading-8">
                                                                ভালো খাবার নির্বাচন
                                                                করা থেকে শুরু করে
                                                                প্যাকেজিং এবং
                                                                ডেলিভারি পর্যন্ত
                                                                প্রতিটি ধাপে আমরা
                                                                যতটা সম্ভব যত্নশীল
                                                                থাকার চেষ্টা করি।
                                                        </p>

                                                        <div className="mt-8 space-y-4">
                                                                {commitments.map(
                                                                        (item) => (
                                                                                <div
                                                                                        key={
                                                                                                item
                                                                                        }
                                                                                        className="flex items-center gap-3"
                                                                                >
                                                                                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />

                                                                                        <span className="text-gray-700">
                                                                                                {
                                                                                                        item
                                                                                                }
                                                                                        </span>
                                                                                </div>
                                                                        )
                                                                )}
                                                        </div>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-5">
                                                        {values.map((value) => {
                                                                const Icon =
                                                                        value.icon;

                                                                return (
                                                                        <div
                                                                                key={
                                                                                        value.title
                                                                                }
                                                                                className={`rounded-2xl ${value.bg} p-6`}
                                                                        >
                                                                                <div
                                                                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${value.iconBg}`}
                                                                                >
                                                                                        <Icon
                                                                                                className={`h-6 w-6 ${value.iconColor}`}
                                                                                        />
                                                                                </div>

                                                                                <h3 className="mt-5 text-lg font-bold text-gray-900">
                                                                                        {
                                                                                                value.title
                                                                                        }
                                                                                </h3>

                                                                                <p className="mt-3 text-sm leading-7 text-gray-600">
                                                                                        {
                                                                                                value.description
                                                                                        }
                                                                                </p>
                                                                        </div>
                                                                );
                                                        })}
                                                </div>

                                        </div>
                                </div>
                        </section>

                        {/* Mission */}
                        <section className="bg-green-600 py-16 md:py-20">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-3xl text-center text-white">

                                                <Leaf className="mx-auto h-12 w-12" />

                                                <h2 className="mt-5 text-3xl md:text-4xl font-bold">
                                                        আমাদের লক্ষ্য
                                                </h2>

                                                <p className="mt-6 text-green-50 text-base md:text-lg leading-8">
                                                        বাংলাদেশের মানুষের
                                                        কাছে ভালো মানের
                                                        প্রাকৃতিক খাদ্যপণ্য
                                                        সহজে পৌঁছে দেওয়া এবং
                                                        একটি বিশ্বস্ত দেশীয়
                                                        ফুড ব্র্যান্ড হিসেবে
                                                        নিজেদের গড়ে তোলা—
                                                        এটাই Shalban Food-এর
                                                        মূল লক্ষ্য।
                                                </p>

                                        </div>
                                </div>
                        </section>

                        {/* Customer Promise */}
                        <section className="py-16 md:py-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-4xl rounded-3xl bg-gray-50 border border-gray-100 p-8 md:p-12 text-center">

                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                                        <Users className="h-7 w-7 text-green-600" />
                                                </div>

                                                <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-900">
                                                        আপনার আস্থাই আমাদের শক্তি
                                                </h2>

                                                <p className="mt-5 text-gray-600 leading-8">
                                                        Shalban Food-এর সঙ্গে
                                                        আপনার প্রতিটি অর্ডার
                                                        আমাদের জন্য গুরুত্বপূর্ণ।
                                                        আপনার প্রয়োজন, মতামত
                                                        এবং অভিজ্ঞতাকে গুরুত্ব
                                                        দিয়ে আমরা আমাদের
                                                        পণ্য ও সেবা আরও ভালো
                                                        করার চেষ্টা করি।
                                                </p>

                                                <div className="mt-8 flex flex-wrap justify-center gap-4">

                                                        <a
                                                                href="https://wa.me/8801603816721"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 font-semibold text-white transition hover:bg-green-700"
                                                        >
                                                                WhatsApp-এ যোগাযোগ করুন
                                                                <ArrowRight className="h-5 w-5" />
                                                        </a>

                                                        <Link
                                                                href="/shop"
                                                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-600"
                                                        >
                                                                <ShoppingBag className="h-5 w-5" />
                                                                Shop Now
                                                        </Link>

                                                </div>
                                        </div>
                                </div>
                        </section>

                        {/* Contact Strip */}
                        <section className="border-t border-gray-100 bg-white py-8">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10 text-sm text-gray-600">

                                                <div className="flex items-center gap-2">
                                                        <MapPin className="h-5 w-5 text-green-600" />
                                                        Bangladesh
                                                </div>

                                                <a
                                                        href="tel:+8801603816721"
                                                        className="flex items-center gap-2 hover:text-green-600"
                                                >
                                                        <Users className="h-5 w-5 text-green-600" />
                                                        01603816721
                                                </a>

                                                <Link
                                                        href="/contact-us"
                                                        className="font-semibold text-green-600 hover:text-green-700"
                                                >
                                                        Contact Us →
                                                </Link>

                                        </div>
                                </div>
                        </section>

                </main>
        );
}
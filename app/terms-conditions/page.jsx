import Link from 'next/link';
import {
        ArrowLeft,
        CheckCircle2,
        FileText,
        ShoppingBag,
} from 'lucide-react';

const BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://shalbanfood.vercel.app';

export const metadata = {
        metadataBase: new URL(BASE_URL),

        title: 'Terms & Conditions | Shalban Food',

        description:
                'Shalban Food-এর Terms & Conditions বা ব্যবহারের শর্তাবলি। অর্ডার, পেমেন্ট, ডেলিভারি, পণ্য, রিটার্ন, রিফান্ড এবং ওয়েবসাইট ব্যবহারের নিয়ম সম্পর্কে বিস্তারিত জানুন।',

        keywords: [
                'Shalban Food Terms and Conditions',
                'Shalban Food terms',
                'শালবন ফুড শর্তাবলি',
                'Terms and Conditions Bangladesh',
                'Shalban Food order policy',
                'Shalban Food return policy',
                'Shalban Food delivery policy',
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
                canonical: '/terms-conditions',
        },

        openGraph: {
                title: 'Terms & Conditions | Shalban Food',
                description:
                        'Shalban Food-এর অর্ডার, পেমেন্ট, ডেলিভারি, রিটার্ন ও ওয়েবসাইট ব্যবহারের শর্তাবলি।',
                url: `${BASE_URL}/terms-conditions`,
                siteName: 'Shalban Food',
                locale: 'bn_BD',
                type: 'website',
        },

        twitter: {
                card: 'summary',
                title: 'Terms & Conditions | Shalban Food',
                description:
                        'Shalban Food-এর Terms & Conditions সম্পর্কে বিস্তারিত জানুন।',
        },

        robots: {
                index: true,
                follow: true,
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
                        name: 'Terms & Conditions',
                        item: `${BASE_URL}/terms-conditions`,
                },
        ],
};

const sections = [
        {
                number: '01',
                title: 'সাধারণ শর্তাবলি',
                content: (
                        <>
                                <p>
                                        Shalban Food ওয়েবসাইট ব্যবহার, পণ্য
                                        ব্রাউজ করা এবং অর্ডার করার মাধ্যমে
                                        আপনি এই Terms & Conditions-এর
                                        শর্তগুলো মেনে নিচ্ছেন বলে বিবেচিত
                                        হবে।
                                </p>

                                <p>
                                        আমাদের ওয়েবসাইটের তথ্য, পণ্যের
                                        বিবরণ, মূল্য এবং নীতিমালা প্রয়োজন
                                        অনুযায়ী পূর্ব ঘোষণা ছাড়াই পরিবর্তন
                                        করা হতে পারে।
                                </p>
                        ),
                },
        },

        {
                number: '02',
                title: 'পণ্যের তথ্য',
                content: (
                        <>
                                <p>
                                        আমরা পণ্যের নাম, ছবি, ওজন, মূল্য,
                                        উপাদান এবং অন্যান্য তথ্য যথাসম্ভব
                                        সঠিকভাবে প্রদর্শনের চেষ্টা করি।
                                </p>

                                <p>
                                        তবে প্রাকৃতিক খাদ্যপণ্যের ক্ষেত্রে
                                        রং, ঘনত্ব, স্বাদ বা গন্ধে ব্যাচ,
                                        মৌসুম ও সংরক্ষণ পরিবেশের কারণে
                                        সামান্য পার্থক্য হতে পারে।
                                </p>

                                <p>
                                        ওয়েবসাইটে প্রদর্শিত পণ্যের ছবি
                                        বাস্তব পণ্যের প্রতিনিধিত্ব করে;
                                        তবে স্ক্রিন বা ডিভাইসের কারণে
                                        রঙে সামান্য পার্থক্য দেখা যেতে পারে।
                                </p>
                        </>
                ),
        },

        {
                number: '03',
                title: 'অর্ডার সংক্রান্ত নিয়ম',
                content: (
                        <>
                                <p>
                                        অর্ডার করার সময় গ্রাহককে সঠিক নাম,
                                        মোবাইল নম্বর, ঠিকানা এবং প্রয়োজনীয়
                                        অন্যান্য তথ্য প্রদান করতে হবে।
                                </p>

                                <p>
                                        ভুল বা অসম্পূর্ণ তথ্যের কারণে
                                        ডেলিভারি ব্যর্থ হলে অতিরিক্ত
                                        ডেলিভারি চার্জ প্রযোজ্য হতে পারে।
                                </p>

                                <p>
                                        কোনো পণ্য স্টকে না থাকলে বা
                                        অনিবার্য কোনো কারণে অর্ডার
                                        সম্পন্ন করা সম্ভব না হলে Shalban
                                        Food অর্ডার বাতিল বা সংশোধন করার
                                        প্রয়োজন হতে পারে।
                                </p>
                        </>
                ),
        },

        {
                number: '04',
                title: 'মূল্য ও পেমেন্ট',
                content: (
                        <>
                                <p>
                                        ওয়েবসাইটে প্রদর্শিত পণ্যের মূল্য
                                        সময়ের সঙ্গে পরিবর্তিত হতে পারে।
                                </p>

                                <p>
                                        অর্ডার নিশ্চিত করার সময় প্রযোজ্য
                                        মূল্য, ডেলিভারি চার্জ এবং অন্যান্য
                                        চার্জ গ্রাহককে জানানো হবে।
                                </p>

                                <p>
                                        Cash on Delivery, অনলাইন পেমেন্ট
                                        অথবা Shalban Food কর্তৃক অনুমোদিত
                                        অন্যান্য পেমেন্ট পদ্ধতি ব্যবহার
                                        করা যেতে পারে।
                                </p>
                        </>
                ),
        },

        {
                number: '05',
                title: 'ডেলিভারি নীতি',
                content: (
                        <>
                                <p>
                                        অর্ডারের গন্তব্য, কুরিয়ার সার্ভিস,
                                        আবহাওয়া, ছুটির দিন এবং অন্যান্য
                                        পরিস্থিতির ওপর ডেলিভারি সময়
                                        নির্ভর করতে পারে।
                                </p>

                                <p>
                                        কুরিয়ার কোম্পানির কারণে সৃষ্ট
                                        অনাকাঙ্ক্ষিত বিলম্বের জন্য
                                        নির্দিষ্ট ডেলিভারি সময় নিশ্চিত করা
                                        সম্ভব নাও হতে পারে।
                                </p>

                                <p>
                                        গ্রাহককে ডেলিভারির সময় প্যাকেটের
                                        বাহ্যিক অবস্থা এবং পণ্যের
                                        প্যাকেজিং পরীক্ষা করার পরামর্শ
                                        দেওয়া হচ্ছে।
                                </p>
                        </>
                ),
        },

        {
                number: '06',
                title: 'রিটার্ন ও রিফান্ড',
                content: (
                        <>
                                <p>
                                        রিটার্ন বা রিফান্ডের ক্ষেত্রে
                                        পণ্যের ধরন এবং সমস্যার ধরন
                                        বিবেচনা করা হবে।
                                </p>

                                <p>
                                        ভুল পণ্য, ক্ষতিগ্রস্ত পণ্য বা
                                        অর্ডারের সঙ্গে উল্লেখযোগ্য
                                        অসঙ্গতি থাকলে দ্রুত আমাদের
                                        Customer Support-এর সঙ্গে যোগাযোগ
                                        করুন।
                                </p>

                                <p>
                                        রিটার্ন বা রিফান্ডের জন্য অর্ডার
                                        নম্বর, পণ্যের ছবি/ভিডিও এবং
                                        সমস্যার সংক্ষিপ্ত বিবরণ প্রয়োজন
                                        হতে পারে।
                                </p>

                                <p>
                                        পচনশীল বা খাদ্যপণ্যের ক্ষেত্রে
                                        স্বাস্থ্য ও নিরাপত্তার কারণে
                                        ব্যবহৃত বা খোলা পণ্যের রিটার্ন
                                        গ্রহণযোগ্য নাও হতে পারে।
                                </p>
                        </>
                ),
        },

        {
                number: '07',
                title: 'অর্ডার বাতিল',
                content: (
                        <>
                                <p>
                                        পণ্য dispatch হওয়ার আগে অর্ডার
                                        বাতিলের অনুরোধ করা যেতে পারে।
                                </p>

                                <p>
                                        পণ্য কুরিয়ারে হস্তান্তরের পর
                                        cancellation-এর ক্ষেত্রে
                                        প্রযোজ্য shipping বা অন্যান্য
                                        খরচের বিষয়টি বিবেচনা করা হতে
                                        পারে।
                                </p>
                        </>
                ),
        },

        {
                number: '08',
                title: 'গ্রাহকের দায়িত্ব',
                content: (
                        <>
                                <p>
                                        গ্রাহককে অর্ডারের সময় সঠিক
                                        যোগাযোগের তথ্য প্রদান করতে হবে
                                        এবং কুরিয়ার থেকে পণ্য গ্রহণের
                                        জন্য প্রয়োজনীয় সহযোগিতা করতে হবে।
                                </p>

                                <p>
                                        ইচ্ছাকৃতভাবে ভুল তথ্য দিয়ে অর্ডার,
                                        প্রতারণামূলক লেনদেন বা বারবার
                                        অর্ডার করে গ্রহণ না করার মতো
                                        কার্যক্রম শনাক্ত হলে Shalban Food
                                        সংশ্লিষ্ট অর্ডার বাতিল করার
                                        অধিকার রাখে।
                                </p>
                        </>
                ),
        },

        {
                number: '09',
                title: 'ওয়েবসাইট ব্যবহারের নিয়ম',
                content: (
                        <>
                                <p>
                                        Shalban Food-এর ওয়েবসাইটের
                                        কনটেন্ট, ছবি, লোগো, ডিজাইন,
                                        ব্র্যান্ডিং এবং অন্যান্য
                                        উপাদান অনুমতি ছাড়া কপি,
                                        পুনঃপ্রকাশ বা বাণিজ্যিকভাবে
                                        ব্যবহার করা যাবে না।
                                </p>

                                <p>
                                        ওয়েবসাইটে কোনো ধরনের ক্ষতিকর
                                        কার্যক্রম, অননুমোদিত access,
                                        automated abuse বা সাইটের
                                        স্বাভাবিক কার্যক্রম ব্যাহত করার
                                        চেষ্টা করা নিষিদ্ধ।
                                </p>
                        </>
                ),
        },

        {
                number: '10',
                title: 'স্বাস্থ্য সংক্রান্ত ঘোষণা',
                content: (
                        <>
                                <p>
                                        Shalban Food-এর খাদ্যপণ্য সাধারণ
                                        খাদ্য হিসেবে বিক্রি করা হয়।
                                        কোনো পণ্যকে রোগ নিরাময়,
                                        চিকিৎসা বা নির্দিষ্ট স্বাস্থ্য
                                        সমস্যার নিশ্চিত সমাধান হিসেবে
                                        বিবেচনা করা উচিত নয়।
                                </p>

                                <p>
                                        কোনো খাবারে অ্যালার্জি, বিশেষ
                                        খাদ্য-নিষেধ বা স্বাস্থ্যগত
                                        সীমাবদ্ধতা থাকলে পণ্য কেনার আগে
                                        উপাদান সম্পর্কে নিশ্চিত হওয়া
                                        গ্রাহকের দায়িত্ব।
                                </p>

                                <p>
                                        ১ বছরের কম বয়সী শিশুকে মধু দেওয়া
                                        উচিত নয়।
                                </p>
                        </>
                ),
        },

        {
                number: '11',
                title: 'বুদ্ধিবৃত্তিক সম্পত্তি',
                content: (
                        <>
                                <p>
                                        Shalban Food-এর নাম, লোগো,
                                        ব্র্যান্ডিং, ওয়েবসাইটের লেখা,
                                        ছবি, গ্রাফিক্স, ডিজাইন এবং
                                        অন্যান্য original content
                                        Shalban Food-এর সম্পত্তি অথবা
                                        যথাযথ অনুমোদনপ্রাপ্ত কনটেন্ট।
                                </p>

                                <p>
                                        লিখিত অনুমতি ছাড়া এসব কনটেন্ট
                                        কপি, পরিবর্তন, পুনঃপ্রকাশ,
                                        বিক্রি বা অন্য কোনো বাণিজ্যিক
                                        কাজে ব্যবহার করা যাবে না।
                                </p>
                        </>
                ),
        },

        {
                number: '12',
                title: 'নীতিমালা পরিবর্তন',
                content: (
                        <p>
                                Shalban Food প্রয়োজন অনুযায়ী এই Terms &
                                Conditions পরিবর্তন, সংশোধন বা
                                আপডেট করার অধিকার রাখে। পরিবর্তনের পর
                                ওয়েবসাইটে প্রকাশিত নতুন শর্তাবলি
                                কার্যকর বলে বিবেচিত হবে।
                        </p>
                ),
        },

        {
                number: '13',
                title: 'যোগাযোগ',
                content: (
                        <>
                                <p>
                                        Terms & Conditions সম্পর্কে
                                        কোনো প্রশ্ন বা অভিযোগ থাকলে
                                        আমাদের সঙ্গে যোগাযোগ করুন।
                                </p>

                                <div className="mt-5 rounded-xl bg-green-50 p-5">
                                        <p className="font-semibold text-gray-900">
                                                Shalban Food
                                        </p>

                                        <p className="mt-2 text-gray-600">
                                                WhatsApp: 01603816721
                                        </p>

                                        <p className="mt-1 text-gray-600">
                                                Website: {BASE_URL}
                                        </p>
                                </div>
                        </>
                ),
        },
];

export default function TermsAndConditionsPage() {
        return (
                <main className="min-h-screen bg-white text-gray-800">

                        {/* Breadcrumb Schema */}
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
                                                                Terms &
                                                                Conditions
                                                        </li>
                                                </ol>
                                        </nav>
                                </div>
                        </div>

                        {/* Hero */}
                        <section className="bg-green-50">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">

                                        <div className="mx-auto max-w-3xl text-center">

                                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-sm">
                                                        <FileText className="h-8 w-8 text-white" />
                                                </div>

                                                <h1 className="mt-6 text-3xl md:text-5xl font-bold text-gray-900">
                                                        Terms & Conditions
                                                </h1>

                                                <p className="mt-5 text-base md:text-lg leading-8 text-gray-600">
                                                        Shalban Food-এর ওয়েবসাইট
                                                        ব্যবহার, পণ্য অর্ডার,
                                                        পেমেন্ট, ডেলিভারি,
                                                        রিটার্ন এবং অন্যান্য
                                                        সেবা ব্যবহারের
                                                        শর্তাবলি এখানে
                                                        বিস্তারিতভাবে
                                                        উল্লেখ করা হয়েছে।
                                                </p>

                                                <p className="mt-4 text-sm text-gray-500">
                                                        সর্বশেষ আপডেট:
                                                        September 2026
                                                </p>

                                        </div>
                                </div>
                        </section>

                        {/* Quick Notice */}
                        <section className="py-8">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-4xl rounded-2xl border border-green-100 bg-green-50 p-5 md:p-6">

                                                <div className="flex items-start gap-4">
                                                        <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />

                                                        <div>
                                                                <h2 className="font-bold text-gray-900">
                                                                        গুরুত্বপূর্ণ তথ্য
                                                                </h2>

                                                                <p className="mt-2 text-sm md:text-base leading-7 text-gray-600">
                                                                        Shalban Food-এর
                                                                        ওয়েবসাইট
                                                                        ব্যবহার
                                                                        অথবা
                                                                        অর্ডার
                                                                        করার আগে
                                                                        নিচের
                                                                        শর্তগুলো
                                                                        পড়ে
                                                                        নেওয়ার
                                                                        অনুরোধ
                                                                        করছি।
                                                                </p>
                                                        </div>
                                                </div>

                                        </div>
                                </div>
                        </section>

                        {/* Terms Content */}
                        <section className="pb-16 md:pb-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-4xl">

                                                <div className="space-y-5">
                                                        {sections.map(
                                                                (section) => (
                                                                        <article
                                                                                key={
                                                                                        section.number
                                                                                }
                                                                                className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm"
                                                                        >

                                                                                <div className="flex items-start gap-4">

                                                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-700">
                                                                                                {
                                                                                                        section.number
                                                                                                }
                                                                                        </div>

                                                                                        <div className="min-w-0 flex-1">

                                                                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                                                                                        {
                                                                                                                section.title
                                                                                                        }
                                                                                                </h2>

                                                                                                <div className="mt-4 space-y-4 text-sm md:text-base leading-8 text-gray-600">
                                                                                                        {
                                                                                                                section.content
                                                                                                        }
                                                                                                </div>

                                                                                        </div>
                                                                                </div>

                                                                        </article>
                                                                )
                                                        )}
                                                </div>

                                        </div>
                                </div>
                        </section>

                        {/* CTA */}
                        <section className="bg-green-600 py-14 md:py-16">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                                        <div className="mx-auto max-w-3xl text-center text-white">

                                                <ShoppingBag className="mx-auto h-10 w-10" />

                                                <h2 className="mt-5 text-2xl md:text-3xl font-bold">
                                                        Shalban Food থেকে
                                                        কেনাকাটা করুন
                                                </h2>

                                                <p className="mt-4 text-green-50 leading-7">
                                                        আপনার পছন্দের
                                                        প্রাকৃতিক
                                                        খাদ্যপণ্য খুঁজে নিন
                                                        এবং সহজেই অর্ডার
                                                        করুন।
                                                </p>

                                                <div className="mt-7 flex flex-wrap justify-center gap-4">

                                                        <Link
                                                                href="/shop"
                                                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-green-700 transition hover:bg-gray-100"
                                                        >
                                                                <ShoppingBag className="h-5 w-5" />
                                                                Shop Now
                                                        </Link>

                                                        <Link
                                                                href="/contact-us"
                                                                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                                                        >
                                                                Contact Us
                                                        </Link>

                                                </div>

                                        </div>
                                </div>
                        </section>

                        {/* Footer Note */}
                        <div className="border-t border-gray-100 bg-gray-50">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

                                        <p className="text-center text-xs md:text-sm text-gray-500">
                                                © {new Date().getFullYear()}{' '}
                                                Shalban Food. All rights
                                                reserved.
                                        </p>

                                </div>
                        </div>

                </main>
        );
}
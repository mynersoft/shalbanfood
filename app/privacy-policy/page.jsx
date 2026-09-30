import Link from 'next/link';
import { ShieldCheck, Lock, Database, UserCheck, Mail, ArrowRight } from 'lucide-react';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://shalbanfood.vercel.app';

export const metadata = {
  title: 'Privacy Policy | Shalban Food',
  description:
    'Shalban Food-এর Privacy Policy। আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষিত রাখা হয় তা জানুন।',
  keywords: [
    'Shalban Food Privacy Policy',
    'Privacy Policy Bangladesh',
    'Shalban Food',
    'শালবন ফুড প্রাইভেসি পলিসি',
    'গোপনীয়তা নীতি',
  ],
  authors: [{ name: 'Shalban Food' }],
  creator: 'Shalban Food',
  publisher: 'Shalban Food',

  alternates: {
    canonical: `${BASE_URL}/privacy-policy`,
  },

  openGraph: {
    title: 'Privacy Policy | Shalban Food',
    description:
      'Shalban Food কীভাবে গ্রাহকের ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখে।',
    url: `${BASE_URL}/privacy-policy`,
    siteName: 'Shalban Food',
    type: 'website',
    locale: 'bn_BD',
  },

  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Shalban Food',
    description:
      'Shalban Food-এর গোপনীয়তা নীতি ও গ্রাহকের তথ্য সুরক্ষা সংক্রান্ত তথ্য।',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
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
        name: 'Privacy Policy',
        item: `${BASE_URL}/privacy-policy`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <ShieldCheck size={18} />
            আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">
            Shalban Food আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তাকে
            গুরুত্বের সঙ্গে বিবেচনা করে। এই নীতিমালায় আমাদের ওয়েবসাইট
            ব্যবহারের সময় আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা
            হয় তা সহজভাবে তুলে ধরা হয়েছে।
          </p>

          <p className="mt-4 text-sm text-gray-500">
            সর্বশেষ হালনাগাদ: ৩০ সেপ্টেম্বর ২০২৬
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">

          {/* 1 */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <Lock className="text-green-600" size={24} />
              ১. আমরা কোন তথ্য সংগ্রহ করি
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আপনি Shalban Food-এ অর্ডার করার সময় বা আমাদের সঙ্গে যোগাযোগ
              করার সময় প্রয়োজন অনুযায়ী কিছু তথ্য দিতে পারেন। যেমন:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-gray-600">
              <li>গ্রাহকের নাম</li>
              <li>মোবাইল নম্বর</li>
              <li>ডেলিভারি ঠিকানা</li>
              <li>অর্ডারের তথ্য</li>
              <li>পেমেন্ট সংক্রান্ত প্রয়োজনীয় তথ্য</li>
              <li>আপনার পাঠানো মেসেজ বা যোগাযোগের তথ্য</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ২. আপনার তথ্য কীভাবে ব্যবহার করি
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আপনার দেওয়া তথ্য মূলত আপনার অর্ডার সঠিকভাবে সম্পন্ন করা এবং
              আপনাকে প্রয়োজনীয় সেবা দেওয়ার জন্য ব্যবহার করা হয়।
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-gray-600">
              <li>অর্ডার গ্রহণ ও নিশ্চিত করতে</li>
              <li>পণ্য প্যাকেজিং ও ডেলিভারি সম্পন্ন করতে</li>
              <li>প্রয়োজনে অর্ডার সম্পর্কে আপনার সঙ্গে যোগাযোগ করতে</li>
              <li>কাস্টমার সার্ভিস প্রদান করতে</li>
              <li>অর্ডার ও ওয়েবসাইটের অভিজ্ঞতা উন্নত করতে</li>
              <li>প্রয়োজনীয় ব্যবসায়িক রেকর্ড সংরক্ষণ করতে</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৩. আপনার তথ্য কার সঙ্গে শেয়ার করা হতে পারে
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আপনার অর্ডার সম্পন্ন করার জন্য প্রয়োজন হলে সীমিত তথ্য সংশ্লিষ্ট
              সেবা প্রদানকারীর সঙ্গে শেয়ার করা হতে পারে। উদাহরণস্বরূপ,
              ডেলিভারি সম্পন্ন করার জন্য প্রয়োজনীয় নাম, ফোন নম্বর ও ঠিকানা
              কুরিয়ার/ডেলিভারি সেবাদাতার কাছে দেওয়া হতে পারে।
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              আমরা আপনার ব্যক্তিগত তথ্য অপ্রয়োজনীয়ভাবে তৃতীয় পক্ষের কাছে
              বিক্রি বা প্রকাশ করার উদ্দেশ্যে ব্যবহার করি না।
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৪. পেমেন্ট সংক্রান্ত তথ্য
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              অনলাইন পেমেন্টের ক্ষেত্রে পেমেন্ট সেবাদাতার নিজস্ব সিস্টেম ও
              নিরাপত্তা ব্যবস্থা প্রযোজ্য হতে পারে। প্রয়োজনীয় পেমেন্ট
              প্রক্রিয়াকরণের বাইরে Shalban Food আপনার সংবেদনশীল পেমেন্ট
              তথ্য অপ্রয়োজনীয়ভাবে সংরক্ষণ করার চেষ্টা করে না।
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৫. কুকিজ ও ওয়েবসাইট ডেটা
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              ওয়েবসাইটের কার্যকারিতা, ব্যবহারকারীর অভিজ্ঞতা এবং প্রয়োজনীয়
              বিশ্লেষণের জন্য cookies বা অনুরূপ প্রযুক্তি ব্যবহার করা হতে
              পারে। এসব প্রযুক্তি ওয়েবসাইট কীভাবে ব্যবহার করা হচ্ছে তা
              বুঝতে সহায়তা করতে পারে।
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৬. তথ্যের নিরাপত্তা
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আপনার ব্যক্তিগত তথ্যকে অননুমোদিত ব্যবহার, পরিবর্তন, প্রকাশ বা
              ক্ষতি থেকে সুরক্ষিত রাখতে আমরা যুক্তিসঙ্গত নিরাপত্তামূলক
              ব্যবস্থা গ্রহণের চেষ্টা করি।
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              তবে ইন্টারনেটের মাধ্যমে কোনো তথ্য আদান-প্রদানের পদ্ধতিই
              সম্পূর্ণ ঝুঁকিমুক্ত নয়। তাই শতভাগ নিরাপত্তার নিশ্চয়তা দেওয়া
              সম্ভব নয়।
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৭. তথ্য কতদিন সংরক্ষণ করা হয়
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              অর্ডার সম্পন্ন করা, কাস্টমার সার্ভিস, ব্যবসায়িক রেকর্ড,
              হিসাব-নিকাশ এবং আইনগত প্রয়োজন মেটানোর জন্য প্রয়োজনীয় সময় পর্যন্ত
              তথ্য সংরক্ষণ করা হতে পারে।
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৮. আপনার অধিকার
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আপনার ব্যক্তিগত তথ্য সম্পর্কে কোনো প্রশ্ন, সংশোধনের অনুরোধ বা
              গোপনীয়তা সংক্রান্ত কোনো উদ্বেগ থাকলে আমাদের সঙ্গে যোগাযোগ
              করতে পারেন।
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ৯. তৃতীয় পক্ষের ওয়েবসাইট
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আমাদের ওয়েবসাইটে প্রয়োজনে তৃতীয় পক্ষের ওয়েবসাইট বা সেবার
              লিংক থাকতে পারে। এসব ওয়েবসাইটের নিজস্ব Privacy Policy ও
              Terms থাকতে পারে। তাদের কার্যক্রমের জন্য Shalban Food দায়ী নয়।
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ১০. শিশুদের গোপনীয়তা
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              আমাদের ওয়েবসাইটের মাধ্যমে অপ্রাপ্তবয়স্কদের কাছ থেকে ইচ্ছাকৃতভাবে
              ব্যক্তিগত তথ্য সংগ্রহ করার উদ্দেশ্য আমাদের নেই। কোনো শিশুর তথ্য
              অভিভাবকের অনুমতি ছাড়া প্রদান করা উচিত নয়।
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              ১১. Privacy Policy পরিবর্তন
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              প্রয়োজন অনুযায়ী আমরা এই Privacy Policy পরিবর্তন বা আপডেট করতে
              পারি। পরিবর্তিত নীতিমালা এই পেজে প্রকাশ করার পর তা কার্যকর
              হিসেবে গণ্য হবে। তাই মাঝে মাঝে এই পেজটি পর্যালোচনা করার
              পরামর্শ দেওয়া হচ্ছে।
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <Mail className="text-green-600" size={24} />
              ১২. যোগাযোগ
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              Privacy Policy বা আপনার ব্যক্তিগত তথ্য সম্পর্কে কোনো প্রশ্ন
              থাকলে Shalban Food-এর সঙ্গে যোগাযোগ করতে পারেন।
            </p>

            <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-6">
              <p className="font-semibold text-gray-900">
                Shalban Food
              </p>

              <p className="mt-2 text-gray-600">
                WhatsApp / Mobile: 01603816721
              </p>

              <a
                href="https://wa.me/8801603816721"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                WhatsApp-এ যোগাযোগ করুন
                <ArrowRight size={18} />
              </a>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="rounded-2xl bg-gray-900 p-7 text-white sm:p-10">
            <h2 className="text-2xl font-bold">
              Shalban Food-এর অন্যান্য নীতিমালা
            </h2>

            <p className="mt-3 leading-7 text-gray-300">
              অর্ডার, ডেলিভারি, রিটার্ন ও ওয়েবসাইট ব্যবহারের নিয়ম জানতে
              আমাদের Terms & Conditions দেখুন।
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/terms-conditions"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Terms & Conditions
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}
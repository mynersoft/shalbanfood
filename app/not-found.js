import Link from "next/link";
import {
    ArrowLeft,
    Home,
    Search,
    ShoppingBag,
} from "lucide-react";

export const metadata = {
    title: "পৃষ্ঠা খুঁজে পাওয়া যায়নি | Shalban Food",
    description:
        "দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি পাওয়া যায়নি। Shalban Food থেকে আপনার পছন্দের প্রাকৃতিক খাদ্যপণ্য খুঁজে দেখুন।",
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <main className="flex min-h-[75vh] items-center justify-center bg-white px-4 py-16">
            <section
                className="w-full max-w-2xl text-center"
                aria-labelledby="not-found-title"
            >
                {/* Brand Icon */}
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 ring-8 ring-green-50/60">
                    <ShoppingBag
                        size={34}
                        strokeWidth={1.7}
                        className="text-green-600"
                    />
                </div>

                {/* 404 */}
                <p className="select-none text-7xl font-black tracking-tight text-green-600 sm:text-8xl">
                    404
                </p>

                {/* Heading */}
                <h1
                    id="not-found-title"
                    className="mt-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                >
                    পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
                </h1>

                {/* Description */}
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-600 sm:text-base">
                    দুঃখিত! আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো
                    সরিয়ে ফেলা হয়েছে, পরিবর্তন করা হয়েছে অথবা
                    ঠিকানা ভুল হতে পারে।
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
                    >
                        <Home size={18} />
                        হোমে ফিরে যান
                    </Link>

                    <Link
                        href="/shop"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-green-200 hover:bg-green-50 active:scale-[0.98]"
                    >
                        <Search size={18} />
                        পণ্য দেখুন
                    </Link>
                </div>

                {/* Back */}
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mx-auto mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
                >
                    <ArrowLeft size={16} />
                    আগের পৃষ্ঠায় ফিরে যান
                </button>

                {/* Brand */}
                <p className="mt-10 text-xs text-gray-400">
                    Shalban Food — স্বাদের সাথে আস্থার বন্ধন
                </p>
            </section>
        </main>
    );
}
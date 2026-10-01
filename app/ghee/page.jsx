import Image from "next/image";
import Link from "next/link";
import {
    Check,
    ChevronDown,
    MessageCircle,
    ShoppingCart,
    ShieldCheck,
    Truck,
    Sparkles,
    Heart,
    Star,
} from "lucide-react";

const GHEE_IMAGE =
    "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/shalbanfood/ghee-250g.jpg";

const WHATSAPP_NUMBER = "8801603816721";

const orderMessage = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি শালবন ফুডের ২৫০ গ্রাম গাওয়া ঘি অর্ডার করতে চাই।"
);

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${orderMessage}`;

export const metadata = {
    title: "২৫০ গ্রাম গাওয়া ঘি | Shalban Food",
    description:
        "শালবন ফুডের ২৫০ গ্রাম গাওয়া ঘি। রান্না, ভর্তা, খিচুড়ি ও নাশতায় ব্যবহারযোগ্য। অর্ডার করতে WhatsApp করুন।",
    keywords: [
        "গাওয়া ঘি",
        "গাওয়া ঘি",
        "২৫০ গ্রাম ঘি",
        "ঘি বাংলাদেশ",
        "Shalban Food",
        "Shalban Food Ghee",
    ],
    openGraph: {
        title: "২৫০ গ্রাম গাওয়া ঘি | Shalban Food",
        description:
            "স্বাদ ও ঘ্রাণে ঘরোয়া অনুভূতি—শালবন ফুডের গাওয়া ঘি।",
        images: [GHEE_IMAGE],
    },
};

function SectionTitle({ eyebrow, title, description }) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            {eyebrow && (
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-700">
                    {eyebrow}
                </p>
            )}

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {title}
            </h2>

            {description && (
                <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function GheeLandingPage() {
    return (
        <main className="min-h-screen bg-[#fffdf8] text-gray-900">

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-[#fffdf8]">
                <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">

                    {/* Text */}
                    <div className="order-2 lg:order-1">

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm">
                            <Sparkles size={14} />
                            Shalban Food
                        </div>

                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                            ঘরোয়া স্বাদে
                            <span className="block text-amber-700">
                                গাওয়া ঘি
                            </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                            রান্না, ভর্তা, খিচুড়ি কিংবা নাশতায়—
                            খাবারের স্বাদ ও ঘ্রাণে বাড়তি মাত্রা যোগ করতে
                            বেছে নিন শালবন ফুডের গাওয়া ঘি।
                        </p>

                        {/* Highlights */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg">
                            {[
                                "২৫০ গ্রাম প্যাক",
                                "সুগন্ধি ও স্বাদযুক্ত",
                                "রান্নায় ব্যবহারযোগ্য",
                                "পরিপাটি প্যাকেজিং",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                        <Check size={13} strokeWidth={3} />
                                    </span>

                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="mt-7 flex items-end gap-3">
                            <span className="text-3xl font-extrabold text-gray-950">
                                ৳920
                            </span>

                            <span className="pb-1 text-base text-gray-400 line-through">
                                ৳1,200
                            </span>

                            <span className="mb-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                                বিশেষ মূল্য
                            </span>
                        </div>

                        {/* CTA */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 active:scale-[0.98]"
                            >
                                <MessageCircle size={19} />
                                WhatsApp-এ অর্ডার করুন
                            </a>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                            >
                                <ShoppingCart size={18} />
                                Shop থেকে অর্ডার
                            </Link>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                            WhatsApp: 01603-816721
                        </p>
                    </div>

                    {/* Product Image */}
                    <div className="order-1 lg:order-2">
                        <div className="relative mx-auto aspect-square max-w-md">

                            {/* Decorative circle */}
                            <div className="absolute inset-8 rounded-full bg-amber-100 blur-2xl" />

                            <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-amber-100 bg-white p-4 shadow-2xl">
                                <Image
                                    src={GHEE_IMAGE}
                                    alt="Shalban Food 250 gram Gawa Ghee"
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 90vw, 45vw"
                                    className="object-contain p-5"
                                />

                                {/* Badge */}
                                <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-amber-800 shadow-lg">
                                    <Star
                                        size={14}
                                        className="fill-amber-500 text-amber-500"
                                    />
                                    ২৫০ গ্রাম
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= TRUST BAR ================= */}
            <section className="border-y border-gray-100 bg-white">
                <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-gray-100 sm:grid-cols-4">

                    <div className="flex items-center justify-center gap-2 px-3 py-5 text-center">
                        <ShieldCheck className="text-amber-600" size={21} />
                        <span className="text-xs font-semibold text-gray-700">
                            মানসম্মত প্যাকেজিং
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 px-3 py-5 text-center">
                        <Truck className="text-amber-600" size={21} />
                        <span className="text-xs font-semibold text-gray-700">
                            ডেলিভারি সুবিধা
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 px-3 py-5 text-center">
                        <Heart className="text-amber-600" size={21} />
                        <span className="text-xs font-semibold text-gray-700">
                            যত্নে প্যাক করা
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 px-3 py-5 text-center">
                        <Sparkles className="text-amber-600" size={21} />
                        <span className="text-xs font-semibold text-gray-700">
                            ঘরোয়া ব্যবহারের জন্য
                        </span>
                    </div>
                </div>
            </section>

            {/* ================= BENEFITS ================= */}
            <section className="px-4 py-14 sm:px-6 lg:px-8">
                <SectionTitle
                    eyebrow="কেন ব্যবহার করবেন"
                    title="দৈনন্দিন খাবারে গাওয়া ঘি"
                    description="সঠিক পরিমাণে ব্যবহার করলে বিভিন্ন ধরনের রান্না ও খাবারে ঘির স্বাদ ও ঘ্রাণ উপভোগ করা যায়।"
                />

                <div className="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            title: "রান্নায়",
                            text: "পোলাও, খিচুড়ি ও বিভিন্ন রান্নায় ব্যবহার করতে পারেন।",
                            icon: "🍚",
                        },
                        {
                            title: "ভর্তায়",
                            text: "ভর্তা ও মসলাজাতীয় খাবারে বাড়তি ঘ্রাণের জন্য।",
                            icon: "🥣",
                        },
                        {
                            title: "নাশতায়",
                            text: "রুটি, পরোটা বা অন্যান্য নাশতায় ব্যবহার করা যায়।",
                            icon: "🍞",
                        },
                        {
                            title: "মিষ্টি খাবারে",
                            text: "হালুয়া ও বিভিন্ন মিষ্টান্ন তৈরিতে ব্যবহারযোগ্য।",
                            icon: "🍯",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="text-3xl">{item.icon}</div>

                            <h3 className="mt-4 font-bold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= PRODUCT STORY ================= */}
            <section className="bg-amber-50 px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">

                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
                            Shalban Food
                        </p>

                        <h2 className="mt-2 text-3xl font-bold leading-tight text-gray-900">
                            খাবারের স্বাদে একটু
                            <span className="text-amber-700">
                                {" "}ভিন্নতা
                            </span>
                        </h2>

                        <p className="mt-4 leading-7 text-gray-600">
                            শালবন ফুডের লক্ষ্য হলো দৈনন্দিন খাবারের জন্য
                            মানসম্মত ও যত্নসহকারে প্যাক করা খাদ্যপণ্য
                            গ্রাহকের কাছে পৌঁছে দেওয়া।
                        </p>

                        <div className="mt-6 space-y-3">
                            {[
                                "পরিষ্কার ও পরিপাটি প্যাকেজিং",
                                "দৈনন্দিন রান্নায় ব্যবহারযোগ্য",
                                "সরাসরি অর্ডারের সুবিধা",
                                "WhatsApp-এ সহজ যোগাযোগ",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                                        <Check size={15} strokeWidth={3} />
                                    </div>

                                    <span className="text-sm font-medium text-gray-700">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white p-4 shadow-xl">
                        <div className="relative aspect-square">
                            <Image
                                src={GHEE_IMAGE}
                                alt="Shalban Food Ghee"
                                fill
                                sizes="(max-width: 768px) 90vw, 40vw"
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= OFFER ================= */}
            <section className="px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gray-950 px-5 py-10 text-center text-white shadow-2xl sm:px-10">

                    <span className="inline-flex rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-gray-950">
                        LIMITED OFFER
                    </span>

                    <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                        ২৫০ গ্রাম গাওয়া ঘি
                    </h2>

                    <div className="mt-4 flex items-center justify-center gap-3">
                        <span className="text-4xl font-extrabold text-amber-400">
                            ৳920
                        </span>

                        <span className="text-lg text-gray-500 line-through">
                            ৳1,200
                        </span>
                    </div>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-300">
                        অর্ডার করতে WhatsApp-এ আপনার নাম, ঠিকানা ও ফোন নম্বর পাঠান।
                    </p>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-green-600"
                    >
                        <MessageCircle size={20} />
                        এখনই অর্ডার করুন
                    </a>
                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section className="px-4 py-14 sm:px-6 lg:px-8">
                <SectionTitle
                    eyebrow="FAQ"
                    title="সাধারণ কিছু প্রশ্ন"
                />

                <div className="mx-auto mt-8 max-w-3xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">

                    {[
                        {
                            q: "প্যাকেটের পরিমাণ কত?",
                            a: "এই ল্যান্ডিং পেইজের পণ্যটি ২৫০ গ্রাম গাওয়া ঘি।",
                        },
                        {
                            q: "ঘি কী কী খাবারে ব্যবহার করা যায়?",
                            a: "রুটি, পরোটা, ভর্তা, খিচুড়ি, পোলাও, হালুয়া ও বিভিন্ন রান্নায় ব্যবহার করা যায়।",
                        },
                        {
                            q: "কীভাবে অর্ডার করব?",
                            a: "উপরের WhatsApp অর্ডার বাটনে ক্লিক করে আপনার নাম, ফোন নম্বর ও ঠিকানা পাঠাতে পারবেন।",
                        },
                        {
                            q: "ডেলিভারি কীভাবে হবে?",
                            a: "আপনার ঠিকানা অনুযায়ী ডেলিভারি ব্যবস্থা ও খরচ অর্ডার নিশ্চিত করার সময় জানিয়ে দেওয়া হবে।",
                        },
                    ].map((item) => (
                        <details
                            key={item.q}
                            className="group p-5"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-800">
                                {item.q}

                                <ChevronDown
                                    size={19}
                                    className="shrink-0 transition-transform group-open:rotate-180"
                                />
                            </summary>

                            <p className="mt-3 pr-8 text-sm leading-6 text-gray-600">
                                {item.a}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ================= FINAL CTA ================= */}
            <section className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-12 text-center text-white">
                <div className="mx-auto max-w-2xl">

                    <h2 className="text-3xl font-extrabold">
                        ঘরের খাবারে যোগ করুন ঘির স্বাদ
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-amber-50">
                        শালবন ফুডের ২৫০ গ্রাম গাওয়া ঘি অর্ডার করতে
                        WhatsApp-এ যোগাযোগ করুন।
                    </p>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-amber-700 shadow-lg transition hover:bg-gray-50"
                    >
                        <MessageCircle size={19} />
                        WhatsApp: 01603-816721
                    </a>

                    <p className="mt-5 text-xs text-amber-100">
                        Shalban Food — স্বাদের সাথে আস্থার বন্ধন।
                    </p>
                </div>
            </section>

            {/* ================= MOBILE STICKY CTA ================= */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur sm:hidden">
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white"
                >
                    <MessageCircle size={19} />
                    WhatsApp-এ অর্ডার করুন
                </a>
            </div>
        </main>
    );
}
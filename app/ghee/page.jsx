'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Check,
    ChevronDown,
    ShoppingCart,
    Minus,
    Plus,
    ShieldCheck,
    Truck,
    RotateCcw,
    Star,
    Sparkles,
    PackageCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';

const PRODUCT = {
    _id: 'shalban-ghee-250g',

    name: 'শালবন ফুড গাওয়া ঘি ২৫০ গ্রাম',

    slug: 'gawa-ghee-250g',

    category: 'Ghee',

    size: {
        value: 500,
        unit: 'gram',
    },

    regularPrice: 1200,

    sellPrice: 920,

    stock: 50,

    image:
        'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/shalbanfood/ghee-250g.jpg',
};

export default function GheeLandingPage() {
    const dispatch = useDispatch();

    const [quantity, setQuantity] = useState(1);

    const discount = Math.round(
        ((PRODUCT.regularPrice - PRODUCT.sellPrice) /
            PRODUCT.regularPrice) *
            100
    );

    const totalPrice = PRODUCT.sellPrice * quantity;

    const handleQuantity = (type) => {
        setQuantity((current) => {
            if (type === 'increase') {
                return Math.min(current + 1, PRODUCT.stock);
            }

            return Math.max(current - 1, 1);
        });
    };

    const handleAddToCart = () => {
        dispatch(
            addToCart({
                product: PRODUCT,
                quantity,
            })
        );

        toast.success(
            `${quantity} টি গাওয়া ঘি কার্টে যোগ হয়েছে`
        );
    };

    return (
        <main className="min-h-screen bg-[#fffdf8] text-gray-900">

            {/* =====================================================
                TOP MINI BAR
            ====================================================== */}

            <div className="bg-gray-950 px-4 py-2 text-center text-xs font-medium text-white">
                🚚 সারা বাংলাদেশে ডেলিভারি সুবিধা
            </div>

            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Breadcrumb"
                    className="text-xs text-gray-500"
                >
                    <Link
                        href="/"
                        className="hover:text-amber-700"
                    >
                        Home
                    </Link>

                    <span className="mx-2">/</span>

                    <span className="font-medium text-gray-700">
                        Gawa Ghee
                    </span>
                </nav>
            </div>

            {/* =====================================================
                HERO PRODUCT AREA
            ====================================================== */}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">

                <div className="grid overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-sm lg:grid-cols-2">

                    {/* ================= IMAGE ================= */}

                    <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-[#fffaf0] to-white p-6 sm:min-h-[550px] lg:p-12">

                        {/* Background decoration */}
                        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/30 blur-3xl" />

                        {/* Discount */}
                        <div className="absolute left-5 top-5 z-10 rounded-full bg-red-500 px-4 py-2 text-xs font-extrabold text-white shadow-lg">
                            {discount}% OFF
                        </div>

                        {/* Product image */}
                        <div className="relative aspect-square w-full max-w-[480px]">

                            <Image
                                src={PRODUCT.image}
                                alt="শালবন ফুড ২৫০ গ্রাম গাওয়া ঘি"
                                fill
                                priority
                                sizes="(max-width: 768px) 90vw, 50vw"
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>

                        {/* Image label */}
                        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-amber-100 bg-white/90 px-4 py-2 text-xs font-bold text-gray-700 shadow-lg backdrop-blur">
                            <PackageCheck
                                size={15}
                                className="text-amber-600"
                            />
                            ২৫০ গ্রাম প্যাক
                        </div>
                    </div>

                    {/* ================= PRODUCT INFO ================= */}

                    <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">

                        {/* Brand */}
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                            <Sparkles size={16} />
                            SHALBAN FOOD
                        </div>

                        {/* Title */}
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            গাওয়া ঘি
                            <span className="block text-amber-700">
                                ২৫০ গ্রাম
                            </span>
                        </h1>

                        {/* Rating */}
                        <div className="mt-4 flex items-center gap-2">

                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className="fill-amber-400 text-amber-400"
                                    />
                                ))}
                            </div>

                            <span className="text-xs text-gray-500">
                                Customer favorite
                            </span>
                        </div>

                        {/* Description */}
                        <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                            রান্না, ভর্তা, খিচুড়ি, পোলাও,
                            রুটি ও বিভিন্ন খাবারে ব্যবহারযোগ্য
                            শালবন ফুডের গাওয়া ঘি।
                        </p>

                        {/* Price */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">

                            <span className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                                ৳{PRODUCT.sellPrice.toLocaleString('en-BD')}
                            </span>

                            <span className="text-base text-gray-400 line-through">
                                ৳{PRODUCT.regularPrice.toLocaleString('en-BD')}
                            </span>

                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                Save ৳
                                {(
                                    PRODUCT.regularPrice -
                                    PRODUCT.sellPrice
                                ).toLocaleString('en-BD')}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="my-6 border-t border-gray-100" />

                        {/* Highlights */}
                        <div className="grid grid-cols-2 gap-y-4">

                            {[
                                '২৫০ গ্রাম পরিমাণ',
                                'পরিপাটি প্যাকেজিং',
                                'রান্নায় ব্যবহারযোগ্য',
                                'সারা বাংলাদেশে ডেলিভারি',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                                        <Check
                                            size={13}
                                            strokeWidth={3}
                                        />
                                    </span>

                                    <span className="text-xs font-medium text-gray-700 sm:text-sm">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Quantity */}
                        <div className="mt-7">

                            <p className="mb-2 text-sm font-semibold text-gray-800">
                                পরিমাণ
                            </p>

                            <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-300 bg-white">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantity('decrease')
                                    }
                                    disabled={quantity <= 1}
                                    className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={17} />
                                </button>

                                <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-3 text-sm font-bold">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantity('increase')
                                    }
                                    disabled={
                                        quantity >= PRODUCT.stock
                                    }
                                    className="flex h-11 w-11 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Add to cart */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={PRODUCT.stock <= 0}
                            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-950 px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            <ShoppingCart size={20} />

                            {PRODUCT.stock > 0
                                ? 'Add to Cart'
                                : 'Out of Stock'}

                            <span className="ml-1 opacity-70">
                                • ৳
                                {totalPrice.toLocaleString('en-BD')}
                            </span>
                        </button>

                        {/* Stock */}
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            In Stock
                        </div>

                    </div>
                </div>
            </section>

            {/* =====================================================
                BENEFIT / TRUST CARDS
            ====================================================== */}

            <section className="border-y border-gray-100 bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">

                    <TrustCard
                        icon={<ShieldCheck size={22} />}
                        title="যত্নে প্যাক করা"
                        text="পরিপাটি প্যাকেজিং"
                    />

                    <TrustCard
                        icon={<Truck size={22} />}
                        title="ডেলিভারি"
                        text="সারা বাংলাদেশে"
                    />

                    <TrustCard
                        icon={<PackageCheck size={22} />}
                        title="২৫০ গ্রাম"
                        text="Convenient pack"
                    />

                    <TrustCard
                        icon={<RotateCcw size={22} />}
                        title="সহজ অর্ডার"
                        text="Cart → Checkout"
                    />
                </div>
            </section>

            {/* =====================================================
                PRODUCT STORY
            ====================================================== */}

            <section className="px-4 py-16 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-6xl">

                    <div className="max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">
                            Everyday Ghee
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            প্রতিদিনের খাবারে
                            <span className="text-amber-700">
                                {' '}ঘির স্বাদ
                            </span>
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
                            গাওয়া ঘি বিভিন্ন ধরনের রান্না ও খাবারে
                            ব্যবহার করা যায়। অল্প পরিমাণে ব্যবহার করেও
                            খাবারে আলাদা ঘ্রাণ ও স্বাদের অনুভূতি পাওয়া যায়।
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">

                        <FeatureCard
                            number="01"
                            title="খিচুড়ি"
                            text="খিচুড়ির সঙ্গে ঘির ব্যবহার খাবারে আলাদা স্বাদের অনুভূতি দিতে পারে।"
                        />

                        <FeatureCard
                            number="02"
                            title="রুটি ও পরোটা"
                            text="নাশতার সময় রুটি বা পরোটার সঙ্গে ব্যবহার করা যায়।"
                        />

                        <FeatureCard
                            number="03"
                            title="ভর্তা ও রান্না"
                            text="বিভিন্ন ভর্তা ও রান্নায় প্রয়োজন অনুযায়ী ব্যবহার করতে পারেন।"
                        />

                    </div>
                </div>
            </section>

            {/* =====================================================
                HOW TO ORDER
            ====================================================== */}

            <section className="bg-gray-950 px-4 py-16 text-white sm:px-6 lg:px-8">

                <div className="mx-auto max-w-5xl">

                    <div className="text-center">

                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
                            Easy Shopping
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                            অর্ডার করা খুবই সহজ
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-3">

                        <Step
                            number="01"
                            title="Add to Cart"
                            text="পছন্দের পরিমাণ নির্বাচন করে Add to Cart করুন।"
                        />

                        <Step
                            number="02"
                            title="Checkout"
                            text="Cart থেকে Checkout পেজে গিয়ে আপনার তথ্য দিন।"
                        />

                        <Step
                            number="03"
                            title="Order Complete"
                            text="অর্ডার নিশ্চিত করুন এবং ডেলিভারির জন্য অপেক্ষা করুন।"
                        />

                    </div>
                </div>
            </section>

            {/* =====================================================
                FAQ
            ====================================================== */}

            <section className="px-4 py-16 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-3xl">

                    <div className="text-center">

                        <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
                            FAQ
                        </p>

                        <h2 className="mt-2 text-3xl font-extrabold">
                            সাধারণ কিছু প্রশ্ন
                        </h2>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">

                        {[
                            {
                                q: 'এই গাওয়া ঘির পরিমাণ কত?',
                                a: 'এই প্যাকেজে ২৫০ গ্রাম গাওয়া ঘি রয়েছে।',
                            },
                            {
                                q: 'গাওয়া ঘি কী কী খাবারে ব্যবহার করা যায়?',
                                a: 'খিচুড়ি, পোলাও, রুটি, পরোটা, ভর্তা, হালুয়া এবং বিভিন্ন রান্নায় ব্যবহার করা যায়।',
                            },
                            {
                                q: 'কীভাবে অর্ডার করব?',
                                a: 'Product page থেকে পরিমাণ নির্বাচন করে Add to Cart করুন। এরপর Cart থেকে Checkout করে অর্ডার সম্পন্ন করুন।',
                            },
                            {
                                q: 'ডেলিভারি কোথায় পাওয়া যাবে?',
                                a: 'সারা বাংলাদেশে ডেলিভারি সুবিধা দেওয়ার জন্য আপনার checkout-এর shipping system অনুযায়ী অর্ডার করা যাবে।',
                            },
                        ].map((item) => (
                            <details
                                key={item.q}
                                className="group border-b border-gray-100 p-5 last:border-0"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-gray-800">
                                    {item.q}

                                    <ChevronDown
                                        size={18}
                                        className="shrink-0 transition-transform group-open:rotate-180"
                                    />
                                </summary>

                                <p className="mt-3 pr-6 text-sm leading-6 text-gray-600">
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* =====================================================
                FINAL CTA
            ====================================================== */}

            <section className="bg-amber-600 px-4 py-14 text-center text-white">

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-100">
                    Shalban Food
                </p>

                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                    আপনার কার্টে গাওয়া ঘি যোগ করুন
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-amber-50">
                    ২৫০ গ্রাম গাওয়া ঘি এখনই Add to Cart করে
                    Checkout থেকে আপনার অর্ডার সম্পন্ন করুন।
                </p>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-amber-700 shadow-xl transition hover:bg-gray-50 active:scale-95"
                >
                    <ShoppingCart size={19} />
                    Add to Cart — ৳
                    {PRODUCT.sellPrice.toLocaleString('en-BD')}
                </button>
            </section>

            {/* =====================================================
                MOBILE STICKY CART
            ====================================================== */}

            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden">

                <div className="flex items-center gap-2">

                    <div className="flex-1 pl-2">
                        <p className="text-[10px] text-gray-500">
                            Total
                        </p>

                        <p className="text-lg font-extrabold text-gray-900">
                            ৳{totalPrice.toLocaleString('en-BD')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="flex flex-[1.5] items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-bold text-white"
                    >
                        <ShoppingCart size={18} />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Bottom spacing for mobile sticky button */}
            <div className="h-20 md:hidden" />
        </main>
    );
}

/* =========================================================
   COMPONENTS
========================================================= */

function TrustCard({ icon, title, text }) {
    return (
        <div className="flex items-center justify-center gap-3 border-b border-r border-gray-100 px-4 py-5 last:border-r-0">
            <div className="text-amber-600">
                {icon}
            </div>

            <div>
                <p className="text-xs font-bold text-gray-800">
                    {title}
                </p>

                <p className="mt-0.5 text-[10px] text-gray-500">
                    {text}
                </p>
            </div>
        </div>
    );
}

function FeatureCard({ number, title, text }) {
    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">

            <span className="text-xs font-black text-amber-600">
                {number}
            </span>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
                {text}
            </p>
        </div>
    );
}

function Step({ number, title, text }) {
    return (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6">

            <span className="text-sm font-black text-amber-400">
                {number}
            </span>

            <h3 className="mt-4 text-lg font-bold">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-400">
                {text}
            </p>
        </div>
    );
}
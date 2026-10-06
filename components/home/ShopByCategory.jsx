'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const categories = [
    {
        name: 'মধু',
        slug: 'honey',
        image: '/images/categories/honey.png',
    },
    {
        name: 'গাওয়া ঘি',
        slug: 'ghee',
        image: '/images/categories/ghee.png',
    },
    {
        name: 'ড্রাই ফ্রুটস',
        slug: 'dry-fruits',
        image: '/images/categories/dry-fruits.png',
    },
    {
        name: 'নাটস & সিডস',
        slug: 'nuts-seeds',
        image: '/images/categories/nuts-seeds.png',
    },
    {
        name: 'খেজুর',
        slug: 'dates',
        image: '/images/categories/dates.jpg',
    },
    {
        name: 'ন্যাচারাল ফুড',
        slug: 'natural-food',
        image: '/images/categories/natural-food.png',
    },
];

export default function ShopByCategory() {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -300 : 300,
            behavior: 'smooth',
        });
    };

    return (
        <section className="bg-white py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4">

                {/* ================= HEADER ================= */}
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Shop by Category
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            আপনার পছন্দের ক্যাটাগরি বেছে নিন
                        </p>
                    </div>

                    {/* Desktop arrows */}
                    <div className="hidden items-center gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            aria-label="Previous categories"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-[#1f5d3b] hover:text-[#1f5d3b]"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            aria-label="Next categories"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f5d3b] text-white shadow-sm transition hover:bg-[#174a2f]"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* ================= CATEGORY LIST ================= */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
                >
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/category/${category.slug}`}
                            className="
                                group
                                relative
                                min-w-[170px]
                                snap-start
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                                transition
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)]
                                sm:min-w-[200px]
                                md:min-w-[220px]
                            "
                        >
                            {/* Image */}
                            <div className="relative flex h-[150px] items-center justify-center overflow-hidden bg-gray-50 sm:h-[170px]">

                                <Image
                                    src={category.image}
                                    alt={`${category.name} - Shalban Food`}
                                    fill
                                    sizes="220px"
                                    className="
                                        object-contain
                                        p-5
                                        transition
                                        duration-500
                                        group-hover:scale-110
                                    "
                                />

                                {/* Hover circle */}
                                <div className="
                                    absolute
                                    right-3
                                    top-3
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/90
                                    text-[#1f5d3b]
                                    opacity-0
                                    shadow-sm
                                    transition
                                    duration-300
                                    group-hover:opacity-100
                                ">
                                    <ArrowRight size={15} />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="px-4 py-4 text-center">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 transition group-hover:text-[#1f5d3b] sm:text-base">
                                    {category.name}
                                </h3>

                                <p className="mt-1 text-xs text-gray-400">
                                    View Products
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ================= MOBILE DOTS ================= */}
                <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
                    {categories.map((category, index) => (
                        <span
                            key={category.slug}
                            className={`h-2 rounded-full transition-all ${
                                index === 0
                                    ? 'w-6 bg-[#1f5d3b]'
                                    : 'w-2 bg-[#b9ddcc]'
                            }`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
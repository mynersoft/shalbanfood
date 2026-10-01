import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

import connectDB from "@/lib/dbConnect";
import ComboOffer from "@/models/ComboOffer";
import OfferCard from "@/components/OfferCard";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Combo Offers | Shalban Food",
    description:
        "Shalban Food-এর বিশেষ combo offers দেখুন এবং অনলাইনে অর্ডার করুন।",
};

async function getOffers() {
    await connectDB();

    const now = new Date();

    const offers = await ComboOffer.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        stock: { $gt: 0 },
    })
        .sort({
            priority: -1,
            createdAt: -1,
        })
        .lean();

    return JSON.parse(JSON.stringify(offers));
}

export default async function OffersPage() {
    const offers = await getOffers();

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                            <Gift size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Combo Offers
                            </h1>

                            <p className="mt-1 text-gray-500">
                                Special bundles at special prices
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {offers.length === 0 ? (
                    <div className="rounded-2xl border bg-white px-6 py-20 text-center">
                        <Gift
                            size={48}
                            className="mx-auto text-gray-300"
                        />

                        <h2 className="mt-4 text-xl font-bold">
                            No active combo offers
                        </h2>

                        <p className="mt-2 text-gray-500">
                            New offers will appear here soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {offers.map((offer) => (
                            <OfferCard
                                key={offer._id}
                                offer={offer}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
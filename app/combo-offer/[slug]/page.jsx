import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {connectDB} from "@/lib/dbConnect";
import ComboOffer from "@/models/ComboOffer";

import OfferDetailsClient from "./OfferDetailsClient";

export const dynamic = "force-dynamic";

async function getOffer(slug) {
    await connectDB();

    const offer = await ComboOffer.findOne({
        slug,
    }).lean();

    if (!offer) {
        return null;
    }

    return JSON.parse(JSON.stringify(offer));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const offer = await getOffer(slug);

    if (!offer) {
        return {
            title: "Offer Not Found | Shalban Food",
        };
    }

    return {
        title:
            offer.seoTitle ||
            `${offer.name} | Shalban Food`,

        description:
            offer.seoDescription ||
            offer.shortDescription ||
            offer.description ||
            `Buy ${offer.name} from Shalban Food.`,

        keywords:
            offer.keywords?.join(", ") ||
            `${offer.name}, Shalban Food, combo offer`,
    };
}

export default async function OfferDetailsPage({
    params,
}) {
    const { slug } = await params;

    const offer = await getOffer(slug);

    if (!offer) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">
                        Offer Not Found
                    </h1>

                    <Link
                        href="/offers"
                        className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-3 text-white"
                    >
                        View Offers
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Link
                    href="/offers"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700"
                >
                    <ArrowLeft size={16} />
                    All Offers
                </Link>

                <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
                    <div className="grid lg:grid-cols-2">
                        <div className="relative min-h-[350px] bg-gray-100 lg:min-h-[600px]">
                            <Image
                                src={offer.featureImg}
                                alt={offer.name}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>

                        <OfferDetailsClient
                            offer={offer}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
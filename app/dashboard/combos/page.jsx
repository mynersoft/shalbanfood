"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Edit3,
    Eye,
    Gift,
    Plus,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

function getStatus(offer) {
    const now = new Date();

    if (!offer.isActive) {
        return {
            label: "Inactive",
            className:
                "bg-gray-100 text-gray-600",
        };
    }

    if (
        new Date(offer.startDate) > now
    ) {
        return {
            label: "Upcoming",
            className:
                "bg-blue-100 text-blue-700",
        };
    }

    if (
        new Date(offer.endDate) < now
    ) {
        return {
            label: "Expired",
            className:
                "bg-red-100 text-red-700",
        };
    }

    if (offer.stock <= 0) {
        return {
            label: "Out of Stock",
            className:
                "bg-orange-100 text-orange-700",
        };
    }

    return {
        label: "Active",
        className:
            "bg-green-100 text-green-700",
    };
}

export default function AdminOffersPage() {
    const [offers, setOffers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [deleting, setDeleting] =
        useState(null);

    const loadOffers = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "/api/offers?admin=true",
                {
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to load offers"
                );
            }

            setOffers(data.offers || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOffers();
    }, []);

    const deleteOffer = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this combo offer?"
        );

        if (!confirmed) return;

        try {
            setDeleting(id);

            const response = await fetch(
                `/api/offers/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Delete failed"
                );
            }

            setOffers((prev) =>
                prev.filter(
                    (offer) =>
                        offer._id !== id
                )
            );

            toast.success(
                "Offer deleted successfully"
            );
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-100 p-3 text-green-700">
                                <Gift size={24} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                    Combo Offers
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Manage Shalban Food combo offers
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/admin/offers/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800"
                    >
                        <Plus size={18} />
                        Create Offer
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-2xl border bg-white p-12 text-center">
                        Loading offers...
                    </div>
                ) : offers.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-12 text-center">
                        <Gift
                            size={45}
                            className="mx-auto text-gray-300"
                        />

                        <h2 className="mt-4 text-xl font-bold">
                            No combo offers
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Create your first combo offer.
                        </p>

                        <Link
                            href="/dashboard/admin/offers/new"
                            className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 font-semibold text-white"
                        >
                            Create Offer
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-4 text-sm font-bold">
                                            Offer
                                        </th>

                                        <th className="px-5 py-4 text-sm font-bold">
                                            Price
                                        </th>

                                        <th className="px-5 py-4 text-sm font-bold">
                                            Stock
                                        </th>

                                        <th className="px-5 py-4 text-sm font-bold">
                                            Schedule
                                        </th>

                                        <th className="px-5 py-4 text-sm font-bold">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-sm font-bold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {offers.map(
                                        (
                                            offer
                                        ) => {
                                            const status =
                                                getStatus(
                                                    offer
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        offer._id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={
                                                                    offer.featureImg
                                                                }
                                                                alt={
                                                                    offer.name
                                                                }
                                                                className="h-14 w-14 rounded-xl object-cover"
                                                            />

                                                            <div>
                                                                <p className="max-w-xs font-bold text-gray-900">
                                                                    {
                                                                        offer.name
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {
                                                                        offer.slug
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-bold text-green-700">
                                                                ৳
                                                                {
                                                                    offer.offerPrice
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-400 line-through">
                                                                ৳
                                                                {
                                                                    offer.regularPrice
                                                                }
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold">
                                                            {
                                                                offer.stock
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            Sold:{" "}
                                                            {
                                                                offer.sold
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-xs text-gray-500">
                                                        <p>
                                                            Start:{" "}
                                                            {new Date(
                                                                offer.startDate
                                                            ).toLocaleString(
                                                                "en-BD"
                                                            )}
                                                        </p>

                                                        <p className="mt-1">
                                                            End:{" "}
                                                            {new Date(
                                                                offer.endDate
                                                            ).toLocaleString(
                                                                "en-BD"
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                                                        >
                                                            {
                                                                status.label
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={`/offers/${offer.slug}`}
                                                                target="_blank"
                                                                className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100"
                                                                title="View"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </Link>

                                                            <Link
                                                                href={`/dashboard/admin/offers/${offer._id}`}
                                                                className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                                                                title="Edit"
                                                            >
                                                                <Edit3
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteOffer(
                                                                        offer._id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleting ===
                                                                    offer._id
                                                                }
                                                                className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                title="Delete"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
    ArrowLeft,
    Mail,
    Phone,
    ShoppingBag,
    Wallet,
    Calendar,
    MapPin,
} from "lucide-react";

export default function CustomerDetailsPage() {
    const params = useParams();

    const id = params?.id;

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        async function loadCustomer() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/customers/${id}`,
                    {
                        cache: "no-store",
                    }
                );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                            "Failed to load customer"
                    );
                }

                setData(result);
            } catch (error) {
                console.error(error);

                setError(
                    error.message ||
                        "Failed to load customer"
                );
            } finally {
                setLoading(false);
            }
        }

        loadCustomer();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">

                <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />

                <div className="h-40 animate-pulse rounded-xl bg-gray-200" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-xl bg-gray-200"
                        />
                    ))}
                </div>

                <div className="h-72 animate-pulse rounded-xl bg-gray-200" />

            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">

                <Link
                    href="/dashboard/customers"
                    className="mb-4 inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Customers
                </Link>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
                    {error}
                </div>

            </div>
        );
    }

    const customer = data?.customer;

    const orders = data?.orders || [];

    return (
        <div className="space-y-6 p-4 md:p-6">

            {/* Header */}

            <div className="flex items-center gap-4">

                <Link
                    href="/dashboard/customers"
                    className="rounded-lg border bg-white p-2 transition hover:bg-gray-50"
                >
                    <ArrowLeft size={18} />
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">
                        Customer Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Customer profile and order history
                    </p>
                </div>

            </div>

            {/* Customer Profile */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-6 md:flex-row md:items-center">

                    {/* Avatar */}

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600">

                        {customer?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "C"}

                    </div>

                    {/* Info */}

                    <div className="flex-1">

                        <h2 className="text-xl font-bold">
                            {customer?.name ||
                                "N/A"}
                        </h2>

                        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:gap-6">

                            <span className="flex items-center gap-2">
                                <Phone
                                    size={16}
                                />

                                {customer?.phone ||
                                    "N/A"}
                            </span>

                            <span className="flex items-center gap-2">
                                <Mail
                                    size={16}
                                />

                                {customer?.email ||
                                    "N/A"}
                            </span>

                        </div>

                        {customer?.createdAt && (
                            <p className="mt-3 text-xs text-gray-400">
                                Joined{" "}
                                {new Date(
                                    customer.createdAt
                                ).toLocaleDateString(
                                    "en-BD"
                                )}
                            </p>
                        )}

                    </div>

                    {/* Status */}

                    <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                            customer?.status ===
                            "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                    >
                        {customer?.status ===
                        "active"
                            ? "Active"
                            : "New"}
                    </span>

                </div>

            </div>

            {/* Statistics */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <StatCard
                    title="Total Orders"
                    value={
                        customer?.totalOrders ||
                        0
                    }
                    icon={
                        <ShoppingBag
                            size={20}
                        />
                    }
                />

                <StatCard
                    title="Total Spent"
                    value={`৳${Number(
                        customer?.totalSpent ||
                            0
                    ).toLocaleString(
                        "en-BD"
                    )}`}
                    icon={
                        <Wallet size={20} />
                    }
                />

                <StatCard
                    title="Last Order"
                    value={
                        customer?.lastOrder
                            ? new Date(
                                  customer.lastOrder
                              ).toLocaleDateString(
                                  "en-BD",
                                  {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                  }
                              )
                            : "No order"
                    }
                    icon={
                        <Calendar
                            size={20}
                        />
                    }
                />

            </div>

            {/* Order History */}

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                <div className="border-b p-5">

                    <h2 className="font-semibold">
                        Order History
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        All orders placed by this customer
                    </p>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px]">

                        <thead className="bg-gray-50">

                            <tr>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Invoice
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Date
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Subtotal
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Shipping
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Total
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                                    Payment
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y">

                            {orders.length ===
                            0 ? (
                                <tr>

                                    <td
                                        colSpan={
                                            7
                                        }
                                        className="px-5 py-16 text-center text-gray-500"
                                    >
                                        <ShoppingBag
                                            size={
                                                40
                                            }
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="mt-3">
                                            No orders found
                                        </p>
                                    </td>

                                </tr>
                            ) : (
                                orders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order._id
                                            }
                                            className="hover:bg-gray-50"
                                        >

                                            {/* Invoice */}

                                            <td className="px-5 py-4 font-medium">

                                                #
                                                {
                                                    order.invoiceNo
                                                }

                                            </td>

                                            {/* Date */}

                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                {order.createdAt
                                                    ? new Date(
                                                          order.createdAt
                                                      ).toLocaleDateString(
                                                          "en-BD"
                                                      )
                                                    : "—"}

                                            </td>

                                            {/* Subtotal */}

                                            <td className="px-5 py-4 text-right text-sm">

                                                ৳
                                                {Number(
                                                    order.subtotal ||
                                                        0
                                                ).toLocaleString(
                                                    "en-BD"
                                                )}

                                            </td>

                                            {/* Shipping */}

                                            <td className="px-5 py-4 text-right text-sm">

                                                ৳
                                                {Number(
                                                    order.shippingFee ||
                                                        0
                                                ).toLocaleString(
                                                    "en-BD"
                                                )}

                                            </td>

                                            {/* Total */}

                                            <td className="px-5 py-4 text-right font-semibold">

                                                ৳
                                                {Number(
                                                    order.total ||
                                                        0
                                                ).toLocaleString(
                                                    "en-BD"
                                                )}

                                            </td>

                                            {/* Payment */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                                                    {
                                                        order
                                                            .payment
                                                            ?.status
                                                    }
                                                </span>

                                            </td>

                                            {/* Status */}

                                            <td className="px-5 py-4 text-center">

                                                <OrderStatus
                                                    status={
                                                        order.status
                                                    }
                                                />

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

// --------------------------------
// Stat Card
// --------------------------------

function StatCard({
    title,
    value,
    icon,
}) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

                <div className="rounded-lg bg-gray-100 p-3">
                    {icon}
                </div>

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-1 text-xl font-bold">
                        {value}
                    </p>
                </div>

            </div>

        </div>
    );
}

// --------------------------------
// Order Status
// --------------------------------

function OrderStatus({ status }) {
    const styles = {
        pending:
            "bg-yellow-100 text-yellow-700",

        processing:
            "bg-blue-100 text-blue-700",

        shipped:
            "bg-purple-100 text-purple-700",

        delivered:
            "bg-green-100 text-green-700",

        cancelled:
            "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status] ||
                "bg-gray-100 text-gray-600"
            }`}
        >
            {status || "unknown"}
        </span>
    );
}
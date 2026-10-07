"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
    Search,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight,
    Users,
    ShoppingBag,
    UserPlus,
} from "lucide-react";

import { useCustomers } from "@/hooks/useCustomers";

export default function CustomersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useCustomers({
        page,
        limit,
        search,
    });

    const customers = data?.customers || [];

    const pagination = data?.pagination || {
        page: 1,
        totalPages: 1,
        totalCustomers: 0,
    };

    // --------------------------------
    // Search debounce
    // --------------------------------
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // --------------------------------
    // Loading
    // --------------------------------
    if (isLoading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-xl bg-gray-200"
                        />
                    ))}
                </div>

                <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
            </div>
        );
    }

    // --------------------------------
    // Error
    // --------------------------------
    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <h2 className="font-semibold text-red-700">
                        Failed to load customers
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                        {error?.message}
                    </p>

                    <button
                        onClick={() => refetch()}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">

            {/* -------------------------------- */}
            {/* Header */}
            {/* -------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Customers
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your Shalban Food customers
                    </p>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            isFetching
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

            </div>

            {/* -------------------------------- */}
            {/* Summary */}
            {/* -------------------------------- */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                    title="Total Customers"
                    value={pagination.totalCustomers}
                    icon={<Users size={20} />}
                />

                <SummaryCard
                    title="Current Page"
                    value={customers.length}
                    icon={<UserPlus size={20} />}
                />

                <SummaryCard
                    title="Page"
                    value={`${pagination.page} / ${pagination.totalPages}`}
                    icon={<ShoppingBag size={20} />}
                />

            </div>

            {/* -------------------------------- */}
            {/* Search */}
            {/* -------------------------------- */}

            <div className="rounded-xl border bg-white p-4 shadow-sm">

                <div className="relative max-w-lg">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) =>
                            setSearchInput(e.target.value)
                        }
                        placeholder="Search name, phone or email..."
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black"
                    />

                </div>

            </div>

            {/* -------------------------------- */}
            {/* Table */}
            {/* -------------------------------- */}

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px]">

                        <thead className="border-b bg-gray-50">

                            <tr>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Customer
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Phone
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Email
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                                    Orders
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Spent
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Last Order
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y">

                            {customers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-16 text-center"
                                    >
                                        <Users
                                            size={40}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="mt-3 text-sm text-gray-500">
                                            No customers found
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map(
                                    (customer) => (
                                        <tr
                                            key={
                                                customer._id
                                            }
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* Customer */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
                                                        {customer.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "C"}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                customer.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            Customer
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>

                                            {/* Phone */}

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {customer.phone ||
                                                    "—"}
                                            </td>

                                            {/* Email */}

                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {customer.email ||
                                                    "—"}
                                            </td>

                                            {/* Orders */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="font-semibold">
                                                    {
                                                        customer.totalOrders
                                                    }
                                                </span>

                                            </td>

                                            {/* Spent */}

                                            <td className="px-5 py-4 text-right font-semibold">

                                                ৳
                                                {Number(
                                                    customer.totalSpent ||
                                                        0
                                                ).toLocaleString(
                                                    "en-BD"
                                                )}

                                            </td>

                                            {/* Last Order */}

                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                {customer.lastOrder
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
                                                    : "No order"}

                                            </td>

                                            {/* Status */}

                                            <td className="px-5 py-4 text-center">

                                                <StatusBadge
                                                    status={
                                                        customer.status
                                                    }
                                                />

                                            </td>

                                            {/* Action */}

                                            <td className="px-5 py-4 text-center">

                                                <Link
                                                    href={`/dashboard/customers/${customer._id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-100"
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    View
                                                </Link>

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

                {/* -------------------------------- */}
                {/* Pagination */}
                {/* -------------------------------- */}

                <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        {customers.length} of{" "}
                        {
                            pagination.totalCustomers
                        }{" "}
                        customers
                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            disabled={page <= 1}
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        Math.max(
                                            prev - 1,
                                            1
                                        )
                                )
                            }
                            className="rounded-lg border p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft
                                size={18}
                            />
                        </button>

                        <span className="px-2 text-sm">
                            {pagination.page} /{" "}
                            {
                                pagination.totalPages
                            }
                        </span>

                        <button
                            disabled={
                                page >=
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        Math.min(
                                            prev + 1,
                                            pagination.totalPages
                                        )
                                )
                            }
                            className="rounded-lg border p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight
                                size={18}
                            />
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}

// --------------------------------
// Summary Card
// --------------------------------

function SummaryCard({
    title,
    value,
    icon,
}) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        {value}
                    </h2>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                    {icon}
                </div>

            </div>

        </div>
    );
}

// --------------------------------
// Status Badge
// --------------------------------

function StatusBadge({ status }) {
    if (status === "active") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            New
        </span>
    );
}
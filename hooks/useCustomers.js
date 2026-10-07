"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchCustomers({
    page,
    limit,
    search,
}) {
    const params = new URLSearchParams();

    params.set("page", page);
    params.set("limit", limit);

    if (search) {
        params.set("search", search);
    }

    const response = await fetch(
        `/api/customers?${params.toString()}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
                "Failed to fetch customers"
        );
    }

    return data;
}

export function useCustomers({
    page = 1,
    limit = 10,
    search = "",
} = {}) {
    return useQuery({
        queryKey: [
            "customers",
            page,
            limit,
            search,
        ],

        queryFn: () =>
            fetchCustomers({
                page,
                limit,
                search,
            }),

        placeholderData: (previousData) =>
            previousData,

        staleTime: 30 * 1000,
    });
}
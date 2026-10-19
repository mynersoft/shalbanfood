"use client";

import { useQuery } from "@tanstack/react-query";

export async function fetchDashboardOverview() {
  const res = await fetch("/api/dashboard/overview", {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const responseText = await res.text();

    console.error("Dashboard API returned non-JSON:", {
      status: res.status,
      response: responseText.slice(0, 200),
    });

    throw new Error(
      `Dashboard API returned HTML/non-JSON (HTTP ${res.status}). Check API route and deployment.`
    );
  }

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(
      data.message || `Dashboard request failed (HTTP ${res.status})`
    );
  }

  return data;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
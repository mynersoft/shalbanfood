
"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchDashboardOverview() {
  const response = await fetch("/api/dashboard/overview", {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Dashboard load failed");
  }

  return data;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

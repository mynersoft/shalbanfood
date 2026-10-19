
async function fetchDashboardOverview() {
  const res = await fetch("/api/dashboard/overview", {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await res.text();

    console.error("Dashboard API returned non-JSON:", {
      status: res.status,
      response: text.slice(0, 200),
    });

    throw new Error(
      `Dashboard API returned HTML/non-JSON (HTTP ${res.status}). Check API route and deployment.`
    );
  }

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Dashboard data load failed");
  }

  return data;
}

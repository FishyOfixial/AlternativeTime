import { apiJson, resolveApiUrl } from "./http";

export function getSalesSummary(accessToken) {
  return apiJson("/api/reports/sales-summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getInventorySummary(accessToken) {
  return apiJson("/api/reports/inventory-summary/", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getDashboardSummary(accessToken, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return apiJson(`/api/reports/dashboard-summary/${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export async function exportReport(accessToken, reportType, format, params = {}) {
  const searchParams = new URLSearchParams();
  const normalizedFormat =
    typeof format === "string" ? format.replace(/^['"]|['"]$/g, "") : format;
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  if (normalizedFormat) {
    searchParams.set("format", normalizedFormat);
  }
  const query = searchParams.toString();
  const response = await fetch(
    resolveApiUrl(`/api/reports/${reportType}/export/${query ? `?${query}` : ""}`),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = filenameMatch
    ? filenameMatch[1]
    : `${reportType}.${normalizedFormat || "csv"}`;
  return { blob, filename };
}

import { resolveApiUrl } from "./http";
import { apiJsonAuth, authHeaders, buildQueryString } from "./serviceUtils";

export function getSalesSummary(accessToken) {
  return apiJsonAuth("/api/reports/sales-summary/", accessToken);
}

export function getInventorySummary(accessToken) {
  return apiJsonAuth("/api/reports/inventory-summary/", accessToken);
}

export function getDashboardSummary(accessToken, params = {}) {
  return apiJsonAuth(`/api/reports/dashboard-summary/${buildQueryString(params)}`, accessToken);
}

export async function exportReport(accessToken, reportType, format, params = {}) {
  const normalizedFormat =
    typeof format === "string" ? format.replace(/^['"]|['"]$/g, "") : format;
  const query = buildQueryString({
    ...params,
    ...(normalizedFormat ? { format: normalizedFormat } : {})
  });
  const response = await fetch(
    resolveApiUrl(`/api/reports/${reportType}/export/${query}`),
    {
      headers: authHeaders(accessToken)
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

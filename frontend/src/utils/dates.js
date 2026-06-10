export const BUSINESS_TIME_ZONE = "America/Mexico_City";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function getBusinessTodayIsoDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function toBusinessIsoDate(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string" && dateOnlyPattern.test(value)) {
    return value;
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatBusinessDate(value) {
  if (!value) {
    return "Sin fecha";
  }
  const date = typeof value === "string" && dateOnlyPattern.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE
  }).format(date);
}

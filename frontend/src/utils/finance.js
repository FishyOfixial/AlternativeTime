export function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function shiftMonths(value, months) {
  const year = value.getFullYear() + Math.floor((value.getMonth() + months) / 12);
  const month = (value.getMonth() + months) % 12;
  const normalizedMonth = month < 0 ? month + 12 : month;
  return new Date(year, normalizedMonth, 1);
}

export function getRangeDates(range, year) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (range === "month") {
    return { date_from: monthStart, date_to: today };
  }
  if (range === "quarter") {
    return { date_from: shiftMonths(monthStart, -2), date_to: today };
  }
  if (range === "half") {
    return { date_from: shiftMonths(monthStart, -5), date_to: today };
  }
  if (range === "year") {
    return {
      date_from: new Date(year, 0, 1),
      date_to: new Date(year, 11, 31)
    };
  }
  return { date_from: null, date_to: null };
}

export function toISODate(value) {
  if (!value) {
    return "";
  }
  return value.toISOString().slice(0, 10);
}

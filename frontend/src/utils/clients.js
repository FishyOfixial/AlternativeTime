export function getClientInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatLastPurchase(value) {
  if (!value) {
    return "Sin compras";
  }

  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric"
  }).format(new Date(value));
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

export function buildInitialClientSaleForm() {
  return {
    product: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    sales_channel: "instagram",
    amount_paid: "",
    extras: "0.00",
    sale_shipping_cost: "0.00",
    notes: ""
  };
}

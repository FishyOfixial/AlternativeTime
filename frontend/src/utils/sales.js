import * as XLSX from "xlsx";

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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

export function getBrandFromLabel(label) {
  if (!label) {
    return "";
  }
  return label.split(" ")[0] || "";
}

export function buildMonthOptions(monthsBack = 12) {
  const now = new Date();
  const options = [{ value: "all", label: "Todos los meses" }];

  for (let i = 0; i < monthsBack; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric"
    }).format(date);
    options.push({ value, label });
  }

  return options;
}

export function monthToRange(value) {
  if (!value || value === "all") {
    return { date_from: "", date_to: "" };
  }

  const [year, month] = value.split("-").map((item) => Number(item));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const date_from = start.toISOString().slice(0, 10);
  const date_to = end.toISOString().slice(0, 10);
  return { date_from, date_to };
}

export function exportSalesSpreadsheet({
  items,
  formatDate,
  formatCurrency,
  channelLabels,
  paymentLabels
}) {
  const headers = [
    "Fecha",
    "ID reloj",
    "Reloj",
    "Cliente",
    "Contacto",
    "Canal",
    "Metodo",
    "Monto",
    "Costo",
    "Ganancia",
    "Margen"
  ];

  const rows = items.map((sale) => [
    formatDate(sale.sale_date),
    sale.product_code || "-",
    sale.product_label || "Venta",
    sale.customer_name || "Venta libre",
    sale.customer_contact || "-",
    channelLabels[sale.sales_channel] || sale.sales_channel || "-",
    paymentLabels[sale.payment_method] || sale.payment_method || "-",
    formatCurrency(sale.amount_paid),
    formatCurrency(sale.cost_snapshot),
    formatCurrency(sale.gross_profit),
    `${(Number(sale.profit_percentage || 0) * 100).toFixed(1)}%`
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `ventas_${today}.xlsx`);
}

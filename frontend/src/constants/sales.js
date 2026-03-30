export const channelLabels = {
  marketplace: "Marketplace",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  direct: "Directo",
  other: "Otro"
};

export const paymentLabels = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  msi: "MSI",
  consignment: "Consigna"
};

export const paymentOptions = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta / MSI" },
  { value: "msi", label: "MSI" },
  { value: "consignment", label: "Consigna" }
];

export const channelOptions = [
  { value: "marketplace", label: "Marketplace" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "direct", label: "Directo" },
  { value: "other", label: "Otro" }
];

export function buildInitialSaleForm() {
  return {
    product: "",
    customer: "",
    customer_name: "",
    customer_contact: "",
    customer_email: "",
    customer_address: "",
    customer_notes: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    sales_channel: "marketplace",
    amount_paid: "",
    extras: "0.00",
    sale_shipping_cost: "0.00",
    notes: ""
  };
}

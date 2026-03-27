export const accountLabels = {
  cash: "Efectivo",
  bbva: "BBVA",
  credit: "Credito",
  amex: "Amex"
};

export const typeLabels = {
  income: "Ingreso",
  expense: "Egreso"
};

export const conceptLabels = {
  sale: "Venta",
  purchase: "Compra",
  capital_payment: "Abono a capital",
  transfer: "Transferencia",
  expense: "Gasto"
};

export const accountCards = [
  { key: "cash", label: "Efectivo" },
  { key: "bbva", label: "BBVA" },
  { key: "credit", label: "Credito" },
  { key: "amex", label: "Amex" }
];

export const rangeOptions = [
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "1 año" },
  { value: "lifetime", label: "Siempre" }
];

export const initialEntryForm = {
  entry_date: new Date().toISOString().slice(0, 10),
  entry_type: "income",
  concept: "sale",
  amount: "",
  account: "cash",
  notes: ""
};

export const conceptOptions = [
  { value: "capital_payment", label: "Abono a capital" },
  { value: "purchase", label: "Compra" },
  { value: "sale", label: "Venta" },
  { value: "transfer", label: "Transferencia" },
  { value: "expense", label: "Gasto" }
];

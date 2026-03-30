import { accountLabels } from "./finance";
import { paymentOptions } from "./sales";

export const layawayStatusLabels = {
  active: "Activo",
  completed: "Vendido",
  cancelled: "Cancelado"
};

export const layawayStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: layawayStatusLabels.active },
  { value: "completed", label: layawayStatusLabels.completed },
  { value: "cancelled", label: layawayStatusLabels.cancelled }
];

export const layawayViewOptions = [
  { value: "all", label: "Todo" },
  { value: "active", label: "Activos" },
  { value: "overdue", label: "Vencidos" },
  { value: "due_soon", label: "Por vencer" }
];

export const layawayAccountOptions = Object.entries(accountLabels).map(([value, label]) => ({
  value,
  label
}));

export const layawayPaymentMethodOptions = paymentOptions.map((option) => ({
  value: option.value,
  label: option.label
}));

export function buildInitialLayawayFilters() {
  return {
    status: "all",
    customer: "",
    query: "",
    view: "all"
  };
}

export function buildInitialLayawayForm() {
  return {
    product: "",
    customer: "",
    customer_name: "",
    customer_contact: "",
    customer_email: "",
    customer_address: "",
    customer_notes: "",
    agreed_price: "",
    start_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    notes: ""
  };
}

export function buildInitialLayawayPaymentForm() {
  return {
    payment_date: new Date().toISOString().slice(0, 10),
    amount: "",
    payment_method: "cash",
    account: "cash",
    notes: ""
  };
}

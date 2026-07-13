import { USERS_MODULE_ENABLED } from "./features";

export const navigationLinks = [
  { to: "/pos/dashboard", label: "Dashboard" },
  { to: "/pos/clients", label: "Clientes" },
  { to: "/pos/inventory", label: "Inventario" },
  { to: "/pos/sales", label: "Ventas" },
  { to: "/pos/layaways", label: "Apartados" },
  { to: "/pos/finance", label: "Finanzas" },
  { to: "/pos/reports", label: "Reportes" },
  { to: "/pos/users", label: "Usuarios", enabled: USERS_MODULE_ENABLED }
].filter((link) => link.enabled !== false);

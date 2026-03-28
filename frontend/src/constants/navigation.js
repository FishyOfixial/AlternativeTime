import { USERS_MODULE_ENABLED } from "./features";

export const navigationLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clientes" },
  { to: "/inventory", label: "Inventario" },
  { to: "/sales", label: "Ventas" },
  { to: "/layaways", label: "Apartados" },
  { to: "/finance", label: "Finanzas" },
  { to: "/reports", label: "Reportes" },
  { to: "/users", label: "Usuarios", enabled: USERS_MODULE_ENABLED }
].filter((link) => link.enabled !== false);

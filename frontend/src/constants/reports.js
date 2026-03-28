export const reportOptions = [
  {
    id: "sales-by-month",
    title: "Ventas por mes / año",
    description: "Detalle de todas las ventas agrupadas por periodo"
  },
  {
    id: "profit-by-period",
    title: "Ganancia por periodo",
    description: "Ingresos netos y margenes por rango de fechas"
  },
  {
    id: "sales-by-brand",
    title: "Ventas por marca",
    description: "Unidades vendidas y montos agrupados por marca"
  },
  {
    id: "top-products",
    title: "Top productos vendidos",
    description: "Relojes con mayor margen y menor tiempo en inventario"
  },
  {
    id: "slow-movers",
    title: "Productos lentos",
    description: "Relojes con mas dias en inventario que el promedio"
  },
  {
    id: "inventory-current",
    title: "Inventario actual",
    description: "Resumen completo del stock disponible con valorizacion"
  },
  {
    id: "purchase-cost",
    title: "Costo de adquisicion",
    description: "Desglose de costos de compra por periodo y metodo de pago"
  },
  {
    id: "cash-flow",
    title: "Flujo de efectivo",
    description: "Ingresos, egresos y saldo por cuenta bancaria"
  },
  {
    id: "client-history",
    title: "Historial por cliente",
    description: "Todas las compras de un cliente especifico"
  }
];

export const reportTypeMap = {
  "sales-by-month": "ventas_por_mes",
  "profit-by-period": "ganancia_por_periodo",
  "sales-by-brand": "ventas_por_marca",
  "top-products": "top_productos",
  "slow-movers": "slow_movers",
  "inventory-current": "inventario_actual",
  "purchase-cost": "costo_adquisicion",
  "cash-flow": "flujo_efectivo",
  "client-history": "historial_cliente"
};

export const rangeOptions = [
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "1 año" },
  { value: "lifetime", label: "Siempre" }
];

export const reportFilterMap = {
  "sales-by-month": ["date_from", "date_to", "brand", "channel", "payment_method"],
  "profit-by-period": ["date_from", "date_to"],
  "sales-by-brand": ["date_from", "date_to", "brand", "channel", "payment_method"],
  "top-products": ["date_from", "date_to", "brand", "channel", "payment_method"],
  "slow-movers": ["dias_minimos"],
  "inventory-current": ["status", "brand", "tag"],
  "purchase-cost": ["date_from", "date_to", "payment_method"],
  "cash-flow": ["date_from", "date_to", "account", "type"],
  "client-history": ["customer_id", "date_from", "date_to"]
};

export const channelOptions = [
  { value: "", label: "Todos" },
  { value: "instore", label: "Tienda" },
  { value: "instagram", label: "Instagram" },
  { value: "marketplace", label: "Marketplace" },
  { value: "whatsapp", label: "WhatsApp" }
];

export const paymentOptions = [
  { value: "", label: "Todos" },
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" }
];

export const accountOptions = [
  { value: "", label: "Todas" },
  { value: "cash", label: "Efectivo" },
  { value: "bbva", label: "BBVA" },
  { value: "credit", label: "Credito" },
  { value: "amex", label: "Amex" }
];

export const entryTypeOptions = [
  { value: "", label: "Todos" },
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Egreso" }
];

export const inventoryStatusOptions = [
  { value: "", label: "Todos" },
  { value: "available", label: "Disponible" },
  { value: "sold", label: "Vendido" },
  { value: "reserved", label: "Apartado" }
];

export const inventoryTagOptions = [
  { value: "", label: "Todas" },
  { value: "new", label: "Nuevo" },
  { value: "discount", label: "Descuento" },
  { value: "featured", label: "Destacado" }
];

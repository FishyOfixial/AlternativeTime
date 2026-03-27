import { useEffect, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
  exportReport,
  getDashboardSummary
} from "../services/reports";
import { listClients } from "../services/clients";

const reportOptions = [
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

const reportTypeMap = {
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

const rangeOptions = [
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "1 año" },
  { value: "lifetime", label: "Siempre" }
];

const reportFilterMap = {
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

const channelOptions = [
  { value: "", label: "Todos" },
  { value: "instore", label: "Tienda" },
  { value: "instagram", label: "Instagram" },
  { value: "marketplace", label: "Marketplace" },
  { value: "whatsapp", label: "WhatsApp" }
];

const paymentOptions = [
  { value: "", label: "Todos" },
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" }
];

const accountOptions = [
  { value: "", label: "Todas" },
  { value: "cash", label: "Efectivo" },
  { value: "bbva", label: "BBVA" },
  { value: "credit", label: "Credito" },
  { value: "amex", label: "Amex" }
];

const entryTypeOptions = [
  { value: "", label: "Todos" },
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Egreso" }
];

const inventoryStatusOptions = [
  { value: "", label: "Todos" },
  { value: "available", label: "Disponible" },
  { value: "sold", label: "Vendido" },
  { value: "reserved", label: "Apartado" }
];

const inventoryTagOptions = [
  { value: "", label: "Todas" },
  { value: "new", label: "Nuevo" },
  { value: "discount", label: "Descuento" },
  { value: "featured", label: "Destacado" }
];

function toDateString(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftMonths(value, amount) {
  const next = new Date(value);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function getRangeDates(rangeKey, selectedYear) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  if (rangeKey === "month") {
    return { date_from: toDateString(monthStart), date_to: toDateString(today) };
  }
  if (rangeKey === "quarter") {
    const start = shiftMonths(monthStart, -2);
    return { date_from: toDateString(start), date_to: toDateString(today) };
  }
  if (rangeKey === "half") {
    const start = shiftMonths(monthStart, -5);
    return { date_from: toDateString(start), date_to: toDateString(today) };
  }
  if (rangeKey === "year") {
    const start = new Date(selectedYear, 0, 1);
    const end =
      selectedYear === today.getFullYear()
        ? today
        : new Date(selectedYear, 11, 31);
    return { date_from: toDateString(start), date_to: toDateString(end) };
  }
  return { date_from: "", date_to: "" };
}

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const [dashboardState, setDashboardState] = useState({ status: "loading", data: null });
  const [clientsState, setClientsState] = useState({ status: "loading", data: [] });
  const [selectedRange, setSelectedRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReportType, setSelectedReportType] = useState(reportOptions[0].id);
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    brand: "",
    channel: "",
    payment_method: "",
    account: "",
    type: "",
    status: "",
    tag: "",
    customer_id: "",
    dias_minimos: ""
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setDashboardState({ status: "loading", data: null });
      try {
        const data = await getDashboardSummary(accessToken, {
          range: selectedRange,
          year: selectedYear
        });
        if (!active) {
          return;
        }
        setDashboardState({ status: "success", data });
      } catch {
        if (!active) {
          return;
        }
        setDashboardState({ status: "error", data: null });
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [accessToken, selectedRange, selectedYear]);

  useEffect(() => {
    let active = true;

    async function loadClients() {
      try {
        const data = await listClients(accessToken);
        if (!active) {
          return;
        }
        setClientsState({ status: "success", data });
      } catch {
        if (!active) {
          return;
        }
        setClientsState({ status: "error", data: [] });
      }
    }

    loadClients();

    return () => {
      active = false;
    };
  }, [accessToken]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function buildExportParams() {
    const params = {};
    const active = reportFilterMap[selectedReportType] || [];
    active.forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    });
    if (active.includes("date_from") || active.includes("date_to")) {
      const rangeDates = getRangeDates(selectedRange, selectedYear);
      if (!params.date_from && rangeDates.date_from) {
        params.date_from = rangeDates.date_from;
      }
      if (!params.date_to && rangeDates.date_to) {
        params.date_to = rangeDates.date_to;
      }
    }
    return params;
  }

  async function handleGenerate() {
    setIsExporting(true);
    setExportError("");
    const reportType = reportTypeMap[selectedReportType] || selectedReportType;

    try {
      const params = buildExportParams();
      const { blob, filename } = await exportReport(
        accessToken,
        reportType,
        exportFormat,
        params
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError("No pudimos generar el reporte. Revisa los parametros e intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  }

  const dashboardData = dashboardState.data;
  const years = dashboardData?.available_years ?? [selectedYear];
  const activeFilters = reportFilterMap[selectedReportType] || [];
  const clients = clientsState.data || [];

  const isLoading = dashboardState.status === "loading";
  const hasError = dashboardState.status === "error";
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Reportes
          </h1>
        </div>
      </section>

      {exportError ? (
        <div className="rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
          {exportError}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="Cargando reportes"
          message="Estamos reuniendo los agregados del backend."
        />
      ) : null}

      {hasError ? (
        <ErrorState
          title="No pudimos cargar reportes"
          message="Algunos endpoints agregados no respondieron como esperabamos."
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.6fr]">
        <div className="panel-surface p-6">
          <div>
            <p className="eyebrow">Reportes disponibles</p>
            <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">
              Reportes disponibles
            </h2>
            <p className="mt-2 text-sm text-[#8a775f]">
              Selecciona un reporte para configurar filtros.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {reportOptions.map((report) => {
              const isActive = report.id === selectedReportType;
              return (
                <button
                  key={report.id}
                  className={`flex w-full flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-[#201914] bg-[#201914] text-[#f8f1e7]"
                      : "border-[#eadfcd] bg-[#fffdf9] text-[#2a221b]"
                  }`}
                  onClick={() => setSelectedReportType(report.id)}
                  type="button"
                >
                  <div>
                    <p className={`font-semibold ${isActive ? "text-[#f8f1e7]" : "text-[#2a221b]"}`}>
                      {report.title}
                    </p>
                    <p className={`text-sm ${isActive ? "text-[#d8c9b2]" : "text-[#8a775f]"}`}>
                      {report.description}
                    </p>
                  </div>
                  <span className={`text-xs uppercase tracking-[0.2em] ${isActive ? "text-[#ddb65f]" : "text-[#b09a7e]"}`}>
                    {isActive ? "Seleccionado" : "Elegir"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <section className="panel-surface p-5">
            <p className="eyebrow">Configurar reporte</p>
            <h3 className="mt-2 font-serif text-2xl text-[#2a221b]">Configurar reporte</h3>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Reporte seleccionado
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  onChange={(event) => setSelectedReportType(event.target.value)}
                  value={selectedReportType}
                >
                  {reportOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Rango temporal
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedRange === option.value
                          ? "bg-[#201914] text-[#ddb65f]"
                          : "bg-[#f7f1e8] text-[#7d6751]"
                      }`}
                      onClick={() => setSelectedRange(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#8a775f]">
                  Este rango se aplica a la exportacion si no eliges fechas.
                </p>
              </label>

              {selectedRange === "year" ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Ano
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    value={selectedYear}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("date_from") ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Fecha inicio
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="date_from"
                      onChange={handleFilterChange}
                      type="date"
                      value={filters.date_from}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Fecha fin
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="date_to"
                      onChange={handleFilterChange}
                      type="date"
                      value={filters.date_to}
                    />
                  </label>
                </div>
              ) : null}

              {activeFilters.includes("brand") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Marca
                  </span>
                  <input
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="brand"
                    onChange={handleFilterChange}
                    placeholder="Ej. Seiko"
                    value={filters.brand}
                  />
                </label>
              ) : null}

              {activeFilters.includes("channel") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Canal
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="channel"
                    onChange={handleFilterChange}
                    value={filters.channel}
                  >
                    {channelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("payment_method") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Metodo de pago
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="payment_method"
                    onChange={handleFilterChange}
                    value={filters.payment_method}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("account") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Cuenta
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="account"
                    onChange={handleFilterChange}
                    value={filters.account}
                  >
                    {accountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("type") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Tipo de movimiento
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="type"
                    onChange={handleFilterChange}
                    value={filters.type}
                  >
                    {entryTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("status") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Estado de inventario
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="status"
                    onChange={handleFilterChange}
                    value={filters.status}
                  >
                    {inventoryStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("tag") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Etiqueta de inventario
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="tag"
                    onChange={handleFilterChange}
                    value={filters.tag}
                  >
                    {inventoryTagOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {activeFilters.includes("customer_id") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Cliente
                  </span>
                  <select
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="customer_id"
                    onChange={handleFilterChange}
                    value={filters.customer_id}
                  >
                    <option value="">Todos</option>
                    {clients.map((client) => {
                      const labelParts = [client.name, client.phone, client.instagram_handle].filter(Boolean);
                      return (
                        <option key={client.id} value={client.id}>
                          {labelParts.join(" · ")}
                        </option>
                      );
                    })}
                  </select>
                  {clientsState.status === "error" ? (
                    <p className="mt-2 text-xs text-[#9b6a5b]">
                      No pudimos cargar clientes. Puedes dejar el filtro en "Todos".
                    </p>
                  ) : null}
                </label>
              ) : null}

              {activeFilters.includes("dias_minimos") ? (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Dias minimos (slow movers)
                  </span>
                  <input
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="dias_minimos"
                    onChange={handleFilterChange}
                    placeholder="60"
                    value={filters.dias_minimos}
                  />
                </label>
              ) : null}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Formato de exportacion
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    className={`rounded-md border px-4 py-2 text-xs ${
                      exportFormat === "xlsx"
                        ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                        : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
                    }`}
                    onClick={() => setExportFormat("xlsx")}
                    type="button"
                  >
                    Excel
                  </button>
                  <button
                    className={`rounded-md border px-4 py-2 text-xs ${
                      exportFormat === "csv"
                        ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                        : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
                    }`}
                    onClick={() => setExportFormat("csv")}
                    type="button"
                  >
                    CSV
                  </button>
                </div>
              </div>

              <button
                className="gold-button w-full px-4 py-2 text-xs"
                disabled={isExporting}
                onClick={handleGenerate}
                type="button"
              >
                {isExporting ? "Generando..." : "Generar reporte"}
              </button>
            </div>
          </section>

          {!isLoading && !hasError ? null : null}
        </div>
      </section>

      {!isLoading && !hasError && (dashboardData?.brands_sold ?? []).length === 0 ? (
        <EmptyState
          title="Aun no hay suficientes ventas"
          message="En cuanto exista historial, aqui veras resumenes por marca y KPIs mas profundos."
        />
      ) : null}
    </div>
  );
}




import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
  getDashboardSummary,
  getInventorySummary,
  getSalesSummary
} from "../services/reports";

const reportOptions = [
  {
    id: "sales-by-month",
    title: "Ventas por mes / año",
    description: "Detalle de todas las ventas agrupadas por periodo"
  },
  {
    id: "profit-by-period",
    title: "Ganancia por periodo",
    description: "Revenue neto y margenes por rango de fechas"
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
    title: "Slow movers (productos lentos)",
    description: "Relojes con mas dias en inventario que el promedio"
  },
  {
    id: "inventory-current",
    title: "Inventario actual",
    description: "Snapshot completo del stock disponible con valorizacion"
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

const rangeOptions = [
  { value: "month", label: "Mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "Anual" },
  { value: "lifetime", label: "Lifetime" }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits
  }).format(Number(value || 0));
}

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const [dashboardState, setDashboardState] = useState({ status: "loading", data: null });
  const [salesState, setSalesState] = useState({ status: "loading", data: null });
  const [inventoryState, setInventoryState] = useState({ status: "loading", data: null });
  const [selectedRange, setSelectedRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

    async function loadReports() {
      try {
        const [sales, inventory] = await Promise.all([
          getSalesSummary(accessToken),
          getInventorySummary(accessToken)
        ]);
        if (!active) {
          return;
        }
        setSalesState({ status: "success", data: sales });
        setInventoryState({ status: "success", data: inventory });
      } catch {
        if (!active) {
          return;
        }
        setSalesState({ status: "error", data: null });
        setInventoryState({ status: "error", data: null });
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const dashboardData = dashboardState.data;
  const years = dashboardData?.available_years ?? [selectedYear];
  const kpis = dashboardData?.kpis ?? {};
  const salesSummary = salesState.data;
  const inventorySummary = inventoryState.data;

  const isLoading =
    dashboardState.status === "loading" ||
    salesState.status === "loading" ||
    inventoryState.status === "loading";

  const hasError =
    dashboardState.status === "error" ||
    salesState.status === "error" ||
    inventoryState.status === "error";

  const summaryCards = useMemo(
    () => [
      {
        label: "Ventas del periodo",
        value: formatCurrency(kpis.sales_revenue)
      },
      {
        label: "Ganancia total",
        value: formatCurrency(kpis.profit_total)
      },
      {
        label: "Costo de ventas",
        value: formatCurrency(kpis.cost_of_sales)
      },
      {
        label: "Unidades vendidas",
        value: formatNumber(kpis.units_sold, 0)
      }
    ],
    [kpis]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Reportes
          </h1>
        </div>
        <button
          className="gold-button px-4 py-2 text-xs"
          disabled
          type="button"
        >
          Generar reporte
        </button>
      </section>

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

      {!isLoading && !hasError ? (
        <section className="grid gap-4 md:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="stat-card">
              <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
                {card.label}
              </p>
              <p className="mt-2 font-serif text-[34px] text-[#2a221b]">
                {card.value}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.6fr]">
        <div className="panel-surface p-6">
          <div>
            <p className="eyebrow">Reportes disponibles</p>
            <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">
              Reportes disponibles
            </h2>
            <p className="mt-2 text-sm text-[#8a775f]">
              Las exportaciones se habilitaran cuando el backend finalize los endpoints.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {reportOptions.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfcd] pb-4"
              >
                <div>
                  <p className="font-semibold text-[#2a221b]">{report.title}</p>
                  <p className="text-sm text-[#8a775f]">{report.description}</p>
                </div>
                <button
                  className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
                  disabled
                  type="button"
                >
                  Generar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <section className="panel-surface p-5">
            <p className="eyebrow">Configurar reporte</p>
            <h3 className="mt-2 font-serif text-2xl text-[#2a221b]">Configurar reporte</h3>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Tipo de reporte
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  disabled
                  value="sales-by-month"
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
                  Este rango afecta los KPIs del dashboard.
                </p>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Año
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

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Marca (opcional)
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  disabled
                  value="all"
                >
                  <option value="all">Todas las marcas</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Canal (opcional)
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  disabled
                  value="all"
                >
                  <option value="all">Todos los canales</option>
                </select>
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Formato de exportacion
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
                    disabled
                    type="button"
                  >
                    Excel
                  </button>
                  <button
                    className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
                    disabled
                    type="button"
                  >
                    CSV
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#8a775f]">
                  Las exportaciones se habilitaran cuando el backend este listo.
                </p>
              </div>
            </div>
          </section>

          {!isLoading && !hasError ? (
            <section className="panel-surface p-5">
              <p className="eyebrow">Resumen operativo</p>
              <h3 className="mt-2 font-serif text-2xl text-[#2a221b]">KPIs globales</h3>
              <div className="mt-4 space-y-3 text-sm text-[#7d6751]">
                <div className="flex items-center justify-between">
                  <span>Ventas globales</span>
                  <span>{formatCurrency(salesSummary?.gross_revenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transacciones</span>
                  <span>{formatNumber(salesSummary?.total_sales_count, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Productos activos</span>
                  <span>{formatNumber(inventorySummary?.active_products, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stock total</span>
                  <span>{formatNumber(inventorySummary?.total_stock, 0)}</span>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      {!isLoading && !hasError && (dashboardData?.brands_sold ?? []).length === 0 ? (
        <EmptyState
          title="Aun no hay suficientes ventas"
          message="En cuanto exista historial, aqui veras res�menes por marca y KPIs mas profundos."
        />
      ) : null}
    </div>
  );
}

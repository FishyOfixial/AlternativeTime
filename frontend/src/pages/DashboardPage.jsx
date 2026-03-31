import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { listNotifications } from "../services/layaways";
import { getDashboardSummary } from "../services/reports";

const initialState = {
  status: "loading",
  data: null
};

const rangeOptions = [
  { value: "month", label: "Mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "Anual" },
  { value: "lifetime", label: "Lifetime" }
];

const chartModes = [
  { value: "sales", label: "Ventas" },
  { value: "profit", label: "Ganancia" },
  { value: "cost", label: "Costo" }
];

function formatCurrency(value) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

function formatPercent(value) {
  const number = Number(value || 0);
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(1)}%`;
}

function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits
  }).format(Number(value || 0));
}

function DashboardKpiCard({ label, value, helper, delta, tone = "default" }) {
  const toneClasses = {
    default: "rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4",
    dark: "rounded-xl border border-[#3c3125] bg-[#211b16] p-4 text-[#f7f1e6]",
    accent: "rounded-xl border border-[#d8c096] bg-[#f5ecda] p-4"
  };
  const deltaClass = Number(delta) >= 0 ? "text-[#6e9d63]" : "text-[#a55b4f]";

  return (
    <article className={toneClasses[tone] ?? toneClasses.default}>
      <p
        className={`text-[11px] uppercase tracking-[0.16em] ${
          tone === "dark" ? "text-[#9d8666]" : "text-[#b5a18a]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-serif text-[24px] sm:text-[28px] ${
          tone === "dark" ? "text-[#f8f1e7]" : "text-[#2a221b]"
        }`}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={tone === "dark" ? "text-[#d5c2aa]" : "text-[#8d7964]"}>{helper}</span>
        {delta !== undefined ? (
          <span className={`font-semibold ${deltaClass}`}>{formatPercent(delta)}</span>
        ) : null}
      </div>
    </article>
  );
}

function RankingList({ title, subtitle, rows, renderValue, renderMeta, emptyMessage }) {
  return (
    <section className="panel-surface p-5">
      <p className="eyebrow">{subtitle}</p>
      <h2 className="mt-2 font-serif text-lg text-[#2a221b] sm:text-2xl">{title}</h2>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d9ccb8] bg-[#f9f4eb] px-5 py-8 text-sm text-[#8a775f]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 max-h-[42vh] space-y-3 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={`${title}-${row.brand}`}
              className="flex items-center justify-between rounded-xl border border-[#e6dac6] bg-[#fdfaf5] px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#201914] text-xs font-semibold text-[#ddb65f]">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2a221b]">{row.brand}</p>
                  {renderMeta ? <p className="text-xs text-[#8a775f]">{renderMeta(row)}</p> : null}
                </div>
              </div>
              <p className="font-serif text-lg text-[#2a221b]">{renderValue(row)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MonthlyBreakdown({ months, chartMode, chartMax }) {
  const trackWidth = Math.max(months.length * 92, 660);

  return (
    <div className="mt-4 max-w-full overflow-x-auto xl:max-w-[760px]">
      <div className="flex items-end gap-2 pr-2" style={{ minWidth: `${trackWidth}px` }}>
        {months.map((month) => {
          const amount = Number(month[chartMode] || 0);
          const height = chartMax > 0 ? `${Math.max((amount / chartMax) * 100, 6)}%` : "6%";

          return (
            <div key={month.month} className="flex w-[84px] flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-xl bg-[#f4ede1] px-1.5 py-1.5 sm:h-36">
                <div
                  className={`w-full rounded-xl ${
                    chartMode === "sales"
                      ? "bg-[#201914]"
                      : chartMode === "profit"
                        ? "bg-[#7b9367]"
                        : "bg-[#b38f49]"
                  }`}
                  style={{ height }}
                />
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8c7963]">{month.month}</p>
                <p className="mt-1 text-xs font-medium text-[#2a221b]">{formatCurrency(amount)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RentabilityTable({ brands }) {
  if (brands.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-[#d9ccb8] bg-[#f9f4eb] px-5 py-6 text-sm text-[#8a775f]">
        Aun no hay ventas suficientes para calcular rentabilidad por marca.
      </div>
    );
  }

  return (
    <div className="mt-5 max-h-[250px] overflow-auto">
      <table className="min-w-full border-collapse text-left">
        <thead className="border-b border-[#eadfcd] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
          <tr>
            <th className="pb-3 pr-4">Marca</th>
            <th className="pb-3 pr-4">Unidades</th>
            <th className="hidden pb-3 pr-4 sm:table-cell">Ventas</th>
            <th className="hidden pb-3 pr-4 sm:table-cell">Costo</th>
            <th className="pb-3 pr-4">Ganancia</th>
            <th className="hidden pb-3 sm:table-cell">Dias promedio</th>
          </tr>
        </thead>
        <tbody>
          {brands.slice(0, 8).map((brand) => (
            <tr key={brand.brand} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
              <td className="py-3 pr-4 font-medium text-[#2a221b]">{brand.brand}</td>
              <td className="py-3 pr-4">{brand.units_sold}</td>
              <td className="hidden py-3 pr-4 sm:table-cell">{formatCurrency(brand.revenue)}</td>
              <td className="hidden py-3 pr-4 sm:table-cell">{formatCurrency(brand.cost_of_sales)}</td>
              <td className="py-3 pr-4 font-semibold text-[#6e9d63]">{formatCurrency(brand.profit)}</td>
              <td className="hidden py-3 sm:table-cell">{formatNumber(brand.avg_days_to_sell)} dias</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [dashboardState, setDashboardState] = useState(initialState);
  const [notificationsState, setNotificationsState] = useState({
    status: "loading",
    data: null
  });
  const [selectedRange, setSelectedRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartMode, setChartMode] = useState("sales");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setDashboardState((current) => ({
        ...current,
        status: "loading"
      }));

      try {
        const data = await getDashboardSummary(accessToken, {
          range: selectedRange,
          year: selectedYear
        });

        if (!active) {
          return;
        }

        setDashboardState({
          status: "success",
          data
        });
      } catch {
        if (!active) {
          return;
        }

        setDashboardState({
          status: "error",
          data: null
        });
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [accessToken, selectedRange, selectedYear]);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setNotificationsState({ status: "loading", data: null });
      try {
        const data = await listNotifications(accessToken);
        if (!active) {
          return;
        }
        setNotificationsState({ status: "success", data });
      } catch {
        if (!active) {
          return;
        }
        setNotificationsState({ status: "error", data: null });
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const months = dashboardState.data?.monthly_breakdown ?? [];
  const years = dashboardState.data?.available_years ?? [selectedYear];
  const kpis = dashboardState.data?.kpis ?? {};

  const chartMax = useMemo(() => {
    const values = months.map((month) => Number(month[chartMode] || 0));
    return Math.max(...values, 0);
  }, [chartMode, months]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-[#2a221b] sm:text-4xl">
            Dashboard de negocio
          </h1>
        </div>
        <div className="w-full max-w-[520px] rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d7964]">
            Rango global del dashboard
          </p>
          <div className="mt-2 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  selectedRange === option.value
                    ? "bg-[#201914] text-[#ddb65f]"
                    : "text-[#7d6751] hover:bg-[#f0e6d5]"
                }`}
                onClick={() => setSelectedRange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {dashboardState.status === "loading" ? (
        <LoadingState
          title="Cargando dashboard"
          message="Estamos reuniendo ventas, ganancias, capital y marcas desde el backend."
        />
      ) : null}

      {dashboardState.status === "error" ? (
        <ErrorState
          title="No pudimos cargar el dashboard"
          message="La sesion esta activa, pero fallaron los endpoints agregados del dashboard."
          networkAware
        />
      ) : null}

      {dashboardState.status === "success" ? (
        <>
          <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <DashboardKpiCard
              delta={kpis.sales_revenue_delta}
              helper="vs periodo anterior"
              label="Ventas totales"
              tone="dark"
              value={formatCurrency(kpis.sales_revenue)}
            />
            <DashboardKpiCard
              delta={kpis.profit_total_delta}
              helper="vs periodo anterior"
              label="Ganancia total"
              tone="accent"
              value={formatCurrency(kpis.profit_total)}
            />
            <DashboardKpiCard
              helper="capital inmovilizado"
              label="Capital en inventario"
              value={formatCurrency(kpis.capital_in_inventory)}
            />
            <DashboardKpiCard
              helper="promedio por reloj"
              label="Dias en venderse"
              value={`${formatNumber(kpis.avg_days_to_sell)} dias`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="panel-surface max-w-full overflow-hidden p-4 sm:p-5">
              <section className="mx-auto w-full max-w-[980px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Desglose mensual</p>
                    <h2 className="mt-1 font-serif text-xl text-[#2a221b]">{selectedYear} dividido por meses</h2>
                    <p className="mt-1 text-xs text-[#8a775f]">Visualiza ventas, ganancia o costo de ventas.</p>
                  </div>
                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[auto_auto] sm:items-center">
                    <select
                      className="w-full rounded-full border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4] sm:w-auto"
                      onChange={(event) => setSelectedYear(Number(event.target.value))}
                      value={selectedYear}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2 rounded-full border border-[#e0d4c0] bg-[#f7f1e8] p-2">
                      {chartModes.map((mode) => (
                        <button
                          key={mode.value}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            chartMode === mode.value
                              ? "bg-[#201914] text-[#ddb65f]"
                              : "text-[#7d6751] hover:bg-[#efe5d3]"
                          }`}
                          onClick={() => setChartMode(mode.value)}
                          type="button"
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <MonthlyBreakdown chartMax={chartMax} chartMode={chartMode} months={months} />
                <div className="mt-5 border-t border-[#e6d9c5] pt-4">
                  <p className="eyebrow">Rentabilidad</p>
                  <h3 className="mt-1 font-serif text-xl text-[#2a221b]">Marcas mas vendidas</h3>
                  <RentabilityTable brands={dashboardState.data.brands_sold ?? []} />
                </div>
              </section>
            </section>

            <div className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-1">
              <section className="panel-surface h-full max-h-[250px] w-full max-w-full overflow-y-auto p-4 sm:max-h-none sm:overflow-visible">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Seguimiento</p>
                    <h2 className="mt-1 font-serif text-lg text-[#2a221b]">Alertas</h2>
                  </div>
                </div>
                {notificationsState.status === "loading" ? (
                  <p className="mt-4 text-sm text-[#8a775f]">Cargando alertas...</p>
                ) : null}
                {notificationsState.status === "error" ? (
                  <p className="mt-4 text-sm text-[#a55b4f]">No pudimos cargar alertas.</p>
                ) : null}
                {notificationsState.status === "success" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-[#e4d7c3] bg-[#fdfaf5] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#b5a18a] sm:text-xs">Apartados vencidos</p>
                      <p className="mt-1 font-serif text-xl text-[#a55b4f] sm:text-2xl">
                        {notificationsState.data?.counts?.layaway_overdue || 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e4d7c3] bg-[#fdfaf5] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#b5a18a] sm:text-xs">Inventario +60 dias</p>
                      <p className="mt-1 font-serif text-xl text-[#2a221b] sm:text-2xl">
                        {notificationsState.data?.counts?.inventory_old || 0}
                      </p>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="panel-surface h-full max-h-[250px] w-full max-w-full overflow-hidden p-4 sm:max-h-none sm:p-5">
                <p className="eyebrow">Snapshot</p>
                <h2 className="mt-1 font-serif text-lg text-[#2a221b]">Resumen</h2>
                <div className="mt-4 grid max-h-[170px] gap-3 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#e4d7c3] bg-[#fdfaf5] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#b5a18a] sm:text-xs">Costo de ventas</p>
                    <p className="mt-2 font-serif text-xl text-[#2a221b] sm:text-2xl">{formatCurrency(kpis.cost_of_sales)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e4d7c3] bg-[#fdfaf5] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#b5a18a] sm:text-xs">Inventory / sales ratio</p>
                    <p className="mt-2 font-serif text-xl text-[#2a221b] sm:text-2xl">{formatNumber(kpis.inventory_sales_ratio, 2)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e4d7c3] bg-[#fdfaf5] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#b5a18a] sm:text-xs">Unidades vendidas</p>
                    <p className="mt-2 font-serif text-xl text-[#2a221b] sm:text-2xl">{formatNumber(kpis.units_sold, 0)}</p>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5">
            <RankingList
              emptyMessage="Aun no hay historial suficiente para calcular rotacion."
              renderValue={(row) => `${formatNumber(row.avg_days_to_sell)} dias`}
              rows={dashboardState.data.fastest_selling_brands ?? []}
              subtitle="Rotacion"
              title="Marcas que se venden mas rapido"
            />
            <RankingList
              emptyMessage="No hay stock activo para agrupar por marca."
              renderValue={(row) => `${row.units} uds`}
              renderMeta={(row) => (
                <>
                  <span className="sm:hidden">{row.units}</span>
                  <span className="hidden sm:inline">{row.units} en stock</span>
                </>
              )}
              rows={dashboardState.data.stock_by_brand ?? []}
              subtitle="Stock"
              title="Unidades por marca"
            />
          </section>

          {(dashboardState.data.brands_sold ?? []).length === 0 ? (
            <EmptyState
              title="Todavia no hay ventas registradas"
              message="En cuanto existan ventas e inventario con costo, aqui veras KPIs y rentabilidad por marca."
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

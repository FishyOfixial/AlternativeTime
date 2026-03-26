import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { getFinanceSummary } from "../services/finance";
import { getInventorySummary, getSalesSummary } from "../services/reports";

const initialState = {
  status: "loading",
  data: null
};

function formatCurrency(value) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(numericValue);
}

function MetricCard({ label, value, accent = "default", helper = "" }) {
  const variants = {
    default: {
      card: "stat-card",
      label: "text-[#b5a18a]",
      value: "text-[#2a221b]"
    },
    emphasis: {
      card: "stat-card bg-[#211b16] text-[#f7f1e6]",
      label: "text-[#9d8666]",
      value: "text-[#ddb65f]"
    },
    accent: {
      card: "stat-card border-[#d6c097]",
      label: "text-[#b2883e]",
      value: "text-[#8f6b2e]"
    }
  };

  const variant = variants[accent] ?? variants.default;

  return (
    <article className={variant.card}>
      <p className={`text-sm uppercase tracking-[0.16em] ${variant.label}`}>
        {label}
      </p>
      <p className={`mt-3 font-serif text-[34px] ${variant.value}`}>{value}</p>
      {helper ? (
        <p className="mt-2 text-sm text-[#8d7964]">{helper}</p>
      ) : null}
    </article>
  );
}

export default function DashboardPage() {
  const { accessToken, user } = useAuth();
  const [dashboardState, setDashboardState] = useState(initialState);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [finance, sales, inventory] = await Promise.all([
          getFinanceSummary(accessToken),
          getSalesSummary(accessToken),
          getInventorySummary(accessToken)
        ]);

        if (!active) {
          return;
        }

        setDashboardState({
          status: "success",
          data: {
            finance,
            sales,
            inventory
          }
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
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Sprint Frontend 3</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Dashboard operativo inicial.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#736350]">
            Bienvenido, {user?.first_name || user?.username || "Admin"}. Esta
            vista ya consume los resumenes reales del backend y sirve como punto
            de entrada al resto de modulos.
          </p>
        </div>
        <div className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] px-4 py-3 text-sm text-[#7d6751]">
          Sesion lista · JWT activo
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { to: "/clients", label: "Clientes", helper: "Consultar y administrar registros" },
          { to: "/inventory", label: "Inventario", helper: "Revisar stock y catalogo" },
          { to: "/sales", label: "Ventas", helper: "Registrar operaciones del dia" },
          { to: "/reports", label: "Reportes", helper: "Ver resumenes agregados" }
        ].map((item) => (
          <NavLink
            key={item.to}
            className="panel-soft p-5 transition hover:-translate-y-0.5 hover:bg-[#f8f1e4]"
            to={item.to}
          >
            <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
              Acceso rapido
            </p>
            <p className="mt-3 font-serif text-2xl text-[#2a221b]">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#7f6d59]">
              {item.helper}
            </p>
          </NavLink>
        ))}
      </section>

      {dashboardState.status === "loading" ? (
        <LoadingState
          title="Cargando dashboard"
          message="Estamos reuniendo finanzas, ventas e inventario desde el backend."
        />
      ) : null}

      {dashboardState.status === "error" ? (
        <ErrorState
          title="No pudimos cargar el dashboard"
          message="La sesion esta activa, pero fallaron los endpoints de resumen. Revisa el backend o intenta de nuevo."
        />
      ) : null}

      {dashboardState.status === "success" ? (
        <>
          <section className="grid gap-4 lg:grid-cols-4">
            <MetricCard
              accent="emphasis"
              helper="Resumen financiero principal"
              label="Revenue bruto"
              value={formatCurrency(dashboardState.data.finance.gross_revenue)}
            />
            <MetricCard
              helper="Ventas registradas"
              label="Ventas totales"
              value={dashboardState.data.finance.total_sales_count}
            />
            <MetricCard
              accent="accent"
              helper="Unidades movidas"
              label="Items vendidos"
              value={dashboardState.data.sales.items_sold}
            />
            <MetricCard
              helper="Productos activos en catalogo"
              label="Activos"
              value={dashboardState.data.inventory.active_products}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="panel-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-2xl text-[#2a221b]">
                  Resumen comercial
                </p>
                <NavLink className="text-sm text-[#a27f41]" to="/sales">
                  Ir a ventas
                </NavLink>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#ddcfba] bg-[#fcf8f2] p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
                    Ingreso reportado
                  </p>
                  <p className="mt-3 font-serif text-3xl text-[#2a221b]">
                    {formatCurrency(dashboardState.data.sales.gross_revenue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ddcfba] bg-[#fcf8f2] p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
                    Ventas unicas
                  </p>
                  <p className="mt-3 font-serif text-3xl text-[#2a221b]">
                    {dashboardState.data.sales.total_sales_count}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ddcfba] bg-[#fcf8f2] p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
                    Ticket base
                  </p>
                  <p className="mt-3 font-serif text-3xl text-[#2a221b]">
                    {dashboardState.data.sales.total_sales_count > 0
                      ? formatCurrency(
                          Number(dashboardState.data.sales.gross_revenue) /
                            dashboardState.data.sales.total_sales_count
                        )
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-2xl text-[#2a221b]">
                  Estado de inventario
                </p>
                <NavLink className="text-sm text-[#a27f41]" to="/inventory">
                  Ir a inventario
                </NavLink>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-[#ddcfba] bg-[#fcf8f2] px-5 py-4">
                  <span className="text-sm text-[#7f6d59]">Stock total</span>
                  <span className="font-serif text-3xl text-[#2a221b]">
                    {dashboardState.data.inventory.total_stock}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#ddcfba] bg-[#fff8ee] px-5 py-4">
                  <span className="text-sm text-[#7f6d59]">Stock bajo</span>
                  <span className="font-serif text-3xl text-[#b2883e]">
                    {dashboardState.data.inventory.low_stock_products}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#dec5bd] bg-[#fff4f1] px-5 py-4">
                  <span className="text-sm text-[#7f6d59]">Sin stock</span>
                  <span className="font-serif text-3xl text-[#8d5b4d]">
                    {dashboardState.data.inventory.out_of_stock_products}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {dashboardState.data.finance.total_sales_count === 0 ? (
            <EmptyState
              title="Todavia no hay ventas registradas"
              message="El dashboard ya esta conectado al backend. Apenas existan ventas reales, aqui se poblaran ingresos, tickets y movimiento de inventario."
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { getFinanceSummary } from "../services/finance";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

const accountCards = [
  { key: "cash", label: "Efectivo" },
  { key: "bbva", label: "BBVA" },
  { key: "credit", label: "Credito" },
  { key: "amex", label: "Amex" }
];

export default function FinancePage() {
  const { accessToken } = useAuth();
  const [financeState, setFinanceState] = useState({
    status: "loading",
    data: null
  });

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setFinanceState((current) => ({ ...current, status: "loading" }));
      try {
        const data = await getFinanceSummary(accessToken);
        if (!active) {
          return;
        }
        setFinanceState({ status: "success", data });
      } catch {
        if (!active) {
          return;
        }
        setFinanceState({ status: "error", data: null });
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const kpis = financeState.data || { total_sales_count: 0, gross_revenue: 0 };
  const balanceNote = "Pendiente de backend";

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Finanzas & Flujo de efectivo
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
            disabled
            type="button"
          >
            + Movimiento
          </button>
          <button
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
            disabled
            type="button"
          >
            Exportar
          </button>
        </div>
      </section>

      {financeState.status === "loading" ? (
        <LoadingState
          title="Cargando finanzas"
          message="Estamos reuniendo el resumen financiero del backend."
        />
      ) : null}

      {financeState.status === "error" ? (
        <ErrorState
          title="No pudimos cargar finanzas"
          message="La sesion esta activa, pero el resumen financiero no respondio."
        />
      ) : null}

      {financeState.status === "success" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Ventas totales
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">
              {kpis.total_sales_count}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Transacciones acumuladas</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Ingresos brutos
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#5f8f66]">
              {formatCurrency(kpis.gross_revenue)}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Base de ingresos por ventas</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Egresos por compra
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">—</p>
            <p className="mt-2 text-xs text-[#8a775f]">{balanceNote}</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Balance neto
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">—</p>
            <p className="mt-2 text-xs text-[#8a775f]">{balanceNote}</p>
          </article>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Saldo por cuenta</p>
          <p className="mt-2 text-sm text-[#8a775f]">
            Esta seccion se activara cuando backend exponga balances por cuenta.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {accountCards.map((card) => (
            <article key={card.key} className="stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">
                {card.label}
              </p>
              <p className="mt-2 font-serif text-[30px] text-[#2a221b]">—</p>
              <p className="mt-1 text-xs text-[#b09a7e]">{balanceNote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          disabled
          value="all"
        >
          <option value="all">Todos los meses</option>
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          disabled
          value="all"
        >
          <option value="all">Todos los tipos</option>
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          disabled
          value="all"
        >
          <option value="all">Todas las cuentas</option>
        </select>
      </section>

      <section className="panel-surface p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3">Reloj</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="p-6">
          <EmptyState
            title="Sin movimientos disponibles"
            message="Los movimientos financieros se mostraran aqui cuando backend habilite la consulta detallada."
          />
        </div>
      </section>
    </div>
  );
}

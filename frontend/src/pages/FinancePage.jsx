import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
  createFinanceEntry,
  getFinanceBalances,
  getFinanceSummary,
  listFinanceEntries
} from "../services/finance";
import { exportReport } from "../services/reports";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function shiftMonths(value, months) {
  const year = value.getFullYear() + Math.floor((value.getMonth() + months) / 12);
  const month = (value.getMonth() + months) % 12;
  const normalizedMonth = month < 0 ? month + 12 : month;
  return new Date(year, normalizedMonth, 1);
}

function getRangeDates(range, year) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (range === "month") {
    return { date_from: monthStart, date_to: today };
  }
  if (range === "quarter") {
    return { date_from: shiftMonths(monthStart, -2), date_to: today };
  }
  if (range === "half") {
    return { date_from: shiftMonths(monthStart, -5), date_to: today };
  }
  if (range === "year") {
    return {
      date_from: new Date(year, 0, 1),
      date_to: new Date(year, 11, 31)
    };
  }
  return { date_from: null, date_to: null };
}

function toISODate(value) {
  if (!value) {
    return "";
  }
  return value.toISOString().slice(0, 10);
}

const accountLabels = {
  cash: "Efectivo",
  bbva: "BBVA",
  credit: "Credito",
  amex: "Amex"
};

const typeLabels = {
  income: "Ingreso",
  expense: "Egreso"
};

const conceptLabels = {
  sale: "Venta",
  purchase: "Compra",
  capital_payment: "Abono a capital",
  transfer: "Transferencia",
  expense: "Gasto"
};

const accountCards = [
  { key: "cash", label: "Efectivo" },
  { key: "bbva", label: "BBVA" },
  { key: "credit", label: "Credito" },
  { key: "amex", label: "Amex" }
];

const rangeOptions = [
  { value: "month", label: "Este mes" },
  { value: "quarter", label: "3 meses" },
  { value: "half", label: "6 meses" },
  { value: "year", label: "1 año" },
  { value: "lifetime", label: "Lifetime" }
];

const initialEntryForm = {
  entry_date: new Date().toISOString().slice(0, 10),
  entry_type: "income",
  concept: "sale",
  amount: "",
  account: "cash",
  notes: ""
};

const conceptOptions = [
  { value: "capital_payment", label: "Abono a capital" },
  { value: "purchase", label: "Compra" },
  { value: "sale", label: "Venta" },
  { value: "transfer", label: "Transferencia" },
  { value: "expense", label: "Gasto" }
];

export default function FinancePage() {
  const { accessToken } = useAuth();
  const [financeState, setFinanceState] = useState({ status: "loading" });
  const [summary, setSummary] = useState(null);
  const [balances, setBalances] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedRange, setSelectedRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryForm, setEntryForm] = useState(initialEntryForm);
  const [entryError, setEntryError] = useState("");
  const [entryFieldErrors, setEntryFieldErrors] = useState({});
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => currentYear - index);
  }, []);

  async function loadSummary() {
    setFinanceState((current) => ({ ...current, status: "loading" }));
    try {
      const [summaryData, balancesData] = await Promise.all([
        getFinanceSummary(accessToken),
        getFinanceBalances(accessToken)
      ]);
      setSummary(summaryData);
      setBalances(balancesData);
      setFinanceState({ status: "success" });
    } catch {
      setFinanceState({ status: "error" });
    }
  }

  async function loadEntries() {
    if (financeState.status !== "success") {
      return;
    }

    const { date_from, date_to } = getRangeDates(selectedRange, selectedYear);
    try {
      const entriesData = await listFinanceEntries(accessToken, {
        type: filterType === "all" ? "" : filterType,
        account: filterAccount === "all" ? "" : filterAccount,
        date_from: toISODate(date_from),
        date_to: toISODate(date_to)
      });
      setEntries(entriesData);
    } catch {
      setEntries([]);
    }
  }

  useEffect(() => {
    let active = true;

    async function initLoad() {
      await loadSummary();
      if (!active) {
        return;
      }
      await loadEntries();
    }

    initLoad();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    loadEntries();
  }, [accessToken, filterType, filterAccount, selectedRange, selectedYear, financeState.status]);

  function handleEntryChange(event) {
    const { name, value } = event.target;
    setEntryForm((current) => ({ ...current, [name]: value }));
  }

  function resetEntryForm() {
    setEntryForm({
      ...initialEntryForm,
      entry_date: new Date().toISOString().slice(0, 10)
    });
    setEntryError("");
    setEntryFieldErrors({});
  }

  function parseEntryErrors(error) {
    const data = error?.data || {};
    const entries = Object.entries(data);
    if (!entries.length) {
      return { fields: {}, message: "No pudimos guardar el movimiento." };
    }

    const fields = Object.fromEntries(
      entries.map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(" ") : String(value)
      ])
    );
    const message = fields[entries[0][0]] || "No pudimos guardar el movimiento.";
    return { fields, message };
  }

  async function handleCreateEntry(event) {
    event.preventDefault();
    setIsSavingEntry(true);
    setEntryError("");
    setEntryFieldErrors({});

    try {
      await createFinanceEntry(accessToken, {
        entry_date: entryForm.entry_date,
        entry_type: entryForm.entry_type,
        concept: entryForm.concept,
        amount: entryForm.amount,
        account: entryForm.account,
        notes: entryForm.notes.trim()
      });
      resetEntryForm();
      setIsModalOpen(false);
      await loadSummary();
      await loadEntries();
    } catch (error) {
      if (error?.data) {
        const parsed = parseEntryErrors(error);
        setEntryFieldErrors(parsed.fields);
        setEntryError(parsed.message);
      } else {
        setEntryError("No pudimos guardar el movimiento.");
      }
    } finally {
      setIsSavingEntry(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setExportError("");

    const { date_from, date_to } = getRangeDates(selectedRange, selectedYear);

    try {
      const { blob, filename } = await exportReport(accessToken, "flujo_efectivo", "csv", {
        date_from: toISODate(date_from),
        date_to: toISODate(date_to),
        type: filterType === "all" ? "" : filterType,
        account: filterAccount === "all" ? "" : filterAccount
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError("No pudimos exportar el flujo de efectivo.");
    } finally {
      setIsExporting(false);
    }
  }

  const kpis = summary || {
    total_sales_count: 0,
    gross_revenue: 0,
    total_income: 0,
    total_expense: 0,
    net_balance: 0
  };
  const balanceNote = "Sin datos aun";
  const balancesMap = balances.reduce((acc, item) => {
    acc[item.account] = item.balance;
    return acc;
  }, {});

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
            className="rounded-md border border-[#201914] bg-[#201914] px-4 py-2 text-xs text-[#ddb65f]"
            onClick={() => {
              resetEntryForm();
              setIsModalOpen(true);
            }}
            type="button"
          >
            + Movimiento
          </button>
          <button
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
            disabled={isExporting}
            onClick={handleExport}
            type="button"
          >
            {isExporting ? "Exportando..." : "Exportar"}
          </button>
        </div>
      </section>

      {exportError ? (
        <div className="rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
          {exportError}
        </div>
      ) : null}

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
              Ingresos
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">
              {formatCurrency(kpis.total_income)}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Movimientos de ingreso</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Egresos
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#a55b4f]">
              {formatCurrency(kpis.total_expense)}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Movimientos de egreso</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Balance neto
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">
              {formatCurrency(kpis.net_balance)}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Ingresos - egresos</p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
              Ventas totales
            </p>
            <p className="mt-2 font-serif text-[34px] text-[#2a221b]">
              {kpis.total_sales_count}
            </p>
            <p className="mt-2 text-xs text-[#8a775f]">Transacciones acumuladas</p>
          </article>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Saldo por cuenta</p>
          <p className="mt-2 text-sm text-[#8a775f]">
            Esta seccion refleja balances por cuenta configurados en backend.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {accountCards.map((card) => (
            <article key={card.key} className="stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">
                {card.label}
              </p>
              <p className="mt-2 font-serif text-[30px] text-[#2a221b]">
                {balancesMap[card.key] ? formatCurrency(balancesMap[card.key]) : "�"}
              </p>
              <p className="mt-1 text-xs text-[#b09a7e]">
                {balancesMap[card.key] ? "Balance actualizado" : balanceNote}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 rounded-xl bg-[#f1ebdf] p-1">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                selectedRange === option.value
                  ? "bg-[#fffdf9] text-[#2a221b] shadow-sm"
                  : "text-[#9a886f]"
              }`}
              onClick={() => setSelectedRange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {selectedRange === "year" ? (
          <select
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            value={selectedYear}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        ) : null}
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setFilterType(event.target.value)}
          value={filterType}
        >
          <option value="all">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Egresos</option>
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setFilterAccount(event.target.value)}
          value={filterAccount}
        >
          <option value="all">Todas las cuentas</option>
          {accountCards.map((card) => (
            <option key={card.key} value={card.key}>
              {card.label}
            </option>
          ))}
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
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                  <td className="px-4 py-4">{formatDate(entry.entry_date)}</td>
                  <td className="px-4 py-4">{typeLabels[entry.entry_type] || entry.entry_type}</td>
                  <td className="px-4 py-4">{conceptLabels[entry.concept] || entry.concept}</td>
                  <td className="px-4 py-4 font-semibold text-[#2a221b]">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-4">{accountLabels[entry.account] || entry.account}</td>
                  <td className="px-4 py-4">{entry.product_code || "�"}</td>
                  <td className="px-4 py-4">{entry.notes || "�"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin movimientos disponibles"
              message="No hay movimientos con los filtros actuales."
            />
          </div>
        ) : null}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#eadfcd] bg-[#fffdf9] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Nuevo movimiento</p>
                <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">Agregar movimiento</h2>
              </div>
              <button
                className="rounded-md border border-[#dccfb9] px-3 py-1 text-xs text-[#7d6751]"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cerrar
              </button>
            </div>

            {entryError ? (
              <div className="mt-4 rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
                {entryError}
              </div>
            ) : null}

            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateEntry}>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Fecha
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="entry_date"
                  onChange={handleEntryChange}
                  type="date"
                  value={entryForm.entry_date}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Tipo
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="entry_type"
                  onChange={handleEntryChange}
                  value={entryForm.entry_type}
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Egreso</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Concepto
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="concept"
                  onChange={handleEntryChange}
                  value={entryForm.concept}
                >
                  {conceptOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cuenta
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="account"
                  onChange={handleEntryChange}
                  value={entryForm.account}
                >
                  {accountCards.map((card) => (
                    <option key={card.key} value={card.key}>
                      {card.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Monto
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  min="0"
                  name="amount"
                  onChange={handleEntryChange}
                  step="0.01"
                  type="number"
                  value={entryForm.amount}
                />
                {entryFieldErrors.amount ? (
                  <p className="mt-2 text-xs text-[#9d5c4b]">{entryFieldErrors.amount}</p>
                ) : null}
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Notas
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="notes"
                  onChange={handleEntryChange}
                  value={entryForm.notes}
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  className="rounded-md border border-[#dccfb9] px-4 py-2 text-sm text-[#7d6751]"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="gold-button px-4 py-2 text-xs"
                  disabled={isSavingEntry}
                  type="submit"
                >
                  {isSavingEntry ? "Guardando..." : "Guardar movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

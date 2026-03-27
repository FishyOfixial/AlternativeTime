import { useEffect, useMemo, useState } from "react";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import AccountBalances from "../components/finance/AccountBalances";
import FinanceEntriesTable from "../components/finance/FinanceEntriesTable";
import FinanceEntryModal from "../components/finance/FinanceEntryModal";
import FinanceFilters from "../components/finance/FinanceFilters";
import FinanceHeader from "../components/finance/FinanceHeader";
import FinanceSummaryCards from "../components/finance/FinanceSummaryCards";
import { useAuth } from "../contexts/AuthContext";
import {
  createFinanceEntry,
  getFinanceBalances,
  getFinanceSummary,
  listFinanceEntries
} from "../services/finance";
import { exportReport } from "../services/reports";
import {
  accountCards,
  accountLabels,
  conceptLabels,
  conceptOptions,
  initialEntryForm,
  rangeOptions,
  typeLabels
} from "../constants/finance";
import { formatCurrency, formatDate, getRangeDates, toISODate } from "../utils/finance";


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

  function handleNewMovement() {
    resetEntryForm();
    setIsModalOpen(true);
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
      <FinanceHeader
        onNewMovement={handleNewMovement}
        onExport={handleExport}
        isExporting={isExporting}
      />

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
        <FinanceSummaryCards kpis={kpis} formatCurrency={formatCurrency} />
      ) : null}

      <AccountBalances
        accountCards={accountCards}
        balancesMap={balancesMap}
        balanceNote={balanceNote}
        formatCurrency={formatCurrency}
      />

      <FinanceFilters
        rangeOptions={rangeOptions}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        selectedYear={selectedYear}
        availableYears={availableYears}
        onYearChange={setSelectedYear}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterAccount={filterAccount}
        onFilterAccountChange={setFilterAccount}
        accountCards={accountCards}
      />

      <FinanceEntriesTable
        entries={entries}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        accountLabels={accountLabels}
        typeLabels={typeLabels}
        conceptLabels={conceptLabels}
      />

      <FinanceEntryModal
        isOpen={isModalOpen}
        entryForm={entryForm}
        onChange={handleEntryChange}
        onSubmit={handleCreateEntry}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSavingEntry}
        entryError={entryError}
        entryFieldErrors={entryFieldErrors}
        conceptOptions={conceptOptions}
        accountCards={accountCards}
      />
    </div>
  );
}


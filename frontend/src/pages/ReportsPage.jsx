import { useEffect, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import ReportFiltersForm from "../components/reports/ReportFiltersForm";
import { useAuth } from "../contexts/AuthContext";
import { exportReport, getDashboardSummary } from "../services/reports";
import { listClients } from "../services/clients";
import {
  accountOptions,
  channelOptions,
  entryTypeOptions,
  inventoryStatusOptions,
  inventoryTagOptions,
  paymentOptions,
  rangeOptions,
  reportFilterMap,
  reportOptions,
  reportTypeMap
} from "../constants/reports";

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

      <ReportFiltersForm
        reportOptions={reportOptions}
        selectedReportType={selectedReportType}
        onSelectReportType={setSelectedReportType}
        rangeOptions={rangeOptions}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        selectedYear={selectedYear}
        years={years}
        onYearChange={setSelectedYear}
        activeFilters={activeFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        channelOptions={channelOptions}
        paymentOptions={paymentOptions}
        accountOptions={accountOptions}
        entryTypeOptions={entryTypeOptions}
        inventoryStatusOptions={inventoryStatusOptions}
        inventoryTagOptions={inventoryTagOptions}
        clients={clients}
        clientsError={clientsState.status === "error"}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        isExporting={isExporting}
        onGenerate={handleGenerate}
      />

      {!isLoading && !hasError && (dashboardData?.brands_sold ?? []).length === 0 ? (
        <EmptyState
          title="Aun no hay suficientes ventas"
          message="En cuanto exista historial, aqui veras resumenes por marca y KPIs mas profundos."
        />
      ) : null}
    </div>
  );
}





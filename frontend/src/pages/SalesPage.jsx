import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import SalesFilters from "../components/sales/SalesFilters";
import SalesHeader from "../components/sales/SalesHeader";
import SalesSummaryCards from "../components/sales/SalesSummaryCards";
import SalesTable from "../components/sales/SalesTable";
import { useAuth } from "../contexts/AuthContext";
import { channelLabels, paymentLabels } from "../constants/sales";
import { listSales } from "../services/sales";
import {
  buildMonthOptions,
  exportSalesSpreadsheet,
  formatCurrency,
  formatDate,
  getBrandFromLabel,
  monthToRange
} from "../utils/sales";

export default function SalesPage() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [salesState, setSalesState] = useState({
    status: "loading",
    items: [],
    error: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const successMessage = location.state?.success;

  useEffect(() => {
    if (successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, navigate, location.pathname]);

  useEffect(() => {
    async function loadSales() {
      setSalesState((current) => ({ ...current, status: "loading" }));
      try {
        const { date_from, date_to } = monthToRange(selectedMonth);
        const sales = await listSales(accessToken, {
          channel: selectedChannel,
          payment_method: selectedMethod,
          brand: selectedBrand === "all" ? "" : selectedBrand,
          date_from,
          date_to
        });
        setSalesState({
          status: "success",
          items: sales,
          error: ""
        });
      } catch {
        setSalesState({
          status: "error",
          items: [],
          error: "No pudimos cargar las ventas desde la API."
        });
      }
    }

    loadSales();
  }, [accessToken, selectedMonth, selectedChannel, selectedMethod, selectedBrand]);

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  const brands = useMemo(() => {
    const derived = salesState.items
      .map((sale) => getBrandFromLabel(sale.product_label))
      .filter(Boolean);
    return [...new Set(derived)].sort();
  }, [salesState.items]);

  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return salesState.items;
    }

    return salesState.items.filter((sale) => {
      return [
        sale.product_code,
        sale.product_label,
        sale.customer_name,
        sale.customer_contact
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedTerm));
    });
  }, [salesState.items, searchTerm]);

  const summary = useMemo(() => {
    const revenue = filteredItems.reduce((acc, sale) => acc + Number(sale.amount_paid || 0), 0);
    const profit = filteredItems.reduce((acc, sale) => acc + Number(sale.gross_profit || 0), 0);
    const count = filteredItems.length;
    return {
      revenue,
      profit,
      count,
      ticket: count > 0 ? revenue / count : 0
    };
  }, [filteredItems]);

  function handleExport() {
    exportSalesSpreadsheet({
      items: filteredItems,
      formatDate,
      formatCurrency,
      channelLabels,
      paymentLabels
    });
  }

  return (
    <div className="space-y-6">
      <SalesHeader
        isExportDisabled={filteredItems.length === 0}
        onExport={handleExport}
      />

      {successMessage ? (
        <div className="rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {successMessage}
        </div>
      ) : null}

      <SalesSummaryCards summary={summary} formatCurrency={formatCurrency} />

      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        monthOptions={monthOptions}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        channelLabels={channelLabels}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        paymentLabels={paymentLabels}
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
        brands={brands}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
      />

      {salesState.status === "loading" ? (
        <LoadingState
          title="Cargando ventas"
          message="Estamos consultando el historial de ventas."
        />
      ) : null}

      {salesState.status === "error" ? (
        <ErrorState title="No pudimos cargar ventas" message={salesState.error} networkAware />
      ) : null}

      {salesState.status === "success" && filteredItems.length === 0 ? (
        <EmptyState
          title="Sin ventas para mostrar"
          message="No hay resultados para los filtros actuales."
        />
      ) : null}

      {salesState.status === "success" && filteredItems.length > 0 ? (
        <SalesTable
          items={filteredItems}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          channelLabels={channelLabels}
          paymentLabels={paymentLabels}
        />
      ) : null}
    </div>
  );
}

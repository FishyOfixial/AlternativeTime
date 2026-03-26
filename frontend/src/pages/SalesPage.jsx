import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { listSales } from "../services/sales";

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

const channelLabels = {
  marketplace: "Marketplace",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  direct: "Directo",
  other: "Otro"
};

const paymentLabels = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  msi: "MSI",
  consignment: "Consigna"
};

function getBrandFromLabel(label) {
  if (!label) {
    return "";
  }
  return label.split(" ")[0] || "";
}

function buildMonthOptions(monthsBack = 12) {
  const now = new Date();
  const options = [{ value: "all", label: "Todos los meses" }];

  for (let i = 0; i < monthsBack; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric"
    }).format(date);
    options.push({ value, label });
  }

  return options;
}

function monthToRange(value) {
  if (!value || value === "all") {
    return { date_from: "", date_to: "" };
  }

  const [year, month] = value.split("-").map((item) => Number(item));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const date_from = start.toISOString().slice(0, 10);
  const date_to = end.toISOString().slice(0, 10);
  return { date_from, date_to };
}

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

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Historial de ventas
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <NavLink className="gold-button px-4 py-2 text-xs" to="/sales/new">
            + Registrar venta
          </NavLink>
          <button
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
            disabled
            type="button"
          >
            Exportar CSV
          </button>
          <button
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
            disabled
            type="button"
          >
            Exportar Excel
          </button>
        </div>
      </section>

      {successMessage ? (
        <div className="rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Ventas del periodo
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {formatCurrency(summary.revenue)}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Ganancia
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#5f8f66]">
            {formatCurrency(summary.profit)}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Transacciones
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {summary.count}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Ticket promedio
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {formatCurrency(summary.ticket)}
          </p>
        </article>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <input
          className="min-w-[230px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar cliente, ID reloj..."
          type="search"
          value={searchTerm}
        />
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setSelectedMonth(event.target.value)}
          value={selectedMonth}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setSelectedChannel(event.target.value)}
          value={selectedChannel}
        >
          <option value="all">Todos los canales</option>
          {Object.entries(channelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setSelectedMethod(event.target.value)}
          value={selectedMethod}
        >
          <option value="all">Todos los metodos</option>
          {Object.entries(paymentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => setSelectedBrand(event.target.value)}
          value={selectedBrand}
        >
          <option value="all">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </section>

      {salesState.status === "loading" ? (
        <LoadingState
          title="Cargando ventas"
          message="Estamos consultando el historial de ventas."
        />
      ) : null}

      {salesState.status === "error" ? (
        <ErrorState title="No pudimos cargar ventas" message={salesState.error} />
      ) : null}

      {salesState.status === "success" && filteredItems.length === 0 ? (
        <EmptyState
          title="Sin ventas para mostrar"
          message="No hay resultados para los filtros actuales."
        />
      ) : null}

      {salesState.status === "success" && filteredItems.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
                <tr>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-4 py-4">ID reloj</th>
                  <th className="px-4 py-4">Reloj</th>
                  <th className="px-4 py-4">Cliente</th>
                  <th className="px-4 py-4">Canal</th>
                  <th className="px-4 py-4">Metodo</th>
                  <th className="px-4 py-4">Monto</th>
                  <th className="px-4 py-4">Costo</th>
                  <th className="px-4 py-4">Ganancia</th>
                  <th className="px-4 py-4">Margen</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-t border-[#eadfcd] text-sm text-[#5d5144]"
                  >
                    <td className="px-4 py-4">{formatDate(sale.sale_date)}</td>
                    <td className="px-4 py-4 font-semibold text-[#b2883e]">
                      {sale.product_code || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#2a221b]">
                        {sale.product_label || "Venta"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {sale.customer_name || "Venta libre"}
                    </td>
                    <td className="px-4 py-4">
                      {channelLabels[sale.sales_channel] || sale.sales_channel}
                    </td>
                    <td className="px-4 py-4">
                      {paymentLabels[sale.payment_method] || sale.payment_method}
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#2a221b]">
                      {formatCurrency(sale.amount_paid)}
                    </td>
                    <td className="px-4 py-4">{formatCurrency(sale.cost_snapshot)}</td>
                    <td className="px-4 py-4 text-[#6ca07e]">
                      {formatCurrency(sale.gross_profit)}
                    </td>
                    <td className="px-4 py-4">
                      {(Number(sale.profit_percentage || 0) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

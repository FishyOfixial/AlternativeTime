import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { listInventory } from "../services/inventory";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

const statusLabels = {
  available: "Disponible",
  reserved: "Apartado",
  sold: "Vendido"
};

const tagLabels = {
  new: "Nuevo",
  promote: "Promover",
  discount: "Descuento",
  liquidate: "Liquidar"
};

const tagClasses = {
  new: "bg-[#edf7f1] text-[#82a88b]",
  promote: "bg-[#fbf1d7] text-[#c4a053]",
  discount: "bg-[#fff0df] text-[#dc9b60]",
  liquidate: "bg-[#fde7e2] text-[#c06b5c]"
};

const statusClasses = {
  available: "bg-[#edf7f1] text-[#7da281]",
  reserved: "bg-[#fff2df] text-[#d2a053]",
  sold: "bg-[#f2eadf] text-[#af9c81]"
};

export default function InventoryPage() {
  const { accessToken } = useAuth();
  const [inventoryState, setInventoryState] = useState({
    status: "loading",
    items: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedDays, setSelectedDays] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    async function loadItems() {
      try {
        const items = await listInventory(accessToken);
        setInventoryState({
          status: "success",
          items
        });
      } catch {
        setInventoryState({
          status: "error",
          items: []
        });
      }
    }

    loadItems();
  }, [accessToken]);

  const brands = useMemo(
    () => [...new Set(inventoryState.items.map((item) => item.brand).filter(Boolean))].sort(),
    [inventoryState.items]
  );

  const counts = useMemo(() => {
    const available = inventoryState.items.filter((item) => item.status === "available").length;
    const reserved = inventoryState.items.filter((item) => item.status === "reserved").length;
    const sold = inventoryState.items.filter((item) => item.status === "sold").length;

    return {
      all: inventoryState.items.length,
      available,
      reserved,
      sold
    };
  }, [inventoryState.items]);

  const filteredItems = useMemo(() => {
    return inventoryState.items.filter((item) => {
      const normalizedTerm = searchTerm.trim().toLowerCase();
      const matchesTerm = normalizedTerm
        ? [item.product_id, item.brand, item.model_name, item.display_name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedTerm))
        : true;
      const matchesStatus = selectedStatus === "all" ? true : item.status === selectedStatus;
      const matchesBrand = selectedBrand === "all" ? true : item.brand === selectedBrand;
      const price = Number(item.price || 0);
      const matchesPrice =
        selectedPrice === "all"
          ? true
          : selectedPrice === "low"
            ? price < 5000
            : selectedPrice === "mid"
              ? price >= 5000 && price < 10000
              : price >= 10000;
      const days = Number(item.days_in_inventory || 0);
      const matchesDays =
        selectedDays === "all"
          ? true
          : selectedDays === "fresh"
            ? days <= 30
            : selectedDays === "steady"
              ? days > 30 && days <= 90
              : days > 90;

      return matchesTerm && matchesStatus && matchesBrand && matchesPrice && matchesDays;
    });
  }, [inventoryState.items, searchTerm, selectedStatus, selectedBrand, selectedPrice, selectedDays]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-[#2a221b]">Inventario</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751]">
            ↑ Importar CSV
          </button>
          <NavLink className="gold-button px-4 py-2 text-xs" to="/inventory/new">
            + Nuevo reloj
          </NavLink>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 rounded-xl bg-[#f1ebdf] p-1">
          {[
            ["all", `Todos (${counts.all})`],
            ["available", `Disponibles (${counts.available})`],
            ["reserved", `Apartados (${counts.reserved})`],
            ["sold", `Vendidos (${counts.sold})`]
          ].map(([value, label]) => (
            <button
              key={value}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                selectedStatus === value ? "bg-[#fffdf9] text-[#2a221b] shadow-sm" : "text-[#9a886f]"
              }`}
              onClick={() => setSelectedStatus(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "table"
                ? "border-[#201914] bg-[#fffdf9] text-[#2a221b]"
                : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
            }`}
            onClick={() => setViewMode("table")}
            type="button"
          >
            Tabla
          </button>
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "cards"
                ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
            }`}
            onClick={() => setViewMode("cards")}
            type="button"
          >
            Tarjetas
          </button>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <input className="min-w-[230px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por ID, marca, modelo..." type="search" value={searchTerm} />
        <select className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm" onChange={(event) => setSelectedBrand(event.target.value)} value={selectedBrand}>
          <option value="all">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        <select className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm" onChange={(event) => setSelectedPrice(event.target.value)} value={selectedPrice}>
          <option value="all">Todos los precios</option>
          <option value="low">Menos de $5,000</option>
          <option value="mid">$5,000 a $9,999</option>
          <option value="high">$10,000 o mas</option>
        </select>
        <select className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm" onChange={(event) => setSelectedDays(event.target.value)} value={selectedDays}>
          <option value="all">Dias en inventario</option>
          <option value="fresh">0 a 30 dias</option>
          <option value="steady">31 a 90 dias</option>
          <option value="aged">90+ dias</option>
        </select>
      </section>

      {inventoryState.status === "loading" ? <LoadingState title="Cargando inventario" message="Estamos consultando los relojes del catalogo." /> : null}
      {inventoryState.status === "error" ? <ErrorState title="No pudimos cargar inventario" message="La API de inventario no respondio como esperabamos." /> : null}
      {inventoryState.status === "success" && filteredItems.length === 0 ? <EmptyState title="Sin relojes para mostrar" message="No hay resultados con los filtros actuales." /> : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && viewMode === "table" ? (
        <section className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Marca / modelo</th>
                  <th className="px-4 py-4">Año</th>
                  <th className="px-4 py-4">Cond.</th>
                  <th className="px-4 py-4">Costo compra</th>
                  <th className="px-4 py-4">Precio</th>
                  <th className="px-4 py-4">Utilidad</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4">Dias inv.</th>
                  <th className="px-4 py-4">Etiqueta</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-[#eadfcd] text-sm text-[#5d5144]">
                    <td className="px-4 py-4 font-semibold text-[#b2883e]">{item.product_id}</td>
                    <td className="px-4 py-4"><p className="font-medium text-[#2a221b]">{item.display_name}</p></td>
                    <td className="px-4 py-4">{item.year_label || "—"}</td>
                    <td className="px-4 py-4">{item.condition_score}</td>
                    <td className="px-4 py-4 font-medium">{formatCurrency(item.total_cost)}</td>
                    <td className="px-4 py-4 font-semibold text-[#2a221b]">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-4">{Number(item.utilidad || 0).toFixed(1)}%</td>
                    <td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-xs ${statusClasses[item.status] || statusClasses.available}`}>{statusLabels[item.status] || item.status}</span></td>
                    <td className="px-4 py-4">{item.days_in_inventory}</td>
                    <td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-xs ${tagClasses[item.age_tag] || tagClasses.new}`}>{tagLabels[item.age_tag] || item.age_tag}</span></td>
                    <td className="px-4 py-4"><NavLink className="text-sm text-[#8f7444]" to={`/inventory/${item.id}`}>Editar</NavLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && viewMode === "cards" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {filteredItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
              <div className="flex min-h-28 items-center justify-center bg-[#eee5d5]">
                {item.image_url ? (
                  <img alt={item.display_name} className="h-24 w-full object-cover" src={item.image_url} />
                ) : (
                  <div className="text-4xl">⌚</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#b2883e]">{item.product_id}</p>
                  <span className={`rounded-md px-2 py-1 text-[10px] uppercase ${tagClasses[item.age_tag] || tagClasses.new}`}>{tagLabels[item.age_tag] || item.age_tag}</span>
                </div>
                <p className="mt-2 font-medium text-[#2a221b]">{item.display_name}</p>
                <p className="mt-1 text-xs text-[#8a775f]">{item.year_label || "Sin año"} · Cond. {item.condition_score} · {item.days_in_inventory} dias</p>
                <p className="mt-3 font-serif text-3xl text-[#2a221b]">{formatCurrency(item.price)}</p>
                <p className="mt-1 text-xs text-[#8a775f]">Costo {formatCurrency(item.total_cost)} · Utilidad {Number(item.utilidad || 0).toFixed(1)}%</p>
                <NavLink className="mt-4 flex w-full items-center justify-center rounded-md bg-[#201914] px-4 py-3 text-sm font-semibold text-[#ddb65f]" to={`/inventory/${item.id}`}>
                  Editar reloj
                </NavLink>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

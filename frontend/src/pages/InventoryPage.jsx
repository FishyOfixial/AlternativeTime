import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import InventoryCards from "../components/inventory/InventoryCards";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStatusTabs from "../components/inventory/InventoryStatusTabs";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryViewToggle from "../components/inventory/InventoryViewToggle";
import { useAuth } from "../contexts/AuthContext";
import { statusClasses, statusLabels, tagClasses, tagLabels } from "../constants/inventory";
import { listInventory } from "../services/inventory";
import { formatCurrency } from "../utils/inventory";

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
      <InventoryHeader />

      <section className="flex flex-wrap items-center justify-between gap-3">
        <InventoryStatusTabs
          counts={counts}
          selectedStatus={selectedStatus}
          onSelect={setSelectedStatus}
        />
        <InventoryViewToggle viewMode={viewMode} onChange={setViewMode} />
      </section>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        brands={brands}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        selectedPrice={selectedPrice}
        onPriceChange={setSelectedPrice}
        selectedDays={selectedDays}
        onDaysChange={setSelectedDays}
      />

      {inventoryState.status === "loading" ? (
        <LoadingState
          title="Cargando inventario"
          message="Estamos consultando los relojes del catalogo."
        />
      ) : null}
      {inventoryState.status === "error" ? (
        <ErrorState
          title="No pudimos cargar inventario"
          message="La API de inventario no respondio como esperabamos."
        />
      ) : null}
      {inventoryState.status === "success" && filteredItems.length === 0 ? (
        <EmptyState
          title="Sin relojes para mostrar"
          message="No hay resultados con los filtros actuales."
        />
      ) : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && viewMode === "table" ? (
        <InventoryTable
          items={filteredItems}
          formatCurrency={formatCurrency}
          statusLabels={statusLabels}
          statusClasses={statusClasses}
          tagLabels={tagLabels}
          tagClasses={tagClasses}
        />
      ) : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && viewMode === "cards" ? (
        <InventoryCards
          items={filteredItems}
          formatCurrency={formatCurrency}
          tagLabels={tagLabels}
          tagClasses={tagClasses}
        />
      ) : null}
    </div>
  );
}

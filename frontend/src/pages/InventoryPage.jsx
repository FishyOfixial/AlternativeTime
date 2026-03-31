import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import InventoryCards from "../components/inventory/InventoryCards";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryStatusTabs from "../components/inventory/InventoryStatusTabs";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryViewToggle from "../components/inventory/InventoryViewToggle";
import OfflineSnapshotStatus from "../components/pwa/OfflineSnapshotStatus";
import { useAuth } from "../contexts/AuthContext";
import { usePwaStatus } from "../contexts/PwaContext";
import { useOfflineSnapshotResource } from "../hooks/useOfflineSnapshotResource";
import { OFFLINE_DATASETS, buildOfflineCacheKey } from "../constants/offlineCache";
import { statusClasses, statusLabels, tagClasses, tagLabels } from "../constants/inventory";
import { importInventoryCsv, listInventory } from "../services/inventory";
import { formatCurrency } from "../utils/inventory";

export default function InventoryPage() {
  const { accessToken } = useAuth();
  const { setDatasetStatus, clearDatasetStatus } = usePwaStatus();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedDays, setSelectedDays] = useState("all");
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches ? "cards" : "table"
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);
  const fileInputRef = useRef(null);
  const inventoryDataset = OFFLINE_DATASETS.inventoryList;
  const inventoryCacheKey = buildOfflineCacheKey(inventoryDataset.datasetId);

  const fetchInventory = useCallback(
    () =>
      listInventory(accessToken).catch(() => {
        throw new Error("La API de inventario no respondio como esperabamos.");
      }),
    [accessToken]
  );

  const inventoryState = useOfflineSnapshotResource({
    cacheKey: inventoryCacheKey,
    datasetId: inventoryDataset.datasetId,
    ttlMs: inventoryDataset.ttlMs,
    fetcher: fetchInventory
  });
  const inventoryItems = inventoryState.data ?? [];

  useEffect(() => {
    setDatasetStatus(inventoryDataset.datasetId, {
      ...inventoryState.freshness,
      label: inventoryDataset.label
    });
    return () => {
      clearDatasetStatus(inventoryDataset.datasetId);
    };
  }, [
    clearDatasetStatus,
    inventoryDataset.datasetId,
    inventoryDataset.label,
    inventoryState.freshness,
    setDatasetStatus
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      setIsDesktop(media.matches);
      if (!media.matches) {
        setViewMode("cards");
      }
    };

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const brands = useMemo(
    () => [...new Set(inventoryItems.map((item) => item.brand).filter(Boolean))].sort(),
    [inventoryItems]
  );

  const counts = useMemo(() => {
    const available = inventoryItems.filter((item) => item.status === "available").length;
    const reserved = inventoryItems.filter((item) => item.status === "reserved").length;
    const sold = inventoryItems.filter((item) => item.status === "sold").length;

    return {
      all: inventoryItems.length,
      available,
      reserved,
      sold
    };
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
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
  }, [inventoryItems, searchTerm, selectedStatus, selectedBrand, selectedPrice, selectedDays]);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleCsvSelected(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    setImportFeedback(null);

    try {
      const result = await importInventoryCsv(accessToken, file);
      const failed = Number(result.failed || 0);
      setImportFeedback({
        type: failed > 0 ? "warning" : "success",
        message:
          failed > 0
            ? `Importacion parcial: ${result.created} creados y ${failed} con error.`
            : `Importacion completa: ${result.created} relojes creados.`,
        errors: result.errors || []
      });
      await inventoryState.refresh();
    } catch (error) {
      setImportFeedback({
        type: "error",
        message: error?.message || "No pudimos importar el archivo CSV.",
        errors: error?.payload?.errors || []
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvSelected}
        ref={fileInputRef}
        type="file"
      />

      {importFeedback ? (
        <section
          className={`rounded-xl border px-4 py-3 text-sm ${
            importFeedback.type === "success"
              ? "border-[#c6ddc8] bg-[#edf8ef] text-[#3d6e46]"
              : importFeedback.type === "warning"
                ? "border-[#e4d7b7] bg-[#fbf5e6] text-[#7b6843]"
                : "border-[#e7c2bc] bg-[#fff1ee] text-[#8e4f45]"
          }`}
        >
          <p>{importFeedback.message}</p>
          {importFeedback.errors?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {importFeedback.errors.slice(0, 5).map((rowError) => (
                <li key={`csv-error-${rowError.row}`}>
                  Fila {rowError.row}: {JSON.stringify(rowError.errors)}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <InventoryStatusTabs
          counts={counts}
          selectedStatus={selectedStatus}
          onSelect={setSelectedStatus}
        />
        <InventoryViewToggle
          showViewOptions={isDesktop}
          viewMode={viewMode}
          onChange={setViewMode}
          onImportClick={handleImportClick}
          isImporting={isImporting}
        />
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

      <OfflineSnapshotStatus
        isStale={inventoryState.isStale}
        label={inventoryDataset.label}
        savedAt={inventoryState.savedAt}
        source={inventoryState.source}
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
          networkAware
        />
      ) : null}
      {inventoryState.status === "success" && filteredItems.length === 0 ? (
        <EmptyState
          title="Sin relojes para mostrar"
          message="No hay resultados con los filtros actuales."
        />
      ) : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && isDesktop && viewMode === "table" ? (
        <InventoryTable
          items={filteredItems}
          formatCurrency={formatCurrency}
          statusLabels={statusLabels}
          statusClasses={statusClasses}
          tagLabels={tagLabels}
          tagClasses={tagClasses}
        />
      ) : null}

      {inventoryState.status === "success" && filteredItems.length > 0 && (!isDesktop || viewMode === "cards") ? (
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

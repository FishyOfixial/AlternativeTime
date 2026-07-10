import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";
import { listCatalog } from "../services/catalog";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const initialFilters = {
  search: "",
  brand: "all",
  yearLabel: "all",
  minPrice: "",
  maxPrice: "",
  conditionMin: "all",
  sortBy: "newest"
};

const loadedCatalogImages = new Set();

function getItemImages(item) {
  return item.image_urls?.length ? item.image_urls : item.primary_image_url ? [item.primary_image_url] : [];
}

function WatchImage({ item, priority = false }) {
  const [, setLoadedVersion] = useState(0);
  const [imageUrl] = getItemImages(item);
  const wasAlreadyLoaded = imageUrl ? loadedCatalogImages.has(imageUrl) : false;

  if (imageUrl) {
    return (
      <img
        alt={item.display_name}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        decoding="async"
        fetchPriority={priority || wasAlreadyLoaded ? "high" : "auto"}
        loading={priority || wasAlreadyLoaded ? "eager" : "lazy"}
        onLoad={() => {
          if (!loadedCatalogImages.has(imageUrl)) {
            loadedCatalogImages.add(imageUrl);
            setLoadedVersion((current) => current + 1);
          }
        }}
        src={imageUrl}
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#292923,#161715_68%)]">
      <span className="text-5xl font-light text-[#b99a59]/50">▷</span>
    </div>
  );
}

function uniqueValues(items, fieldName) {
  return [...new Set(items.map((item) => item[fieldName]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "es")
  );
}

function matchesSearch(item, search) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }
  return [item.display_name, item.brand, item.model_name, item.year_label, item.description, item.product_id]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedSearch));
}

function sortItems(items, sortBy) {
  const sorted = [...items];
  const byPrice = (direction) => (first, second) =>
    direction * (Number(first.price || 0) - Number(second.price || 0));

  const sorters = {
    price_asc: byPrice(1),
    price_desc: byPrice(-1),
    brand: (first, second) =>
      `${first.brand} ${first.model_name}`.localeCompare(`${second.brand} ${second.model_name}`, "es"),
    condition_desc: (first, second) => Number(second.condition_score || 0) - Number(first.condition_score || 0),
    newest: (first, second) => Number(second.id || 0) - Number(first.id || 0)
  };

  return sorted.sort(sorters[sortBy] || sorters.newest);
}

export default function CatalogPage() {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    listCatalog()
      .then((items) => setState({ status: "ready", items }))
      .catch(() => setState({ status: "error", items: [] }));
  }, []);

  const brands = useMemo(() => uniqueValues(state.items, "brand"), [state.items]);
  const yearLabels = useMemo(() => uniqueValues(state.items, "year_label"), [state.items]);

  const filteredItems = useMemo(() => {
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    const conditionMin = filters.conditionMin === "all" ? null : Number(filters.conditionMin);

    const nextItems = state.items.filter((item) => {
      const price = Number(item.price || 0);
      const condition = Number(item.condition_score || 0);
      return (
        matchesSearch(item, filters.search) &&
        (filters.brand === "all" || item.brand === filters.brand) &&
        (filters.yearLabel === "all" || item.year_label === filters.yearLabel) &&
        (minPrice === null || price >= minPrice) &&
        (maxPrice === null || price <= maxPrice) &&
        (conditionMin === null || condition >= conditionMin)
      );
    });

    return sortItems(nextItems, filters.sortBy);
  }, [filters, state.items]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  const activeFilterCount = [
    filters.search.trim(),
    filters.brand !== "all",
    filters.yearLabel !== "all",
    filters.minPrice,
    filters.maxPrice,
    filters.conditionMin !== "all",
    filters.sortBy !== "newest"
  ].filter(Boolean).length;

  return (
    <CatalogShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(187,151,78,.18),transparent_26%),linear-gradient(115deg,#131512,#080909)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-[#c4a45f]">Colección disponible</p>
              <h1 className="mt-4 max-w-3xl font-brand text-4xl leading-[.96] text-white sm:text-6xl lg:text-7xl">
                Catálogo de relojes.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#aaa69d] sm:text-lg">
                Piezas seleccionadas para quienes entienden que un buen reloj no solo mide el tiempo: lo acompaña.
              </p>
              <div className="mt-7 hidden sm:block"><ContactLinks /></div>
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="h-56 w-56 rounded-full border border-[#c4a45f]/30 bg-[radial-gradient(circle,#272820_0%,#10110f_65%)] shadow-[0_0_90px_rgba(196,164,95,.12)]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-8 sm:py-20">
          <div className="mb-6 flex flex-col gap-4 px-1 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-[#a7894d]">En inventario</p>
              <h2 className="mt-3 font-brand text-3xl text-white sm:text-5xl">Relojes disponibles</h2>
            </div>
            {state.status === "ready" && (
              <p className="text-sm text-[#77766f]">
                {filteredItems.length} de {state.items.length} piezas
              </p>
            )}
          </div>

          <div className="mb-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,.22)] sm:mb-12 sm:rounded-[2rem]">
            <button
              aria-controls="catalog-filters"
              aria-expanded={isFiltersOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
              onClick={() => setIsFiltersOpen((current) => !current)}
              type="button"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.28em] text-[#c4a45f]">Filtros</span>
                <span className="mt-1 block text-sm text-[#8f8c85]">
                  {activeFilterCount ? `${activeFilterCount} activo${activeFilterCount === 1 ? "" : "s"}` : "Buscar, filtrar y ordenar"}
                </span>
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#10110f] text-xl text-[#d4b874] transition">
                {isFiltersOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className={`${isFiltersOpen ? "block" : "hidden"} border-t border-white/10 p-3 sm:p-5`}
              id="catalog-filters"
            >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_.8fr_.8fr_.7fr_.7fr_.8fr]">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Buscar</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#66645e] focus:border-[#c4a45f]"
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Marca, modelo, descripción..."
                  value={filters.search}
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Marca</span>
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none focus:border-[#c4a45f]"
                  onChange={(event) => updateFilter("brand", event.target.value)}
                  value={filters.brand}
                >
                  <option value="all">Todas</option>
                  {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Año / estilo</span>
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none focus:border-[#c4a45f]"
                  onChange={(event) => updateFilter("yearLabel", event.target.value)}
                  value={filters.yearLabel}
                >
                  <option value="all">Todos</option>
                  {yearLabels.map((yearLabel) => <option key={yearLabel} value={yearLabel}>{yearLabel}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Precio min.</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none focus:border-[#c4a45f]"
                  min="0"
                  onChange={(event) => updateFilter("minPrice", event.target.value)}
                  type="number"
                  value={filters.minPrice}
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Precio max.</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none focus:border-[#c4a45f]"
                  min="0"
                  onChange={(event) => updateFilter("maxPrice", event.target.value)}
                  type="number"
                  value={filters.maxPrice}
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#9c8148]">Ordenar</span>
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#10110f] px-4 py-3 text-sm text-white outline-none focus:border-[#c4a45f]"
                  onChange={(event) => updateFilter("sortBy", event.target.value)}
                  value={filters.sortBy}
                >
                  <option value="newest">Más recientes</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="brand">Marca A-Z</option>
                  <option value="condition_desc">Mejor condición</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#aaa69d]">
                <span>Condición mínima</span>
                <select
                  className="rounded-full border border-white/10 bg-[#10110f] px-3 py-2 text-sm text-white outline-none focus:border-[#c4a45f]"
                  onChange={(event) => updateFilter("conditionMin", event.target.value)}
                  value={filters.conditionMin}
                >
                  <option value="all">Cualquiera</option>
                  <option value="7">7/10+</option>
                  <option value="8">8/10+</option>
                  <option value="9">9/10+</option>
                </select>
              </label>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c8c1b5] transition hover:border-[#c4a45f]/60 hover:text-white"
                onClick={resetFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
            </div>
          </div>

          {state.status === "loading" && <p className="py-24 text-center text-[#aaa69d]">Preparando la colección...</p>}
          {state.status === "error" && <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-[#c8c1b5]">No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.</p>}
          {state.status === "ready" && !state.items.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-[#aaa69d]">Muy pronto habrá nuevas piezas disponibles.</p>}
          {state.status === "ready" && state.items.length > 0 && filteredItems.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-[#aaa69d]">
              No encontramos piezas con esos filtros.
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <article className="catalog-card group" key={item.id}>
                <Link to={`/catalogo/${item.id}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-[2px] bg-[#181916] sm:aspect-[4/5]">
                    <WatchImage item={item} priority={index < 4} />
                  </div>
                  <div className="border-b border-white/10 py-3 sm:py-5">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <p className="hidden text-[10px] uppercase tracking-[0.3em] text-[#9c8148] sm:block">{item.brand}</p>
                        <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug text-[#f1ede5] sm:mt-2 sm:text-xl">{item.model_name}</h3>
                      </div>
                      <span className={`mt-1 hidden h-2 w-2 shrink-0 rounded-full sm:block ${item.status === "available" ? "bg-[#7da071]" : "bg-[#bf9b50]"}`} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                      <p className="text-[15px] tracking-wide text-[#cdb274] sm:text-lg">{money.format(Number(item.price))}</p>
                      <p className="hidden text-xs text-[#77766f] sm:block">{item.availability}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </CatalogShell>
  );
}

import { useEffect, useMemo, useState } from "react";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";
import CatalogProductCard from "../components/catalog/CatalogProductCard";
import { listCatalog, listCatalogFilters } from "../services/catalog";

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
const CATALOG_PAGE_SIZE = 12;

function getItemImages(item) {
  return item.image_urls?.length ? item.image_urls : item.primary_image_url ? [item.primary_image_url] : [];
}

function getCardImage(item) {
  const variants = item.primary_image_variants;
  const [fallbackUrl] = getItemImages(item);
  return {
    src: item.card_image_url || variants?.card || fallbackUrl || "",
    srcSet: variants?.card_srcset || "",
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 420px"
  };
}

function WatchImage({ item, priority = false }) {
  const [, setLoadedVersion] = useState(0);
  const { sizes, src: imageUrl, srcSet } = getCardImage(item);
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
        sizes={sizes}
        src={imageUrl}
        srcSet={srcSet || undefined}
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#292923,#161715_68%)]">
      <span className="text-5xl font-light text-[#b99a59]/50">▷</span>
    </div>
  );
}

function mergeCatalogPage(currentItems, nextItems) {
  const knownIds = new Set();
  return [...currentItems, ...nextItems].filter((item) => {
    if (knownIds.has(item.id)) {
      return false;
    }
    knownIds.add(item.id);
    return true;
  });
}

function getCatalogQuery(filters, page) {
  return {
    page,
    page_size: CATALOG_PAGE_SIZE,
    search: filters.search.trim(),
    brand: filters.brand,
    year_label: filters.yearLabel,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    condition_min: filters.conditionMin,
    ordering: filters.sortBy
  };
}

export default function CatalogPage() {
  const [state, setState] = useState({ status: "loading", items: [], count: 0, next: null });
  const [filterOptions, setFilterOptions] = useState({ brands: [], year_labels: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    listCatalogFilters({
      onUpdate: (options) => {
        if (active) {
          setFilterOptions(options);
        }
      }
    })
      .then((options) => {
        if (active) {
          setFilterOptions(options);
        }
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const requestDelay = window.setTimeout(() => {
      setState((current) => ({
        ...(page === 1 ? { items: [], count: 0, next: null } : current),
        status: page === 1 ? "loading" : "loading_more"
      }));
      listCatalog(getCatalogQuery(filters, page), {
        onUpdate: (payload) => {
          if (!active) {
            return;
          }
          setState((current) => ({
            status: "ready",
            items: page === 1 ? payload.results : mergeCatalogPage(current.items, payload.results),
            count: payload.count,
            next: payload.next
          }));
        }
      })
        .then((payload) => {
          if (!active) {
            return;
          }
          setState((current) => ({
            status: "ready",
            items: page === 1 ? payload.results : mergeCatalogPage(current.items, payload.results),
            count: payload.count,
            next: payload.next
          }));
        })
        .catch(() => {
          if (active) {
            setState({ status: "error", items: [], count: 0, next: null });
          }
        });
    }, filters.search ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(requestDelay);
    };
  }, [filters, page]);

  const brands = useMemo(() => filterOptions.brands || [], [filterOptions.brands]);
  const yearLabels = useMemo(() => filterOptions.year_labels || [], [filterOptions.year_labels]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPage(1);
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
  const hasMoreItems = Boolean(state.next);

  return (
    <CatalogShell>
      <main>
        <section className="hidden">
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
              <p className="text-xs uppercase tracking-[0.36em] text-[#a7894d]">Colección disponible</p>
              <h2 className="mt-3 font-brand text-3xl text-white sm:text-5xl">Catálogo de relojes</h2>
            </div>
            {state.status === "ready" && (
              <p className="text-sm text-[#77766f]">
                {state.items.length} de {state.count} piezas
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

          {state.status === "loading" && <CatalogGridSkeleton />}
          {state.status === "error" && <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-[#c8c1b5]">No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.</p>}
          {state.status === "ready" && !state.items.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-[#aaa69d]">Muy pronto habrá nuevas piezas disponibles.</p>}
          <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
            {state.items.map((item, index) => (
              <CatalogProductCard item={item} key={item.id} priority={index < 4} />
            ))}
          </div>
          {state.status === "ready" && hasMoreItems ? (
            <div className="mt-12 flex justify-center">
              <button
                className="rounded-full border border-[#c4a45f]/35 px-6 py-3 text-sm font-semibold text-[#d4b874] transition hover:border-[#d4b874] hover:bg-[#d4b874]/10"
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Cargar más piezas
              </button>
            </div>
          ) : null}
          {state.status === "loading_more" ? (
            <div className="mt-8">
              <CatalogGridSkeleton count={3} />
            </div>
          ) : null}
        </section>
      </main>
    </CatalogShell>
  );
}

function CatalogGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <article className="animate-pulse" key={index}>
          <div className="aspect-[3/4] rounded-[2px] bg-white/[0.06] sm:aspect-[4/5]" />
          <div className="border-b border-white/10 py-3 sm:py-5">
            <div className="h-4 w-4/5 rounded-full bg-white/[0.08]" />
            <div className="mt-3 h-4 w-2/3 rounded-full bg-[#c4a45f]/15" />
          </div>
        </article>
      ))}
    </div>
  );
}

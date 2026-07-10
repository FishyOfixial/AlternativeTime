import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";
import { getCatalogItem } from "../services/catalog";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const DESCRIPTION_COLLAPSE_LENGTH = 360;

function getItemImages(item) {
  return item?.image_urls?.length ? item.image_urls : item?.primary_image_url ? [item.primary_image_url] : [];
}

function getDetailImage(item, index) {
  const variant = item?.image_variants?.[index] || item?.primary_image_variants;
  const fallback = getItemImages(item)[index] || getItemImages(item)[0] || "";
  return {
    src: variant?.detail || fallback,
    srcSet: variant?.detail_srcset || "",
    sizes: "(max-width: 1024px) 100vw, 680px",
    thumb: variant?.thumb || fallback
  };
}

export default function CatalogDetailPage() {
  const { itemId } = useParams();
  const [state, setState] = useState({ status: "loading", item: null });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    getCatalogItem(itemId)
      .then((item) => {
        setState({ status: "ready", item });
        setActiveImageIndex(0);
        setIsDescriptionExpanded(false);
      })
      .catch(() => setState({ status: "error", item: null }));
  }, [itemId]);

  const images = useMemo(() => getItemImages(state.item), [state.item]);
  const activeImage = getDetailImage(state.item, activeImageIndex);
  const hasMultipleImages = images.length > 1;
  const description = state.item?.description || "Solicita más información sobre esta pieza y su historia.";
  const shouldCollapseDescription = description.length > DESCRIPTION_COLLAPSE_LENGTH;

  function showPreviousImage() {
    setActiveImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <CatalogShell>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-14">
        <Link className="text-xs uppercase tracking-[0.25em] text-[#9f8959] hover:text-[#c8ae74]" to="/catalogo">← Volver al catálogo</Link>
        {state.status === "loading" && <p className="py-32 text-center text-[#aaa69d]">Cargando pieza...</p>}
        {state.status === "error" && <div className="py-32 text-center"><h1 className="font-brand text-4xl">Pieza no disponible</h1><p className="mt-4 text-[#918f88]">Este reloj ya no forma parte del catálogo.</p></div>}
        {state.item && (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-[#181916]">
                {activeImage.src ? (
                  <img
                    alt={state.item.display_name}
                    className="h-full w-full object-cover"
                    decoding="async"
                    fetchPriority="high"
                    sizes={activeImage.sizes}
                    src={activeImage.src}
                    srcSet={activeImage.srcSet || undefined}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,#292923,#111210_70%)] text-8xl text-[#b99a59]/40">▷</div>
                )}
                {hasMultipleImages ? (
                  <>
                    <button
                      aria-label="Imagen anterior"
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-2xl text-white backdrop-blur transition hover:bg-black/70"
                      onClick={showPreviousImage}
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      aria-label="Siguiente imagen"
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-2xl text-white backdrop-blur transition hover:bg-black/70"
                      onClick={showNextImage}
                      type="button"
                    >
                      ›
                    </button>
                    <p className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">
                      {activeImageIndex + 1} / {images.length}
                    </p>
                  </>
                ) : null}
              </div>
              {hasMultipleImages ? (
                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                  {images.map((imageUrl, index) => {
                    const thumbImage = getDetailImage(state.item, index);
                    return (
                    <button
                      aria-label={`Ver imagen ${index + 1}`}
                      className={`aspect-square overflow-hidden rounded-xl border transition ${
                        index === activeImageIndex ? "border-[#c4a45f]" : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                      key={imageUrl}
                      onClick={() => setActiveImageIndex(index)}
                      type="button"
                    >
                      <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" src={thumbImage.thumb || imageUrl} />
                    </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col justify-center lg:py-8">
              <p className="text-xs uppercase tracking-[0.4em] text-[#b69857]">{state.item.brand}</p>
              <h1 className="mt-4 max-w-2xl font-brand text-3xl leading-[1.02] text-white sm:text-4xl lg:text-5xl">
                {state.item.model_name}
              </h1>
              {state.item.year_label && <p className="mt-3 text-sm text-[#77766f]">{state.item.year_label}</p>}
              <p className="mt-7 text-2xl text-[#d4b874] sm:text-3xl">{money.format(Number(state.item.price))}</p>
              <div className="mt-8 flex flex-wrap gap-8 border-y border-white/10 py-5 text-sm">
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Estado</p><p className="mt-2 text-[#d9d4ca]">{state.item.availability}</p></div>
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Existencia</p><p className="mt-2 text-[#d9d4ca]">{state.item.stock} pieza</p></div>
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Condición</p><p className="mt-2 text-[#d9d4ca]">{state.item.condition_score}/10</p></div>
              </div>
              <div className="relative mt-8 rounded-[1.35rem] border border-[#c4a45f]/15 bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                <div className={`rounded-[1.25rem] bg-[#10110f]/72 px-5 py-5 ${shouldCollapseDescription && !isDescriptionExpanded ? "max-h-44 overflow-hidden" : ""}`}>
                  <p className="whitespace-pre-line text-base leading-8 text-[#aaa69d]">
                    {description}
                  </p>
                </div>
                {shouldCollapseDescription ? (
                  <div className={`rounded-b-[1.25rem] bg-[#10110f]/72 px-5 pb-5 ${isDescriptionExpanded ? "pt-1" : "-mt-16 pt-16 bg-gradient-to-t from-[#10110f] via-[#10110f]/95 to-transparent"}`}>
                    <button
                      className="text-sm font-semibold text-[#d4b874] underline decoration-[#d4b874]/40 underline-offset-4 transition hover:text-[#f1d58c]"
                      onClick={() => setIsDescriptionExpanded((current) => !current)}
                      type="button"
                    >
                      {isDescriptionExpanded ? "Leer menos" : "Leer más"}
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="mt-9">
                <ContactLinks productName={state.item.display_name} whatsappLabel="Adquirir por WhatsApp" />
              </div>
            </div>
          </div>
        )}
      </main>
    </CatalogShell>
  );
}

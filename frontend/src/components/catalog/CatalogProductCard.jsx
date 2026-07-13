import { useState } from "react";
import { Link } from "react-router-dom";
import { preloadCatalogItem } from "../../services/catalog";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const loadedCatalogImages = new Set();

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

export default function CatalogProductCard({ item, priority = false }) {
  return (
    <article className="catalog-card group">
      <Link
        onFocus={() => preloadCatalogItem(item)}
        onMouseEnter={() => preloadCatalogItem(item)}
        onTouchStart={() => preloadCatalogItem(item)}
        to={`/catalogo/${item.id}`}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-[2px] bg-[#181916] sm:aspect-[4/5]">
          <WatchImage item={item} priority={priority} />
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
            <p className="text-[15px] tracking-wide text-[#cdb274] sm:text-lg">{money.format(Number(item.price))} MXN</p>
            <p className="hidden text-xs text-[#77766f] sm:block">{item.availability}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

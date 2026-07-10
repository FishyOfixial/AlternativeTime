function isCatalogPerformanceEnabled() {
  return (
    new URLSearchParams(window.location.search).get("perf") === "1" ||
    window.localStorage.getItem("at.catalogPerf") === "1"
  );
}

function logMetric(name, value, unit = "ms") {
  console.info(`[catalog-perf] ${name}: ${Math.round(value)}${unit}`);
}

export function registerCatalogPerformanceObservers() {
  if (!isCatalogPerformanceEnabled() || !("PerformanceObserver" in window)) {
    return;
  }

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        logMetric("LCP", lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // Browser does not support this observer.
  }

  try {
    let cls = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      console.info(`[catalog-perf] CLS: ${cls.toFixed(3)}`);
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // Browser does not support this observer.
  }

  try {
    let blockingTime = 0;
    const longTaskObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        blockingTime += Math.max(0, entry.duration - 50);
      });
      logMetric("estimated TBT", blockingTime);
    });
    longTaskObserver.observe({ type: "longtask", buffered: true });
  } catch {
    // Browser does not support this observer.
  }

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      const imageResources = performance
        .getEntriesByType("resource")
        .filter((entry) => entry.initiatorType === "img" || /\.(avif|webp|png|jpe?g)(\?|$)/i.test(entry.name));
      const transferredBytes = imageResources.reduce((total, entry) => total + (entry.transferSize || 0), 0);
      logMetric("image requests", imageResources.length, "");
      logMetric("image transfer", transferredBytes / 1024, "KB");
    }, 1500);
  });
}

import { render, screen, waitFor } from "@testing-library/react";
import { useOfflineSnapshotResource } from "./useOfflineSnapshotResource";
import { clearOfflineSnapshots } from "../pwa/offlineSnapshots";

function setNavigatorOnline(value) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value
  });
}

function disableIndexedDb() {
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: undefined
  });
}

function ResourceProbe({ fetcher, cacheKey = "probe::default", ttlMs = 60_000 }) {
  const state = useOfflineSnapshotResource({
    cacheKey,
    datasetId: "probe",
    ttlMs,
    fetcher
  });

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <span data-testid="source">{state.source || "none"}</span>
      <span data-testid="saved-at">{state.savedAt ? "yes" : "no"}</span>
      <span data-testid="payload">{JSON.stringify(state.data)}</span>
    </div>
  );
}

describe("useOfflineSnapshotResource", () => {
  beforeEach(async () => {
    disableIndexedDb();
    setNavigatorOnline(true);
    await clearOfflineSnapshots();
  });

  it("stores a network snapshot and later falls back to cache when offline", async () => {
    const onlineFetcher = vi.fn(async () => [{ id: 1, name: "Ada" }]);
    const offlineFetcher = vi.fn(async () => {
      throw new Error("offline");
    });

    const { rerender } = render(<ResourceProbe fetcher={onlineFetcher} />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("success");
    });

    expect(screen.getByTestId("source")).toHaveTextContent("network");
    expect(screen.getByTestId("saved-at")).toHaveTextContent("yes");

    setNavigatorOnline(false);

    rerender(<ResourceProbe fetcher={offlineFetcher} />);

    await waitFor(() => {
      expect(screen.getByTestId("source")).toHaveTextContent("cache");
    });

    expect(screen.getByTestId("payload")).toHaveTextContent("Ada");
  });
});

import {
  clearOfflineSnapshots,
  deleteOfflineSnapshot,
  getOfflineSnapshot,
  saveOfflineSnapshot
} from "./offlineSnapshots";

function disableIndexedDb() {
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: undefined
  });
}

describe("offlineSnapshots", () => {
  beforeEach(async () => {
    disableIndexedDb();
    await clearOfflineSnapshots();
  });

  it("saves and reads an offline snapshot with freshness metadata", async () => {
    const snapshot = await saveOfflineSnapshot({
      cacheKey: "clients::default",
      payload: [{ id: 1, name: "Ada" }],
      ttlMs: 60_000
    });

    expect(snapshot.source).toBe("network");
    expect(snapshot.savedAt).toBeTypeOf("number");
    expect(snapshot.expiresAt).toBeGreaterThan(snapshot.savedAt);
    expect(snapshot.isStale).toBe(false);

    const stored = await getOfflineSnapshot("clients::default");

    expect(stored).toMatchObject({
      cacheKey: "clients::default",
      payload: [{ id: 1, name: "Ada" }],
      source: "network",
      isStale: false
    });
  });

  it("marks the snapshot as stale when it exceeds its ttl", async () => {
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValue(1_000);

    await saveOfflineSnapshot({
      cacheKey: "dashboard::month",
      payload: { kpis: {} },
      ttlMs: 100
    });

    nowSpy.mockReturnValue(1_500);

    const stored = await getOfflineSnapshot("dashboard::month");

    expect(stored.isStale).toBe(true);
  });

  it("deletes snapshots cleanly", async () => {
    await saveOfflineSnapshot({
      cacheKey: "inventory::default",
      payload: [{ id: 10 }],
      ttlMs: 60_000
    });

    await deleteOfflineSnapshot("inventory::default");

    expect(await getOfflineSnapshot("inventory::default")).toBeNull();
  });
});

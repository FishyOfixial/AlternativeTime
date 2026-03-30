import {
  createInventoryItem,
  importInventoryCsv,
  updateInventoryItem
} from "./inventory";
import { createSale } from "./sales";
import { createFinanceEntry } from "./finance";
import { createLayaway, createLayawayPayment } from "./layaways";
import { exportReport } from "./reports";

function mockJsonResponse(payload = {}, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    blob: async () => new Blob([JSON.stringify(payload)], { type: "application/json" }),
    headers: {
      get: () => null
    }
  };
}

describe("service api urls", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    vi.stubEnv("VITE_API_HOST", "");
    global.fetch = vi.fn(async () => mockJsonResponse({ id: 1 }, 201));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("routes inventory writes through the configured api base url", async () => {
    const payload = {
      brand: "Rolex",
      model_name: "Datejust",
      price: "10000.00",
      purchase_date: "2026-03-30",
      status: "available",
      sales_channel: "instagram",
      purchase_cost: {
        watch_cost: "8000.00",
        shipping_cost: "0.00",
        maintenance_cost: "0.00",
        other_costs: "0.00",
        payment_method: "cash",
        source_account: "cash",
        notes: ""
      }
    };

    await createInventoryItem("token", payload);
    await updateInventoryItem("token", 42, payload);
    await importInventoryCsv("token", new File(["sku"], "inventory.csv", { type: "text/csv" }));

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/inventory/",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/inventory/42/",
      expect.objectContaining({ method: "PATCH" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "https://api.example.com/api/inventory/import-csv/",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("routes other write and export calls through the configured api base url", async () => {
    await createSale("token", { product_id: 1 });
    await createFinanceEntry("token", { amount: "100.00" });
    await createLayaway("token", { product_id: 1 });
    await createLayawayPayment("token", 7, { amount: "50.00" });
    await exportReport("token", "sales-summary", "csv", { year: "2026" });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/sales/",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/finance/entries/",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "https://api.example.com/api/layaways/",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      "https://api.example.com/api/layaways/7/payments/",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      5,
      "https://api.example.com/api/reports/sales-summary/export/?year=2026&format=csv",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });
});

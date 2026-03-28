import { createFinanceEntry } from "../finance";
import { createLayaway, createLayawayPayment } from "../layaways";
import { exportReport } from "../reports";
import { createSale } from "../sales";

function mockResponse({ ok = true, status = 200, json = {}, blob = new Blob(["ok"]) } = {}) {
  return {
    ok,
    status,
    json: async () => json,
    blob: async () => blob,
    headers: {
      get: (name) => {
        if (name.toLowerCase() === "content-disposition") {
          return 'attachment; filename="reporte.csv"';
        }
        return null;
      }
    }
  };
}

describe("service error handling", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws VALIDATION_ERROR on createSale 400", async () => {
    global.fetch.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 400, json: { amount_paid: ["Requerido"] } })
    );

    await expect(createSale("token", {})).rejects.toMatchObject({
      message: "VALIDATION_ERROR",
      status: 400,
      data: { amount_paid: ["Requerido"] }
    });
  });

  it("throws HTTP error on createLayawayPayment non-400 error", async () => {
    global.fetch.mockResolvedValueOnce(mockResponse({ ok: false, status: 404 }));

    await expect(createLayawayPayment("token", 99, {})).rejects.toThrow("HTTP 404");
  });

  it("throws VALIDATION_ERROR on createLayaway 400", async () => {
    global.fetch.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 400, json: { product: ["No disponible"] } })
    );

    await expect(createLayaway("token", {})).rejects.toMatchObject({
      message: "VALIDATION_ERROR",
      status: 400,
      data: { product: ["No disponible"] }
    });
  });

  it("throws VALIDATION_ERROR on createFinanceEntry 400", async () => {
    global.fetch.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 400, json: { amount: ["Invalido"] } })
    );

    await expect(createFinanceEntry("token", {})).rejects.toMatchObject({
      message: "VALIDATION_ERROR",
      status: 400,
      data: { amount: ["Invalido"] }
    });
  });

  it("exports report and normalizes quoted format", async () => {
    global.fetch.mockResolvedValueOnce(mockResponse({ ok: true, status: 200 }));

    const result = await exportReport("token", "ventas_por_mes", '"csv"', {
      channel: "instagram"
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/reports/ventas_por_mes/export/?channel=instagram&format=csv",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" })
      })
    );
    expect(result.filename).toBe("reporte.csv");
  });
});

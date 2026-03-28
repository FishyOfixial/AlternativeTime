import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

function createToken(expOffsetSeconds = 1800) {
  const header = window.btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = window.btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds
    })
  );

  return `${header}.${payload}.signature`;
}

function mockJsonResponse(payload, status = 200) {
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

function getMockUser() {
  return {
    id: 1,
    username: "devadmin",
    email: "devadmin@example.com",
    first_name: "Dev",
    last_name: "Admin",
    is_staff: true
  };
}

function getDashboardPayload() {
  return {
    range: "month",
    selected_year: 2026,
    available_years: [2026],
    kpis: {
      sales_revenue: "1230.00",
      sales_revenue_delta: 12.5,
      profit_total: "430.00",
      profit_total_delta: 8.4,
      capital_in_inventory: "5400.00",
      avg_days_to_sell: 18.5,
      cost_of_sales: "800.00",
      inventory_sales_ratio: 4.39,
      units_sold: 8
    },
    brands_sold: [
      {
        brand: "Rolex",
        units_sold: 4,
        avg_days_to_sell: 15.4,
        revenue: "900.00",
        cost_of_sales: "600.00",
        profit: "300.00"
      }
    ],
    fastest_selling_brands: [
      {
        brand: "Omega",
        units_sold: 2,
        avg_days_to_sell: 10.2,
        revenue: "330.00",
        cost_of_sales: "200.00",
        profit: "130.00"
      }
    ],
    stock_by_brand: [{ brand: "Rolex", units: 6 }],
    monthly_breakdown: Array.from({ length: 12 }, (_, index) => ({
      month: `M${index + 1}`,
      sales: index === 2 ? "1230.00" : "0.00",
      profit: index === 2 ? "430.00" : "0.00",
      cost: index === 2 ? "800.00" : "0.00"
    }))
  };
}

function setupAuthenticatedFetch() {
  global.fetch = vi.fn(async (input, options = {}) => {
    const url = String(input);
    if (url.endsWith("/api/auth/me/")) {
      return mockJsonResponse(getMockUser());
    }
    if (url.includes("/api/reports/dashboard-summary/")) {
      return mockJsonResponse(getDashboardPayload());
    }
    if (url.endsWith("/api/notifications/")) {
      return mockJsonResponse({
        counts: {
          layaway_overdue: 1,
          inventory_old: 2
        },
        items: []
      });
    }
    if (url.includes("/api/clients/")) {
      return mockJsonResponse([
        {
          id: 10,
          name: "Ricardo Torres",
          phone: "33 1155 8630",
          email: "ricardo@example.com",
          instagram_handle: "@ricardo",
          address: "Centro 101",
          notes: "",
          is_active: true,
          purchases_count: 2,
          total_spent: "3100.00",
          last_purchase_at: "2026-01-10T12:00:00Z"
        }
      ]);
    }
    if (url.includes("/api/inventory/")) {
      return mockJsonResponse([
        {
          id: 1,
          brand: "Rolex",
          model_name: "Datejust",
          display_name: "Rolex Datejust",
          product_id: "ROL-001",
          price: "10000.00",
          total_cost: "8000.00",
          status: "available",
          is_active: true,
          days_in_inventory: 12,
          age_tag: "new",
          condition_score: "8.5"
        }
      ]);
    }
    if (url.includes("/api/sales/")) {
      return mockJsonResponse([
        {
          id: 1,
          sale_date: "2026-03-20",
          product_code: "ROL-001",
          product_label: "Rolex Datejust",
          customer_name: "Ricardo Torres",
          customer_contact: "33 1155 8630",
          sales_channel: "instagram",
          payment_method: "cash",
          amount_paid: "11000.00",
          cost_snapshot: "8000.00",
          gross_profit: "3000.00",
          profit_percentage: "0.375"
        }
      ]);
    }
    if (url.includes("/api/layaways/") && url.includes("/payments/")) {
      return mockJsonResponse({ detail: "ok" });
    }
    if (url.match(/\/api\/layaways\/\d+\/$/)) {
      return mockJsonResponse({
        id: 1,
        product_label: "Rolex Datejust",
        product_code: "ROL-001",
        status: "active",
        product_status: "reserved",
        agreed_price: "12000.00",
        amount_paid: "3000.00",
        balance_due: "9000.00",
        payments: []
      });
    }
    if (url.includes("/api/layaways/")) {
      return mockJsonResponse([
        {
          id: 1,
          product_label: "Rolex Datejust",
          product_code: "ROL-001",
          client_name: "Ricardo Torres",
          status: "active",
          is_overdue: false,
          agreed_price: "12000.00",
          amount_paid: "3000.00",
          balance_due: "9000.00",
          start_date: "2026-03-01"
        }
      ]);
    }
    if (url.endsWith("/api/finance/summary/")) {
      return mockJsonResponse({
        total_sales_count: 1,
        gross_revenue: "11000.00",
        total_income: "11000.00",
        total_expense: "2000.00",
        net_balance: "9000.00"
      });
    }
    if (url.endsWith("/api/finance/balances/")) {
      return mockJsonResponse([
        { account: "cash", balance: "5000.00" },
        { account: "bbva", balance: "3000.00" },
        { account: "credit", balance: "1000.00" },
        { account: "amex", balance: "0.00" }
      ]);
    }
    if (url.includes("/api/finance/entries/")) {
      return mockJsonResponse([]);
    }
    if (url.endsWith("/api/reports/sales-summary/")) {
      return mockJsonResponse({ total_sales_count: 1, gross_revenue: "11000.00", items_sold: 1 });
    }
    if (url.endsWith("/api/reports/inventory-summary/")) {
      return mockJsonResponse({ active_products: 1, total_stock: 1, low_stock_products: 0, out_of_stock_products: 0 });
    }

    if (options.method === "POST") {
      return mockJsonResponse({ id: 99 }, 201);
    }

    return mockJsonResponse({});
  });
}

function enableStoredSession() {
  window.localStorage.setItem("at.frontend.access", createToken());
  window.localStorage.setItem("at.frontend.refresh", "refresh-token");
}

describe("App auth routing", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login form route for guests", async () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    expect(await screen.findByText(/bienvenido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
  });

  it("redirects guests away from protected routes", async () => {
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    expect(await screen.findByText(/bienvenido/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa tus credenciales/i)).toBeInTheDocument();
  });

  it("restores a stored session and loads dashboard metrics", async () => {
    enableStoredSession();
    setupAuthenticatedFetch();

    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    expect(await screen.findByText(/dashboard de negocio/i)).toBeInTheDocument();
    expect(await screen.findByText(/ventas totales/i)).toBeInTheDocument();
    expect(await screen.findByText(/desglose mensual/i)).toBeInTheDocument();
    expect(await screen.findByText(/marcas mas vendidas/i)).toBeInTheDocument();
    expect(screen.queryByText(/^usuarios$/i)).not.toBeInTheDocument();
  });

  it("loads clients module", async () => {
    enableStoredSession();
    setupAuthenticatedFetch();

    window.history.pushState({}, "", "/clients");
    render(<App />);

    expect(await screen.findByText(/clientes registrados/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar por nombre o telefono/i)).toBeInTheDocument();
  });

  it("loads inventory, sales, layaways, finance and reports routes", async () => {
    enableStoredSession();
    setupAuthenticatedFetch();

    window.history.pushState({}, "", "/inventory");
    render(<App />);
    expect(await screen.findByText(/importar csv/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/sales");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(await screen.findByText(/historial de ventas/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/sales/new");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(await screen.findByText(/registrar venta/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/layaways");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(await screen.findByText(/\+ nuevo apartado/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/layaways/1");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(await screen.findByText(/apartado #1/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/finance");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(await screen.findByText(/finanzas & flujo de efectivo/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, "", "/reports");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => {
      expect(screen.getAllByText(/configurar reporte/i).length).toBeGreaterThan(0);
    });
  });
});

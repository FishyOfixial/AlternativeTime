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

function mockJsonResponse(payload) {
  return {
    ok: true,
    json: async () => payload
  };
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
    window.localStorage.setItem("at.frontend.access", createToken());
    window.localStorage.setItem("at.frontend.refresh", "refresh-token");

    global.fetch
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: 1,
          username: "devadmin",
          email: "devadmin@example.com",
          first_name: "Dev",
          last_name: "Admin",
          is_staff: true
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
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
        })
      );

    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/dashboard de negocio/i)).toBeInTheDocument();
    });

    expect(await screen.findByText(/ventas totales/i)).toBeInTheDocument();
    expect(screen.getAllByText(/marcas mas vendidas/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/corte anual por meses/i)).toBeInTheDocument();
  });

  it("loads the clients module with list data", async () => {
    window.localStorage.setItem("at.frontend.access", createToken());
    window.localStorage.setItem("at.frontend.refresh", "refresh-token");

    global.fetch
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: 1,
          username: "devadmin",
          email: "devadmin@example.com",
          first_name: "Dev",
          last_name: "Admin",
          is_staff: true
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse([
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
        ])
      );

    window.history.pushState({}, "", "/clients");
    render(<App />);

    expect(await screen.findByText(/ricardo torres/i)).toBeInTheDocument();
    expect(screen.getByText(/clientes registrados/i)).toBeInTheDocument();
    expect(screen.getByText(/ver perfil/i)).toBeInTheDocument();
  });
});

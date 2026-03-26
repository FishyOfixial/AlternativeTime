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

  it("restores a stored session and shows dashboard", async () => {
    window.localStorage.setItem("at.frontend.access", createToken());
    window.localStorage.setItem("at.frontend.refresh", "refresh-token");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: "devadmin",
        email: "devadmin@example.com",
        first_name: "Dev",
        last_name: "Admin",
        is_staff: true
      })
    });

    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/dashboard base dentro de la shell autenticada/i)
      ).toBeInTheDocument();
    });
  });
});

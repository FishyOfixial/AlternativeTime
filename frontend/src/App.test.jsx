import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App routing shell", () => {
  it("renders the login placeholder route", () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    expect(
      screen.getByText(/login placeholder con layout publico listo/i)
    ).toBeInTheDocument();
  });

  it("renders the authenticated dashboard shell", () => {
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    expect(
      screen.getByText(/dashboard base dentro de la shell autenticada/i)
    ).toBeInTheDocument();
  });
});

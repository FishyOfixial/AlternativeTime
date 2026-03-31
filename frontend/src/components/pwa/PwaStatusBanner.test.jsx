import { useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PwaStatusBanner from "./PwaStatusBanner";
import { PwaProvider, usePwaStatus } from "../../contexts/PwaContext";

const authState = {
  isAuthenticated: false
};

const swState = {
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: vi.fn(async () => undefined)
};

vi.mock("../../pwa/serviceWorker", () => ({
  useServiceWorkerRegistration: () => swState
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => authState
}));

function setNavigatorOnline(value) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value
  });
}

function setUserAgent(value) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value
  });
}

function renderBanner() {
  return render(
    <PwaProvider>
      <PwaStatusBanner />
    </PwaProvider>
  );
}

function FreshnessProbe() {
  const { setDatasetStatus } = usePwaStatus();

  useEffect(() => {
    setDatasetStatus("clients-list", {
      datasetId: "clients-list",
      label: "Clientes",
      source: "cache",
      savedAt: new Date("2026-03-31T12:15:00Z").getTime(),
      expiresAt: new Date("2026-03-31T12:35:00Z").getTime(),
      isStale: false
    });
  }, [setDatasetStatus]);

  return null;
}

describe("PwaStatusBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
    authState.isAuthenticated = false;
    setNavigatorOnline(true);
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    );
    swState.needRefresh = false;
    swState.offlineReady = false;
    swState.updateServiceWorker = vi.fn(async () => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an offline banner and a restored banner when connectivity changes", async () => {
    renderBanner();

    setNavigatorOnline(false);
    fireEvent(window, new Event("offline"));
    expect(await screen.findByText(/sin conexion/i)).toBeInTheDocument();

    setNavigatorOnline(true);
    fireEvent(window, new Event("online"));
    expect(await screen.findByText(/conexion restaurada/i)).toBeInTheDocument();
  });

  it("shows a native install call to action when beforeinstallprompt is available", async () => {
    renderBanner();

    const installEvent = new Event("beforeinstallprompt");
    installEvent.preventDefault = vi.fn();
    installEvent.prompt = vi.fn(async () => undefined);
    installEvent.userChoice = Promise.resolve({ outcome: "accepted" });

    fireEvent(window, installEvent);

    expect(await screen.findByText(/^instalar app$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^instalar$/i })).toBeInTheDocument();
  });

  it("shows the manual Apple install guide when native prompt is not available", async () => {
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
    );

    renderBanner();

    expect(await screen.findByText(/^agregar a pantalla de inicio$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ocultar/i })).toBeInTheDocument();
  });

  it("shows the update prompt when a new service worker is waiting", async () => {
    swState.needRefresh = true;

    renderBanner();

    expect(await screen.findByText(/nueva version disponible/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /actualizar ahora/i }));

    await waitFor(() => {
      expect(swState.updateServiceWorker).toHaveBeenCalledWith(true);
    });
  });

  it("shows freshness information when a supported view is using cached data", async () => {
    render(
      <PwaProvider>
        <FreshnessProbe />
        <PwaStatusBanner />
      </PwaProvider>
    );

    expect(await screen.findByText(/datos offline disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(/clientes muestra el ultimo snapshot local/i)).toBeInTheDocument();
  });

  it("hides connectivity and freshness banners five seconds after the session is active", async () => {
    vi.useFakeTimers();
    authState.isAuthenticated = true;

    render(
      <PwaProvider>
        <FreshnessProbe />
        <PwaStatusBanner />
      </PwaProvider>
    );

    expect(await screen.findByText(/datos offline disponibles/i)).toBeInTheDocument();

    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText(/datos offline disponibles/i)).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

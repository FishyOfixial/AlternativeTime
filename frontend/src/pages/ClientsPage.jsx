import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import ClientForm from "../components/clients/ClientForm";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { createClient, listClients } from "../services/clients";

function getClientInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatLastPurchase(value) {
  if (!value) {
    return "Sin compras";
  }

  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default function ClientsPage() {
  const { accessToken } = useAuth();
  const [clientsState, setClientsState] = useState({
    status: "loading",
    clients: [],
    error: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function loadClients() {
    try {
      const clients = await listClients(accessToken);
      setClientsState({
        status: "success",
        clients,
        error: ""
      });
    } catch {
      setClientsState({
        status: "error",
        clients: [],
        error: "No pudimos cargar los clientes desde la API."
      });
    }
  }

  useEffect(() => {
    loadClients();
  }, [accessToken]);

  const filteredClients = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return clientsState.clients.filter((client) => {
      const matchesTerm = normalizedTerm
        ? [client.name, client.phone, client.instagram_handle]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedTerm))
        : true;

      if (!matchesTerm) {
        return false;
      }

      if (filter === "recurring") {
        return client.purchases_count >= 2;
      }

      if (filter === "active") {
        return client.is_active;
      }

      return true;
    });
  }, [clientsState.clients, filter, searchTerm]);

  const recurringClients = clientsState.clients.filter(
    (client) => client.purchases_count >= 2
  ).length;

  async function handleCreateClient(payload) {
    setIsSaving(true);
    setSubmitError("");

    try {
      await createClient(accessToken, payload);
      setIsCreateOpen(false);
      await loadClients();
    } catch {
      setSubmitError("No pudimos crear el cliente. Revisa la informacion e intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex items-end justify-between gap-4">
        <button
          className="gold-button px-4 py-2 text-xs"
          onClick={() => setIsCreateOpen((current) => !current)}
          type="button"
        >
          + Nuevo cliente
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Clientes registrados
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {clientsState.clients.length}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Clientes activos
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {clientsState.clients.filter((client) => client.is_active).length}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Clientes recurrentes
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {recurringClients}
          </p>
          <p className="mt-1 text-xs text-[#b09a7e]">con 2+ compras</p>
        </article>
      </section>

      {isCreateOpen ? (
        <section className="panel-surface p-6">
          {submitError ? (
            <div className="mb-4">
              <ErrorState
                message={submitError}
                title="No pudimos guardar el cliente"
              />
            </div>
          ) : null}

          <ClientForm
            isSubmitting={isSaving}
            onSubmit={handleCreateClient}
            submitLabel="Crear cliente"
          />
        </section>
      ) : null}

      <section className="panel-surface p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfcd] px-4 py-4">
          <input
            className="min-w-[280px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre o telefono..."
            type="search"
            value={searchTerm}
          />

          <select
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            onChange={(event) => setFilter(event.target.value)}
            value={filter}
          >
            <option value="all">Todos los clientes</option>
            <option value="active">Clientes activos</option>
            <option value="recurring">Clientes recurrentes</option>
          </select>
        </div>

        {clientsState.status === "loading" ? (
          <div className="p-6">
            <LoadingState
              message="Estamos consultando la lista de clientes en el backend."
              title="Cargando clientes"
            />
          </div>
        ) : null}

        {clientsState.status === "error" ? (
          <div className="p-6">
            <ErrorState
              message={clientsState.error}
              title="No pudimos cargar clientes"
            />
          </div>
        ) : null}

        {clientsState.status === "success" && filteredClients.length === 0 ? (
          <div className="p-6">
            <EmptyState
              message="No hay clientes para este filtro o busqueda."
              title="Sin clientes para mostrar"
            />
          </div>
        ) : null}

        {clientsState.status === "success" && filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-[#fffdf9] text-left">
              <thead className="border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Telefono</th>
                  <th className="px-4 py-3">Instagram</th>
                  <th className="px-4 py-3">Compras</th>
                  <th className="px-4 py-3">Total gastado</th>
                  <th className="px-4 py-3">Ultima compra</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#f3efe6] font-semibold text-[#9e834d]">
                          {getClientInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-medium text-[#2a221b]">{client.name}</p>
                          {client.purchases_count >= 2 ? (
                            <span className="mt-1 inline-flex rounded-full bg-[#f6ebc9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c19b4d]">
                              VIP
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{client.phone}</td>
                    <td className="px-4 py-4">
                      {client.instagram_handle || "—"}
                    </td>
                    <td className="px-4 py-4">{client.purchases_count}</td>
                    <td className="px-4 py-4 font-semibold text-[#6ca07e]">
                      {formatCurrency(client.total_spent)}
                    </td>
                    <td className="px-4 py-4">{formatLastPurchase(client.last_purchase_at)}</td>
                    <td className="px-4 py-4">
                      <NavLink
                        className="rounded-full border border-[#ddcfba] px-3 py-2 text-xs text-[#7d6751] transition hover:bg-[#f3ecde]"
                        to={`/clients/${client.id}`}
                      >
                        Ver perfil →
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

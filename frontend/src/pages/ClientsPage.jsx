import { useEffect, useMemo, useState } from "react";
import ClientForm from "../components/clients/ClientForm";
import ClientsFilters from "../components/clients/ClientsFilters";
import ClientsHeader from "../components/clients/ClientsHeader";
import ClientsSummaryCards from "../components/clients/ClientsSummaryCards";
import ClientsTable from "../components/clients/ClientsTable";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { createClient, listClients } from "../services/clients";
import { formatCurrency, formatLastPurchase, getClientInitials } from "../utils/clients";

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
      <ClientsHeader onToggleCreate={() => setIsCreateOpen((current) => !current)} />

      <ClientsSummaryCards
        total={clientsState.clients.length}
        active={clientsState.clients.filter((client) => client.is_active).length}
        recurring={recurringClients}
      />

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
        <ClientsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
        />

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
          <ClientsTable
            clients={filteredClients}
            getClientInitials={getClientInitials}
            formatCurrency={formatCurrency}
            formatLastPurchase={formatLastPurchase}
          />
        ) : null}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import ClientFormModal from "../components/clients/ClientFormModal";
import ClientsFilters from "../components/clients/ClientsFilters";
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
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc"
  });

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

  const sortedClients = useMemo(() => {
    const items = [...filteredClients];
    const { field, direction } = sortConfig;
    const factor = direction === "asc" ? 1 : -1;

    function compareStrings(a, b) {
      return String(a || "").localeCompare(String(b || ""), "es", { sensitivity: "base" });
    }

    items.sort((left, right) => {
      if (field === "name") {
        return compareStrings(left.name, right.name) * factor;
      }
      if (field === "total_spent") {
        return (Number(left.total_spent || 0) - Number(right.total_spent || 0)) * factor;
      }
      if (field === "purchases_count") {
        return (Number(left.purchases_count || 0) - Number(right.purchases_count || 0)) * factor;
      }
      if (field === "last_purchase_at") {
        const leftDate = left.last_purchase_at ? new Date(left.last_purchase_at).getTime() : 0;
        const rightDate = right.last_purchase_at ? new Date(right.last_purchase_at).getTime() : 0;
        return (leftDate - rightDate) * factor;
      }
      return 0;
    });

    return items;
  }, [filteredClients, sortConfig]);

  function handleSort(field) {
    setSortConfig((current) => {
      if (current.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc"
        };
      }
      return {
        field,
        direction: "asc"
      };
    });
  }

  const recurringClients = clientsState.clients.filter((client) => client.purchases_count >= 2).length;

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

  function openCreateModal() {
    setSubmitError("");
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    setSubmitError("");
    setIsCreateOpen(false);
  }

  function toggleCreateModal() {
    if (isCreateOpen) {
      closeCreateModal();
      return;
    }
    openCreateModal();
  }

  return (
    <div className="space-y-6">
      <ClientsSummaryCards
        total={clientsState.clients.length}
        active={clientsState.clients.filter((client) => client.is_active).length}
        recurring={recurringClients}
      />

      <ClientFormModal
        isOpen={isCreateOpen}
        title="Crear cliente"
        submitLabel="Crear cliente"
        isSubmitting={isSaving}
        submitError={submitError}
        onSubmit={handleCreateClient}
        onClose={closeCreateModal}
      />

      <section className="panel-surface p-0">
        <ClientsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          onToggleCreate={toggleCreateModal}
          isCreateOpen={isCreateOpen}
        />

        {clientsState.status === "loading" ? (
          <div className="p-6">
            <LoadingState message="Estamos consultando la lista de clientes en el backend." title="Cargando clientes" />
          </div>
        ) : null}

        {clientsState.status === "error" ? (
          <div className="p-6">
            <ErrorState message={clientsState.error} networkAware title="No pudimos cargar clientes" />
          </div>
        ) : null}

        {clientsState.status === "success" && filteredClients.length === 0 ? (
          <div className="p-6">
            <EmptyState message="No hay clientes para este filtro o busqueda." title="Sin clientes para mostrar" />
          </div>
        ) : null}

        {clientsState.status === "success" && sortedClients.length > 0 ? (
          <ClientsTable
            clients={sortedClients}
            getClientInitials={getClientInitials}
            formatCurrency={formatCurrency}
            formatLastPurchase={formatLastPurchase}
            sortField={sortConfig.field}
            sortDirection={sortConfig.direction}
            onSort={handleSort}
          />
        ) : null}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ClientFormModal from "../components/clients/ClientFormModal";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import LayawayCreateForm from "../components/layaways/LayawayCreateForm";
import LayawayCreateModal from "../components/layaways/LayawayCreateModal";
import LayawayFilters from "../components/layaways/LayawayFilters";
import LayawayKpiCards from "../components/layaways/LayawayKpiCards";
import LayawaysTable from "../components/layaways/LayawaysTable";
import {
  buildInitialLayawayFilters,
  buildInitialLayawayForm
} from "../constants/layaways";
import { useAuth } from "../contexts/AuthContext";
import { createClient, listClients } from "../services/clients";
import { listInventory } from "../services/inventory";
import { createLayaway, listLayaways } from "../services/layaways";

function sortClientsAlphabetically(items) {
  return [...items].sort((left, right) =>
    String(left.name || "").localeCompare(String(right.name || ""), "es", {
      sensitivity: "base"
    })
  );
}

function parseValidationError(error) {
  const data = error?.data || {};
  const entries = Object.entries(data);
  if (!entries.length) {
    return { fields: {}, message: "No pudimos registrar el apartado." };
  }

  const fields = Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(" ") : String(value)
    ])
  );

  return {
    fields,
    message: fields[entries[0][0]] || "No pudimos registrar el apartado."
  };
}

function isDueSoon(layaway) {
  if (!layaway?.due_date || layaway.status !== "active" || layaway.is_overdue) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${layaway.due_date}T00:00:00`);
  const diffInDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
  return diffInDays >= 0 && diffInDays <= 7;
}

function matchesQuickView(layaway, quickView) {
  if (quickView === "active") {
    return layaway.status === "active";
  }
  if (quickView === "overdue") {
    return Boolean(layaway.is_overdue);
  }
  if (quickView === "due_soon") {
    return isDueSoon(layaway);
  }
  return true;
}

export default function LayawaysPage() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const [state, setState] = useState({ status: "loading", layaways: [], error: "" });
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState(buildInitialLayawayFilters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formValues, setFormValues] = useState(buildInitialLayawayForm);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientModalError, setClientModalError] = useState("");

  async function loadData() {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const [layawaysData, clientsData, inventoryData] = await Promise.all([
        listLayaways(accessToken),
        listClients(accessToken),
        listInventory(accessToken)
      ]);

      setState({ status: "success", layaways: layawaysData, error: "" });
      setClients(sortClientsAlphabetically(clientsData));
      setInventory(inventoryData.filter((item) => item.status === "available"));
    } catch {
      setState({
        status: "error",
        layaways: [],
        error: "No pudimos cargar apartados, clientes o inventario."
      });
    }
  }

  useEffect(() => {
    loadData();
  }, [accessToken]);

  useEffect(() => {
    const stateData = location.state || {};
    if (stateData.openCreate) {
      setIsCreateOpen(true);
      setFormValues((current) => ({
        ...current,
        product: stateData.prefillProductId || current.product,
        customer: stateData.prefillCustomerId || current.customer,
        agreed_price: stateData.prefillAgreedPrice || current.agreed_price
      }));
    }
  }, [location.state]);

  const filteredLayaways = useMemo(() => {
    const query = String(filters.query || "").trim().toLowerCase();

    return state.layaways.filter((layaway) => {
      if (filters.status !== "all" && layaway.status !== filters.status) {
        return false;
      }

      if (filters.customer && String(layaway.client) !== String(filters.customer)) {
        return false;
      }

      if (!matchesQuickView(layaway, filters.view)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        layaway.client_name,
        layaway.customer_name,
        layaway.product_label,
        layaway.product_code,
        String(layaway.id)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [filters, state.layaways]);

  const kpis = useMemo(() => {
    const active = filteredLayaways.filter((item) => item.status === "active");
    const completed = filteredLayaways.filter((item) => item.status === "completed");
    const overdue = active.filter((item) => item.is_overdue);
    const pendingBalance = active.reduce((acc, item) => acc + Number(item.balance_due || 0), 0);

    return { active: active.length, completed: completed.length, overdue: overdue.length, pendingBalance };
  }, [filteredLayaways]);

  const selectedClient = clients.find((client) => String(client.id) === String(formValues.customer));
  const selectedProduct = inventory.find((item) => String(item.id) === String(formValues.product));

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setSubmitError("");
    setFieldErrors({});
    setSuccessMessage("");
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setIsCreateOpen(false);
    setSubmitError("");
    setFieldErrors({});
    setFormValues(buildInitialLayawayForm());
  }

  function openClientModal() {
    setClientModalError("");
    setIsClientModalOpen(true);
  }

  function closeClientModal() {
    setClientModalError("");
    setIsClientModalOpen(false);
  }

  async function handleCreateClient(payload) {
    setIsCreatingClient(true);
    setClientModalError("");

    try {
      const newClient = await createClient(accessToken, payload);
      setClients((current) => sortClientsAlphabetically([...current, newClient]));
      setFormValues((current) => ({
        ...current,
        customer: String(newClient.id)
      }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.customer;
        return next;
      });
      setSuccessMessage(`Cliente creado: ${newClient.name}.`);
      setIsClientModalOpen(false);
    } catch {
      setClientModalError("No pudimos crear el cliente. Revisa la informacion e intenta de nuevo.");
    } finally {
      setIsCreatingClient(false);
    }
  }

  async function handleCreateLayaway(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      const clientId = formValues.customer ? Number(formValues.customer) : null;

      if (!clientId) {
        setFieldErrors({ customer: "Selecciona un cliente o crea uno nuevo." });
        setSubmitError("Selecciona un cliente para registrar el apartado.");
        setIsSaving(false);
        return;
      }

      await createLayaway(accessToken, {
        product: Number(formValues.product),
        client: clientId,
        customer_name: "",
        customer_contact: "",
        agreed_price: formValues.agreed_price,
        start_date: formValues.start_date,
        due_date: formValues.due_date,
        notes: formValues.notes.trim()
      });

      setSuccessMessage("Apartado registrado correctamente.");
      setIsCreateOpen(false);
      setFormValues(buildInitialLayawayForm());
      await loadData();
    } catch (error) {
      const parsed = parseValidationError(error);
      setFieldErrors(parsed.fields);
      setSubmitError(parsed.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">Apartados</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#2a221b]">Seguimiento de apartados</h1>
        </div>
        <button className="gold-button px-4 py-2 text-xs" onClick={openCreateForm} type="button">
          + Nuevo apartado
        </button>
      </section>

      {successMessage ? (
        <div className="rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {successMessage}
        </div>
      ) : null}

      <LayawayKpiCards kpis={kpis} />

      <section className="panel-surface p-0">
        <LayawayFilters clients={clients} filters={filters} onChange={handleFilterChange} />

        {state.status === "loading" ? (
          <div className="p-6">
            <LoadingState title="Cargando apartados" message="Consultando apartados, clientes e inventario." />
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="p-6">
            <ErrorState title="No pudimos cargar apartados" message={state.error} networkAware />
          </div>
        ) : null}

        {state.status === "success" && filteredLayaways.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin apartados para mostrar"
              message="Prueba con otro cliente, cambia la vista rapida o registra un nuevo apartado."
            />
          </div>
        ) : null}

        {state.status === "success" && filteredLayaways.length > 0 ? (
          <LayawaysTable layaways={filteredLayaways} />
        ) : null}
      </section>

      <LayawayCreateModal isOpen={isCreateOpen} onClose={closeCreateForm}>
        <LayawayCreateForm
          clientSuccess={successMessage.startsWith("Cliente creado") ? successMessage : ""}
          clients={clients}
          fieldErrors={fieldErrors}
          formValues={formValues}
          inventory={inventory}
          isSaving={isSaving}
          onChange={handleFormChange}
          onClose={closeCreateForm}
          onOpenCreateClient={openClientModal}
          onSubmit={handleCreateLayaway}
          selectedClient={selectedClient}
          selectedProduct={selectedProduct}
          submitError={submitError}
        />
      </LayawayCreateModal>

      <ClientFormModal
        isOpen={isClientModalOpen}
        title="Crear cliente"
        submitLabel="Crear cliente"
        defaultValues={{}}
        isSubmitting={isCreatingClient}
        submitError={clientModalError}
        onSubmit={handleCreateClient}
        onClose={closeClientModal}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import LayawayCreateForm from "../components/layaways/LayawayCreateForm";
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

function buildClientPayload(formValues) {
  const name = formValues.customer_name.trim();
  const contact = formValues.customer_contact.trim();
  let phone = "";
  let instagram_handle = "";

  if (contact.startsWith("@")) {
    instagram_handle = contact.slice(1);
  } else {
    phone = contact;
  }

  return {
    name,
    phone,
    instagram_handle,
    email: formValues.customer_email.trim(),
    address: formValues.customer_address.trim(),
    notes: formValues.customer_notes.trim()
  };
}

function validateNewClientInputs(formValues) {
  const errors = {};
  const name = formValues.customer_name.trim();
  const contact = formValues.customer_contact.trim();
  const email = formValues.customer_email.trim();

  if (!name) {
    errors.customer_name = "Debes capturar el nombre del cliente.";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customer_email = "El email no tiene un formato valido.";
  }
  if (contact && !contact.startsWith("@")) {
    const phoneLike = contact.replace(/[^\d]/g, "");
    if (phoneLike.length < 6) {
      errors.customer_contact = "El telefono debe tener al menos 6 digitos.";
    }
  }

  return errors;
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
  const [clientSuccess, setClientSuccess] = useState("");
  const [formValues, setFormValues] = useState(buildInitialLayawayForm);

  async function loadData() {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const [layawaysData, clientsData, inventoryData] = await Promise.all([
        listLayaways(accessToken, filters),
        listClients(accessToken),
        listInventory(accessToken)
      ]);
      setState({ status: "success", layaways: layawaysData, error: "" });
      setClients(clientsData);
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
  }, [accessToken, filters]);

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

  const kpis = useMemo(() => {
    const active = state.layaways.filter((item) => item.status === "active");
    const completed = state.layaways.filter((item) => item.status === "completed");
    const overdue = active.filter((item) => item.is_overdue);
    const pendingBalance = active.reduce((acc, item) => acc + Number(item.balance_due || 0), 0);

    return { active: active.length, completed: completed.length, overdue: overdue.length, pendingBalance };
  }, [state.layaways]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "customer" && value) {
        next.customer_name = "";
        next.customer_contact = "";
        next.customer_email = "";
        next.customer_address = "";
        next.customer_notes = "";
      }
      return next;
    });
  }

  async function handleCreateLayaway(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    setFieldErrors({});
    setClientSuccess("");

    try {
      let clientId = formValues.customer ? Number(formValues.customer) : null;

      if (!clientId) {
        const clientValidationErrors = validateNewClientInputs(formValues);
        if (Object.keys(clientValidationErrors).length > 0) {
          setFieldErrors(clientValidationErrors);
          setSubmitError("Completa los datos del nuevo cliente.");
          setIsSaving(false);
          return;
        }
        const newClient = await createClient(accessToken, buildClientPayload(formValues));
        clientId = newClient.id;
        setClientSuccess(`Cliente creado: ${newClient.name || formValues.customer_name.trim()}.`);
      }

      await createLayaway(accessToken, {
        product: Number(formValues.product),
        client: clientId,
        customer_name: "",
        customer_contact: "",
        agreed_price: formValues.agreed_price,
        start_date: formValues.start_date,
        due_date: formValues.due_date,
        notes: formValues.notes
      });

      setIsCreateOpen(false);
      setFormValues(buildInitialLayawayForm());
      await loadData();
    } catch (error) {
      if (error.message === "VALIDATION_ERROR" && error.data) {
        setFieldErrors(error.data);
        setSubmitError("Revisa los campos marcados.");
      } else {
        setSubmitError("No pudimos registrar el apartado.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="mt-2 text-sm text-[#8a775f]">
            Gestiona apartados activos, vencimientos y abonos del cliente.
          </p>
        </div>
        <button
          className="gold-button px-4 py-2 text-xs"
          onClick={() => setIsCreateOpen((current) => !current)}
          type="button"
        >
          {isCreateOpen ? "Cerrar" : "+ Nuevo apartado"}
        </button>
      </section>

      <LayawayKpiCards kpis={kpis} />

      {isCreateOpen ? (
        <LayawayCreateForm
          clientSuccess={clientSuccess}
          clients={clients}
          fieldErrors={fieldErrors}
          formValues={formValues}
          inventory={inventory}
          isSaving={isSaving}
          onChange={handleFormChange}
          onSubmit={handleCreateLayaway}
          submitError={submitError}
        />
      ) : null}

      <section className="panel-surface p-0">
        <LayawayFilters clients={clients} filters={filters} onChange={handleFilterChange} />

        {state.status === "loading" ? (
          <div className="p-6">
            <LoadingState title="Cargando apartados" message="Consultando apartados, clientes e inventario." />
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="p-6">
            <ErrorState title="No pudimos cargar apartados" message={state.error} />
          </div>
        ) : null}

        {state.status === "success" && state.layaways.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Sin apartados" message="Todavia no hay apartados registrados para este filtro." />
          </div>
        ) : null}

        {state.status === "success" && state.layaways.length > 0 ? (
          <LayawaysTable layaways={state.layaways} />
        ) : null}
      </section>
    </div>
  );
}

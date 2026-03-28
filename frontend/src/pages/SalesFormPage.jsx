import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import SaleCustomerSection from "../components/sales/SaleCustomerSection";
import SaleHoldPanel from "../components/sales/SaleHoldPanel";
import SalePaymentSection from "../components/sales/SalePaymentSection";
import SaleProductSection from "../components/sales/SaleProductSection";
import SaleSummaryPanel from "../components/sales/SaleSummaryPanel";
import SaleTransactionSection from "../components/sales/SaleTransactionSection";
import SalesFormHeader from "../components/sales/SalesFormHeader";
import SalesInfoAlert from "../components/sales/SalesInfoAlert";
import { useAuth } from "../contexts/AuthContext";
import { buildInitialSaleForm, channelOptions, paymentOptions } from "../constants/sales";
import { createClient, listClients } from "../services/clients";
import { listInventory } from "../services/inventory";
import { createSale } from "../services/sales";
import { formatCurrency } from "../utils/sales";

export default function SalesFormPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inventoryState, setInventoryState] = useState({
    status: "loading",
    items: []
  });
  const [clientsState, setClientsState] = useState({
    status: "loading",
    items: []
  });
  const [formValues, setFormValues] = useState(buildInitialSaleForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [clientSuccess, setClientSuccess] = useState("");
  const preselectedCustomer = searchParams.get("customer");

  useEffect(() => {
    async function loadInventory() {
      try {
        const items = await listInventory(accessToken, { status: "available" });
        setInventoryState({
          status: "success",
          items: items.filter((item) => item.is_active)
        });
      } catch {
        setInventoryState({ status: "error", items: [] });
      }
    }

    async function loadClients() {
      try {
        const items = await listClients(accessToken);
        setClientsState({ status: "success", items });
      } catch {
        setClientsState({ status: "error", items: [] });
      }
    }

    loadInventory();
    loadClients();
  }, [accessToken]);

  useEffect(() => {
    if (!preselectedCustomer || clientsState.status !== "success") {
      return;
    }

    const exists = clientsState.items.some(
      (client) => String(client.id) === String(preselectedCustomer)
    );
    if (!exists) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      customer: String(preselectedCustomer),
      customer_name: "",
      customer_contact: "",
      customer_email: "",
      customer_address: "",
      customer_notes: ""
    }));
  }, [clientsState.items, clientsState.status, preselectedCustomer]);

  const selectedItem = useMemo(
    () => inventoryState.items.find((item) => String(item.id) === String(formValues.product)),
    [inventoryState.items, formValues.product]
  );
  const selectedClient = useMemo(
    () =>
      clientsState.items.find((client) => String(client.id) === String(formValues.customer)),
    [clientsState.items, formValues.customer]
  );

  const costSnapshot = Number(selectedItem?.total_cost || 0);
  const amountPaid = Number(formValues.amount_paid || 0);
  const extras = Number(formValues.extras || 0);
  const shipping = Number(formValues.sale_shipping_cost || 0);
  const profit = amountPaid - costSnapshot - extras - shipping;
  const margin = costSnapshot > 0 ? (profit / costSnapshot) * 100 : 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "product") {
        const nextItem = inventoryState.items.find((item) => String(item.id) === value);
        next.amount_paid = nextItem ? String(nextItem.price || "") : "";
      }
      if (name === "customer" && value) {
        next.customer_name = "";
        next.customer_contact = "";
      }
      return next;
    });
  }

  function handlePaymentChange(value) {
    setFormValues((current) => ({ ...current, payment_method: value }));
  }

  function handleRegisterLayaway() {
    if (!formValues.product) {
      return;
    }
    navigate("/layaways", {
      state: {
        openCreate: true,
        prefillProductId: String(formValues.product),
        prefillAgreedPrice: formValues.amount_paid || ""
      }
    });
  }

  function buildClientPayload() {
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

  function parseValidationError(error) {
    const data = error?.data || {};
    const entries = Object.entries(data);
    if (!entries.length) {
      return { fields: {}, message: "No pudimos registrar la venta." };
    }

    const fields = Object.fromEntries(
      entries.map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(" ") : String(value)
      ])
    );
    const message = fields[entries[0][0]] || "No pudimos registrar la venta.";
    return { fields, message };
  }

  function validateNewClientInputs() {
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setFieldErrors({});
    setClientSuccess("");

    try {
      let customerId = formValues.customer ? Number(formValues.customer) : null;

      if (!customerId) {
        const validationErrors = validateNewClientInputs();
        if (Object.keys(validationErrors).length > 0) {
          setFieldErrors(validationErrors);
          setSubmitError("Completa los datos del nuevo cliente.");
          setIsSubmitting(false);
          return;
        }

        const newClient = await createClient(accessToken, buildClientPayload());
        customerId = newClient.id;
        setClientSuccess(`Cliente creado: ${newClient.name || formValues.customer_name.trim()}.`);
      }

      await createSale(accessToken, {
        customer: customerId,
        product: Number(formValues.product),
        customer_name: "",
        customer_contact: "",
        sale_date: formValues.sale_date,
        payment_method: formValues.payment_method,
        sales_channel: formValues.sales_channel,
        amount_paid: formValues.amount_paid,
        extras: formValues.extras,
        sale_shipping_cost: formValues.sale_shipping_cost,
        notes: formValues.notes.trim()
      });
      navigate("/sales", {
        replace: true,
        state: { success: "Venta registrada correctamente." }
      });
    } catch (error) {
      if (error?.data) {
        const parsed = parseValidationError(error);
        setFieldErrors(parsed.fields);
        setSubmitError(parsed.message);
      } else {
        setSubmitError("No pudimos registrar la venta. Revisa los datos e intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (inventoryState.status === "loading") {
    return <LoadingState title="Cargando inventario" message="Estamos consultando los relojes disponibles." />;
  }

  if (inventoryState.status === "error") {
    return (
      <ErrorState
        title="Inventario no disponible"
        message="No pudimos cargar los relojes disponibles para venta."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SalesFormHeader />

      <SalesInfoAlert />

      {clientSuccess ? (
        <div className="rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {clientSuccess}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
          {submitError}
        </div>
      ) : null}

      <form className="grid gap-6 xl:grid-cols-[1.2fr_0.5fr]" id="sales-form" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <SaleProductSection
            inventoryItems={inventoryState.items}
            selectedItem={selectedItem}
            productValue={formValues.product}
            onChange={handleChange}
            formatCurrency={formatCurrency}
            fieldErrors={fieldErrors}
          />

          <SaleCustomerSection
            clients={clientsState.items}
            selectedClient={selectedClient}
            formValues={formValues}
            onChange={handleChange}
            fieldErrors={fieldErrors}
          />

          <SaleTransactionSection
            formValues={formValues}
            onChange={handleChange}
            fieldErrors={fieldErrors}
            channelOptions={channelOptions}
          />

          <SalePaymentSection
            paymentOptions={paymentOptions}
            selectedMethod={formValues.payment_method}
            onSelect={handlePaymentChange}
          />
        </div>

        <div className="space-y-5">
          <SaleSummaryPanel
            amountPaid={amountPaid}
            costSnapshot={costSnapshot}
            extras={extras}
            shipping={shipping}
            profit={profit}
            margin={margin}
            formatCurrency={formatCurrency}
            isSubmitting={isSubmitting}
            canSubmit={Boolean(formValues.product && formValues.amount_paid)}
          />

          <SaleHoldPanel disabled={!formValues.product} onRegister={handleRegisterLayaway} />
        </div>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { createClient, listClients } from "../services/clients";
import { listInventory } from "../services/inventory";
import { createSale } from "../services/sales";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function buildInitialSaleForm() {
  return {
    product: "",
    customer: "",
    customer_name: "",
    customer_contact: "",
    customer_email: "",
    customer_address: "",
    customer_notes: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    sales_channel: "marketplace",
    amount_paid: "",
    extras: "0.00",
    sale_shipping_cost: "0.00",
    notes: ""
  };
}

const paymentOptions = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta / MSI" },
  { value: "msi", label: "MSI" },
  { value: "consignment", label: "Consigna" }
];

const channelOptions = [
  { value: "marketplace", label: "Marketplace" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "direct", label: "Directo" },
  { value: "other", label: "Otro" }
];

export default function SalesFormPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
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

  const selectedItem = useMemo(
    () => inventoryState.items.find((item) => String(item.id) === String(formValues.product)),
    [inventoryState.items, formValues.product]
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
      if (name === "customer") {
        if (value) {
          next.customer_name = "";
          next.customer_contact = "";
        }
      }
      return next;
    });
  }

  function handlePaymentChange(value) {
    setFormValues((current) => ({ ...current, payment_method: value }));
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
    return (
      <LoadingState
        title="Cargando inventario"
        message="Estamos consultando los relojes disponibles."
      />
    );
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
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
            Registrar venta
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <NavLink
            className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751]"
            to="/sales"
          >
            Cancelar
          </NavLink>
        </div>
      </section>

      <div className="rounded-xl border border-[#cfe0ef] bg-[#eef5fe] px-4 py-3 text-sm text-[#5f7da2]">
        Al confirmar, el estado del reloj cambiara automaticamente a Vendido y se calculara la ganancia.
      </div>

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
          <section className="panel-surface p-5">
            <h2 className="font-serif text-2xl text-[#2a221b]">Reloj a vender</h2>
            <div className="mt-4">
              <select
                className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
                name="product"
                onChange={handleChange}
                required
                value={formValues.product}
              >
                <option value="">Selecciona un reloj</option>
                {inventoryState.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.display_name} • {item.product_id} • {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
              {fieldErrors.product ? (
                <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.product}</p>
              ) : null}
            </div>

            {selectedItem ? (
              <div className="mt-4 rounded-xl border border-[#e4d7c3] bg-[#fffaf1] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eee5d5] text-2xl">?</div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#2a221b]">
                      {selectedItem.product_id} • {selectedItem.display_name}
                    </p>
                    <p className="mt-1 text-xs text-[#8c7963]">
                      Precio lista: {formatCurrency(selectedItem.price)} • Costo: {formatCurrency(selectedItem.total_cost)} • Condicion: {selectedItem.condition_score}
                    </p>
                  </div>
                  <span className="rounded-md bg-[#edf7f1] px-2 py-1 text-xs text-[#7da281]">
                    Disponible
                  </span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="panel-surface p-5">
            <h2 className="font-serif text-2xl text-[#2a221b]">Datos del cliente</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cliente existente
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="customer"
                  onChange={handleChange}
                  value={formValues.customer}
                >
                  <option value="">Crear nuevo cliente</option>
                  {clientsState.items.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.phone || "sin telefono"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formValues.customer ? (
              <div className="mt-5 rounded-xl border border-[#e4d7c3] bg-[#fffaf1] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cliente seleccionado
                </p>
                <p className="mt-2 font-semibold text-[#2a221b]">
                  {clientsState.items.find((client) => String(client.id) === String(formValues.customer))?.name ||
                    "Cliente"}
                </p>
                <p className="mt-1 text-sm text-[#8c7963]">
                  {clientsState.items.find((client) => String(client.id) === String(formValues.customer))?.phone ||
                    "Sin telefono"}{" "}
                  ·{" "}
                  {clientsState.items.find((client) => String(client.id) === String(formValues.customer))?.instagram_handle ||
                    "Sin IG"}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Datos del nuevo cliente
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Nombre del cliente
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="customer_name"
                      onChange={handleChange}
                      placeholder="Nombre del comprador"
                      value={formValues.customer_name}
                    />
                    {fieldErrors.customer_name ? (
                      <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_name}</p>
                    ) : null}
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Contacto (telefono / Instagram)
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="customer_contact"
                      onChange={handleChange}
                      placeholder="33 1234 5678 / @usuario"
                      value={formValues.customer_contact}
                    />
                    {fieldErrors.customer_contact ? (
                      <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_contact}</p>
                    ) : null}
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Email
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="customer_email"
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      type="email"
                      value={formValues.customer_email}
                    />
                    {fieldErrors.customer_email ? (
                      <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_email}</p>
                    ) : null}
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Direccion
                    </span>
                    <input
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="customer_address"
                      onChange={handleChange}
                      placeholder="Ciudad / colonia / referencia"
                      value={formValues.customer_address}
                    />
                  </label>
                  <label className="md:col-span-2 block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Notas del cliente
                    </span>
                    <textarea
                      className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                      name="customer_notes"
                      onChange={handleChange}
                      placeholder="Preferencias, referencias, etc."
                      value={formValues.customer_notes}
                    />
                  </label>
                </div>
              </div>
            )}
          </section>

          <section className="panel-surface p-5">
            <h2 className="font-serif text-2xl text-[#2a221b]">Datos de la transaccion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Monto cobrado
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  min="0"
                  name="amount_paid"
                  onChange={handleChange}
                  step="0.01"
                  type="number"
                  value={formValues.amount_paid}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Canal de venta
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="sales_channel"
                  onChange={handleChange}
                  value={formValues.sales_channel}
                >
                  {channelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Fecha de venta
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="sale_date"
                  onChange={handleChange}
                  type="date"
                  value={formValues.sale_date}
                />
                {fieldErrors.sale_date ? (
                  <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.sale_date}</p>
                ) : null}
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Extras (accesorios, caja...)
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  min="0"
                  name="extras"
                  onChange={handleChange}
                  step="0.01"
                  type="number"
                  value={formValues.extras}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Costo de envio al cliente
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  min="0"
                  name="sale_shipping_cost"
                  onChange={handleChange}
                  step="0.01"
                  type="number"
                  value={formValues.sale_shipping_cost}
                />
              </label>
              <label className="md:col-span-3 block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Notas de la venta
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="notes"
                  onChange={handleChange}
                  value={formValues.notes}
                />
              </label>
            </div>
          </section>

          <section className="panel-surface p-5">
            <h2 className="font-serif text-2xl text-[#2a221b]">Metodo de pago</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    formValues.payment_method === option.value
                      ? "border-[#b69556] bg-[#fff5dd] text-[#2a221b]"
                      : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
                  }`}
                  onClick={() => handlePaymentChange(option.value)}
                  type="button"
                >
                  <span>{option.label}</span>
                  {formValues.payment_method === option.value ? (
                    <span className="text-[#b69556]">?</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b09a7e]">Resumen de la venta</p>
            <div className="mt-4 space-y-3 text-sm text-[#7d6751]">
              <div className="flex items-center justify-between">
                <span>Precio cobrado</span>
                <span>{formatCurrency(amountPaid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Costo del reloj</span>
                <span>-{formatCurrency(costSnapshot)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Extras</span>
                <span>{formatCurrency(extras)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Costo envio</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-[#e5d7c2] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl text-[#2a221b]">Ganancia</span>
                <span className="font-serif text-3xl text-[#5f8f66]">
                  {formatCurrency(profit)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#8c7963]">
                Margen: {margin.toFixed(1)}%
              </p>
            </div>
            <button
              className="gold-button mt-5 w-full"
              disabled={isSubmitting || !formValues.product || !formValues.amount_paid}
              type="submit"
            >
              {isSubmitting ? "Confirmando venta..." : "Confirmar venta"}
            </button>
          </section>

          <section className="panel-surface p-5">
            <p className="font-serif text-xl text-[#2a221b]">¿El cliente pagara en parcialidades?</p>
            <button
              className="mt-4 w-full rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-3 text-sm text-[#8d5b4d]"
              disabled
              type="button"
            >
              Registrar como apartado
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ClientForm from "../components/clients/ClientForm";
import EmptyState from "../components/feedback/EmptyState";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { deleteClient, getClient, updateClient } from "../services/clients";
import { listInventory } from "../services/inventory";
import { createSale } from "../services/sales";

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

function formatMonthYear(value) {
  if (!value) {
    return "Sin compras";
  }

  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function buildInitialSaleForm() {
  return {
    product: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    sales_channel: "instagram",
    amount_paid: "",
    extras: "0.00",
    sale_shipping_cost: "0.00",
    notes: ""
  };
}

export default function ClientDetailPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [clientState, setClientState] = useState({
    status: "loading",
    client: null
  });
  const [inventoryState, setInventoryState] = useState({
    status: "loading",
    items: []
  });
  const [submitError, setSubmitError] = useState("");
  const [saleError, setSaleError] = useState("");
  const [saleSuccess, setSaleSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [saleForm, setSaleForm] = useState(buildInitialSaleForm);

  async function loadClient() {
    try {
      const client = await getClient(accessToken, clientId);
      setClientState({
        status: "success",
        client
      });
    } catch {
      setClientState({
        status: "error",
        client: null
      });
    }
  }

  async function loadInventory() {
    try {
      const items = await listInventory(accessToken);
      setInventoryState({
        status: "success",
        items: items.filter((item) => item.is_active && item.status === "available")
      });
    } catch {
      setInventoryState({
        status: "error",
        items: []
      });
    }
  }

  useEffect(() => {
    loadClient();
    loadInventory();
  }, [accessToken, clientId]);

  const client = clientState.client;
  const selectedItem = useMemo(
    () => inventoryState.items.find((item) => String(item.id) === String(saleForm.product)),
    [inventoryState.items, saleForm.product]
  );

  const averageTicket = useMemo(() => {
    if (!client || !client.purchases_count) {
      return 0;
    }

    return Number(client.total_spent || 0) / client.purchases_count;
  }, [client]);

  function handleSaleFormChange(event) {
    const { name, value } = event.target;
    setSaleForm((current) => {
      const next = {
        ...current,
        [name]: value
      };

      if (name === "product") {
        const nextItem = inventoryState.items.find((item) => String(item.id) === value);
        next.amount_paid = nextItem ? String(nextItem.price || "") : "";
      }

      return next;
    });
  }

  async function handleUpdate(payload) {
    setIsSaving(true);
    setSubmitError("");

    try {
      const updatedClient = await updateClient(accessToken, clientId, payload);
      setClientState({
        status: "success",
        client: updatedClient
      });
      setIsEditOpen(false);
    } catch {
      setSubmitError("No pudimos actualizar el cliente. Revisa los datos e intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setSubmitError("");

    try {
      await deleteClient(accessToken, clientId);
      navigate("/clients", { replace: true });
    } catch {
      setSubmitError("No pudimos eliminar el cliente. Intenta de nuevo.");
      setIsDeleting(false);
    }
  }

  async function handleCreateSale(event) {
    event.preventDefault();
    setIsCreatingSale(true);
    setSaleError("");
    setSaleSuccess("");

    try {
      await createSale(accessToken, {
        customer: Number(clientId),
        product: Number(saleForm.product),
        sale_date: saleForm.sale_date,
        payment_method: saleForm.payment_method,
        sales_channel: saleForm.sales_channel,
        amount_paid: saleForm.amount_paid,
        extras: saleForm.extras,
        sale_shipping_cost: saleForm.sale_shipping_cost,
        notes: saleForm.notes.trim()
      });
      await loadClient();
      await loadInventory();
      setSaleForm(buildInitialSaleForm());
      setSaleSuccess("Venta registrada correctamente para este cliente.");
      setIsSaleFormOpen(false);
    } catch {
      setSaleError("No pudimos registrar la venta. Revisa los datos de la operacion.");
    } finally {
      setIsCreatingSale(false);
    }
  }

  if (clientState.status === "loading") {
    return (
      <LoadingState
        message="Estamos consultando el detalle del cliente en la API."
        title="Cargando perfil"
      />
    );
  }

  if (clientState.status === "error" || !client) {
    return (
      <ErrorState
        message="No encontramos el cliente solicitado o la API no respondio como esperabamos."
        title="Cliente no disponible"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#edf4ee] font-semibold text-2xl text-[#6d9b85]">
            {getClientInitials(client.name)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl tracking-tight text-[#2a221b]">
                {client.name}
              </h1>
              {client.purchases_count >= 2 ? (
                <span className="rounded-full bg-[#f6ebc9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c19b4d]">
                  VIP
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#7f6d59]">
              <span>{client.phone}</span>
              <span>·</span>
              <span>{client.instagram_handle || "Sin IG"}</span>
              <span>·</span>
              <span>Cliente desde {formatMonthYear(client.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
            onClick={() => setIsEditOpen((current) => !current)}
            type="button"
          >
            {isEditOpen ? "Cerrar" : "Editar"}
          </button>
          <NavLink
            className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
            to="/clients"
          >
            Volver
          </NavLink>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Compras</p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {client.purchases_count}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Total gastado
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#5f8f66]">
            {formatCurrency(client.total_spent)}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Ticket prom.
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {formatCurrency(averageTicket)}
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
            Ultima compra
          </p>
          <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
            {formatMonthYear(client.last_purchase_at)}
          </p>
        </article>
      </section>

      {isEditOpen ? (
        <section className="panel-surface p-6">
          {submitError ? (
            <div className="mb-4">
              <ErrorState
                message={submitError}
                title="No pudimos guardar los cambios"
              />
            </div>
          ) : null}

          <ClientForm
            defaultValues={client}
            isSubmitting={isSaving}
            onSubmit={handleUpdate}
            submitLabel="Guardar cambios"
          />
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr]">
        <div className="panel-surface p-6">
          <p className="font-serif text-2xl text-[#2a221b]">Historial de compras</p>
          <div className="mt-4 space-y-4 border-t border-[#eadfcd] pt-4">
            {client.purchase_history?.length ? (
              client.purchase_history.map((purchase) => (
                <div key={purchase.sale_id} className="border-b border-[#efe4d1] pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#3b3024]">
                        {purchase.item_names.join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-[#9b8974]">
                        {formatDate(purchase.created_at)} · {client.instagram_handle || "Sin IG"}
                      </p>
                    </div>
                    <p className="font-semibold text-[#6ca07e]">
                      {formatCurrency(purchase.total)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                message="Todavia no hay ventas ligadas a este cliente."
                title="Sin historial de compras"
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <section className="panel-surface p-6">
            <p className="font-serif text-2xl text-[#2a221b]">Notas del cliente</p>
            <div className="mt-4 rounded-xl border border-[#ddcfba] bg-[#fffdf9] p-4 text-sm leading-6 text-[#5d5144]">
              {client.notes || "Sin notas registradas para este cliente."}
            </div>
          </section>

          <section className="panel-surface p-6">
            <p className="font-serif text-2xl text-[#2a221b]">Acciones</p>

            {saleSuccess ? (
              <p className="mt-4 rounded-md border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
                {saleSuccess}
              </p>
            ) : null}

            {saleError ? (
              <div className="mt-4">
                <ErrorState
                  message={saleError}
                  title="No pudimos registrar la venta"
                />
              </div>
            ) : null}

            <button
              className="gold-button mt-4 w-full"
              onClick={() => setIsSaleFormOpen((current) => !current)}
              type="button"
            >
              {isSaleFormOpen ? "Cerrar venta" : "+ Registrar nueva venta"}
            </button>

            {isSaleFormOpen ? (
              <form className="mt-4 space-y-4" onSubmit={handleCreateSale}>
                <div className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Reloj
                    </span>
                    <select
                      className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
                      name="product"
                      onChange={handleSaleFormChange}
                      required
                      value={saleForm.product}
                    >
                      <option value="">Selecciona un reloj</option>
                      {inventoryState.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.display_name} · {item.product_id} · {formatCurrency(item.price)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Fecha de venta
                      </span>
                      <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" name="sale_date" onChange={handleSaleFormChange} type="date" value={saleForm.sale_date} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Metodo de pago
                      </span>
                      <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" name="payment_method" onChange={handleSaleFormChange} value={saleForm.payment_method}>
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia</option>
                        <option value="card">Tarjeta</option>
                        <option value="msi">MSI</option>
                        <option value="consignment">Consigna</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Canal de venta
                      </span>
                      <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" name="sales_channel" onChange={handleSaleFormChange} value={saleForm.sales_channel}>
                        <option value="marketplace">Marketplace</option>
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="direct">Directo</option>
                        <option value="other">Otro</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Monto pagado
                      </span>
                      <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" min="0" name="amount_paid" onChange={handleSaleFormChange} step="0.01" type="number" value={saleForm.amount_paid} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Extras
                      </span>
                      <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" min="0" name="extras" onChange={handleSaleFormChange} step="0.01" type="number" value={saleForm.extras} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Costo de envio
                      </span>
                      <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" min="0" name="sale_shipping_cost" onChange={handleSaleFormChange} step="0.01" type="number" value={saleForm.sale_shipping_cost} />
                    </label>
                    <label className="md:col-span-2 block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                        Notas
                      </span>
                      <textarea className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]" name="notes" onChange={handleSaleFormChange} value={saleForm.notes} />
                    </label>
                  </div>

                  {selectedItem ? (
                    <div className="mt-4 rounded-lg border border-[#e4d7c3] bg-[#fffaf1] px-4 py-3 text-sm text-[#7d6751]">
                      {selectedItem.display_name} · {selectedItem.product_id} · precio lista {formatCurrency(selectedItem.price)}
                    </div>
                  ) : null}
                </div>

                <button
                  className="gold-button w-full"
                  disabled={
                    isCreatingSale ||
                    inventoryState.status === "error" ||
                    inventoryState.items.length === 0 ||
                    !saleForm.product ||
                    !saleForm.amount_paid
                  }
                  type="submit"
                >
                  {isCreatingSale ? "Registrando venta..." : "Registrar venta"}
                </button>
              </form>
            ) : null}

            <button
              className="mt-4 w-full rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-3 text-sm text-[#8d5b4d] transition hover:bg-[#fbe9e4]"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "Eliminando..." : "Eliminar cliente"}
            </button>
          </section>
        </div>
      </section>
    </div>
  );
}

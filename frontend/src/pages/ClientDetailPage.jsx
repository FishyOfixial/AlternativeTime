import { useEffect, useMemo, useState } from "react";
import ClientActionsPanel from "../components/clients/ClientActionsPanel";
import ClientDetailHeader from "../components/clients/ClientDetailHeader";
import ClientDetailStats from "../components/clients/ClientDetailStats";
import ClientForm from "../components/clients/ClientForm";
import ClientNotesCard from "../components/clients/ClientNotesCard";
import ClientPurchaseHistory from "../components/clients/ClientPurchaseHistory";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { deleteClient, getClient, updateClient } from "../services/clients";
import { listInventory } from "../services/inventory";
import { createSale } from "../services/sales";
import { buildInitialClientSaleForm } from "../utils/clients";
import { useNavigate, useParams } from "react-router-dom";

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
  const [saleForm, setSaleForm] = useState(buildInitialClientSaleForm);

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
      setSaleForm(buildInitialClientSaleForm());
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
      <ClientDetailHeader
        client={client}
        isEditOpen={isEditOpen}
        onToggleEdit={() => setIsEditOpen((current) => !current)}
      />

      <ClientDetailStats averageTicket={averageTicket} client={client} />

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
        <ClientPurchaseHistory
          instagramHandle={client.instagram_handle}
          purchases={client.purchase_history}
        />

        <div className="space-y-5">
          <ClientNotesCard notes={client.notes} />

          <ClientActionsPanel
            inventoryState={inventoryState}
            isCreatingSale={isCreatingSale}
            isDeleting={isDeleting}
            isSaleFormOpen={isSaleFormOpen}
            onCreateSale={handleCreateSale}
            onDelete={handleDelete}
            onSaleFormChange={handleSaleFormChange}
            onToggleSaleForm={() => setIsSaleFormOpen((current) => !current)}
            saleError={saleError}
            saleForm={saleForm}
            saleSuccess={saleSuccess}
            selectedItem={selectedItem}
          />
        </div>
      </section>
    </div>
  );
}

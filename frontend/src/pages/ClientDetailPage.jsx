import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientActionsPanel from "../components/clients/ClientActionsPanel";
import ClientDetailHeader from "../components/clients/ClientDetailHeader";
import ClientDetailStats from "../components/clients/ClientDetailStats";
import ClientFormModal from "../components/clients/ClientFormModal";
import ClientNotesCard from "../components/clients/ClientNotesCard";
import ClientPurchaseHistory from "../components/clients/ClientPurchaseHistory";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { deleteClient, getClient, updateClient } from "../services/clients";

export default function ClientDetailPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [clientState, setClientState] = useState({
    status: "loading",
    client: null
  });
  const [updateError, setUpdateError] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  useEffect(() => {
    loadClient();
  }, [accessToken, clientId]);

  const client = clientState.client;

  const averageTicket = useMemo(() => {
    if (!client || !client.purchases_count) {
      return 0;
    }

    return Number(client.total_spent || 0) / client.purchases_count;
  }, [client]);

  async function handleUpdate(payload) {
    setIsSaving(true);
    setUpdateError("");

    try {
      const updatedClient = await updateClient(accessToken, clientId, payload);
      setClientState({
        status: "success",
        client: updatedClient
      });
      setIsEditOpen(false);
    } catch {
      setUpdateError("No pudimos actualizar el cliente. Revisa los datos e intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  function closeEditModal() {
    setUpdateError("");
    setIsEditOpen(false);
  }

  function toggleEditModal() {
    if (isEditOpen) {
      closeEditModal();
      return;
    }
    setUpdateError("");
    setIsEditOpen(true);
  }

  async function handleDeactivate() {
    setIsDeleting(true);
    setDeactivateError("");

    try {
      await deleteClient(accessToken, clientId);
      navigate("/clients", { replace: true });
    } catch {
      setDeactivateError("No pudimos inactivar el cliente. Intenta de nuevo.");
      setIsDeleting(false);
    }
  }

  if (clientState.status === "loading") {
    return <LoadingState message="Estamos consultando el detalle del cliente en la API." title="Cargando perfil" />;
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
        onToggleEdit={toggleEditModal}
      />

      <ClientDetailStats averageTicket={averageTicket} client={client} />

      <ClientFormModal
        defaultValues={client}
        isOpen={isEditOpen}
        isSubmitting={isSaving}
        onClose={closeEditModal}
        onSubmit={handleUpdate}
        submitError={updateError}
        submitLabel="Guardar cambios"
        title="Editar cliente"
      />

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr]">
        <ClientPurchaseHistory instagramHandle={client.instagram_handle} purchases={client.purchase_history} />

        <div className="space-y-5">
          <ClientNotesCard notes={client.notes} />

          <ClientActionsPanel
            clientId={clientId}
            deactivateError={deactivateError}
            isDeleting={isDeleting}
            onDeactivate={handleDeactivate}
          />
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import InventoryForm from "../components/inventory/InventoryForm";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItem,
  listInventory,
  updateInventoryItem
} from "../services/inventory";

export default function InventoryFormPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEdit = Boolean(itemId);
  const [pageState, setPageState] = useState({
    status: isEdit ? "loading" : "ready",
    item: null
  });
  const [existingItems, setExistingItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadBase() {
      try {
        const items = await listInventory(accessToken);
        setExistingItems(items);
      } catch {
        setExistingItems([]);
      }
    }

    loadBase();
  }, [accessToken]);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    async function loadItem() {
      try {
        const item = await getInventoryItem(accessToken, itemId);
        setPageState({
          status: "ready",
          item
        });
      } catch {
        setPageState({
          status: "error",
          item: null
        });
      }
    }

    loadItem();
  }, [accessToken, isEdit, itemId]);

  const title = useMemo(() => (isEdit ? "Editar reloj" : "Nuevo producto"), [isEdit]);

  async function handleSubmit(payload) {
    setIsSaving(true);
    setSubmitError("");

    try {
      if (isEdit) {
        await updateInventoryItem(accessToken, itemId, payload);
      } else {
        await createInventoryItem(accessToken, payload);
      }

      navigate("/inventory", { replace: true });
    } catch {
      setSubmitError("No pudimos guardar el reloj. Revisa la informacion e intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) {
      return;
    }

    setIsDeleting(true);
    setSubmitError("");

    try {
      await deleteInventoryItem(accessToken, itemId);
      navigate("/inventory", { replace: true });
    } catch {
      setSubmitError("No pudimos eliminar el reloj. Intenta de nuevo.");
      setIsDeleting(false);
    }
  }

  if (pageState.status === "loading") {
    return <LoadingState title="Cargando reloj" message="Estamos consultando el detalle del inventario." />;
  }

  if (pageState.status === "error") {
    return <ErrorState title="Reloj no disponible" message="No encontramos el reloj solicitado en inventario." />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-[#2a221b]">{title}</h1>
        <div className="flex flex-wrap gap-3">
          <NavLink className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751]" to="/inventory">
            Cancelar
          </NavLink>
          {isEdit ? (
            <button
              className="rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-2 text-sm text-[#8d5b4d]"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          ) : null}
        </div>
      </section>

      <InventoryForm
        defaultValues={pageState.item || {}}
        existingItems={existingItems.filter((item) => String(item.id) !== String(itemId))}
        isEdit={isEdit}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        submitError={submitError}
        submitLabel={isEdit ? "Guardar reloj" : "Guardar reloj →"}
      />
    </div>
  );
}

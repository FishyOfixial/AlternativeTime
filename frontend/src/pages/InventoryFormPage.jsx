import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [existingProductIds, setExistingProductIds] = useState([]);
  const emptyDefaultValues = useMemo(() => ({}), []);

  useEffect(() => {
    async function loadExistingIds() {
      try {
        const items = await listInventory(accessToken);
        setExistingProductIds(items.map((item) => item.product_id).filter(Boolean));
      } catch {
        setExistingProductIds([]);
      }
    }

    loadExistingIds();

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

  async function handleSubmit(payload) {
    setIsSaving(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      if (isEdit) {
        await updateInventoryItem(accessToken, itemId, payload);
      } else {
        await createInventoryItem(accessToken, payload);
      }

      navigate("/inventory", { replace: true });
    } catch (error) {
      const apiErrors = error?.data || {};
      const hasFieldErrors = Object.keys(apiErrors).length > 0;

      if (hasFieldErrors) {
        const normalizedFieldErrors = {};
        function assignErrors(source, prefix = "") {
          Object.entries(source).forEach(([key, value]) => {
            const fieldKey = prefix ? `${prefix}.${key}` : key;
            if (Array.isArray(value)) {
              normalizedFieldErrors[fieldKey] = value.join(" ");
              return;
            }
            if (value && typeof value === "object") {
              assignErrors(value, fieldKey);
              return;
            }
            normalizedFieldErrors[fieldKey] = String(value);
          });
        }
        assignErrors(apiErrors);
        setFieldErrors(normalizedFieldErrors);
        const firstMessage = Object.values(normalizedFieldErrors)[0];
        setSubmitError(firstMessage || "Revisa los campos marcados.");
      } else {
        setSubmitError("No pudimos guardar el reloj. Revisa la informacion e intenta de nuevo.");
      }
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
    <InventoryForm
      defaultValues={pageState.item || emptyDefaultValues}
      existingProductIds={existingProductIds}
      isEdit={isEdit}
      fieldErrors={fieldErrors}
      isSubmitting={isSaving}
      isDeleting={isDeleting}
      onDelete={handleDelete}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel={isEdit ? "Guardar reloj" : "Guardar reloj"}
      cancelPath="/inventory"
    />
  );
}

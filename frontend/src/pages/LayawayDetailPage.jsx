import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import LayawayPaymentForm from "../components/layaways/LayawayPaymentForm";
import LayawayPaymentsTable from "../components/layaways/LayawayPaymentsTable";
import LayawaySummaryCards from "../components/layaways/LayawaySummaryCards";
import { buildInitialLayawayPaymentForm } from "../constants/layaways";
import { useAuth } from "../contexts/AuthContext";
import { createLayawayPayment, deleteLayaway, getLayaway, updateLayaway } from "../services/layaways";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function LayawayDetailPage() {
  const { layawayId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [state, setState] = useState({ status: "loading", layaway: null, error: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [updateFieldErrors, setUpdateFieldErrors] = useState({});
  const [formValues, setFormValues] = useState(buildInitialLayawayPaymentForm);
  const [editValues, setEditValues] = useState({ agreed_price: "", due_date: "", notes: "" });

  async function loadLayaway() {
    try {
      const layaway = await getLayaway(accessToken, layawayId);
      setState({ status: "success", layaway, error: "" });
    } catch {
      setState({
        status: "error",
        layaway: null,
        error: "No encontramos el apartado solicitado o la API no respondio."
      });
    }
  }

  useEffect(() => {
    loadLayaway();
  }, [accessToken, layawayId]);

  const layaway = state.layaway;

  useEffect(() => {
    if (!layaway) {
      return;
    }
    setEditValues({
      agreed_price: layaway.agreed_price || "",
      start_date: layaway.start_date || "",
      due_date: layaway.due_date || "",
      notes: layaway.notes || ""
    });
  }, [layaway]);

  const canPay = useMemo(() => {
    return (
      layaway?.status === "active" &&
      layaway?.product_status !== "sold" &&
      Number(layaway.balance_due || 0) > 0
    );
  }, [layaway]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditValues((current) => ({ ...current, [name]: value }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setIsUpdating(true);
    setUpdateError("");
    setUpdateFieldErrors({});

    try {
      const updated = await updateLayaway(accessToken, layawayId, {
        ...editValues,
        start_date: editValues.start_date || null,
        due_date: editValues.due_date || null
      });
      setState({ status: "success", layaway: updated, error: "" });
    } catch (error) {
      if (error.message === "VALIDATION_ERROR" && error.data) {
        setUpdateFieldErrors(error.data);
        setUpdateError("Revisa los campos marcados.");
      } else {
        setUpdateError("No pudimos actualizar el apartado.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Se eliminara el apartado. Los abonos y movimientos financieros registrados se conservaran. ¿Quieres continuar?"
    );
    if (!confirmed) {
      return;
    }
    setIsDeleting(true);
    setUpdateError("");

    try {
      await deleteLayaway(accessToken, layawayId);
      navigate("/layaways");
    } catch {
      setUpdateError("No pudimos eliminar el apartado.");
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const response = await createLayawayPayment(accessToken, layawayId, formValues);
      setState({ status: "success", layaway: response.layaway, error: "" });
      setFormValues(buildInitialLayawayPaymentForm());
    } catch (error) {
      if (error.message === "VALIDATION_ERROR" && error.data) {
        setFieldErrors(error.data);
        setSubmitError("Revisa los campos marcados.");
      } else {
        setSubmitError("No pudimos registrar el abono.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (state.status === "loading") {
    return <LoadingState title="Cargando apartado" message="Consultando detalle del apartado." />;
  }

  if (state.status === "error" || !layaway) {
    return <ErrorState title="Apartado no disponible" message={state.error} />;
  }

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#2a221b]">Apartado #{layaway.id}</h1>
          <p className="mt-2 text-sm text-[#8a775f]">
            {layaway.product_label} ({layaway.product_code})
          </p>
        </div>
        <NavLink
          className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
          to="/layaways"
        >
          Volver
        </NavLink>
      </section>

      <LayawaySummaryCards layaway={layaway} />

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <section className="panel-surface p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="eyebrow">Condiciones</p>
                <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">Editar apartado</h2>
              </div>
              <button
                className="rounded-xl border border-[#d8b7a8] bg-[#fff7f3] px-4 py-2 text-sm font-semibold text-[#9d5c4b] transition hover:bg-[#fde7e2] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={handleDelete}
                type="button"
              >
                {isDeleting ? "Eliminando..." : "Eliminar apartado"}
              </button>
            </div>

            {updateError ? <p className="mt-3 text-sm text-[#a55b4f]">{updateError}</p> : null}

            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleUpdate}>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                  Precio acordado
                </span>
                <input
                  className={fieldClassName}
                  min="1"
                  name="agreed_price"
                  onChange={handleEditChange}
                  required
                  step="0.01"
                  type="number"
                  value={editValues.agreed_price}
                />
                {updateFieldErrors.agreed_price ? (
                  <p className="mt-1 text-xs text-[#a55b4f]">{updateFieldErrors.agreed_price}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                  Fecha inicio
                </span>
                <input
                  className={`${fieldClassName} appearance-none text-xs sm:text-sm`}
                  name="start_date"
                  onChange={handleEditChange}
                  required
                  type="date"
                  value={editValues.start_date}
                />
                {updateFieldErrors.start_date ? (
                  <p className="mt-1 text-xs text-[#a55b4f]">{updateFieldErrors.start_date}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                  Fecha compromiso
                </span>
                <input
                  className={`${fieldClassName} appearance-none text-xs sm:text-sm`}
                  name="due_date"
                  onChange={handleEditChange}
                  type="date"
                  value={editValues.due_date}
                />
                {updateFieldErrors.due_date ? (
                  <p className="mt-1 text-xs text-[#a55b4f]">{updateFieldErrors.due_date}</p>
                ) : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Notas</span>
                <textarea
                  className={`${fieldClassName} min-h-20 resize-none`}
                  name="notes"
                  onChange={handleEditChange}
                  value={editValues.notes}
                />
              </label>

              <div className="md:col-span-2">
                <button className="gold-button px-4 py-2.5 text-xs" disabled={isUpdating} type="submit">
                  {isUpdating ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>

          <LayawayPaymentsTable payments={layaway.payments || []} />
        </div>
        <LayawayPaymentForm
          canPay={canPay}
          fieldErrors={fieldErrors}
          formValues={formValues}
          isSaving={isSaving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </section>
    </div>
  );
}

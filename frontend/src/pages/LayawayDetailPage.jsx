import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import LayawayPaymentForm from "../components/layaways/LayawayPaymentForm";
import LayawayPaymentsTable from "../components/layaways/LayawayPaymentsTable";
import LayawaySummaryCards from "../components/layaways/LayawaySummaryCards";
import { buildInitialLayawayPaymentForm } from "../constants/layaways";
import { useAuth } from "../contexts/AuthContext";
import { createLayawayPayment, getLayaway } from "../services/layaways";

export default function LayawayDetailPage() {
  const { layawayId } = useParams();
  const { accessToken } = useAuth();
  const [state, setState] = useState({ status: "loading", layaway: null, error: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formValues, setFormValues] = useState(buildInitialLayawayPaymentForm);

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
        <LayawayPaymentsTable payments={layaway.payments || []} />
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

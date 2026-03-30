import ErrorState from "../feedback/ErrorState";
import {
  layawayAccountOptions,
  layawayPaymentMethodOptions
} from "../../constants/layaways";

const labelClassName = "text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]";
const fieldClassName =
  "mt-1.5 w-full min-w-0 max-w-full rounded-lg border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function LayawayPaymentForm({
  canPay,
  formValues,
  fieldErrors,
  submitError,
  isSaving,
  onChange,
  onSubmit
}) {
  return (
    <section className="panel-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Abonos</p>
          <p className="mt-2 font-serif text-2xl text-[#2a221b]">Registrar abono</p>
          <p className="mt-2 text-sm text-[#8a775f]">
            La fecha del abono se carga con hoy. Solo cambiala si necesitas capturar un pago anterior.
          </p>
        </div>
      </div>

      {submitError ? (
        <div className="mt-4">
          <ErrorState message={submitError} title="No pudimos registrar el abono" />
        </div>
      ) : null}

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClassName}>Monto</span>
            <input
              className={fieldClassName}
              min="0.01"
              name="amount"
              onChange={onChange}
              required
              step="0.01"
              type="number"
              value={formValues.amount}
            />
            {fieldErrors.amount ? <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.amount}</p> : null}
          </label>

          <label className="block">
            <span className={labelClassName}>Fecha del abono</span>
            <input
              className={`${fieldClassName} appearance-none text-xs sm:text-sm`}
              name="payment_date"
              onChange={onChange}
              required
              type="date"
              value={formValues.payment_date}
            />
            {fieldErrors.payment_date ? (
              <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.payment_date}</p>
            ) : null}
          </label>

          <label className="block">
            <span className={labelClassName}>Metodo</span>
            <select
              className={fieldClassName}
              name="payment_method"
              onChange={onChange}
              value={formValues.payment_method}
            >
              {layawayPaymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Cuenta</span>
            <select className={fieldClassName} name="account" onChange={onChange} value={formValues.account}>
              {layawayAccountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className={labelClassName}>Notas</span>
          <textarea
            className={`${fieldClassName} min-h-20 resize-none`}
            name="notes"
            onChange={onChange}
            placeholder="Opcional: referencia, transferencia o comentario"
            value={formValues.notes}
          />
        </label>

        <button className="gold-button w-full" disabled={!canPay || isSaving} type="submit">
          {isSaving ? "Registrando..." : "Registrar abono"}
        </button>
      </form>

      {!canPay ? (
        <p className="mt-3 text-xs text-[#8a775f]">
          Este apartado ya no admite abonos porque no esta activo o ya no tiene saldo.
        </p>
      ) : null}
    </section>
  );
}

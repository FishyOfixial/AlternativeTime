import ErrorState from "../feedback/ErrorState";
import {
  layawayAccountOptions,
  layawayPaymentMethodOptions
} from "../../constants/layaways";

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
    <section className="panel-surface p-6">
      <p className="font-serif text-2xl text-[#2a221b]">Registrar abono</p>
      {submitError ? (
        <div className="mt-4">
          <ErrorState message={submitError} title="No pudimos registrar el abono" />
        </div>
      ) : null}
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Fecha</span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Monto</span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Metodo</span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Cuenta</span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="account"
            onChange={onChange}
            value={formValues.account}
          >
            {layawayAccountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Notas</span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="notes"
            onChange={onChange}
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

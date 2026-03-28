import ErrorState from "../feedback/ErrorState";
import SaleCustomerSection from "../sales/SaleCustomerSection";
import { formatCurrency } from "../../utils/finance";

export default function LayawayCreateForm({
  clients,
  inventory,
  formValues,
  fieldErrors,
  isSaving,
  submitError,
  clientSuccess,
  onChange,
  onSubmit
}) {
  const selectedClient = clients.find((client) => String(client.id) === String(formValues.customer));

  return (
    <section className="panel-surface p-6">
      {clientSuccess ? (
        <div className="mb-4 rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {clientSuccess}
        </div>
      ) : null}
      {submitError ? (
        <div className="mb-4">
          <ErrorState message={submitError} title="No pudimos crear el apartado" />
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Reloj y condiciones</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Reloj</span>
              <select
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="product"
                onChange={onChange}
                required
                value={formValues.product}
              >
                <option value="">Selecciona un reloj disponible</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.display_name} - {item.product_id} - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
              {fieldErrors.product ? <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.product}</p> : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Precio acordado</span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                min="1"
                name="agreed_price"
                onChange={onChange}
                required
                step="0.01"
                type="number"
                value={formValues.agreed_price}
              />
              {fieldErrors.agreed_price ? (
                <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.agreed_price}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Fecha inicio</span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="start_date"
                onChange={onChange}
                required
                type="date"
                value={formValues.start_date}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Fecha limite</span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="due_date"
                onChange={onChange}
                type="date"
                value={formValues.due_date}
              />
              {fieldErrors.due_date ? <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.due_date}</p> : null}
            </label>
          </div>
        </section>

        <SaleCustomerSection
          clients={clients}
          fieldErrors={fieldErrors}
          formValues={formValues}
          onChange={onChange}
          selectedClient={selectedClient}
        />

        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Notas</h2>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Observaciones</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
              name="notes"
              onChange={onChange}
              value={formValues.notes}
            />
          </label>
        </section>

        <button className="gold-button w-full" disabled={isSaving} type="submit">
          {isSaving ? "Guardando apartado..." : "Guardar apartado"}
        </button>
      </form>
    </section>
  );
}

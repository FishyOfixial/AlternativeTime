import ErrorState from "../feedback/ErrorState";
import { formatCurrency } from "../../utils/finance";

const fieldClassName =
  "mt-1.5 w-full min-w-0 max-w-full rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

function ProductSummary({ selectedProduct }) {
  if (!selectedProduct) {
    return (
      <div className="rounded-xl border border-dashed border-[#ddcfba] bg-[#fffaf1] px-3 py-2 text-[11px] text-[#8a775f]">
        Elige un reloj disponible.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e4d7c3] bg-[#fffaf1] px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="line-clamp-1 text-sm font-semibold text-[#2a221b]">
            {selectedProduct.product_id} - {selectedProduct.display_name}
          </p>
          <p className="mt-0.5 text-[11px] text-[#8c7963]">
            {formatCurrency(selectedProduct.price)} - Costo: {formatCurrency(selectedProduct.total_cost)}
          </p>
        </div>
        <span className="hidden rounded-full bg-[#edf7f1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#67856d] sm:inline-flex">
          Disponible
        </span>
      </div>
    </div>
  );
}

function CompactCustomerSection({
  clients,
  selectedClient,
  formValues,
  onChange,
  fieldErrors,
  onOpenCreateClient
}) {
  return (
    <section className="panel-surface p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg text-[#2a221b] sm:text-xl">Cliente</h3>
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-2.5 py-1 text-[11px] text-[#7d6751] transition hover:bg-[#f3ecde] sm:px-3 sm:py-1.5"
          onClick={onOpenCreateClient}
          type="button"
        >
          Crear cliente
        </button>
      </div>

      <label className="mt-3 block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
          Cliente existente
        </span>
        <select className={fieldClassName} name="customer" onChange={onChange} value={formValues.customer}>
          <option value="">Selecciona un cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {fieldErrors.customer ? <p className="mt-1 text-xs text-[#a55b4f]">{fieldErrors.customer}</p> : null}
      </label>

      <div className="mt-3 rounded-xl border border-[#e4d7c3] bg-[#fffaf1] px-3 py-2">
        {selectedClient ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="line-clamp-1 text-sm font-semibold text-[#2a221b]">{selectedClient.name}</p>
              <p className="mt-0.5 text-[11px] text-[#8c7963]">
                {selectedClient.phone || "Sin telefono"}
                {selectedClient.instagram_handle ? ` - @${selectedClient.instagram_handle}` : ""}
              </p>
            </div>
            <span className="hidden rounded-full bg-[#edf7f1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#67856d] sm:inline-flex">
              Cliente
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#8a775f]">Selecciona un cliente o crea uno nuevo.</p>
        )}
      </div>
    </section>
  );
}

export default function LayawayCreateForm({
  clients,
  inventory,
  formValues,
  fieldErrors,
  isSaving,
  submitError,
  clientSuccess,
  selectedClient,
  selectedProduct,
  onChange,
  onClose,
  onSubmit,
  onOpenCreateClient
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <div>
          <p className="eyebrow">Apartados</p>
          <h2 className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-3xl">Nuevo apartado</h2>
        </div>
      </div>

      {clientSuccess ? (
        <div className="mt-3 rounded-xl border border-[#d9e5d7] bg-[#edf7ed] px-3 py-2 text-xs text-[#4c6d50] sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
          {clientSuccess}
        </div>
      ) : null}

      {submitError ? (
        <div className="mt-4">
          <ErrorState message={submitError} title="No pudimos crear el apartado" />
        </div>
      ) : null}

      <form className="mt-5 space-y-3 sm:space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
          <section className="panel-surface p-3 sm:p-4">
            <h3 className="font-serif text-lg text-[#2a221b] sm:text-xl">Reloj</h3>
            <label className="mt-3 block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Reloj</span>
              <select
                className={fieldClassName}
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

            <div className="mt-3">
              <ProductSummary selectedProduct={selectedProduct} />
            </div>
          </section>

          <CompactCustomerSection
            clients={clients}
            selectedClient={selectedClient}
            formValues={formValues}
            onChange={onChange}
            fieldErrors={fieldErrors}
            onOpenCreateClient={onOpenCreateClient}
          />
        </div>

        <section className="panel-surface p-3 sm:p-4">
          <h3 className="font-serif text-lg text-[#2a221b] sm:text-xl">Condiciones</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                Precio acordado
              </span>
              <input
                className={fieldClassName}
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                Fecha compromiso (opcional)
              </span>
              <input
                className={`${fieldClassName} appearance-none text-xs sm:text-sm`}
                name="due_date"
                onChange={onChange}
                type="date"
                value={formValues.due_date}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
                Notas
              </span>
              <textarea
                className={`${fieldClassName} min-h-16 resize-none`}
                name="notes"
                onChange={onChange}
                placeholder="Opcional"
                value={formValues.notes}
              />
            </label>
          </div>
        </section>

        <div className="flex flex-row justify-end gap-2 sm:gap-3">
          <button
            className="rounded-xl border border-[#dccfb9] px-4 py-2.5 text-sm text-[#7d6751]"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button className="gold-button px-4 py-2.5 text-xs" disabled={isSaving} type="submit">
            {isSaving ? "Guardando apartado..." : "Guardar apartado"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SaleCustomerSection({
  clients,
  selectedClient,
  formValues,
  onChange,
  fieldErrors,
  onOpenCreateClient
}) {
  return (
    <section className="panel-surface h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-2xl text-[#2a221b]">Datos del cliente</h2>
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751] transition hover:bg-[#f3ecde]"
          onClick={onOpenCreateClient}
          type="button"
        >
          Crear cliente
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Cliente existente
          </span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="customer"
            onChange={onChange}
            value={formValues.customer}
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.phone || "sin telefono"}
              </option>
            ))}
          </select>
          {fieldErrors.customer ? (
            <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer}</p>
          ) : null}
        </label>
      </div>

      {formValues.customer ? (
        <div className="mt-5 rounded-xl border border-[#e4d7c3] bg-[#fffaf1] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Cliente seleccionado
          </p>
          <p className="mt-2 font-semibold text-[#2a221b]">
            {selectedClient?.name || "Cliente"}
          </p>
          <p className="mt-1 text-sm text-[#8c7963]">
            {selectedClient?.phone || "Sin telefono"} - {selectedClient?.instagram_handle || "Sin IG"}
          </p>
          {selectedClient?.email ? (
            <p className="mt-1 text-sm text-[#8c7963]">{selectedClient.email}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#eadfcd] bg-[#fffdf9] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Cliente requerido
          </p>
          <p className="mt-3 text-sm text-[#8c7963]">
            Selecciona un cliente existente o crea uno nuevo desde el modal.
          </p>
        </div>
      )}
    </section>
  );
}

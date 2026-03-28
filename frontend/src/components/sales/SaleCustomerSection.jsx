export default function SaleCustomerSection({
  clients,
  selectedClient,
  formValues,
  onChange,
  fieldErrors
}) {
  return (
    <section className="panel-surface p-5">
      <h2 className="font-serif text-2xl text-[#2a221b]">Datos del cliente</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Cliente existente
          </span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="customer"
            onChange={onChange}
            value={formValues.customer}
          >
            <option value="">Crear nuevo cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.phone || "sin telefono"}
              </option>
            ))}
          </select>
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
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Datos del nuevo cliente
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Nombre del cliente
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="customer_name"
                onChange={onChange}
                placeholder="Nombre del comprador"
                value={formValues.customer_name}
              />
              {fieldErrors.customer_name ? (
                <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_name}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Contacto (telefono / Instagram)
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="customer_contact"
                onChange={onChange}
                placeholder="33 1234 5678 / @usuario"
                value={formValues.customer_contact}
              />
              {fieldErrors.customer_contact ? (
                <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_contact}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Email
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="customer_email"
                onChange={onChange}
                placeholder="correo@ejemplo.com"
                type="email"
                value={formValues.customer_email}
              />
              {fieldErrors.customer_email ? (
                <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.customer_email}</p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Direccion
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="customer_address"
                onChange={onChange}
                placeholder="Ciudad / colonia / referencia"
                value={formValues.customer_address}
              />
            </label>
            <label className="md:col-span-2 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Notas del cliente
              </span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                name="customer_notes"
                onChange={onChange}
                placeholder="Preferencias, referencias, etc."
                value={formValues.customer_notes}
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

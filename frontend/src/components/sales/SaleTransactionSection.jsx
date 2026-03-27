export default function SaleTransactionSection({
  formValues,
  onChange,
  fieldErrors,
  channelOptions
}) {
  return (
    <section className="panel-surface p-5">
      <h2 className="font-serif text-2xl text-[#2a221b]">Datos de la transaccion</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Monto cobrado
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            min="0"
            name="amount_paid"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.amount_paid}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Canal de venta
          </span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="sales_channel"
            onChange={onChange}
            value={formValues.sales_channel}
          >
            {channelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Fecha de venta
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="sale_date"
            onChange={onChange}
            type="date"
            value={formValues.sale_date}
          />
          {fieldErrors.sale_date ? (
            <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.sale_date}</p>
          ) : null}
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Extras (accesorios, caja...)
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            min="0"
            name="extras"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.extras}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Costo de envio al cliente
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            min="0"
            name="sale_shipping_cost"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.sale_shipping_cost}
          />
        </label>
        <label className="md:col-span-3 block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Notas de la venta
          </span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
            name="notes"
            onChange={onChange}
            value={formValues.notes}
          />
        </label>
      </div>
    </section>
  );
}

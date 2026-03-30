export default function SaleTransactionSection({
  formValues,
  onChange,
  fieldErrors,
  channelOptions,
  paymentOptions
}) {
  const labelClassName = "text-[10px] font-semibold uppercase tracking-[0.06em] lg:tracking-[0.16em] text-[#b09a7e]";
  const inputClassName =
    "mt-1.5 w-full min-w-0 max-w-full rounded-lg border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";
  const dateInputClassName = `${inputClassName} block appearance-none text-xs sm:text-sm`;

  return (
    <section className="panel-surface p-5">
      <h2 className="font-serif text-2xl text-[#2a221b]">Datos de la transaccion</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <label className="block">
          <span className={labelClassName}>
            Monto cobrado
          </span>
          <input
            className={inputClassName}
            min="0"
            name="amount_paid"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.amount_paid}
          />
        </label>
        <label className="block">
          <span className={labelClassName}>
            Canal de venta
          </span>
          <select
            className={inputClassName}
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
          <span className={labelClassName}>
            Metodo de pago
          </span>
          <select
            className={inputClassName}
            name="payment_method"
            onChange={onChange}
            value={formValues.payment_method}
          >
            {paymentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClassName}>
            Fecha de venta
          </span>
          <input
            className={dateInputClassName}
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
          <span className={labelClassName}>
            Extras
          </span>
          <input
            className={inputClassName}
            min="0"
            name="extras"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.extras}
          />
        </label>
        <label className="block">
          <span className={labelClassName}>
            Costo de envio
          </span>
          <input
            className={inputClassName}
            min="0"
            name="sale_shipping_cost"
            onChange={onChange}
            step="0.01"
            type="number"
            value={formValues.sale_shipping_cost}
          />
        </label>
        <label className="col-span-2 md:col-span-3 block">
          <span className={labelClassName}>
            Notas de la venta
          </span>
          <textarea
            className={`${inputClassName} min-h-20 resize-none`}
            name="notes"
            onChange={onChange}
            value={formValues.notes}
          />
        </label>
      </div>
    </section>
  );
}

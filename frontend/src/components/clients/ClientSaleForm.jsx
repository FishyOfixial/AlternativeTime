import { channelOptions, paymentOptions } from "../../constants/sales";
import { formatCurrency } from "../../utils/clients";

export default function ClientSaleForm({
  saleForm,
  inventoryItems,
  selectedItem,
  onChange,
  onSubmit,
  isSubmitting,
  isDisabled
}) {
  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      <div className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Reloj
          </span>
          <select
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            name="product"
            onChange={onChange}
            required
            value={saleForm.product}
          >
            <option value="">Selecciona un reloj</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.display_name} - {item.product_id} - {formatCurrency(item.price)}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Fecha de venta
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              name="sale_date"
              onChange={onChange}
              type="date"
              value={saleForm.sale_date}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Metodo de pago
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              name="payment_method"
              onChange={onChange}
              value={saleForm.payment_method}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Canal de venta
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              name="sales_channel"
              onChange={onChange}
              value={saleForm.sales_channel}
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
              Monto pagado
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              min="0"
              name="amount_paid"
              onChange={onChange}
              step="0.01"
              type="number"
              value={saleForm.amount_paid}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Extras
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              min="0"
              name="extras"
              onChange={onChange}
              step="0.01"
              type="number"
              value={saleForm.extras}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Costo de envio
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              min="0"
              name="sale_shipping_cost"
              onChange={onChange}
              step="0.01"
              type="number"
              value={saleForm.sale_shipping_cost}
            />
          </label>
          <label className="md:col-span-2 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Notas
            </span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
              name="notes"
              onChange={onChange}
              value={saleForm.notes}
            />
          </label>
        </div>

        {selectedItem ? (
          <div className="mt-4 rounded-lg border border-[#e4d7c3] bg-[#fffaf1] px-4 py-3 text-sm text-[#7d6751]">
            {selectedItem.display_name} - {selectedItem.product_id} - precio lista{" "}
            {formatCurrency(selectedItem.price)}
          </div>
        ) : null}
      </div>

      <button className="gold-button w-full" disabled={isDisabled} type="submit">
        {isSubmitting ? "Registrando venta..." : "Registrar venta"}
      </button>
    </form>
  );
}

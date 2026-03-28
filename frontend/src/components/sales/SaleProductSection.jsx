export default function SaleProductSection({
  inventoryItems,
  selectedItem,
  productValue,
  onChange,
  formatCurrency,
  fieldErrors
}) {
  return (
    <section className="panel-surface p-5">
      <h2 className="font-serif text-2xl text-[#2a221b]">Reloj a vender</h2>
      <div className="mt-4">
        <select
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b]"
          name="product"
          onChange={onChange}
          required
          value={productValue}
        >
          <option value="">Selecciona un reloj</option>
          {inventoryItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.display_name} - {item.product_id} - {formatCurrency(item.price)}
            </option>
          ))}
        </select>
        {fieldErrors.product ? (
          <p className="mt-2 text-xs text-[#9d5c4b]">{fieldErrors.product}</p>
        ) : null}
      </div>

      {selectedItem ? (
        <div className="mt-4 rounded-xl border border-[#e4d7c3] bg-[#fffaf1] p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eee5d5] text-2xl">?</div>
            <div className="flex-1">
              <p className="font-semibold text-[#2a221b]">
                {selectedItem.product_id} - {selectedItem.display_name}
              </p>
              <p className="mt-1 text-xs text-[#8c7963]">
                Precio lista: {formatCurrency(selectedItem.price)} - Costo:{" "}
                {formatCurrency(selectedItem.total_cost)} - Condicion: {selectedItem.condition_score}
              </p>
            </div>
            <span className="rounded-md bg-[#edf7f1] px-2 py-1 text-xs text-[#7da281]">
              Disponible
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function SaleSummaryPanel({
  amountPaid,
  costSnapshot,
  extras,
  shipping,
  profit,
  margin,
  formatCurrency,
  isSubmitting,
  canSubmit
}) {
  return (
    <section className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-[#b09a7e]">Resumen de la venta</p>
      <div className="mt-4 space-y-3 text-sm text-[#7d6751]">
        <div className="flex items-center justify-between">
          <span>Precio cobrado</span>
          <span>{formatCurrency(amountPaid)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Reloj</span>
          <span>-{formatCurrency(costSnapshot)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Extras</span>
          <span>{formatCurrency(extras)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Costo envio</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
      </div>
      <div className="mt-4 border-t border-[#e5d7c2] pt-4">
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl text-[#2a221b]">Ganancia</span>
          <span className="font-serif text-3xl text-[#5f8f66]">
            {formatCurrency(profit)}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#8c7963]">Margen: {margin.toFixed(1)}%</p>
      </div>
      <button
        className="gold-button mt-5 w-full"
        disabled={isSubmitting || !canSubmit}
        type="submit"
      >
        {isSubmitting ? "Confirmando venta..." : "Confirmar venta"}
      </button>
    </section>
  );
}

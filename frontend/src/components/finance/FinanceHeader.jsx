export default function FinanceHeader({ onNewMovement, onExport, isExporting }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">Finanzas</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
          Finanzas & Flujo de efectivo
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-md border border-[#201914] bg-[#201914] px-4 py-2 text-xs text-[#ddb65f]"
          onClick={onNewMovement}
          type="button"
        >
          + Movimiento
        </button>
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
          disabled={isExporting}
          onClick={onExport}
          type="button"
        >
          {isExporting ? "Exportando..." : "Exportar"}
        </button>
      </div>
    </section>
  );
}

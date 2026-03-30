export default function FinanceHeader({ onNewMovement, onExport, isExporting }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="eyebrow">Finanzas</p>
        <h1 className="mt-2 font-serif text-[30px] tracking-tight text-[#2a221b] sm:hidden">Finanzas</h1>
        <h1 className="mt-2 hidden font-serif text-4xl tracking-tight text-[#2a221b] sm:block">
          Finanzas y flujo de efectivo
        </h1>
      </div>

      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <button
          className="w-full rounded-xl border border-[#201914] bg-[#201914] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#ddb65f] sm:w-auto"
          onClick={onNewMovement}
          type="button"
        >
          + Movimiento
        </button>
        <button
          className="hidden rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#7d6751] transition hover:bg-[#f5eee2] sm:inline-flex"
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

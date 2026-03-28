export default function FinanceHeader({ onNewMovement, onExport, isExporting }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
      </div>
      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
        <button
          className="w-full rounded-md border border-[#201914] bg-[#201914] px-4 py-2 text-xs text-[#ddb65f] sm:w-auto"
          onClick={onNewMovement}
          type="button"
        >
          + Movimiento
        </button>
        <button
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751] sm:w-auto"
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

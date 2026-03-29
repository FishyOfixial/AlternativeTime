import { NavLink } from "react-router-dom";

export default function SalesHeader({ onExport, isExportDisabled = false }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">Ventas</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#2a221b] sm:text-4xl">
          Historial de ventas
        </h1>
      </div>
      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
        <NavLink className="gold-button w-full px-4 py-2 text-xs sm:w-auto" to="/sales/new">
          + Registrar venta
        </NavLink>
        <button
          className="hidden w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751] transition hover:bg-[#f3ecde] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:inline-flex"
          disabled={isExportDisabled}
          onClick={onExport}
          type="button"
        >
          Exportar Excel
        </button>
      </div>
    </section>
  );
}

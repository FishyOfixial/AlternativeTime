import { NavLink } from "react-router-dom";

export default function SalesHeader() {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">Ventas</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
          Historial de ventas
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <NavLink className="gold-button px-4 py-2 text-xs" to="/sales/new">
          + Registrar venta
        </NavLink>
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
          disabled
          type="button"
        >
          Exportar CSV
        </button>
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-xs text-[#7d6751]"
          disabled
          type="button"
        >
          Exportar Excel
        </button>
      </div>
    </section>
  );
}

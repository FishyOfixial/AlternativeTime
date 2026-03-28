import { NavLink } from "react-router-dom";

export default function SalesFormHeader() {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">Ventas</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
          Registrar venta
        </h1>
      </div>
      <div className="flex flex-wrap gap-3">
        <NavLink
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751]"
          to="/sales"
        >
          Cancelar
        </NavLink>
      </div>
    </section>
  );
}

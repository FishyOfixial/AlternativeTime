import { NavLink } from "react-router-dom";

export default function InventoryHeader({ isImporting = false, onImportClick }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <h1 className="font-serif text-4xl tracking-tight text-[#2a221b]">Inventario</h1>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isImporting}
          onClick={onImportClick}
          type="button"
        >
          {isImporting ? "Importando..." : "Importar CSV"}
        </button>
        <NavLink className="gold-button px-4 py-2 text-xs" to="/inventory/new">
          + Nuevo reloj
        </NavLink>
      </div>
    </section>
  );
}

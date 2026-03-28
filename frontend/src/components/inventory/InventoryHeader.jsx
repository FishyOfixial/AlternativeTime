import { NavLink } from "react-router-dom";

export default function InventoryHeader({ isImporting = false, onImportClick }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <h1></h1>
      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
        <button
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#7d6751] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isImporting}
          onClick={onImportClick}
          type="button"
        >
          {isImporting ? "Importando..." : "Importar CSV"}
        </button>
        <NavLink className="gold-button w-full px-4 py-2 text-xs sm:w-auto" to="/inventory/new">
          + Nuevo reloj
        </NavLink>
      </div>
    </section>
  );
}

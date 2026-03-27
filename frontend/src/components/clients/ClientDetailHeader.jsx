import { NavLink } from "react-router-dom";
import { formatLastPurchase, getClientInitials } from "../../utils/clients";

export default function ClientDetailHeader({ client, isEditOpen, onToggleEdit }) {
  return (
    <section className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#edf4ee] font-semibold text-2xl text-[#6d9b85]">
          {getClientInitials(client.name)}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-4xl tracking-tight text-[#2a221b]">{client.name}</h1>
            {client.purchases_count >= 2 ? (
              <span className="rounded-full bg-[#f6ebc9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c19b4d]">
                VIP
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#7f6d59]">
            <span>{client.phone}</span>
            <span>-</span>
            <span>{client.instagram_handle || "Sin IG"}</span>
            <span>-</span>
            <span>Cliente desde {formatLastPurchase(client.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
          onClick={onToggleEdit}
          type="button"
        >
          {isEditOpen ? "Cerrar" : "Editar"}
        </button>
        <NavLink
          className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
          to="/clients"
        >
          Volver
        </NavLink>
      </div>
    </section>
  );
}

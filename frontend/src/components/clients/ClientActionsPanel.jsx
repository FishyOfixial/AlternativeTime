import { useState } from "react";
import { NavLink } from "react-router-dom";
import ErrorState from "../feedback/ErrorState";

export default function ClientActionsPanel({ clientId, deactivateError, isDeleting, onDeactivate }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  function handleToggleConfirm() {
    setIsConfirmOpen((current) => !current);
    setConfirmChecked(false);
  }

  async function handleConfirmDeactivate() {
    await onDeactivate();
  }

  return (
    <section className="panel-surface p-5">
      <p className="font-serif text-2xl text-[#2a221b]">Acciones</p>

      {deactivateError ? (
        <div className="mt-4">
          <ErrorState message={deactivateError} title="No pudimos inactivar el cliente" />
        </div>
      ) : null}

      <NavLink className="gold-button mt-4 w-full py-2.5" to={`/sales/new?customer=${clientId}`}>
        + Registrar nueva venta
      </NavLink>

      <button
        className="mt-3 w-full rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-2.5 text-sm text-[#8d5b4d] transition hover:bg-[#fbe9e4]"
        onClick={handleToggleConfirm}
        type="button"
      >
        {isConfirmOpen ? "Cancelar" : "Inactivar cliente"}
      </button>

      {isConfirmOpen ? (
        <div className="mt-3 rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
          <label className="flex items-start gap-3 text-sm text-[#6f5a46]">
            <input
              checked={confirmChecked}
              className="mt-1"
              onChange={(event) => setConfirmChecked(event.target.checked)}
              type="checkbox"
            />
            Confirmo que quiero inactivar este cliente. Dejara de aparecer en listados y selectores.
          </label>
          <button
            className="mt-3 w-full rounded-md border border-[#d8b3ab] bg-[#ffecea] px-4 py-2.5 text-sm font-semibold text-[#8d5b4d] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!confirmChecked || isDeleting}
            onClick={handleConfirmDeactivate}
            type="button"
          >
            {isDeleting ? "Inactivando..." : "Confirmar inactivacion"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

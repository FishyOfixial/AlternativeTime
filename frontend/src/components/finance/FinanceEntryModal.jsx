import AppModal from "../common/AppModal";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function FinanceEntryModal({
  isOpen,
  entryForm,
  onChange,
  onSubmit,
  onClose,
  isSaving,
  entryError,
  entryFieldErrors,
  conceptOptions,
  accountCards,
  mode = "create",
  isAutomatic = false,
  onDelete,
  isDeleting = false
}) {
  if (!isOpen) {
    return null;
  }

  const isEditing = mode === "edit";
  const canDelete = isEditing && onDelete && entryForm.concept !== "purchase";
  const availableConceptOptions = isEditing
    ? conceptOptions
    : conceptOptions.filter((option) => option.value !== "purchase");

  return (
    <AppModal isOpen={isOpen} maxWidthClass="max-w-xl" onClose={onClose}>
      <div>
        <div>
          <p className="eyebrow">{isEditing ? "Editar movimiento" : "Nuevo movimiento"}</p>
          <h2 className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-3xl">
            {isEditing ? "Actualizar movimiento" : "Agregar movimiento"}
          </h2>
        </div>

        {entryError ? (
          <div className="mt-4 rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
            {entryError}
          </div>
        ) : null}

        {isEditing && isAutomatic ? (
          <div className="mt-4 rounded-xl border border-[#ddcfba] bg-[#fcf8f2] px-4 py-3 text-sm text-[#7d6751]">
            Este movimiento viene de una venta, compra o abono. Puedes ajustar fecha, cuenta, monto y notas;
            el sistema sincronizara el origen automaticamente.
          </div>
        ) : null}

        <form className="mt-5 grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Fecha</span>
            <input
              className={`${fieldClassName} appearance-none text-xs sm:text-sm`}
              name="entry_date"
              onChange={onChange}
              type="date"
              value={entryForm.entry_date}
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Tipo</span>
            <select
              className={fieldClassName}
              disabled={isAutomatic}
              name="entry_type"
              onChange={onChange}
              value={entryForm.entry_type}
            >
              <option value="income">Ingreso</option>
              <option value="expense">Egreso</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Concepto</span>
            <select
              className={fieldClassName}
              disabled={isAutomatic}
              name="concept"
              onChange={onChange}
              value={entryForm.concept}
            >
              {availableConceptOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Cuenta</span>
            <select
              className={fieldClassName}
              name="account"
              onChange={onChange}
              value={entryForm.account}
            >
              {accountCards.map((card) => (
                <option key={card.key} value={card.key}>
                  {card.label}
                </option>
              ))}
            </select>
          </label>

          <label className="col-span-2 block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Monto</span>
            <input
              className={`${fieldClassName} text-lg font-semibold sm:text-xl`}
              min="0"
              name="amount"
              onChange={onChange}
              step="0.01"
              type="number"
              value={entryForm.amount}
            />
            {entryFieldErrors.amount ? (
              <p className="mt-2 text-xs text-[#9d5c4b]">{entryFieldErrors.amount}</p>
            ) : null}
          </label>

          <label className="col-span-2 block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">Notas</span>
            <textarea
              className={`${fieldClassName} min-h-20 resize-none`}
              name="notes"
              onChange={onChange}
              placeholder="Opcional"
              value={entryForm.notes}
            />
          </label>

          <div className="col-span-2 flex flex-row justify-end gap-2 sm:gap-3">
            {canDelete ? (
              <button
                className="rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-2.5 text-sm font-semibold text-[#935849]"
                disabled={isDeleting}
                onClick={onDelete}
                type="button"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            ) : null}
            <button
              className="rounded-xl border border-[#dccfb9] px-4 py-2.5 text-sm text-[#7d6751]"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button className="gold-button px-4 py-2.5 text-xs" disabled={isSaving} type="submit">
              {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar movimiento"}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}

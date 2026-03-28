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
  accountCards
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#eadfcd] bg-[#fffdf9] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Nuevo movimiento</p>
            <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">
              Agregar movimiento
            </h2>
          </div>
          <button
            className="rounded-md border border-[#dccfb9] px-3 py-1 text-xs text-[#7d6751]"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        {entryError ? (
          <div className="mt-4 rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
            {entryError}
          </div>
        ) : null}

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Fecha
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
              name="entry_date"
              onChange={onChange}
              type="date"
              value={entryForm.entry_date}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Tipo
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
              name="entry_type"
              onChange={onChange}
              value={entryForm.entry_type}
            >
              <option value="income">Ingreso</option>
              <option value="expense">Egreso</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Concepto
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
              name="concept"
              onChange={onChange}
              value={entryForm.concept}
            >
              {conceptOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Cuenta
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
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
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Monto
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
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
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
              Notas
            </span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
              name="notes"
              onChange={onChange}
              value={entryForm.notes}
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              className="rounded-md border border-[#dccfb9] px-4 py-2 text-sm text-[#7d6751]"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button className="gold-button px-4 py-2 text-xs" disabled={isSaving} type="submit">
              {isSaving ? "Guardando..." : "Guardar movimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

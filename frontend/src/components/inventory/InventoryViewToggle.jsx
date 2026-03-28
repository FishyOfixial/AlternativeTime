export default function InventoryViewToggle({
  showViewOptions = true,
  viewMode,
  onChange,
  onImportClick,
  isImporting = false
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {showViewOptions ? (
        <>
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "table"
                ? "border-[#201914] bg-[#fffdf9] text-[#2a221b]"
                : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
            }`}
            onClick={() => onChange("table")}
            type="button"
          >
            Tabla
          </button>
          <button
            className={`rounded-md border px-4 py-2 text-sm ${
              viewMode === "cards"
                ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
            }`}
            onClick={() => onChange("cards")}
            type="button"
          >
            Tarjetas
          </button>
        </>
      ) : null}
      <button
        className="hidden rounded-md border border-[#2e6f9e] bg-[#eaf4fb] px-4 py-2 text-sm font-medium text-[#245b83] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
        disabled={isImporting}
        onClick={onImportClick}
        type="button"
      >
        {isImporting ? "Importando..." : "Importar CSV"}
      </button>
    </div>
  );
}

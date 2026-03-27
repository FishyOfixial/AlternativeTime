export default function InventoryViewToggle({ viewMode, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
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
    </div>
  );
}

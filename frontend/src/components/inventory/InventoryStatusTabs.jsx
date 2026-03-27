export default function InventoryStatusTabs({ counts, selectedStatus, onSelect }) {
  const options = [
    ["all", `Todos (${counts.all})`],
    ["available", `Disponibles (${counts.available})`],
    ["reserved", `Apartados (${counts.reserved})`],
    ["sold", `Vendidos (${counts.sold})`]
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-[#f1ebdf] p-1">
      {options.map(([value, label]) => (
        <button
          key={value}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            selectedStatus === value ? "bg-[#fffdf9] text-[#2a221b] shadow-sm" : "text-[#9a886f]"
          }`}
          onClick={() => onSelect(value)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

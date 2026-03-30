export default function InventoryStatusTabs({ counts, selectedStatus, onSelect }) {
  const options = [
    ["all", `Todos (${counts.all})`, `Todos (${counts.all})`],
    ["available", `Disponibles (${counts.available})`, `Disp. (${counts.available})`],
    ["reserved", `Apartados (${counts.reserved})`, `Apt. (${counts.reserved})`],
    ["sold", `Vendidos (${counts.sold})`, `Vend. (${counts.sold})`]
  ];

  return (
    <div className="grid w-full grid-cols-4 gap-1 rounded-xl bg-[#f1ebdf] p-1 lg:w-auto">
      {options.map(([value, label, mobileLabel]) => (
        <button
          key={value}
          className={`rounded-lg px-1.5 py-1.5 text-[11px] transition sm:px-3 sm:py-2 sm:text-sm ${
            selectedStatus === value ? "bg-[#fffdf9] text-[#2a221b] shadow-sm" : "text-[#9a886f]"
          }`}
          onClick={() => onSelect(value)}
          type="button"
        >
          <span className="sm:hidden">{mobileLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

import { NavLink } from "react-router-dom";

export default function InventoryCards({ items, formatCurrency, tagLabels, tagClasses }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-[#b2883e]">{item.product_id}</p>
              <span
                className={`rounded-md px-2 py-1 text-[10px] uppercase ${
                  tagClasses[item.age_tag] || tagClasses.new
                }`}
              >
                {tagLabels[item.age_tag] || item.age_tag}
              </span>
            </div>
            <p className="mt-2 truncate font-medium text-[#2a221b]" title={item.display_name}>
              {item.display_name}
            </p>
            <p className="mt-1 text-xs text-[#8a775f]">
              {item.year_label || "Sin ano"} - Cond. {item.condition_score} - {item.days_in_inventory} dias
            </p>
            <p className="mt-3 font-serif text-3xl text-[#2a221b]">{formatCurrency(item.price)}</p>
            <p className="mt-1 text-xs text-[#8a775f]">
              Costo {formatCurrency(item.total_cost)} - Utilidad {Number(item.utilidad || 0).toFixed(1)}%
            </p>
            <NavLink
              className="mt-4 flex w-full items-center justify-center rounded-md bg-[#201914] px-4 py-2.5 text-sm font-semibold text-[#ddb65f]"
              to={`/inventory/${item.id}`}
            >
              Editar reloj
            </NavLink>
          </div>
        </article>
      ))}
    </section>
  );
}

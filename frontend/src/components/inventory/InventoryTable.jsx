import { NavLink } from "react-router-dom";
import ResponsiveTableShell from "../common/ResponsiveTableShell";

function InventoryMobileCard({ item, formatCurrency, statusLabels, statusClasses, tagLabels, tagClasses }) {
  return (
    <article className="rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-[#b4a085]">{item.product_id}</p>
          <p className="truncate font-medium text-[#2a221b]">{item.display_name}</p>
        </div>
        <NavLink className="text-xs text-[#8f7444]" to={`/inventory/${item.id}`}>
          Editar
        </NavLink>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5d5144]">
        <p>Costo: {formatCurrency(item.total_cost)}</p>
        <p>Precio: {formatCurrency(item.price)}</p>
        <p>Dias: {item.days_in_inventory}</p>
        <p>Utilidad: {Number(item.utilidad || 0).toFixed(1)}%</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-md px-2 py-1 text-xs ${statusClasses[item.status] || statusClasses.available}`}
        >
          {statusLabels[item.status] || item.status}
        </span>
        <span className={`rounded-md px-2 py-1 text-xs ${tagClasses[item.age_tag] || tagClasses.new}`}>
          {tagLabels[item.age_tag] || item.age_tag}
        </span>
      </div>
    </article>
  );
}

export default function InventoryTable({
  items,
  formatCurrency,
  statusLabels,
  statusClasses,
  tagLabels,
  tagClasses
}) {
  return (
    <ResponsiveTableShell
      mobileContent={items.map((item) => (
        <InventoryMobileCard
          key={item.id}
          item={item}
          formatCurrency={formatCurrency}
          statusLabels={statusLabels}
          statusClasses={statusClasses}
          tagLabels={tagLabels}
          tagClasses={tagClasses}
        />
      ))}
      desktopContent={
        <table className="w-full min-w-[940px] border-collapse text-left lg:min-w-[980px]">
          <thead className="sticky top-0 z-10 bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="w-[110px] px-4 py-2">ID</th>
              <th className="min-w-[220px] px-4 py-2">Marca / modelo</th>
              <th className="hidden w-[110px] px-4 py-2 lg:table-cell">Ano</th>
              <th className="w-[80px] px-4 py-2">Cond.</th>
              <th className="w-[130px] px-4 py-2">Costo compra</th>
              <th className="w-[120px] px-4 py-2">Precio</th>
              <th className="w-[110px] px-4 py-2">Utilidad</th>
              <th className="w-[120px] px-4 py-2">Estado</th>
              <th className="w-[110px] px-4 py-2">Dias inv.</th>
              <th className="hidden w-[110px] px-4 py-2 lg:table-cell">Etiqueta</th>
              <th className="w-[80px] px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#eadfcd] text-sm text-[#5d5144]">
                <td className="px-4 py-4 font-semibold text-[#b2883e]">{item.product_id}</td>
                <td className="px-4 py-4">
                  <p className="truncate font-medium text-[#2a221b]" title={item.display_name}>
                    {item.display_name}
                  </p>
                </td>
                <td className="hidden px-4 py-4 lg:table-cell">{item.year_label || "-"}</td>
                <td className="px-4 py-4">{item.condition_score}</td>
                <td className="px-4 py-4 font-medium">{formatCurrency(item.total_cost)}</td>
                <td className="px-4 py-4 font-semibold text-[#2a221b]">{formatCurrency(item.price)}</td>
                <td className="px-4 py-4">{Number(item.utilidad || 0).toFixed(1)}%</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${statusClasses[item.status] || statusClasses.available}`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-4">{item.days_in_inventory}</td>
                <td className="hidden px-4 py-4 lg:table-cell">
                  <span className={`rounded-md px-2 py-1 text-xs ${tagClasses[item.age_tag] || tagClasses.new}`}>
                    {tagLabels[item.age_tag] || item.age_tag}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <NavLink className="text-sm text-[#8f7444]" to={`/inventory/${item.id}`}>
                    Editar
                  </NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}

import { NavLink } from "react-router-dom";

export default function InventoryTable({
  items,
  formatCurrency,
  statusLabels,
  statusClasses,
  tagLabels,
  tagClasses
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Marca / modelo</th>
              <th className="px-4 py-4">Ano</th>
              <th className="px-4 py-4">Cond.</th>
              <th className="px-4 py-4">Costo compra</th>
              <th className="px-4 py-4">Precio</th>
              <th className="px-4 py-4">Utilidad</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Dias inv.</th>
              <th className="px-4 py-4">Etiqueta</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#eadfcd] text-sm text-[#5d5144]">
                <td className="px-4 py-4 font-semibold text-[#b2883e]">{item.product_id}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-[#2a221b]">{item.display_name}</p>
                </td>
                <td className="px-4 py-4">{item.year_label || "-"}</td>
                <td className="px-4 py-4">{item.condition_score}</td>
                <td className="px-4 py-4 font-medium">{formatCurrency(item.total_cost)}</td>
                <td className="px-4 py-4 font-semibold text-[#2a221b]">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-4 py-4">{Number(item.utilidad || 0).toFixed(1)}%</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      statusClasses[item.status] || statusClasses.available
                    }`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-4">{item.days_in_inventory}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      tagClasses[item.age_tag] || tagClasses.new
                    }`}
                  >
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
      </div>
    </section>
  );
}

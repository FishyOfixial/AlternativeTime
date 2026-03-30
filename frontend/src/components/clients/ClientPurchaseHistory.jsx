import EmptyState from "../feedback/EmptyState";
import { formatCurrency, formatDate } from "../../utils/clients";

export default function ClientPurchaseHistory({ purchases, instagramHandle }) {
  return (
    <div className="panel-surface p-6">
      <p className="font-serif text-2xl text-[#2a221b]">Historial de compras</p>
      <div className="mt-4 space-y-4 border-t border-[#eadfcd] pt-4">
        {purchases?.length ? (
          purchases.map((purchase) => (
            <div key={purchase.sale_id} className="border-b border-[#efe4d1] pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#3b3024]">{purchase.item_names.join(", ")}</p>
                  <p className="mt-1 text-xs text-[#9b8974]">
                    {formatDate(purchase.created_at)} - {instagramHandle || "Sin IG"}
                  </p>
                </div>
                <p className="font-semibold text-[#6ca07e]">{formatCurrency(purchase.total)}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            message="Todavia no hay ventas ligadas a este cliente."
            title="Sin historial de compras"
          />
        )}
      </div>
    </div>
  );
}

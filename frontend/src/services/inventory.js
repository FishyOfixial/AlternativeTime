import { apiRequestAuth, apiJsonAuth, buildQueryString, submitFormData, submitJson } from "./serviceUtils";

function buildInventoryPayload(payload) {
  const purchaseCost = payload.purchase_cost || {};
  const purchaseCosts = (payload.purchase_costs || []).filter(
    (cost) => cost.id || Number(cost.amount || 0) > 0
  );

  return {
    brand: payload.brand?.trim() || "",
    model_name: payload.model_name?.trim() || "",
    year_label: payload.year_label?.trim() || "",
    condition_score: payload.condition_score,
    provider: payload.provider?.trim() || "",
    description: payload.description?.trim() || "",
    notes: payload.notes?.trim() || "",
    price: payload.price,
    purchase_date: payload.purchase_date || null,
    status: payload.status,
    sales_channel: payload.sales_channel,
    image_url: payload.image_url?.trim() || "",
    purchase_costs: purchaseCosts.length
      ? purchaseCosts.map((cost) => ({
          id: cost.id,
          cost_type: cost.cost_type,
          amount: cost.amount,
          account: cost.account,
          payment_method: cost.payment_method,
          cost_date: cost.cost_date || payload.purchase_date || null,
          notes: cost.notes?.trim() || ""
        }))
      : undefined,
    purchase_cost: purchaseCosts.length
      ? undefined
      : {
          watch_cost: purchaseCost.watch_cost,
          shipping_cost: purchaseCost.shipping_cost,
          maintenance_cost: purchaseCost.maintenance_cost,
          other_costs: purchaseCost.other_costs,
          payment_method: purchaseCost.payment_method,
          source_account: purchaseCost.source_account,
          notes: purchaseCost.notes?.trim() || ""
        }
  };
}

export function listInventory(accessToken, filters = {}) {
  return apiJsonAuth(`/api/inventory/${buildQueryString(filters)}`, accessToken);
}

export function getInventoryItem(accessToken, itemId) {
  return apiJsonAuth(`/api/inventory/${itemId}/`, accessToken);
}

export function createInventoryItem(accessToken, payload) {
  return submitJson("/api/inventory/", {
    accessToken,
    method: "POST",
    payload: buildInventoryPayload(payload),
    validationErrorMessage: "No pudimos crear el reloj.",
    errorMessage: "No pudimos crear el reloj."
  });
}

export function updateInventoryItem(accessToken, itemId, payload) {
  return submitJson(`/api/inventory/${itemId}/`, {
    accessToken,
    method: "PATCH",
    payload: buildInventoryPayload(payload),
    validationErrorMessage: "No pudimos actualizar el reloj.",
    errorMessage: "No pudimos actualizar el reloj."
  });
}

export async function deleteInventoryItem(accessToken, itemId) {
  await apiRequestAuth(`/api/inventory/${itemId}/`, accessToken, { method: "DELETE" });
}

export async function importInventoryCsv(accessToken, file) {
  const formData = new FormData();
  formData.append("file", file);

  return submitFormData("/api/inventory/import-csv/", {
    accessToken,
    method: "POST",
    formData,
    errorMessage: "No pudimos importar el CSV."
  });
}

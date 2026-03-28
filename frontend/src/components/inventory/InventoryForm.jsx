import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

const initialValues = {
  brand: "",
  model_name: "",
  year_label: "",
  condition_score: "8.0",
  provider: "",
  description: "",
  notes: "",
  purchase_date: getTodayIsoDate(),
  price: "0.00",
  status: "available",
  sales_channel: "marketplace",
  purchase_cost: {
    watch_cost: "0.00",
    shipping_cost: "0.00",
    maintenance_cost: "0.00",
    other_costs: "0.00",
    payment_method: "cash",
    source_account: "cash",
    notes: ""
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function normalizeBrand(value) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }
  return trimmed
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ""))
        .join("-")
    )
    .join(" ");
}

function getBrandPrefix(brandValue) {
  const clean = (brandValue || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!clean) {
    return "ATC";
  }

  return clean.slice(0, 3);
}

function getNextIdNumber(existingProductIds) {
  let maxNumber = 0;

  for (const productId of existingProductIds) {
    if (!productId || !productId.includes("-")) {
      continue;
    }

    const numberPart = productId.split("-")[1] || "";
    const parsed = Number.parseInt(numberPart, 10);
    if (!Number.isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed;
    }
  }

  return maxNumber + 1;
}

function buildProductIdPreview(values, defaultValues, isEdit, existingProductIds) {
  if (isEdit && defaultValues.product_id) {
    return defaultValues.product_id;
  }

  const prefix = getBrandPrefix(values.brand);
  const nextNumber = getNextIdNumber(existingProductIds);
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

function buildFormState(defaultValues = {}) {
  const purchaseCost = defaultValues.purchase_cost || {};

  return {
    ...initialValues,
    ...defaultValues,
    condition_score: String(defaultValues.condition_score ?? initialValues.condition_score),
    price: String(defaultValues.price ?? initialValues.price),
    purchase_date: defaultValues.purchase_date || initialValues.purchase_date,
    purchase_cost: {
      ...initialValues.purchase_cost,
      ...Object.fromEntries(
        Object.entries(purchaseCost).map(([key, value]) => [
          key,
          value === null || value === undefined ? "" : String(value)
        ])
      )
    }
  };
}

const labelClassName = "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b09a7e]";
const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}

export default function InventoryForm({
  defaultValues = {},
  existingProductIds = [],
  isEdit = false,
  isSubmitting = false,
  isDeleting = false,
  submitLabel,
  onSubmit,
  onDelete,
  fieldErrors = {},
  submitError = "",
  cancelPath = "/inventory"
}) {
  const [values, setValues] = useState(() => buildFormState(defaultValues));

  useEffect(() => {
    setValues(buildFormState(defaultValues));
  }, [defaultValues]);

  useEffect(() => {
    const keys = Object.keys(fieldErrors || {});
    if (!keys.length) {
      return;
    }

    const firstKey = keys[0];
    const lastSegment = firstKey.split(".").at(-1);
    const isPurchaseCostField = firstKey.startsWith("purchase_cost.");
    const selector = isPurchaseCostField
      ? `[name="${lastSegment}"][data-group="purchase_cost"]`
      : `[name="${lastSegment}"]`;
    const target = document.querySelector(selector);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus?.();
  }, [fieldErrors]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handlePurchaseCostChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      purchase_cost: {
        ...current.purchase_cost,
        [name]: value
      }
    }));
  }

  function getFieldError(fieldName, nestedPath = "") {
    if (nestedPath && fieldErrors[nestedPath]) {
      return fieldErrors[nestedPath];
    }
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName];
    }
    return "";
  }

  function getInputClass(fieldName, nestedPath = "") {
    const hasError = Boolean(getFieldError(fieldName, nestedPath));
    if (!hasError) {
      return fieldClassName;
    }
    return `${fieldClassName} border-[#d57d6f] focus:border-[#d57d6f] focus:ring-[#f2c4bc]`;
  }

  function FieldError({ fieldName, nestedPath = "" }) {
    const error = getFieldError(fieldName, nestedPath);
    if (!error) {
      return null;
    }
    return <p className="mt-1 text-xs text-[#b25445]">{error}</p>;
  }

  const summary = useMemo(() => {
    const purchaseCost =
      Number(values.purchase_cost.watch_cost || 0) +
      Number(values.purchase_cost.shipping_cost || 0) +
      Number(values.purchase_cost.maintenance_cost || 0) +
      Number(values.purchase_cost.other_costs || 0);
    const salePrice = Number(values.price || 0);
    const profit = salePrice - purchaseCost;
    const margin = purchaseCost > 0 ? (profit / purchaseCost) * 100 : 0;

    return {
      purchaseCost,
      salePrice,
      profit,
      margin
    };
  }, [values.price, values.purchase_cost]);

  const productIdPreview = useMemo(
    () => buildProductIdPreview(values, defaultValues, isEdit, existingProductIds),
    [defaultValues, existingProductIds, isEdit, values]
  );

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      brand: normalizeBrand(values.brand),
      model_name: values.model_name.trim(),
      year_label: values.year_label.trim(),
      condition_score: values.condition_score,
      provider: values.provider.trim(),
      description: values.description.trim(),
      notes: values.notes.trim(),
      purchase_date: values.purchase_date || null,
      price: values.price,
      status: values.status,
      sales_channel: values.sales_channel,
      purchase_cost: {
        watch_cost: values.purchase_cost.watch_cost,
        shipping_cost: values.purchase_cost.shipping_cost,
        maintenance_cost: values.purchase_cost.maintenance_cost,
        other_costs: values.purchase_cost.other_costs,
        payment_method: values.purchase_cost.payment_method,
        source_account: values.purchase_cost.source_account,
        notes: values.purchase_cost.notes.trim()
      }
    });
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]" onSubmit={handleSubmit}>
      <div className="space-y-5">

        <section className="panel-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Reloj</p>
              <h2 className="mt-1 font-serif text-2xl text-[#2a221b]">Ficha principal</h2>
            </div>
            <div className="rounded-lg border border-[#e4d9c7] bg-[#f2ecdf] px-3 py-2 text-sm text-[#7d6c55]">
              <span className="mr-2 text-xs uppercase tracking-[0.12em]">ID</span>
              <span className="font-semibold">{productIdPreview}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Marca">
              <input className={getInputClass("brand")} name="brand" onChange={handleChange} required value={values.brand} />
              <FieldError fieldName="brand" />
            </Field>
            <Field label="Modelo">
              <input className={getInputClass("model_name")} name="model_name" onChange={handleChange} required value={values.model_name} />
              <FieldError fieldName="model_name" />
            </Field>
            <Field label="Año / estilo">
              <input className={getInputClass("year_label")} name="year_label" onChange={handleChange} value={values.year_label} />
              <FieldError fieldName="year_label" />
            </Field>
            <Field label="Condicion (1-10)">
              <input
                className={getInputClass("condition_score")}
                max="10"
                min="1"
                name="condition_score"
                onChange={handleChange}
                step="0.1"
                type="number"
                value={values.condition_score}
              />
              <FieldError fieldName="condition_score" />
            </Field>
            <Field label="Proveedor">
              <input className={getInputClass("provider")} name="provider" onChange={handleChange} value={values.provider} />
              <FieldError fieldName="provider" />
            </Field>
            <Field label="Estado">
              <select className={getInputClass("status")} name="status" onChange={handleChange} value={values.status}>
                <option value="available">Disponible</option>
                <option value="reserved">Apartado</option>
                <option value="sold">Vendido</option>
              </select>
              <FieldError fieldName="status" />
            </Field>
            <Field className="col-span-2" label="Descripcion">
              <textarea
                className={`${getInputClass("description")} min-h-16 resize-none`}
                name="description"
                onChange={handleChange}
                value={values.description}
              />
              <FieldError fieldName="description" />
            </Field>
            <Field className="col-span-2" label="Notas internas">
              <textarea
                className={`${getInputClass("notes")} min-h-16 resize-none`}
                name="notes"
                onChange={handleChange}
                value={values.notes}
              />
              <FieldError fieldName="notes" />
            </Field>
          </div>
        </section>

        <section className="panel-surface p-5">
          <p className="eyebrow">Adquisicion</p>
          <h2 className="mt-1 font-serif text-2xl text-[#2a221b]">Costos y origen</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Costo del reloj">
              <input className={getInputClass("watch_cost", "purchase_cost.watch_cost")} data-group="purchase_cost" min="0" name="watch_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.watch_cost} />
              <FieldError fieldName="watch_cost" nestedPath="purchase_cost.watch_cost" />
            </Field>
            <Field label="Costo de envio">
              <input className={getInputClass("shipping_cost", "purchase_cost.shipping_cost")} data-group="purchase_cost" min="0" name="shipping_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.shipping_cost} />
              <FieldError fieldName="shipping_cost" nestedPath="purchase_cost.shipping_cost" />
            </Field>
            <Field label="Mantenimiento / pila">
              <input className={getInputClass("maintenance_cost", "purchase_cost.maintenance_cost")} data-group="purchase_cost" min="0" name="maintenance_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.maintenance_cost} />
              <FieldError fieldName="maintenance_cost" nestedPath="purchase_cost.maintenance_cost" />
            </Field>
            <Field label="Otros costos">
              <input className={getInputClass("other_costs", "purchase_cost.other_costs")} data-group="purchase_cost" min="0" name="other_costs" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.other_costs} />
              <FieldError fieldName="other_costs" nestedPath="purchase_cost.other_costs" />
            </Field>
            <Field label="Metodo de pago compra">
              <select className={getInputClass("payment_method", "purchase_cost.payment_method")} data-group="purchase_cost" name="payment_method" onChange={handlePurchaseCostChange} value={values.purchase_cost.payment_method}>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option value="msi">MSI</option>
                <option value="consignment">Consigna</option>
              </select>
              <FieldError fieldName="payment_method" nestedPath="purchase_cost.payment_method" />
            </Field>
            <Field label="Cuenta origen">
              <select className={getInputClass("source_account", "purchase_cost.source_account")} data-group="purchase_cost" name="source_account" onChange={handlePurchaseCostChange} value={values.purchase_cost.source_account}>
                <option value="cash">Efectivo</option>
                <option value="bbva">BBVA</option>
                <option value="credit">Credito</option>
                <option value="amex">Amex</option>
              </select>
              <FieldError fieldName="source_account" nestedPath="purchase_cost.source_account" />
            </Field>
            <Field label="Fecha de compra">
              <input
                className={`${getInputClass("purchase_date")} block w-full min-w-0 max-w-full appearance-none text-xs sm:text-sm`}
                name="purchase_date"
                onChange={handleChange}
                type="date"
                value={values.purchase_date}
              />
              <FieldError fieldName="purchase_date" />
            </Field>
            <Field label="Canal de venta previsto">
              <select className={getInputClass("sales_channel")} name="sales_channel" onChange={handleChange} value={values.sales_channel}>
                <option value="marketplace">Marketplace</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="direct">Directo</option>
                <option value="other">Otro</option>
              </select>
              <FieldError fieldName="sales_channel" />
            </Field>
            <Field className="col-span-2 sm:col-span-3" label="Notas de compra">
              <textarea
                className={`${getInputClass("notes", "purchase_cost.notes")} min-h-16 resize-none`}
                data-group="purchase_cost"
                name="notes"
                onChange={handlePurchaseCostChange}
                value={values.purchase_cost.notes}
              />
              <FieldError fieldName="notes" nestedPath="purchase_cost.notes" />
            </Field>
          </div>
        </section>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
        <section className="panel-surface p-5">
          <p className="eyebrow">Precio</p>
          <h2 className="mt-1 font-serif text-2xl text-[#2a221b]">Resumen financiero</h2>

          <Field label="Precio de venta (MXN)">
            <input className={getInputClass("price")} min="0" name="price" onChange={handleChange} step="0.01" type="number" value={values.price} />
            <FieldError fieldName="price" />
          </Field>

          <div className="mt-4 rounded-xl border border-[#e1d5c2] bg-[#faf4e9] p-4">
            <div className="flex items-center justify-between text-sm text-[#7f6d59]">
              <span>Costo total compra</span>
              <span>{formatCurrency(summary.purchaseCost)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-[#7f6d59]">
              <span>Precio de venta</span>
              <span>{formatCurrency(summary.salePrice)}</span>
            </div>
            <div className="mt-4 border-t border-[#e4d7c3] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl text-[#2a221b]">Ganancia est.</span>
                <span className={`font-serif text-3xl ${summary.profit >= 0 ? "text-[#5f8f66]" : "text-[#a55b4f]"}`}>
                  {formatCurrency(summary.profit)}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#8c7963]">Utilidad: {summary.margin.toFixed(1)}%</p>
            </div>
          </div>
        </section>

        {isEdit ? (
          <button
            className="w-full rounded-lg border border-[#dec5bd] bg-[#fff4f1] px-4 py-2.5 text-sm text-[#8d5b4d] transition hover:bg-[#fdebe7]"
            disabled={isDeleting}
            onClick={onDelete}
            type="button"
          >
            {isDeleting ? "Eliminando..." : "Eliminar reloj"}
          </button>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <NavLink
            className="inline-flex items-center justify-center rounded-lg border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#7d6751] transition hover:bg-[#f3ecde]"
            to={cancelPath}
          >
            Cancelar
          </NavLink>
          <button className="gold-button w-full py-2.5" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Guardando..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

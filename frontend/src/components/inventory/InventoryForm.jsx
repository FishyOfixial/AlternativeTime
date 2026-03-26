import { useEffect, useMemo, useState } from "react";

const initialValues = {
  brand: "",
  model_name: "",
  year_label: "",
  condition_score: "8.0",
  provider: "",
  description: "",
  notes: "",
  purchase_date: "",
  price: "0.00",
  status: "available",
  sales_channel: "marketplace",
  image_url: "",
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
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function buildFormState(defaultValues = {}) {
  const purchaseCost = defaultValues.purchase_cost || {};

  return {
    ...initialValues,
    ...defaultValues,
    condition_score: String(defaultValues.condition_score ?? initialValues.condition_score),
    price: String(defaultValues.price ?? initialValues.price),
    purchase_date: defaultValues.purchase_date || "",
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

export default function InventoryForm({
  defaultValues = {},
  isEdit = false,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  submitError = ""
}) {
  const [values, setValues] = useState(() => buildFormState(defaultValues));

  useEffect(() => {
    setValues(buildFormState(defaultValues));
  }, [defaultValues]);

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

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      brand: values.brand.trim(),
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
      image_url: values.image_url.trim(),
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
    <form className="grid gap-5 xl:grid-cols-[1.25fr_0.55fr]" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[#cfdcf0] bg-[#eef5fe] px-4 py-3 text-sm text-[#5f7da2]">
          {isEdit
            ? `ID del reloj: ${defaultValues.product_id || "Pendiente"}`
            : "El ID del reloj se genera automaticamente al guardar, con base en la marca."}
        </div>

        {submitError ? (
          <div className="rounded-xl border border-[#e4c2bc] bg-[#fff1ee] px-4 py-3 text-sm text-[#935849]">
            {submitError}
          </div>
        ) : null}

        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Informacion del reloj</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Marca</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="brand" onChange={handleChange} required value={values.brand} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">ID generado</span>
              <input className="mt-2 w-full rounded-md border border-[#e4d9c7] bg-[#f2ecdf] px-4 py-3 text-[#7d6c55]" readOnly value={defaultValues.product_id || "Se genera al guardar"} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Modelo</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="model_name" onChange={handleChange} required value={values.model_name} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Año / estilo</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="year_label" onChange={handleChange} value={values.year_label} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Condicion (1-10)</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" max="10" min="1" name="condition_score" onChange={handleChange} step="0.1" type="number" value={values.condition_score} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Proveedor / vendedor</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="provider" onChange={handleChange} value={values.provider} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Estado</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="status" onChange={handleChange} value={values.status}>
                <option value="available">Disponible</option>
                <option value="reserved">Apartado</option>
                <option value="sold">Vendido</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Etiqueta automatica</span>
              <div className="mt-2 rounded-md border border-[#e4d9c7] bg-[#f2ecdf] px-4 py-3 text-[#7d6c55]">
                {(defaultValues.age_tag || defaultValues.tag || "new").replace("_", " ")}
              </div>
            </label>
            <label className="md:col-span-2 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Descripcion</span>
              <textarea className="mt-2 min-h-28 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="description" onChange={handleChange} value={values.description} />
            </label>
            <label className="md:col-span-2 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Notas internas</span>
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="notes" onChange={handleChange} value={values.notes} />
            </label>
          </div>
        </section>

        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Costos de adquisicion</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Costo del reloj</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="watch_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.watch_cost} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Costo de envio</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="shipping_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.shipping_cost} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Mantenimiento / pila</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="maintenance_cost" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.maintenance_cost} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Otros costos</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="other_costs" onChange={handlePurchaseCostChange} step="0.01" type="number" value={values.purchase_cost.other_costs} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Metodo de pago compra</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="payment_method" onChange={handlePurchaseCostChange} value={values.purchase_cost.payment_method}>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option value="msi">MSI</option>
                <option value="consignment">Consigna</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Cuenta origen</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="source_account" onChange={handlePurchaseCostChange} value={values.purchase_cost.source_account}>
                <option value="cash">Efectivo</option>
                <option value="bbva">BBVA</option>
                <option value="credit">Credito</option>
                <option value="amex">Amex</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Fecha de compra</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="purchase_date" onChange={handleChange} type="date" value={values.purchase_date} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Canal de venta previsto</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="sales_channel" onChange={handleChange} value={values.sales_channel}>
                <option value="marketplace">Marketplace</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="direct">Directo</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <label className="md:col-span-3 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Notas de compra</span>
              <textarea className="mt-2 min-h-20 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="notes" onChange={handlePurchaseCostChange} value={values.purchase_cost.notes} />
            </label>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Precio de venta</h2>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Precio de venta (MXN)</span>
            <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="price" onChange={handleChange} step="0.01" type="number" value={values.price} />
          </label>
          <div className="mt-5 rounded-xl border border-[#e1d5c2] bg-[#faf4e9] p-4">
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
                <span className="font-serif text-3xl text-[#5f8f66]">{formatCurrency(summary.profit)}</span>
              </div>
              <p className="mt-2 text-sm text-[#8c7963]">Utilidad: {summary.margin.toFixed(1)}%</p>
            </div>
          </div>
        </section>

        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Foto del reloj</h2>
          <div className="mt-4 flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-[#dccfb9] bg-[#faf4e9] px-4 py-6 text-center text-sm text-[#a08c73]">
            {values.image_url ? (
              <img alt="Preview del reloj" className="max-h-40 rounded-xl object-cover" src={values.image_url} />
            ) : (
              <div>
                <p>Pega la URL de la imagen del reloj.</p>
                <p className="mt-1 text-xs">La subida directa de archivos queda para la siguiente fase.</p>
              </div>
            )}
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">URL de imagen</span>
            <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="image_url" onChange={handleChange} value={values.image_url} />
          </label>
        </section>

        <button className="gold-button w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

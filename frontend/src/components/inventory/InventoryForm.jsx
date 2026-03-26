import { useEffect, useMemo, useState } from "react";

const initialValues = {
  brand: "",
  model_name: "",
  sku: "",
  year_label: "",
  condition_score: "0.0",
  provider: "",
  description: "",
  cost_price: "0.00",
  shipping_cost: "0.00",
  maintenance_cost: "0.00",
  payment_method: "cash",
  purchase_date: "",
  price: "0.00",
  status: "available",
  tag: "none",
  sales_channel: "marketplace",
  image_url: "",
  stock: "1"
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getPrefix(brand) {
  return (brand || "ATC")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
}

function buildNextSku(brand, items) {
  const prefix = getPrefix(brand);
  const matches = items
    .map((item) => item.sku || "")
    .filter((sku) => sku.startsWith(`${prefix}-`))
    .map((sku) => Number(sku.split("-")[1] || 0))
    .filter((value) => !Number.isNaN(value));

  const next = (Math.max(0, ...matches) + 1).toString().padStart(3, "0");
  return `${prefix}-${next}`;
}

export default function InventoryForm({
  defaultValues = {},
  existingItems = [],
  isEdit = false,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  submitError = ""
}) {
  const [values, setValues] = useState({
    ...initialValues,
    ...Object.fromEntries(
      Object.entries(defaultValues || {}).map(([key, value]) => [
        key,
        value === null || value === undefined ? "" : String(value)
      ])
    )
  });

  useEffect(() => {
    if (isEdit) {
      return;
    }

    setValues((current) => {
      if (!current.brand) {
        return current;
      }

      return {
        ...current,
        sku: buildNextSku(current.brand, existingItems)
      };
    });
  }, [existingItems, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => {
      const nextValues = {
        ...current,
        [name]: value
      };

      if (!isEdit && name === "brand") {
        nextValues.sku = buildNextSku(value, existingItems);
      }

      return nextValues;
    });
  }

  const summary = useMemo(() => {
    const cost =
      Number(values.cost_price || 0) +
      Number(values.shipping_cost || 0) +
      Number(values.maintenance_cost || 0);
    const salePrice = Number(values.price || 0);
    const profit = salePrice - cost;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

    return {
      cost,
      salePrice,
      profit,
      margin
    };
  }, [values.cost_price, values.shipping_cost, values.maintenance_cost, values.price]);

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      brand: values.brand.trim(),
      model_name: values.model_name.trim(),
      sku: values.sku.trim(),
      year_label: values.year_label.trim(),
      condition_score: values.condition_score,
      provider: values.provider.trim(),
      description: values.description.trim(),
      cost_price: values.cost_price,
      shipping_cost: values.shipping_cost,
      maintenance_cost: values.maintenance_cost,
      payment_method: values.payment_method,
      purchase_date: values.purchase_date || null,
      price: values.price,
      status: values.status,
      tag: values.tag,
      sales_channel: values.sales_channel,
      image_url: values.image_url.trim(),
      stock: values.status === "sold" ? 0 : 1
    });
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1.25fr_0.55fr]" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[#cfdcf0] bg-[#eef5fe] px-4 py-3 text-sm text-[#5f7da2]">
          El ID se genera automaticamente al seleccionar la marca.
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
              <input className="mt-2 w-full rounded-md border border-[#e4d9c7] bg-[#f2ecdf] px-4 py-3 text-[#7d6c55]" name="sku" onChange={handleChange} readOnly={!isEdit} required value={values.sku} />
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
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" max="10" min="0" name="condition_score" onChange={handleChange} step="0.1" type="number" value={values.condition_score} />
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
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Etiqueta</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="tag" onChange={handleChange} value={values.tag}>
                <option value="none">Sin etiqueta</option>
                <option value="new">Nuevo</option>
                <option value="discount">Descuento</option>
                <option value="promote">Promover</option>
              </select>
            </label>
            <label className="md:col-span-2 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Descripcion</span>
              <textarea className="mt-2 min-h-28 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="description" onChange={handleChange} value={values.description} />
            </label>
          </div>
        </section>

        <section className="panel-surface p-5">
          <h2 className="font-serif text-2xl text-[#2a221b]">Costos de adquisicion</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Costo del reloj</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="cost_price" onChange={handleChange} step="0.01" type="number" value={values.cost_price} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Costo de envio</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="shipping_cost" onChange={handleChange} step="0.01" type="number" value={values.shipping_cost} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Mantenimiento / pila</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" min="0" name="maintenance_cost" onChange={handleChange} step="0.01" type="number" value={values.maintenance_cost} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Metodo de pago compra</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="payment_method" onChange={handleChange} value={values.payment_method}>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Fecha de compra</span>
              <input className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="purchase_date" onChange={handleChange} type="date" value={values.purchase_date} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Canal</span>
              <select className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3" name="sales_channel" onChange={handleChange} value={values.sales_channel}>
                <option value="marketplace">Marketplace</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="store">Tienda</option>
              </select>
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
              <span>Costo total</span>
              <span>{formatCurrency(summary.cost)}</span>
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
              <p className="mt-2 text-sm text-[#8c7963]">Margen: {summary.margin.toFixed(0)}%</p>
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
                <p>Arrastra imagen o pega una URL.</p>
                <p className="mt-1 text-xs">JPG, PNG hasta 5MB</p>
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

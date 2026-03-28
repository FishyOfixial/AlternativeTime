const initialValues = {
  name: "",
  phone: "",
  email: "",
  instagram_handle: "",
  address: "",
  notes: "",
  is_active: true
};

export default function ClientForm({
  defaultValues = initialValues,
  isSubmitting = false,
  onSubmit,
  submitLabel = "Guardar cliente"
}) {
  const values = {
    ...initialValues,
    ...defaultValues
  };

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    onSubmit({
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      instagram_handle: String(formData.get("instagram_handle") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      is_active: formData.get("is_active") === "on"
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Nombre
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            defaultValue={values.name}
            name="name"
            required
            type="text"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Telefono
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            defaultValue={values.phone}
            name="phone"
            required
            type="text"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Email
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            defaultValue={values.email}
            name="email"
            type="email"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
            Instagram
          </span>
          <input
            className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
            defaultValue={values.instagram_handle}
            name="instagram_handle"
            placeholder="@usuario"
            type="text"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
          Direccion
        </span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
          defaultValue={values.address}
          name="address"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
          Notas
        </span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
          defaultValue={values.notes}
          name="notes"
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-[#ddcfba] bg-[#fcf8f2] px-4 py-3 text-sm text-[#6f5a46]">
        <input defaultChecked={values.is_active} name="is_active" type="checkbox" />
        Cliente activo
      </label>

      <button className="gold-button w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

const initialValues = {
  name: "",
  phone: "",
  email: "",
  instagram_handle: "",
  address: "",
  notes: ""
};

const inputClassName =
  "mt-1.5 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

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
      notes: String(formData.get("notes") || "").trim()
    });
  }

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Nombre</span>
          <input className={inputClassName} defaultValue={values.name} name="name" required type="text" />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Telefono</span>
          <input className={inputClassName} defaultValue={values.phone} name="phone" required type="text" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Email</span>
          <input className={inputClassName} defaultValue={values.email} name="email" type="email" />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Instagram</span>
          <input
            className={inputClassName}
            defaultValue={values.instagram_handle}
            name="instagram_handle"
            placeholder="@usuario"
            type="text"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Direccion</span>
        <textarea
          className={`${inputClassName} min-h-20 resize-none`}
          defaultValue={values.address}
          name="address"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">Notas</span>
        <textarea
          className={`${inputClassName} min-h-24 resize-none`}
          defaultValue={values.notes}
          name="notes"
        />
      </label>

      <button className="gold-button w-full py-2.5" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

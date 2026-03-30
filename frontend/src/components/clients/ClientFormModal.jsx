import AppModal from "../common/AppModal";
import ErrorState from "../feedback/ErrorState";
import ClientForm from "./ClientForm";

export default function ClientFormModal({
  isOpen,
  title,
  submitLabel,
  defaultValues,
  isSubmitting,
  submitError,
  onSubmit,
  onClose
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <AppModal isOpen={isOpen} maxWidthClass="max-w-xl" onClose={onClose}>
      <div>
        <div>
          <p className="eyebrow">Clientes</p>
          <h2 className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-3xl">{title}</h2>
        </div>

        {submitError ? (
          <div className="mb-4 mt-4">
            <ErrorState message={submitError} title="No pudimos guardar el cliente" />
          </div>
        ) : null}

        <div className="mt-4">
          <ClientForm
            defaultValues={defaultValues}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </AppModal>
  );
}

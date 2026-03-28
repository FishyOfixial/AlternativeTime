import { useEffect, useState } from "react";
import ErrorState from "../feedback/ErrorState";
import ClientForm from "./ClientForm";

const ANIMATION_MS = 200;

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
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    if (shouldRender) {
      setIsVisible(false);
      const timeoutId = window.setTimeout(() => setShouldRender(false), ANIMATION_MS);
      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-3 py-4 transition-opacity duration-200 sm:items-center sm:px-4 ${
        isVisible ? "bg-black/45 opacity-100" : "bg-black/0 opacity-0"
      }`}
    >
      <button
        aria-label="Cerrar formulario de cliente"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <section
        className={`panel-surface relative z-10 my-auto w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto p-4 transition-all duration-200 sm:max-h-[min(90vh,760px)] sm:p-6 ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Clientes</p>
            <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">{title}</h2>
          </div>
          <button
            className="rounded-md border border-[#dccfb9] px-3 py-1 text-xs text-[#7d6751]"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
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
            onSubmit={onSubmit}
            submitLabel={submitLabel}
          />
        </div>
      </section>
    </div>
  );
}

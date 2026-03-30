import { useEffect, useRef, useState } from "react";

const ANIMATION_MS = 200;
const modalStack = [];

export default function AppModal({
  isOpen,
  onClose,
  maxWidthClass = "max-w-xl",
  children
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const modalIdRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const modalId = modalIdRef.current;

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
      return undefined;
    }

    if (!modalStack.includes(modalId)) {
      modalStack.push(modalId);
    }

    function handleKeyDown(event) {
      const isTopmostModal = modalStack[modalStack.length - 1] === modalId;
      if (event.key === "Escape" && isTopmostModal) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      const index = modalStack.lastIndexOf(modalId);
      if (index >= 0) {
        modalStack.splice(index, 1);
      }
      document.body.style.overflow = modalStack.length ? "hidden" : "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shouldRender, onClose, modalId]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <div
        className={`relative z-10 w-full ${maxWidthClass} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] border border-[#eadfcd] bg-[#fffdf9] p-5 shadow-[0_32px_80px_-42px_rgba(32,25,20,0.65)] transition-all duration-200 sm:p-6 ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const sections = [
  {
    number: "01",
    title: "Políticas de Envío y Procesamiento",
    items: [
      ["Tiempo de procesamiento", "Todos los pedidos se procesan y preparan para su envío en un plazo de 1 a 3 días hábiles."],
      ["Paqueterías", "Los envíos se realizan exclusivamente a través de servicios Express de DHL o FedEx."],
      ["Tiempos de entrega", "Una vez que el paquete es entregado a la paquetería, el tiempo estimado de entrega es de 1 a 5 días hábiles."],
      ["Rastreo", "Te proporcionaremos un número de guía en cuanto el paquete vaya en camino para que puedas monitorear su trayecto en todo momento."]
    ]
  },
  {
    number: "02",
    title: "Políticas de Venta",
    subtitle: "Cambios y devoluciones",
    items: [
      ["Piezas únicas", "En Alternative Time, cada pieza es única y ha sido seleccionada cuidadosamente para coleccionistas y amantes de la relojería."],
      ["Ventas finales", "Debido a la naturaleza vintage y exclusiva de nuestro inventario, todas nuestras ventas son finales. No contamos con devoluciones, reembolsos ni cambios por insatisfacción o cambio de opinión."],
      ["Transparencia", "Nos esforzamos por brindarte descripciones detalladas, fotografías reales y atención personalizada para que cuentes con toda la información necesaria antes de realizar tu compra."]
    ]
  },
  {
    number: "03",
    title: "Garantía Limitada por Daño o Defecto",
    subtitle: "15 días naturales",
    items: [
      ["Naturaleza vintage", "Vendemos relojes históricos, muchos de ellos desde los años 50 en adelante. Debido a su antigüedad no es posible ofrecer una garantía mecánica extendida; antes de publicar cada pieza verificamos minuciosamente su correcto funcionamiento."],
      ["Plazo de cobertura", "Si tu reloj llega con un daño ocasionado durante el traslado o presenta una falla mecánica de origen, cuentas con un plazo estricto de 15 días naturales a partir de la fecha de entrega para reportarlo."]
    ],
    steps: [
      ["Contacto inmediato", "Contáctanos dentro de los 15 días naturales posteriores a recibir tu pieza."],
      ["Evidencia", "Envíanos fotos y un video claro donde se aprecien el empaque y el problema o falla de la pieza."],
      ["Solución", "Una vez validado el caso por nuestro equipo, nos encargaremos de la reparación del reloj sin costo adicional para ti."]
    ]
  }
];

export default function PoliciesModal({ isOpen, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      aria-labelledby="policies-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
    >
      <button aria-label="Cerrar políticas" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#111210] shadow-2xl sm:max-h-[88vh] sm:rounded-[28px]">
        <header className="flex items-start justify-between gap-5 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#b99a59]">Alternative Time Co.</p>
            <h2 className="mt-2 font-brand text-3xl text-white sm:text-4xl" id="policies-title">Políticas de compra</h2>
            <p className="mt-2 text-sm text-[#8f8c85]">Información importante antes de adquirir una pieza.</p>
          </div>
          <button
            aria-label="Cerrar políticas"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-[#d8d2c7] transition hover:border-[#b99a59] hover:text-white"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-10">
            {sections.map((section) => (
              <section className="grid gap-5 sm:grid-cols-[64px_1fr]" key={section.number}>
                <span className="font-brand text-3xl text-[#b99a59]/60">{section.number}</span>
                <div>
                  <h3 className="font-brand text-2xl text-[#f4f0e8] sm:text-3xl">{section.title}</h3>
                  {section.subtitle ? <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#b99a59]">{section.subtitle}</p> : null}
                  <div className="mt-5 space-y-4">
                    {section.items.map(([title, description]) => (
                      <div className="border-l border-[#b99a59]/40 pl-4" key={title}>
                        <h4 className="text-sm font-semibold text-[#e7dfd2]">{title}</h4>
                        <p className="mt-1 text-sm leading-6 text-[#9c9991]">{description}</p>
                      </div>
                    ))}
                  </div>
                  {section.steps ? (
                    <div className="mt-7 rounded-2xl border border-[#b99a59]/20 bg-[#b99a59]/[0.06] p-5">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8ab6c]">Pasos para hacer válida la revisión</h4>
                      <ol className="mt-5 space-y-4">
                        {section.steps.map(([title, description], index) => (
                          <li className="flex gap-4" key={title}>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b99a59]/40 text-xs text-[#c8ab6c]">{index + 1}</span>
                            <p className="text-sm leading-6 text-[#9c9991]"><strong className="text-[#e7dfd2]">{title}:</strong> {description}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-white/10 bg-[#0d0e0d] px-5 py-4 sm:px-8">
          <button className="w-full rounded-full bg-[#c9a85f] px-6 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#dfc075] sm:w-auto" onClick={onClose} type="button">
            Entendido
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

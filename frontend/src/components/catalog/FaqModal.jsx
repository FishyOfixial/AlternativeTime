import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const faqSections = [
  {
    title: "Envíos y Entregas",
    questions: [
      {
        question: "¿A qué partes realizan envíos y qué paqueterías usan?",
        answer: "Realizamos envíos a todo México. Para garantizar que tu pieza llegue rápida y segura, utilizamos exclusivamente los servicios Express de DHL y FedEx."
      },
      {
        question: "¿Cuánto tarda en llegar mi pedido?",
        answer: "Nos tomamos de 1 a 3 días hábiles para procesar y preparar meticulosamente tu orden. Una vez que la paquetería recolecta el paquete, el tiempo de entrega estimado es de 1 a 5 días hábiles. Te compartiremos tu número de guía de inmediato para que puedas rastrearlo."
      },
      {
        question: "¿Qué pasa si mi paquete se retrasa o hay un problema con la paquetería?",
        answer: "Una vez que entregamos el paquete a DHL o FedEx, los tiempos dependen directamente de ellos. Sin embargo, nosotros te daremos seguimiento y te apoyaremos a gestionar cualquier aclaración con la paquetería para asegurar que recibas tu compra."
      }
    ]
  },
  {
    title: "Detalles del Inventario y Autenticidad",
    questions: [
      {
        question: "¿Los relojes son originales?",
        answer: "Sí. El 100% de nuestras piezas son completamente originales. Nuestro equipo de expertos revisa minuciosamente la autenticidad de cada componente, movimiento y caja antes de ponerlos a la venta."
      },
      {
        question: "¿Venden relojes nuevos o usados?",
        answer: "Nos especializamos en alta relojería e historia, por lo que nuestro catálogo está compuesto principalmente por piezas vintage y de época. Cada reloj tiene un carácter único y una historia propia, aunque también manejamos algunas piezas nuevas."
      },
      {
        question: "¿El reloj que veo en la foto es exactamente el que voy a recibir?",
        answer: "Sí. Todas las fotos y videos en nuestro sitio web son reales y tomados directamente de la pieza que estás comprando. No usamos fotos de catálogo y nos esforzamos por mostrarte a detalle el estado estético de cada reloj."
      }
    ]
  },
  {
    title: "Garantías, Cambios y Devoluciones",
    questions: [
      {
        question: "¿Tienen alguna garantía los relojes?",
        answer: "Sí. Al ser relojes históricos y antiguos, no es posible ofrecer una garantía mecánica a largo plazo; sin embargo, te respaldamos con una Garantía Limitada de 15 días naturales a partir de que recibes el paquete. Esta garantía cubre cualquier falla mecánica de origen o daño en el traslado."
      },
      {
        question: "¿Cómo hago válida mi garantía si mi reloj falla?",
        answer: "Si notas alguna falla de origen dentro de los primeros 15 días, contáctanos de inmediato. Te pediremos fotos y un video claro mostrando el problema junto con el empaque. Una vez validado el caso, nos encargaremos de la reparación sin costo adicional. La garantía no cubre daños por mal uso, golpes, exposición al agua en piezas no sumergibles ni piezas abiertas por relojeros ajenos a nuestro equipo."
      },
      {
        question: "¿Puedo devolver un reloj si cambio de opinión o no me gustó?",
        answer: "Debido a la naturaleza exclusiva y vintage de nuestras piezas, todas las ventas son finales. No realizamos cambios, devoluciones ni reembolsos por insatisfacción o cambio de opinión. Te invitamos a revisar bien las fotos y descripciones antes de comprar."
      }
    ]
  },
  {
    title: "Métodos de Pago y Seguridad",
    questions: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express; pagos seguros por Mercado Pago; transferencias y depósitos bancarios SPEI."
      }
    ]
  },
  {
    title: "Sistema de Apartado",
    questions: [
      {
        question: "¿Cómo funciona el sistema de apartado?",
        answer: "Eliges la pieza y realizas el pago inicial correspondiente al plazo que prefieras. La pieza queda reservada exclusivamente para ti durante el tiempo acordado. Dentro de ese plazo puedes liquidarla en su totalidad o realizar abonos hasta completar el pago."
      },
      {
        question: "¿Cuáles son las opciones de apartado disponibles?",
        answer: (
          <ul className="space-y-2">
            <li><strong className="text-[#ded6c9]">8 días:</strong> pago inicial del 10% del valor de la pieza.</li>
            <li><strong className="text-[#ded6c9]">12 días:</strong> pago inicial del 30% del valor de la pieza.</li>
            <li><strong className="text-[#ded6c9]">30 días:</strong> pago inicial del 60% del valor de la pieza.</li>
          </ul>
        )
      },
      {
        question: "¿Qué pasa si vence el plazo y no liquido la pieza o cancelo el apartado?",
        answer: "Es indispensable respetar el plazo acordado. Si expira y la pieza no ha sido liquidada en su totalidad, el apartado se cancelará automáticamente, la pieza volverá a estar disponible y el anticipo o los abonos realizados no serán reembolsables ni transferibles a otra pieza."
      },
      {
        question: "¿Cuándo se envía mi reloj si lo compré por sistema de apartado?",
        answer: "Tu pieza se procesará y enviará bajo nuestras políticas normales, de 1 a 3 días hábiles de procesamiento mediante DHL o FedEx Express, una vez que el valor total del reloj haya sido liquidado al 100%."
      }
    ]
  }
];

export default function FaqModal({ isOpen, onClose }) {
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
    <div aria-labelledby="faq-title" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6" role="dialog">
      <button aria-label="Cerrar preguntas frecuentes" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#111210] shadow-2xl sm:max-h-[88vh] sm:rounded-[28px]">
        <header className="flex items-start justify-between gap-5 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#b99a59]">Alternative Time Co.</p>
            <h2 className="mt-2 font-brand text-3xl text-white sm:text-4xl" id="faq-title">Preguntas frecuentes</h2>
            <p className="mt-2 text-sm text-[#8f8c85]">Todo lo que necesitas saber antes de elegir tu reloj.</p>
          </div>
          <button aria-label="Cerrar preguntas frecuentes" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-[#d8d2c7] transition hover:border-[#b99a59] hover:text-white" onClick={onClose} ref={closeButtonRef} type="button">×</button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-9">
            {faqSections.map((section) => (
              <section key={section.title}>
                <h3 className="border-b border-[#b99a59]/25 pb-3 font-brand text-xl text-[#d4b874] sm:text-2xl">{section.title}</h3>
                <div className="mt-2 divide-y divide-white/10">
                  {section.questions.map((item) => (
                    <details className="group py-1" key={item.question}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-semibold text-[#eee8de] marker:content-none sm:text-base">
                        {item.question}
                        <span aria-hidden="true" className="text-xl font-light text-[#b99a59] transition group-open:rotate-45">+</span>
                      </summary>
                      <div className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-[#9c9991]">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-white/10 bg-[#0d0e0d] px-5 py-4 sm:px-8">
          <button className="w-full rounded-full bg-[#c9a85f] px-6 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#dfc075] sm:w-auto" onClick={onClose} type="button">Entendido</button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

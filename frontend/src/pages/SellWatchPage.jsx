import { Link } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";

const sellSteps = [
  {
    title: "Envíanos los detalles",
    text: "Escríbenos por WhatsApp y comparte imágenes claras junto con videos detallados de la pieza que deseas vender. Mientras mejor podamos apreciar el estado del reloj, más precisa será la evaluación inicial.",
    icon: (
      <path d="M8 18.5 4.5 21l.9-4.2A8 8 0 1 1 8 18.5Zm3.8-5.4h.1m-3.1 0h.1m6.1 0h.1" />
    )
  },
  {
    title: "Recibe una oferta cotizada",
    text: "Analizamos la marca, el modelo y las condiciones estéticas de tu reloj para presentarte una oferta justa, clara y basada en el mercado actual.",
    icon: (
      <path d="M20 7.5 13.5 14 10 10.5 4 16.5M15 7.5h5v5M5 5h14v14H5z" />
    )
  },
  {
    title: "Envío e inspección técnica",
    text: "Si aceptas la oferta, nos envías la pieza para revisión física. Cualquier diferencia contra la condición declarada puede ajustar la oferta final.",
    icon: (
      <path d="M3.5 8.5 12 4l8.5 4.5-8.5 4.5-8.5-4.5Zm0 0V16l8.5 4.5 8.5-4.5V8.5M12 13v7.5M17.5 18.5l3 3m-1.1-5.2a3.1 3.1 0 1 0-4.4 4.4 3.1 3.1 0 0 0 4.4-4.4Z" />
    )
  },
  {
    title: "Pago inmediato",
    text: "Una vez confirmada la condición del reloj, realizamos el pago de forma segura mediante transferencia bancaria. Directo y sin complicaciones.",
    icon: (
      <path d="M4 7h16v10H4zM4 10h16M8 14h4m4 0h1.5M7 4.5h10" />
    )
  }
];

const sellWhatsappMessage = "Hola, quiero vender un reloj con Alternative Time Co. ¿Me pueden ayudar con una cotización?";

function StepIcon({ children }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-[#c4a45f]/25 bg-[#c4a45f]/10"
      style={{ height: "3.5rem", width: "3.5rem" }}
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="42"
        stroke="#d4b874"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.65"
        viewBox="0 0 24 24"
        width="32"
      >
        {children}
      </svg>
    </span>
  );
}

export default function SellWatchPage() {
  return (
    <CatalogShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(196,164,95,.16),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,.06),transparent_24%),linear-gradient(135deg,#111210_0%,#070808_58%,#15120b_100%)]" />
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
          <Link className="text-xs uppercase tracking-[0.25em] text-[#9f8959] hover:text-[#c8ae74]" to="/">
            ← Volver al inicio
          </Link>

          <div className="mt-10 max-w-4xl">
            <p className="text-xs uppercase tracking-[0.42em] text-[#c4a45f]">Vende tu reloj</p>
            <h1 className="mt-5 max-w-3xl font-brand text-4xl leading-[.95] text-white sm:text-6xl">
              Proceso de compra.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#aaa69d]">
              Vender tu pieza con nosotros es rápido, seguro y transparente. Diseñamos un proceso sencillo para que recibas una oferta clara y tu pago sin complicaciones.
            </p>
            <div className="mt-8">
              <ContactLinks
                message={sellWhatsappMessage}
                showInstagram={false}
                whatsappLabel="Iniciar cotización por WhatsApp"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sellSteps.map((step, index) => (
              <article
                className="flex min-h-[23rem] flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,.2)] transition hover:border-[#c4a45f]/30 hover:bg-white/[0.06] sm:p-6"
                key={step.title}
              >
                <div className="flex items-center justify-between gap-4">
                  <StepIcon>{step.icon}</StepIcon>
                  <span className="font-brand text-5xl leading-none text-[#c4a45f]/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9c8148]">
                  Paso {index + 1}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-tight text-[#f1ede5]">{step.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#aaa69d]">{step.text}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-7 text-[#8f8c85]">
            Tip: para una cotización más precisa, ten a la mano fotos del frente, laterales, parte trasera, brazalete/correa y un video breve mostrando el funcionamiento.
          </p>
        </section>
      </main>
    </CatalogShell>
  );
}

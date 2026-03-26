import EmptyState from "../components/feedback/EmptyState";

export default function LoginPage() {
  return (
    <section className="grid overflow-hidden rounded-[22px] border border-[#d9ccb8] bg-[#fbf7f0] lg:grid-cols-[1.25fr_0.75fr]">
      <div className="flex min-h-[620px] flex-col items-center justify-center bg-[#211b16] px-8 py-12 text-center">
        <p className="font-serif text-5xl font-semibold leading-tight text-[#d7ae57]">
          Alternative
          <br />
          Time Co.
        </p>
        <p className="mt-5 text-[11px] uppercase tracking-[0.38em] text-[#7d6a53]">
          Vintage · Classic · Timeless
        </p>
        <div className="mt-10 h-px w-44 bg-[#6a5431]" />
        <p className="mt-6 text-sm italic text-[#82715d]">
          Sistema de Punto de Venta
        </p>
      </div>

      <div className="flex items-center bg-[#f8f3eb] px-8 py-10 sm:px-12">
        <EmptyState
          title="Bienvenido"
          message="La ruta y la composicion ya siguen el mockup. En el Sprint Frontend 2 entraran el formulario real, JWT, auth/me y el flujo de sesion."
        />
      </div>
    </section>
  );
}

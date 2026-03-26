import EmptyState from "../components/feedback/EmptyState";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">Sprint Frontend 3</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
          Dashboard base dentro de la shell autenticada.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#736350]">
          Esta vista ya vive dentro del layout privado y sirve para validar la
          navegacion interna antes de integrar el dashboard real.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["Ventas totales", "$81,630"],
          ["Ganancia total", "$33,324"],
          ["Capital en inventario", "$71,100"],
          ["Dias promedio", "32"]
        ].map(([title, value], index) => (
          <div
            key={title}
            className={`stat-card ${index === 0 ? "bg-[#211b16] text-[#f7f1e6]" : ""}`}
          >
            <p className={`text-sm uppercase tracking-[0.16em] ${index === 0 ? "text-[#9d8666]" : "text-[#b5a18a]"}`}>
              {title}
            </p>
            <p className={`mt-3 font-serif text-[34px] ${index === 0 ? "text-[#ddb65f]" : "text-[#2a221b]"}`}>
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="panel-surface p-6">
          <p className="font-serif text-2xl text-[#2a221b]">Ventas por mes</p>
          <div className="mt-6 flex h-48 items-end gap-4 border-t border-[#ddcfba] pt-6">
            {[54, 28, 71, 23, 46, 82, 51, 43].map((height, index) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className={`w-full rounded-t-md ${index % 2 === 0 ? "bg-[#211b16]" : "bg-[#d2ae57]"}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-[#9e8b76]">
                  {["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-6">
          <p className="font-serif text-2xl text-[#2a221b]">Canales de venta</p>
          <div className="mt-6 flex items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[16px] border-[#211b16] border-r-[#d2ae57] border-b-[#eadfcb] text-sm text-[#7a6652]">
              66%
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

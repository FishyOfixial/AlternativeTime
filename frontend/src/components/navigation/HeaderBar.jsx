export default function HeaderBar() {
  return (
    <header className="panel-soft flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
      <div>
        <p className="eyebrow">Workspace UI</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Router, layouts y componentes compartidos listos.
        </h2>
      </div>
      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
        Base tecnica activa
      </div>
    </header>
  );
}

export default function LoadingState({
  title = "Cargando",
  message = "Estamos preparando esta vista."
}) {
  return (
    <div className="panel-soft flex items-center gap-4 p-5">
      <div className="h-10 w-10 animate-pulse rounded-full border border-cyan-300/20 bg-cyan-300/15" />
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}

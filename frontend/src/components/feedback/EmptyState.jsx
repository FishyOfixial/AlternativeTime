export default function EmptyState({
  title = "Nada por mostrar todavia",
  message = "Esta area quedo lista para poblarse en los siguientes sprints."
}) {
  return (
    <div className="panel-soft border-dashed p-5">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
    </div>
  );
}

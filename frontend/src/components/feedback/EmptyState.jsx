export default function EmptyState({
  title = "Nada por mostrar todavia",
  message = "Esta area quedo lista para poblarse en los siguientes sprints."
}) {
  return (
    <div className="panel-soft border-dashed p-5">
      <p className="font-serif text-lg text-[#2a221b]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#736350]">{message}</p>
    </div>
  );
}

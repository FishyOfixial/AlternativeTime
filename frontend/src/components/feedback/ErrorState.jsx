export default function ErrorState({
  title = "No fue posible cargar esta vista",
  message = "Revisa el backend o vuelve a intentar mas tarde."
}) {
  return (
    <div className="panel-soft border-red-300/20 bg-red-500/10 p-5">
      <p className="text-base font-semibold text-red-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-red-100/80">{message}</p>
    </div>
  );
}

export default function ErrorState({
  title = "No fue posible cargar esta vista",
  message = "Revisa el backend o vuelve a intentar mas tarde.",
  networkAware = false
}) {
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  const effectiveTitle =
    networkAware && isOffline ? "Sin conexion para esta vista" : title;
  const effectiveMessage =
    networkAware && isOffline
      ? "La app pudo abrir desde cache, pero esta vista necesita conexion para consultar datos nuevos."
      : message;

  return (
    <div className="panel-soft border-[#d9b7af] bg-[#fff4f1] p-5">
      <p className="font-serif text-lg text-[#74372a]">{effectiveTitle}</p>
      <p className="mt-2 text-sm leading-6 text-[#8f5a4f]">{effectiveMessage}</p>
    </div>
  );
}

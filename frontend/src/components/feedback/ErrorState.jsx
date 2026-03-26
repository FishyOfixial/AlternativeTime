export default function ErrorState({
  title = "No fue posible cargar esta vista",
  message = "Revisa el backend o vuelve a intentar mas tarde."
}) {
  return (
    <div className="panel-soft border-[#d9b7af] bg-[#fff4f1] p-5">
      <p className="font-serif text-lg text-[#74372a]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#8f5a4f]">{message}</p>
    </div>
  );
}

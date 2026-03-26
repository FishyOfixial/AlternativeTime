export default function LoadingState({
  title = "Cargando",
  message = "Estamos preparando esta vista."
}) {
  return (
    <div className="panel-soft flex items-center gap-4 p-5">
      <div className="h-10 w-10 animate-pulse rounded-full border border-[#d9c6a2] bg-[#eadbbd]" />
      <div>
        <p className="font-serif text-lg text-[#2a221b]">{title}</p>
        <p className="mt-1 text-sm text-[#736350]">{message}</p>
      </div>
    </div>
  );
}

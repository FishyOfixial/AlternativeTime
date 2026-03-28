export default function ClientsHeader({ onToggleCreate }) {
  return (
    <section className="flex items-end justify-between gap-4">
        <div></div>
      <button className="gold-button w-full px-4 py-2 text-xs sm:w-auto" onClick={onToggleCreate} type="button">
        + Nuevo cliente
      </button>
    </section>
  );
}

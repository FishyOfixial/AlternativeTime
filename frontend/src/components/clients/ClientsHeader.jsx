export default function ClientsHeader({ onToggleCreate }) {
  return (
    <section className="flex items-end justify-between gap-4">
      <button className="gold-button px-4 py-2 text-xs" onClick={onToggleCreate} type="button">
        + Nuevo cliente
      </button>
    </section>
  );
}

function formatSnapshotTime(value) {
  if (!value) {
    return "Sin sincronizacion previa";
  }

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function OfflineSnapshotStatus({
  label,
  source,
  savedAt,
  isStale
}) {
  if (!source && !savedAt) {
    return null;
  }

  const isCache = source === "cache";
  const title = isCache ? "Mostrando ultimo snapshot" : "Snapshot listo para lectura offline";
  const message = isCache
    ? `${label} se esta mostrando desde almacenamiento local. Ultima sincronizacion: ${formatSnapshotTime(savedAt)}.`
    : `${label} se sincronizo a las ${formatSnapshotTime(savedAt)} y puede consultarse sin red.`;

  return (
    <section
      className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_10px_24px_rgba(42,34,27,0.05)] ${
        isCache || isStale
          ? "border-[#dfcfb8] bg-[#fcf7ee] text-[#705c3e]"
          : "border-[#d7e3d2] bg-[#edf7ee] text-[#426748]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
        <span>{isCache ? "Offline" : "Freshness"}</span>
        {isStale ? (
          <span className="rounded-full border border-current/15 px-2 py-0.5 text-[10px]">
            Snapshot con antiguedad
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-serif text-lg">{title}</p>
      <p className="mt-1 leading-6">{message}</p>
    </section>
  );
}
